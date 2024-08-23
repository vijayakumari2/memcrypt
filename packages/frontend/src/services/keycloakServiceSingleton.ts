import { KeycloakService } from './keycloakService';

class KeycloakServiceSingleton {
    private static instance: KeycloakService | null = null;

    private constructor() {} // Private constructor to prevent direct construction calls with the `new` operator.

    public static getInstance(): KeycloakService {
        if (!KeycloakServiceSingleton.instance) {
            KeycloakServiceSingleton.instance = new KeycloakService();
        }

        return KeycloakServiceSingleton.instance;
    }

    public static initializeWithCustomInstance(customInstance: KeycloakService): void {
        KeycloakServiceSingleton.instance = customInstance;
    }
}

export const getKeycloakService = (): KeycloakService => KeycloakServiceSingleton.getInstance();
export const initializeKeycloakService = (customInstance?: KeycloakService): void => {
    if (customInstance) {
        KeycloakServiceSingleton.initializeWithCustomInstance(customInstance);
    } else {
        KeycloakServiceSingleton.getInstance(); // This will create the default instance if it doesn't exist
    }
};