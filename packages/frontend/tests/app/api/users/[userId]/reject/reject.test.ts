// tests/api/users/[userId]/reject.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/users/[userId]/reject/route';
import { initializeKeycloakService } from '@/services/keycloakServiceSingleton';
import { KeycloakService } from '@/services/keycloakService';
import { KeycloakError } from "@/utils/errorHandler";

// Mock the KeycloakService
vi.mock('@/services/keycloakService');

describe('POST /api/users/[userId]/reject', () => {
    let mockKeycloakService: any;

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        mockKeycloakService = {
            rejectUser: vi.fn(),
        };
        initializeKeycloakService(mockKeycloakService as unknown as KeycloakService);
    });

    it('should reject user successfully', async () => {
        const userId = 'test-user-id';
        mockKeycloakService.rejectUser.mockResolvedValue(undefined);

        const request = new NextRequest('http://localhost/api/users/test-user-id/reject', {
            method: 'POST',
        });

        const response = await POST(request, { params: { userId } });

        expect(mockKeycloakService.rejectUser).toHaveBeenCalledWith(userId);
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ message: 'User rejected successfully' });
    });

    it('should return 500 if rejectUser throws an error', async () => {
        const userId = 'test-user-id';
        mockKeycloakService.rejectUser.mockRejectedValue(new Error('Rejection failed'));

        const request = new NextRequest('http://localhost/api/users/test-user-id/reject', {
            method: 'POST',
        });

        const response = await POST(request, { params: { userId } });

        expect(mockKeycloakService.rejectUser).toHaveBeenCalledWith(userId);
        expect(response.status).toBe(500);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ error: 'Failed to reject user' });
    });

    it('should return 500 if rejectUser throws a KeycloakError', async () => {
        const userId = 'test-user-id';
        mockKeycloakService.rejectUser.mockRejectedValue(new KeycloakError('Keycloak rejection failed'));

        const request = new NextRequest('http://localhost/api/users/test-user-id/reject', {
            method: 'POST',
        });

        const response = await POST(request, { params: { userId } });

        expect(mockKeycloakService.rejectUser).toHaveBeenCalledWith(userId);
        expect(response.status).toBe(500);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ error: 'Failed to reject user' });
    });
});