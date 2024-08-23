import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/users/[userId]/approve/route';
import { initializeKeycloakService} from '@/services/keycloakServiceSingleton';
import { KeycloakService } from '@/services/keycloakService';
import { KeycloakError } from "@/utils/errorHandler";

// Mock the KeycloakService
vi.mock('@/services/keycloakService');

describe('POST /api/users/[userId]/approve', () => {
    let mockKeycloakService: any;

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        mockKeycloakService = {
            approveUser: vi.fn(),
        };
        initializeKeycloakService(mockKeycloakService as unknown as KeycloakService);
    });

    it('should approve user successfully', async () => {
        const userId = 'test-user-id';
        mockKeycloakService.approveUser.mockResolvedValue(undefined);

        const request = new NextRequest('http://localhost/api/users/test-user-id/approve', {
            method: 'POST',
        });

        const response = await POST(request, { params: { userId } });

        expect(mockKeycloakService.approveUser).toHaveBeenCalledWith(userId);
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ message: 'User approved successfully' });
    });

    it('should return 500 if approveUser throws an error', async () => {
        const userId = 'test-user-id';
        mockKeycloakService.approveUser.mockRejectedValue(new Error('Approval failed'));

        const request = new NextRequest('http://localhost/api/users/test-user-id/approve', {
            method: 'POST',
        });

        const response = await POST(request, { params: { userId } });

        expect(mockKeycloakService.approveUser).toHaveBeenCalledWith(userId);
        expect(response.status).toBe(500);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ error: 'Failed to approve user' });
    });

    it('should return 500 if approveUser throws a KeycloakError', async () => {
        const userId = 'test-user-id';
        mockKeycloakService.approveUser.mockRejectedValue(new KeycloakError('Keycloak approval failed'));

        const request = new NextRequest('http://localhost/api/users/test-user-id/approve', {
            method: 'POST',
        });

        const response = await POST(request, { params: { userId } });

        expect(mockKeycloakService.approveUser).toHaveBeenCalledWith(userId);
        expect(response.status).toBe(500);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ error: 'Failed to approve user' });
    });
});