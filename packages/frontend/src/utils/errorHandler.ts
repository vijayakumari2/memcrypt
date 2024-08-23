export class KeycloakError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'KeycloakError';
    }
}

export class ApiError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
        this.name = 'ApiError';
    }
}