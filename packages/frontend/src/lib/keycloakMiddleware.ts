import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS_URI = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}/protocol/openid-connect/certs`;

let JWKS: ReturnType<typeof createRemoteJWKSet>;

export async function verifyKeycloakToken(token: string) {
    try {
        if (!JWKS) {
            JWKS = createRemoteJWKSet(new URL(JWKS_URI));
        }

        const { payload } = await jwtVerify(token, JWKS, {
            issuer: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}`,
        });

        // Additional check for the intended audience
        if (payload.azp !== process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID) {
            console.error('Token not intended for this client');
            return null;
        }

        return payload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}