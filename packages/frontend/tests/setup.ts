import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const requiredEnvVars = [
    'KEYCLOAK_URL',
    'KEYCLOAK_REALM',
    'KEYCLOAK_ADMIN_USERNAME',
    'KEYCLOAK_ADMIN_PASSWORD',
    'KEYCLOAK_ADMIN_CLIENT_ID'
];

requiredEnvVars.forEach(varName => {
    if (typeof process.env[varName] !== 'string') {
        throw new Error(`Missing required environment variable for tests: ${varName}`);
    }
});