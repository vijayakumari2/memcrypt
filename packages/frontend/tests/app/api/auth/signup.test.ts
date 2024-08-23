import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/signup/route';
import { KeycloakService } from '@/services/keycloakService';
import { initializeKeycloakService } from '@/services/keycloakServiceSingleton';
import { KeycloakError } from "@/utils/errorHandler";
import { NextRequest } from 'next/server';

// Mock the KeycloakService
vi.mock('@/services/keycloakService');

describe('Users API Route', () => {
    let mockKeycloakService: any;

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        mockKeycloakService = {
            createOrganizationAndUser: vi.fn(),
            getUsersWithOrgInfo: vi.fn()
        };
        initializeKeycloakService(mockKeycloakService as unknown as KeycloakService);
    });

    describe('POST /api/auth/signup', () => {
        it('should create a user and organization successfully', async () => {
            const mockRequestBody = {
                orgName: 'Test Org',
                adminUser: {
                    username: 'testadmin',
                    email: 'admin@test.com',
                    firstName: 'Test',
                    lastName: 'Admin',
                    password: 'password123',
                },
            };

            const mockResult = {
                tenant: {id: 'org123', name: 'Test Org'},
                adminUser: {
                    id: 'user123',
                    username: 'testadmin',
                    email: 'admin@test.com',
                    firstName: 'Test',
                    lastName: 'Admin',
                },
            };

            mockKeycloakService.createOrganizationAndUser.mockResolvedValue(mockResult);

            const request = new NextRequest('http://localhost/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(mockRequestBody),
            });

            const response = await POST(request);

            expect(response.status).toBe(201);
            const responseBody = await response.json();
            expect(responseBody).toEqual(mockResult);
            expect(mockKeycloakService.createOrganizationAndUser).toHaveBeenCalledWith(mockRequestBody);
        });

        it('should return 400 for KeycloakError', async () => {
            const errorMessage = 'Invalid input data';
            mockKeycloakService.createOrganizationAndUser.mockRejectedValue(new KeycloakError(errorMessage));

            const request = new NextRequest('http://localhost/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
            const responseBody = await response.json();
            expect(responseBody).toEqual({error: errorMessage});
        });

        it('should return 500 for unexpected errors', async () => {
            mockKeycloakService.createOrganizationAndUser.mockRejectedValue(new Error('Unexpected error'));

            const request = new NextRequest('http://localhost/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(request);

            expect(response.status).toBe(500);
            const responseBody = await response.json();
            expect(responseBody).toEqual({error: 'An unexpected error occurred'});
        });

        it('should handle JSON parsing errors', async () => {
            const request = new NextRequest('http://localhost/api/auth/signup', {
                method: 'POST',
                body: 'invalid json',
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
            const responseBody = await response.json();
            expect(responseBody).toEqual({error: expect.any(String)});
        });
    });
});
