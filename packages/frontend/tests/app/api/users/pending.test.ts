// tests/api/users/pending.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/users/pending/route';
import { initializeKeycloakService} from '@/services/keycloakServiceSingleton';
import { KeycloakService } from '@/services/keycloakService';
import { KeycloakError } from "@/utils/errorHandler";

// Mock the KeycloakService
vi.mock('@/services/keycloakService');

describe('GET /api/users/pending', () => {
    let mockKeycloakService: any;

    beforeEach(() => {
        mockKeycloakService = {
            getPendingUsers: vi.fn(),
        };

        initializeKeycloakService(mockKeycloakService as unknown as KeycloakService);
    });

    it('should return pending users successfully', async () => {
        const mockPendingUsers = [
            { id: '1', username: 'user1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', createdTimestamp: 1234567890 },
            { id: '2', username: 'user2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Doe', createdTimestamp: 1234567891 },
        ];

        mockKeycloakService.getPendingUsers.mockResolvedValue(mockPendingUsers);

        const request = new NextRequest('http://localhost/api/users/pending');
        const response = await GET(request);

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toEqual(mockPendingUsers);
    });

    it('should return 400 if KeycloakError is thrown', async () => {
        mockKeycloakService.getPendingUsers.mockRejectedValue(new KeycloakError('Failed to fetch pending users'));

        const request = new NextRequest('http://localhost/api/users/pending');
        const response = await GET(request);

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ error: 'Failed to fetch pending users' });
    });

    it('should return 500 for unexpected errors', async () => {
        mockKeycloakService.getPendingUsers.mockRejectedValue(new Error('Unexpected error'));

        const request = new NextRequest('http://localhost/api/users/pending');
        const response = await GET(request);

        expect(response.status).toBe(500);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ error: 'An unexpected error occurred' });
    });
});