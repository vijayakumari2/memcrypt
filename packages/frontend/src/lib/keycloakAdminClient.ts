import KcAdminClient from '@keycloak/keycloak-admin-client';

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (typeof value !== 'string') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function getEnvNumber(name: string, defaultValue: number): number {
    const value = process.env[name];
    if (value === undefined) {
        return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        console.warn(`Invalid value for ${name}, using default: ${defaultValue}`);
        return defaultValue;
    }
    return parsed;
}

class KeycloakAdminClientManager {
    private client: KcAdminClient | null = null;
    private lastAuth: number = 0;
    private readonly AUTH_TIMEOUT: number;

    constructor() {
        // Get AUTH_TIMEOUT from environment variable, default to 58 seconds if not set
        this.AUTH_TIMEOUT = getEnvNumber('KEYCLOAK_AUTH_TIMEOUT', 58) * 1000;
    }

    async getClient(): Promise<KcAdminClient> {
        if (!this.client || Date.now() - this.lastAuth > this.AUTH_TIMEOUT) {
            this.client = new KcAdminClient({
                baseUrl: getRequiredEnv('KEYCLOAK_URL'),
                realmName: getRequiredEnv('KEYCLOAK_REALM'),
                requestOptions: {
                    cache: "no-cache"
                }
            });

            await this.client.auth({
                username: getRequiredEnv('KEYCLOAK_ADMIN_USERNAME'),
                password: getRequiredEnv('KEYCLOAK_ADMIN_PASSWORD'),
                grantType: 'password',
                clientId: getRequiredEnv('KEYCLOAK_ADMIN_CLIENT_ID'),
            });

            const appRealm = getRequiredEnv('APP_REALM');
            this.client.setConfig({ realmName: appRealm });

            this.lastAuth = Date.now();
            console.log(`Keycloak Admin Client initialized and set to realm: ${appRealm}`);
            console.log(`Auth timeout set to: ${this.AUTH_TIMEOUT / 1000} seconds`);
        }

        return this.client;
    }
}

// Use a singleton pattern for server-side
let keycloakManagerInstance: KeycloakAdminClientManager | null = null;

export async function getKeycloakAdminClient(): Promise<KcAdminClient> {
    if (typeof window !== 'undefined') {
        throw new Error('Keycloak Admin Client should not be used on the client-side');
    }

    if (!keycloakManagerInstance) {
        keycloakManagerInstance = new KeycloakAdminClientManager();
    }

    return keycloakManagerInstance.getClient();
}