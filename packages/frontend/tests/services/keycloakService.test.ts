import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KeycloakService } from '@/services/keycloakService';
import { KeycloakError } from "@/utils/errorHandler";
import { CreateOrgWithAdminInput } from '@/types/keycloak';
import * as keycloakAdminClientModule from '@/lib/keycloakAdminClient';
import { emailService } from '@/services/emailService';
import {PaginationQuery} from "@/types/pagination";


// Mock the entire keycloakAdminClient module
vi.mock('@/lib/keycloakAdminClient');
vi.mock('@/services/emailService');

describe('KeycloakService', () => {
    let keycloakService: KeycloakService;
    let mockKcAdminClient: any;

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        keycloakService = new KeycloakService();

        // Create a mock Keycloak Admin Client
        mockKcAdminClient = {
            organizations: {
                create: vi.fn(),
                addMember: vi.fn(),
                findOne: vi.fn(),
            },
            users: {
                create: vi.fn(),
                update: vi.fn(),
                find: vi.fn(),
                findOne: vi.fn(),
                count: vi.fn(),
            },
        };

        vi.mocked(keycloakAdminClientModule.getKeycloakAdminClient).mockResolvedValue(mockKcAdminClient);
        vi.spyOn(emailService, 'sendEmail').mockResolvedValue();
    });

    describe('createOrganizationAndUser', () => {
        const validInput: CreateOrgWithAdminInput = {
            orgName: 'Test Org',
            adminUser: {
                username: 'testadmin',
                email: 'admin@test.com',
                firstName: 'Test',
                lastName: 'Admin',
                password: 'password123',
            },
        };

        it('should create an organization and user successfully', async () => {
            const mockOrg = { id: 'org123', name: 'Test Org' };
            const mockUser = {
                id: 'user123',
                username: 'testadmin',
                email: 'admin@test.com',
                firstName: 'Test',
                lastName: 'Admin',
            };

            mockKcAdminClient.organizations.create.mockResolvedValue(mockOrg);
            mockKcAdminClient.users.create.mockResolvedValue(mockUser);

            const result = await keycloakService.createOrganizationAndUser(validInput);

            expect(result).toMatchObject({
                tenant: { id: 'org123', name: 'Test Org' },
                adminUser: {
                    id: 'user123',
                    username: 'testadmin',
                    email: 'admin@test.com',
                    firstName: 'Test',
                    lastName: 'Admin'
                },
            });

            expect(mockKcAdminClient.organizations.create).toHaveBeenCalledWith({
                name: 'Test Org',
                domains: [{ name: 'testorg.com', verified: true }],
            });

            expect(mockKcAdminClient.users.create).toHaveBeenCalledWith({
                username: 'testadmin',
                email: 'admin@test.com',
                firstName: 'Test',
                lastName: 'Admin',
                enabled: false,
                attributes: {
                    status: ['pending'],
                    verificationToken: [expect.any(String)]
                },
                credentials: [{ type: 'password', value: 'password123', temporary: false }],
            });

            expect(mockKcAdminClient.organizations.addMember).toHaveBeenCalledWith({
                orgId: 'org123',
                userId: 'user123',
            });

            // Check if admin notification email was sent
            expect(emailService.sendEmail).toHaveBeenNthCalledWith(1, expect.objectContaining({
                subject: `New User Registration for Test Org`,
                templateName: 'adminNotification',
                templateData: {
                    orgName: 'Test Org',
                    username: 'testadmin',
                    email: 'admin@test.com',
                    firstName: 'Test',
                    lastName: 'Admin',
                },
            }));

            // Check if user verification email was sent
            expect(emailService.sendEmail).toHaveBeenNthCalledWith(2, expect.objectContaining({
                to: 'admin@test.com',
                subject: `Verify Your Email for Test Org`,
                templateName: 'userVerification',
                templateData: {
                    orgName: 'Test Org',
                    firstName: 'Test',
                    verificationLink: expect.stringContaining('verify-email?token='),
                },
            }));
        });

        it('should throw KeycloakError for invalid input', async () => {
            const invalidInput = { ...validInput, orgName: '' };
            await expect(keycloakService.createOrganizationAndUser(invalidInput))
                .rejects.toThrow(KeycloakError);
        });

        it('should throw KeycloakError if organization creation fails', async () => {
            mockKcAdminClient.organizations.create.mockRejectedValue(new Error('Org creation failed'));
            await expect(keycloakService.createOrganizationAndUser(validInput))
                .rejects.toThrow(KeycloakError);
        });

        it('should throw KeycloakError if user creation fails', async () => {
            mockKcAdminClient.organizations.create.mockResolvedValue({ id: 'org123', name: 'Test Org' });
            mockKcAdminClient.users.create.mockRejectedValue(new Error('User creation failed'));
            await expect(keycloakService.createOrganizationAndUser(validInput))
                .rejects.toThrow(KeycloakError);
        });

        it('should throw KeycloakError if user assignment fails', async () => {
            mockKcAdminClient.organizations.create.mockResolvedValue({ id: 'org123', name: 'Test Org' });
            mockKcAdminClient.users.create.mockResolvedValue({
                id: 'user123',
                username: 'testadmin',
                email: 'admin@test.com',
            });
            mockKcAdminClient.organizations.addMember.mockRejectedValue(new Error('Assignment failed'));
            await expect(keycloakService.createOrganizationAndUser(validInput))
                .rejects.toThrow(KeycloakError);
        });
    });

    describe('input validation', () => {
        it('should throw KeycloakError for missing organization name', async () => {
            const invalidInput = {
                orgName: '',
                adminUser: {
                    username: 'testadmin',
                    email: 'admin@test.com',
                    firstName: 'Test',
                    lastName: 'Admin',
                    password: 'password123',
                },
            };
            await expect(keycloakService.createOrganizationAndUser(invalidInput))
                .rejects.toThrow('Organization name is required');
        });

        it('should throw KeycloakError for missing username', async () => {
            const invalidInput = {
                orgName: 'Test Org',
                adminUser: {
                    username: '',
                    email: 'admin@test.com',
                    firstName: 'Test',
                    lastName: 'Admin',
                    password: 'password123',
                },
            };
            await expect(keycloakService.createOrganizationAndUser(invalidInput))
                .rejects.toThrow('Username is required');
        });

        it('should throw KeycloakError for invalid email', async () => {
            const invalidInput = {
                orgName: 'Test Org',
                adminUser: {
                    username: 'testadmin',
                    email: 'invalid-email',
                    firstName: 'Test',
                    lastName: 'Admin',
                    password: 'password123',
                },
            };
            await expect(keycloakService.createOrganizationAndUser(invalidInput))
                .rejects.toThrow('Valid email is required');
        });

        it('should throw KeycloakError for short password', async () => {
            const invalidInput = {
                orgName: 'Test Org',
                adminUser: {
                    username: 'testadmin',
                    email: 'admin@test.com',
                    firstName: 'Test',
                    lastName: 'Admin',
                    password: 'short',
                },
            };
            await expect(keycloakService.createOrganizationAndUser(invalidInput))
                .rejects.toThrow('Password must be at least 8 characters long');
        });
    });

    describe('approveUser', () => {
        it('should approve user successfully', async () => {
            const userId = 'user123';
            const mockUser = {
                id: userId,
                username: 'testuser',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                attributes: {
                    someAttribute: ['value']
                }
            };
            mockKcAdminClient.users.findOne.mockResolvedValue(mockUser);
            mockKcAdminClient.users.update.mockResolvedValue(undefined);

            await keycloakService.approveUser(userId);

            expect(mockKcAdminClient.users.findOne).toHaveBeenCalledWith({ id: userId });
            expect(mockKcAdminClient.users.update).toHaveBeenCalledWith(
                { id: userId },
                {
                    ...mockUser,
                    enabled: true,
                    attributes: {
                        ...mockUser.attributes,
                        status: ['approved'] }
                }
            );
            expect(emailService.sendEmail).toHaveBeenCalledWith({
                to: 'test@example.com',
                subject: 'Your account has been approved',
                templateName: 'userApproved',
                templateData: {
                    username: 'testuser',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                },
            });
        });

        it('should throw KeycloakError if user update fails', async () => {
            const userId = 'user123';
            mockKcAdminClient.users.update.mockRejectedValue(new Error('Update failed'));

            await expect(keycloakService.approveUser(userId))
                .rejects.toThrow(KeycloakError);
        });
    });

    describe('rejectUser', () => {
        it('should reject user successfully', async () => {
            const userId = 'user123';
            const mockUser = {
                id: userId,
                username: 'testuser',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                attributes: {
                    someAttribute: ['value']
                }
            };
            mockKcAdminClient.users.findOne.mockResolvedValue(mockUser);
            mockKcAdminClient.users.update.mockResolvedValue(undefined);

            await keycloakService.rejectUser(userId);

            expect(mockKcAdminClient.users.update).toHaveBeenCalledWith(
                { id: userId },
                {
                    ...mockUser,
                    enabled: false,
                    attributes: {
                        ...mockUser.attributes,
                        status: ['rejected'] }
                }
            );

            expect(emailService.sendEmail).toHaveBeenCalledWith({
                to: 'test@example.com',
                subject: 'Your account application status',
                templateName: 'userRejected',
                templateData: {
                    username: 'testuser',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                },
            });
        });

        it('should throw KeycloakError if user update fails', async () => {
            const userId = 'user123';
            mockKcAdminClient.users.update.mockRejectedValue(new Error('Update failed'));

            await expect(keycloakService.rejectUser(userId))
                .rejects.toThrow(KeycloakError);
        });
    });

    describe('verifyEmail', () => {
        it('should verify email successfully', async () => {
            const token = 'validToken';
            const mockUser = {
                id: 'user123',
                username: 'testuser',
                email: 'test@example.com',
                attributes: {
                    verificationToken: [token]
                }
            };
            mockKcAdminClient.users.find.mockResolvedValue([mockUser]);
            mockKcAdminClient.users.update.mockResolvedValue(undefined);

            await keycloakService.verifyEmail(token);

            expect(mockKcAdminClient.users.find).toHaveBeenCalledWith({
                max: 1,
                exact: true,
                q: `verificationToken:${token}`,
            });

            expect(mockKcAdminClient.users.update).toHaveBeenCalledWith(
                { id: 'user123' },
                {
                    ...mockUser,
                    emailVerified: true,
                    attributes: {
                        verificationToken: undefined,
                    },
                }
            );
        });

        it('should throw KeycloakError for invalid token', async () => {
            const token = 'invalidToken';
            mockKcAdminClient.users.find.mockResolvedValue([]);

            await expect(keycloakService.verifyEmail(token))
                .rejects.toThrow(KeycloakError);
        });

        it('should throw KeycloakError if update fails', async () => {
            const token = 'validToken';
            mockKcAdminClient.users.find.mockResolvedValue([{ id: 'user123' }]);
            mockKcAdminClient.users.update.mockRejectedValue(new Error('Update failed'));

            await expect(keycloakService.verifyEmail(token))
                .rejects.toThrow(KeycloakError);
        });
    });

    describe('getPendingUsers', () => {
        it('should fetch pending users successfully', async () => {
            const mockPendingUsers = [
                { id: 'user1', username: 'user1', email: 'user1@example.com' },
                { id: 'user2', username: 'user2', email: 'user2@example.com' },
            ];
            mockKcAdminClient.users.find.mockResolvedValue(mockPendingUsers);

            const result = await keycloakService.getPendingUsers();

            expect(result).toMatchObject(mockPendingUsers);
            expect(mockKcAdminClient.users.find).toHaveBeenCalledWith({
                max: 1000,
                enabled: false,
                exact: true,
                q: 'status:pending'
            });
        });

        it('should throw KeycloakError if fetching users fails', async () => {
            mockKcAdminClient.users.find.mockRejectedValue(new Error('Fetch failed'));

            await expect(keycloakService.getPendingUsers())
                .rejects.toThrow(KeycloakError);
        });
    });

    describe('getUsersWithOrgInfo', () => {
        const mockPaginationQuery: PaginationQuery = { page: 1, pageSize: 10 };

        it('should fetch users with organization info successfully', async () => {
            const mockUsers = [
                { id: 'user1', username: 'user1', email: 'user1@example.com', attributes: { 'kc.org': ['org1'] } },
                { id: 'user2', username: 'user2', email: 'user2@example.com', attributes: { 'kc.org': ['org2'] } },
            ];
            const mockOrgs = [
                { id: 'org1', name: 'Organization 1' },
                { id: 'org2', name: 'Organization 2' },
            ];

            mockKcAdminClient.users.find.mockResolvedValue(mockUsers);
            mockKcAdminClient.users.count.mockResolvedValue(2);
            mockKcAdminClient.organizations.findOne.mockImplementation((params: {id: string}) =>
                Promise.resolve(mockOrgs.find(org => org.id === params.id))
            );

            const result = await keycloakService.getUsersWithOrgInfo(mockPaginationQuery);

            expect(result).toEqual({
                data: expect.arrayContaining([
                    expect.objectContaining({ ...mockUsers[0], organization: mockOrgs[0] }),
                    expect.objectContaining({ ...mockUsers[1], organization: mockOrgs[1] }),
                ]),
                totalCount: 2,
                page: 1,
                pageSize: 10,
                totalPages: 1,
            });

            expect(mockKcAdminClient.users.find).toHaveBeenCalledWith({
                max: 10,
                first: 0,
            });
            expect(mockKcAdminClient.organizations.findOne).toHaveBeenCalledTimes(2);
        });

        it('should handle users without organization', async () => {
            const mockUsers = [
                { id: 'user1', username: 'user1', email: 'user1@example.com', attributes: {} },
                { id: 'user2', username: 'user2', email: 'user2@example.com', attributes: { 'kc.org': ['org2'] } },
            ];
            const mockOrgs = [
                { id: 'org2', name: 'Organization 2' },
            ];

            mockKcAdminClient.users.find.mockResolvedValue(mockUsers);
            mockKcAdminClient.users.count.mockResolvedValue(2);
            mockKcAdminClient.organizations.findOne.mockImplementation((params: {id: string}) =>
                Promise.resolve(mockOrgs.find(org => org.id === params.id))
            );

            const result = await keycloakService.getUsersWithOrgInfo(mockPaginationQuery);

            expect(result.data[0].organization).toBeNull();
            expect(result.data[1].organization).toEqual(mockOrgs[0]);
        });

        it('should handle pagination correctly', async () => {
            const mockPaginationQuery: PaginationQuery = { page: 2, pageSize: 5 };
            const mockUsers = [
                { id: 'user6', username: 'user6', email: 'user6@example.com', attributes: { 'kc.org': ['org1'] } },
                { id: 'user7', username: 'user7', email: 'user7@example.com', attributes: { 'kc.org': ['org2'] } },
            ];

            mockKcAdminClient.users.find.mockResolvedValue(mockUsers);
            mockKcAdminClient.users.count.mockResolvedValue(10);
            mockKcAdminClient.organizations.findOne.mockResolvedValue({ id: 'org1', name: 'Organization 1' });

            const result = await keycloakService.getUsersWithOrgInfo(mockPaginationQuery);

            expect(result.page).toBe(2);
            expect(result.pageSize).toBe(5);
            expect(result.totalPages).toBe(2);
            expect(mockKcAdminClient.users.find).toHaveBeenCalledWith({
                max: 5,
                first: 5,
            });
        });

        it('should throw KeycloakError if fetching users fails', async () => {
            mockKcAdminClient.users.find.mockRejectedValue(new Error('Fetch failed'));

            await expect(keycloakService.getUsersWithOrgInfo(mockPaginationQuery))
                .rejects.toThrow(KeycloakError);
        });

        it('should throw KeycloakError if fetching organizations fails', async () => {
            const mockUsers = [
                { id: 'user1', username: 'user1', email: 'user1@example.com', attributes: { 'kc.org': ['org1'] } },
            ];

            mockKcAdminClient.users.find.mockResolvedValue(mockUsers);
            mockKcAdminClient.organizations.findOne.mockRejectedValue(new Error('Org fetch failed'));

            await expect(keycloakService.getUsersWithOrgInfo(mockPaginationQuery))
                .rejects.toThrow(KeycloakError);
        });
    });
});