import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js';

// Table name for members
const MEMBER_TABLE = 'member';

export class MemberService {
    private db = DatabaseService.getInstance();
    private static instance: MemberService;
    private tenantService: TenantService;

    private constructor() {
        this.tenantService = new TenantService();
        this.initializeDefaultData();
    }

    static getInstance(): MemberService {
        if (!MemberService.instance) {
            MemberService.instance = new MemberService();
        }
        return MemberService.instance;
    }

    /**
     * Initialize default member data for testing purposes.
     * In a production environment, this would be replaced with actual data.
     */
    private async initializeDefaultData() {
        try {
            // Check if we already have member data
            const existingMembers = await this.db.find(MEMBER_TABLE);
            if (existingMembers && existingMembers.length > 0) {
                return; // Data already exists
            }

            // Create default members
            const defaultMembers = [
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: 'Admin',
                    status: 'Active',
                    joinedAt: new Date('2024-12-01T10:00:00Z'),
                    tenantId: 'default_tenant',
                    workspaces: ['Default', 'Development']
                },
                {
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    role: 'Editor',
                    status: 'Active',
                    joinedAt: new Date('2025-01-15T14:30:00Z'),
                    tenantId: 'default_tenant',
                    workspaces: ['Default']
                }
            ];

            for (const member of defaultMembers) {
                await this.db.create(MEMBER_TABLE, member);
            }
            logger.info('[MemberService] Default members created');
        } catch (error) {
            logger.error(`[MemberService] Error initializing default data: ${(error as any).message}`);
        }
    }

    /**
     * Get all members for a tenant.
     */
    async getAllMembers(tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            const members = await this.db.find(MEMBER_TABLE, { tenantId });

            // If no members found, initialize with default data
            if (!members || members.length === 0) {
                await this.initializeDefaultData();
                return await this.db.find(MEMBER_TABLE, { tenantId });
            }

            return members;
        } catch (error) {
            logger.error(`[MemberService] Error fetching members: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Get member by ID.
     */
    async getMemberById(memberId: string, tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            const member = await this.db.findOne(MEMBER_TABLE, { memberId, tenantId });
            if (!member) {
                throw new Error(`Member not found: ${memberId}`);
            }

            return member;
        } catch (error) {
            logger.error(`[MemberService] Error fetching member: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Create a new member invitation.
     */
    async inviteMember(data: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(data.tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${data.tenantId}`);
            }

            // Check if email already exists
            const existingMember = await this.db.findOne(MEMBER_TABLE, { email: data.email, tenantId: data.tenantId });
            if (existingMember) {
                throw new Error(`Member with email ${data.email} already exists`);
            }

            // Create new member with Pending status
            const newMember = await this.db.create(MEMBER_TABLE, {
                ...data,
                status: 'Pending',
                joinedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            logger.info(`[MemberService] Member invitation created: ${newMember.memberId}`);
            return newMember;
        } catch (error) {
            logger.error(`[MemberService] Error inviting member: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update a member.
     */
    async updateMember(memberId: string, data: any, tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Check if member exists
            const existingMember = await this.db.findOne(MEMBER_TABLE, { memberId, tenantId });
            if (!existingMember) {
                throw new Error(`Member not found: ${memberId}`);
            }

            // Update member
            const result = await this.db.update(
                MEMBER_TABLE,
                { memberId, tenantId },
                { ...data, updatedAt: new Date() },
                undefined
            );

            if (!result) {
                throw new Error(`Failed to update member: ${memberId}`);
            }

            logger.info(`[MemberService] Member updated: ${memberId}`);
            return await this.db.findOne(MEMBER_TABLE, { memberId, tenantId });
        } catch (error) {
            logger.error(`[MemberService] Error updating member: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Remove a member.
     */
    async removeMember(memberId: string, tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Check if member exists
            const existingMember = await this.db.findOne(MEMBER_TABLE, { memberId, tenantId });
            if (!existingMember) {
                throw new Error(`Member not found: ${memberId}`);
            }

            // Delete member
            const result = await this.db.delete(MEMBER_TABLE, { memberId, tenantId });
            if (!result) {
                throw new Error(`Failed to delete member: ${memberId}`);
            }

            logger.info(`[MemberService] Member deleted: ${memberId}`);
            return result;
        } catch (error) {
            logger.error(`[MemberService] Error removing member: ${(error as any).message}`);
            throw error;
        }
    }
}
