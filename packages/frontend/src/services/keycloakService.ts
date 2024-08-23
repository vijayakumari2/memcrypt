import { getKeycloakAdminClient } from '@/lib/keycloakAdminClient';
import OrganizationRepresentation from '@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { KeycloakError } from "@/utils/errorHandler";
import { CreateOrgWithAdminInput, CreateOrgWithAdminResult, Tenant, User, UserWithOrg } from '@/types/keycloak';
import { PaginationQuery, PaginatedResult } from '@/types/pagination'; // You'll need to define this type
import { emailService } from './emailService';
import crypto from 'crypto';

export class KeycloakService {
    private appUrl: string;

    constructor() {
        this.appUrl = process.env.APP_URL || 'http://localhost:3000';
    }

    private generateVerificationToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private validateInput(input: CreateOrgWithAdminInput): void {
        if (!input.orgName || input.orgName.trim().length === 0) {
            throw new KeycloakError('Organization name is required');
        }
        if (!input.adminUser.username || input.adminUser.username.trim().length === 0) {
            throw new KeycloakError('Username is required');
        }
        if (!input.adminUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.adminUser.email)) {
            throw new KeycloakError('Valid email is required');
        }
        if (!input.adminUser.password || input.adminUser.password.length < 8) {
            throw new KeycloakError('Password must be at least 8 characters long');
        }
    }

    private async createOrganization(
        kcAdminClient: KeycloakAdminClient,
        orgName: string
    ): Promise<OrganizationRepresentation> {
        try {
            return await kcAdminClient.organizations.create({
                name: orgName,
                domains: [{
                    name: orgName.toLowerCase().replace(/\s/g, '') + '.com',
                    verified: true
                }]
            });
        } catch (error) {
            console.error('Error creating organization:', error);
            throw new KeycloakError('Failed to create organization');
        }
    }

    private async createUser(
        kcAdminClient: KeycloakAdminClient,
        adminUser: CreateOrgWithAdminInput['adminUser']
    ): Promise<UserRepresentation> {
        try {
            const verificationToken = this.generateVerificationToken();

            const createdUser = await kcAdminClient.users.create({
                username: adminUser.username,
                email: adminUser.email,
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                enabled: false,
                attributes: {
                    status: ['pending'],
                    verificationToken: [verificationToken]
                },
                credentials: [{
                    type: 'password',
                    value: adminUser.password,
                    temporary: false
                }]
            });

            if (!createdUser.id) {
                throw new KeycloakError('User created without an ID');
            }

            // Construct and return the full user object
            return {
                id: createdUser.id,
                username: adminUser.username,
                email: adminUser.email,
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                attributes: {
                    status: ['pending'],
                    verificationToken: [verificationToken]
                },
                enabled: false
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw new KeycloakError('Failed to create user');
        }
    }

    private async assignUserToOrganization(
        kcAdminClient: KeycloakAdminClient,
        organizationId: string,
        userId: string
    ): Promise<void> {
        try {
            await kcAdminClient.organizations.addMember({
                orgId: organizationId,
                userId: userId
            });
        } catch (error) {
            console.error('Error assigning user to organization:', error);
            throw new KeycloakError('Failed to assign user to organization');
        }
    }

    public async createOrganizationAndUser(
        input: CreateOrgWithAdminInput
    ): Promise<CreateOrgWithAdminResult> {
        this.validateInput(input);

        const kcAdminClient = await getKeycloakAdminClient();

        try {
            const org = await this.createOrganization(kcAdminClient, input.orgName);

            if (!org.id) {
                throw new KeycloakError('Organization created without an ID');
            }

            const user = await this.createUser(kcAdminClient, input.adminUser);

            if (!user.id) {
                throw new KeycloakError('User created without an ID');
            }

            await this.assignUserToOrganization(kcAdminClient, <string>org.id, <string>user.id);

            const tenant: Tenant = <Tenant>{
                id: org.id,
                name: org.name!
            };

            const adminUser: User = <User>{
                ...user
            };

            // Send admin notification asynchronously
            this.sendAdminNotification(adminUser, input.orgName).catch(console.error);

            // Generate verification link
            const verificationToken = user.attributes?.verificationToken?.[0];
            const verificationLink = `${this.appUrl}/verify-email?token=${verificationToken}`;
            this.sendUserVerificationEmail(adminUser, input.orgName, verificationLink).catch(console.error);

            return { tenant, adminUser };
        } catch (error) {
            if (error instanceof KeycloakError) {
                throw error;
            }
            console.error('Unexpected error in createOrganizationAndUser:', error);
            throw new KeycloakError('An unexpected error occurred while creating organization and user');
        }
    }

    private async updateUserStatus(userId: string, status: string, enabled: boolean): Promise<void> {
        const kcAdminClient: KeycloakAdminClient = await getKeycloakAdminClient();
        try {
            // First, fetch the current user data
            const currentUser = await kcAdminClient.users.findOne({ id: userId });

            if (!currentUser) {
                throw new Error('User not found');
            }

            // Prepare the update object, preserving existing attributes
            const updateData = {
                ...currentUser,
                enabled: enabled,
                attributes: {
                    ...currentUser.attributes,
                    status: [status]
                }
            };

            // Update the user
            await kcAdminClient.users.update(
                { id: userId },
                updateData
            );

            // Send email notification
            await this.sendStatusUpdateEmail(currentUser, status);
        } catch (error) {
            console.error(`Error updating user status to ${status}:`, error);
            throw new KeycloakError(`Failed to update user status to ${status}`);
        }
    }

    public async approveUser(userId: string): Promise<void> {
        await this.updateUserStatus(userId, 'approved', true);
    }

    public async rejectUser(userId: string): Promise<void> {
        await this.updateUserStatus(userId, 'rejected', false);
    }

    public async getPendingUsers(): Promise<UserWithOrg[]> {
        const kcAdminClient = await getKeycloakAdminClient();
        try {
            const pendingUsers = await kcAdminClient.users.find({
                max: 1000,
                enabled: false,
                exact: true,
                q: `status:pending`
            });

            // Extract unique org IDs from user attributes
            const orgIds = Array.from(new Set(pendingUsers.map(user => user.attributes?.['kc.org']?.[0]).filter(Boolean)));

            // Fetch organizations info using the extracted method
            const orgMap = await this.getOrganizationsInfo(orgIds);

            return pendingUsers.map(user => {
                const orgId = user.attributes?.['kc.org']?.[0];
                const org = orgId ? orgMap.get(orgId) : null;
                return {
                    id: user.id!,
                    username: user.username!,
                    email: user.email!,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    enabled: user.enabled!,
                    attributes: {...user.attributes},
                    organization: org ? {...org} : null,
                };
            });
        } catch (error) {
            console.error('Error fetching pending users:', error);
            throw new KeycloakError('Failed to fetch pending users');
        }
    }

    private async getOrganizationsInfo(orgIds: string[]): Promise<Map<string, Tenant>> {
        const kcAdminClient = await getKeycloakAdminClient();
        try {
            const keycloakOrgs = await Promise.all(
                orgIds.map(orgId => kcAdminClient.organizations.findOne({ id: orgId }))
            );

            return new Map(keycloakOrgs.map(org => [org.id!, {
                id: org.id!,
                name: org.name!,
                 }]));
        } catch (error) {
            console.error('Error fetching organizations info:', error);
            throw new KeycloakError('Failed to fetch organizations info');
        }
    }

    public async getUsersWithOrgInfo(query: PaginationQuery): Promise<PaginatedResult<UserWithOrg>> {
        const kcAdminClient = await getKeycloakAdminClient();
        try {
            const keycloakUsers = await kcAdminClient.users.find({
                max: query.pageSize,
                first: (query.page - 1) * query.pageSize,
            });

            // Extract unique org IDs from user attributes
            const orgIds = Array.from(new Set(keycloakUsers.map(user => user.attributes?.['kc.org']?.[0]).filter(Boolean)));

            // Fetch organizations info using the extracted method
            const orgMap = await this.getOrganizationsInfo(orgIds);

            const usersWithOrgs: UserWithOrg[] = keycloakUsers.map(keycloakUser => {
                const orgId = keycloakUser.attributes?.['kc.org']?.[0];
                const org = orgId ? orgMap.get(orgId) : null;
                return {
                    id: keycloakUser.id!,
                    username: keycloakUser.username!,
                    email: keycloakUser.email!,
                    firstName: keycloakUser.firstName,
                    lastName: keycloakUser.lastName,
                    enabled: keycloakUser.enabled!,
                    attributes: {...keycloakUser.attributes},
                    organization: org ? {...org} : null,
                };
            });

            const totalCount = await kcAdminClient.users.count();

            return {
                data: usersWithOrgs,
                totalCount,
                page: query.page,
                pageSize: query.pageSize,
                totalPages: Math.ceil(totalCount / query.pageSize),
            };
        } catch (error) {
            console.error('Error fetching users with organization info:', error);
            throw new KeycloakError('Failed to fetch users with organization info');
        }
    }

    public async verifyEmail(token: string): Promise<void> {
        try {
            const kcAdminClient = await getKeycloakAdminClient();
            const users = await kcAdminClient.users.find({
                max: 1,
                exact: true,
                q: `verificationToken:${token}`,
            });

            if (users.length === 0) {
                throw new KeycloakError('Invalid or expired verification token');
            }

            const user = users[0];

            await kcAdminClient.users.update(
                { id: user.id! },
                {
                    ...user,
                    emailVerified: true,
                    attributes: {
                        ...user.attributes,
                        verificationToken: undefined,
                    },
                }
            );

            console.log('User email verified successfully');
        } catch (error) {
            console.error('Error verifying email:', error);
            throw new KeycloakError('Failed to verify email');
        }
    }

    private async sendAdminNotification(newUser: any, orgName: string) {
        try {
            await emailService.sendEmail({
                to: process.env.ADMIN_EMAIL!,
                subject: `New User Registration for ${orgName}`,
                templateName: 'adminNotification',
                templateData: {
                    orgName,
                    username: newUser.username,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                },
            });
            console.log('Admin notification email sent successfully');
        } catch (error) {
            console.error('Failed to send admin notification email:', error);
        }
    }

    private async sendUserVerificationEmail(user: any, orgName: string, verificationLink: string) {
        try {
            await emailService.sendEmail({
                to: user.email,
                subject: `Verify Your Email for ${orgName}`,
                templateName: 'userVerification',
                templateData: {
                    orgName,
                    firstName: user.firstName,
                    verificationLink,
                },
            });
            console.log('User verification email sent successfully');
        } catch (error) {
            console.error('Failed to send user verification email:', error);
        }
    }

    private async sendStatusUpdateEmail(user: any, status: string): Promise<void> {
        try {
            const templateName = status === 'approved' ? 'userApproved' : 'userRejected';
            const subject = status === 'approved' ? 'Your account has been approved' : 'Your account application status';

            await emailService.sendEmail({
                to: user.email,
                subject: subject,
                templateName: templateName,
                templateData: {
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            });

            console.log(`${status.charAt(0).toUpperCase() + status.slice(1)} notification email sent successfully to ${user.email}`);
        } catch (error) {
            console.error(`Failed to send ${status} notification email:`, error);
        }
    }
}