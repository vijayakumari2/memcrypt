import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE} from '@/app/api/users/route';
import { KeycloakService } from '@/services/keycloakService';
import { initializeKeycloakService } from '@/services/keycloakServiceSingleton';
import { KeycloakError } from "@/utils/errorHandler";
import { NextRequest } from 'next/server';
import {PaginatedResult} from "@/types/pagination";
import {UserWithOrg} from "@/types/keycloak";

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

    describe('GET /api/users', () => {
        it('should return paginated users with organization info', async () => {
            const mockResult: PaginatedResult<UserWithOrg> = {
                data: [
                    { id: 'user1', username: 'user1', organization: { id: 'org1', name: 'Org 1' } } as UserWithOrg,
                    { id: 'user2', username: 'user2', organization: { id: 'org2', name: 'Org 2' } } as UserWithOrg,
                ],
                totalCount: 2,
                page: 1,
                pageSize: 10,
                totalPages: 1,
            };

            mockKeycloakService.getUsersWithOrgInfo.mockResolvedValue(mockResult);

            const request = new NextRequest('http://localhost/api/users?page=1&pageSize=10');
            const response = await GET(request);

            expect(response.status).toBe(200);
            const responseBody = await response.json();
            expect(responseBody).toEqual(mockResult);
            expect(mockKeycloakService.getUsersWithOrgInfo).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
        });

        it('should use default pagination values when not provided', async () => {
            const request = new NextRequest('http://localhost/api/users');
            await GET(request);

            expect(mockKeycloakService.getUsersWithOrgInfo).toHaveBeenCalledWith({ page: 1, pageSize: 1000 });
        });

        it('should handle KeycloakError', async () => {
            const errorMessage = 'Failed to fetch users';
            mockKeycloakService.getUsersWithOrgInfo.mockRejectedValue(new KeycloakError(errorMessage));

            const request = new NextRequest('http://localhost/api/users');
            const response = await GET(request);

            expect(response.status).toBe(400);
            const responseBody = await response.json();
            expect(responseBody).toEqual({ error: errorMessage });
        });

        it('should handle unexpected errors', async () => {
            mockKeycloakService.getUsersWithOrgInfo.mockRejectedValue(new Error('Unexpected error'));

            const request = new NextRequest('http://localhost/api/users');
            const response = await GET(request);

            expect(response.status).toBe(500);
            const responseBody = await response.json();
            expect(responseBody).toEqual({ error: 'An unexpected error occurred' });
        });

        it('should parse pagination parameters correctly', async () => {
            const request = new NextRequest('http://localhost/api/users?page=2&pageSize=20');
            await GET(request);

            expect(mockKeycloakService.getUsersWithOrgInfo).toHaveBeenCalledWith({ page: 2, pageSize: 20 });
        });
    });

    describe('PUT /api/users', () => {
        it('should return 501 Not Implemented', async () => {
            const response = await PUT();

            expect(response.status).toBe(501);
            const responseBody = await response.json();
            expect(responseBody).toEqual({ message: 'PUT method not implemented' });
        });
    });

    describe('DELETE /api/users', () => {
        it('should return 501 Not Implemented', async () => {
            const response = await DELETE();

            expect(response.status).toBe(501);
            const responseBody = await response.json();
            expect(responseBody).toEqual({ message: 'DELETE method not implemented' });
        });
    });
});