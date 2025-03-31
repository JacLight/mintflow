import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js';

// Table name for limits
const LIMITS_TABLE = 'limits';

export class LimitsService {
    private db = DatabaseService.getInstance();
    private static instance: LimitsService;
    private tenantService: TenantService;

    private constructor() {
        this.tenantService = new TenantService();
        this.initializeDefaultData();
    }

    static getInstance(): LimitsService {
        if (!LimitsService.instance) {
            LimitsService.instance = new LimitsService();
        }
        return LimitsService.instance;
    }

    /**
     * Initialize default limits data for testing purposes.
     * In a production environment, this would be replaced with actual data.
     */
    private async initializeDefaultData() {
        try {
            // Check if we already have limits data
            const existingLimits = await this.db.find(LIMITS_TABLE);
            if (existingLimits && existingLimits.length > 0) {
                return; // Data already exists
            }

            // Create default limits
            const defaultLimits = {
                tenantId: 'default_tenant',
                apiRateLimit: 100,
                maxWorkspaces: 5,
                maxMembers: 10,
                maxStorage: 10 * 1024 * 1024 * 1024, // 10 GB
                currentUsage: {
                    apiCalls: 42,
                    workspaces: 2,
                    members: 5,
                    storage: 2.5 * 1024 * 1024 * 1024 // 2.5 GB
                }
            };

            await this.db.create(LIMITS_TABLE, defaultLimits);
            logger.info('[LimitsService] Default limits created');
        } catch (error) {
            logger.error(`[LimitsService] Error initializing default data: ${(error as any).message}`);
        }
    }

    /**
     * Get limits for a tenant.
     */
    async getLimits(tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get limits
            const limits = await this.db.findOne(LIMITS_TABLE, { tenantId });

            // If no limits found, initialize with default data
            if (!limits) {
                await this.initializeDefaultData();
                return await this.db.findOne(LIMITS_TABLE, { tenantId });
            }

            return limits;
        } catch (error) {
            logger.error(`[LimitsService] Error fetching limits: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update limits for a tenant.
     */
    async updateLimits(tenantId: string, data: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Check if limits exist
            const existingLimits = await this.db.findOne(LIMITS_TABLE, { tenantId });
            if (!existingLimits) {
                // Create new limits
                const newLimits = await this.db.create(LIMITS_TABLE, {
                    tenantId,
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                logger.info(`[LimitsService] Limits created for tenant: ${tenantId}`);
                return newLimits;
            }

            // Update limits
            const result = await this.db.update(
                LIMITS_TABLE,
                { tenantId },
                { ...data, updatedAt: new Date() },
                undefined
            );

            if (!result) {
                throw new Error(`Failed to update limits for tenant: ${tenantId}`);
            }

            logger.info(`[LimitsService] Limits updated for tenant: ${tenantId}`);
            return await this.db.findOne(LIMITS_TABLE, { tenantId });
        } catch (error) {
            logger.error(`[LimitsService] Error updating limits: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update current usage for a tenant.
     */
    async updateUsage(tenantId: string, usage: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Check if limits exist
            const existingLimits = await this.db.findOne(LIMITS_TABLE, { tenantId });
            if (!existingLimits) {
                // Initialize default limits first
                await this.initializeDefaultData();
                const limits = await this.db.findOne(LIMITS_TABLE, { tenantId });

                // Update usage
                const result = await this.db.update(
                    LIMITS_TABLE,
                    { tenantId },
                    {
                        currentUsage: { ...limits.currentUsage, ...usage },
                        updatedAt: new Date()
                    },
                    undefined
                );

                if (!result) {
                    throw new Error(`Failed to update usage for tenant: ${tenantId}`);
                }

                logger.info(`[LimitsService] Usage updated for tenant: ${tenantId}`);
                return await this.db.findOne(LIMITS_TABLE, { tenantId });
            }

            // Update usage
            const result = await this.db.update(
                LIMITS_TABLE,
                { tenantId },
                {
                    currentUsage: { ...existingLimits.currentUsage, ...usage },
                    updatedAt: new Date()
                },
                undefined
            );

            if (!result) {
                throw new Error(`Failed to update usage for tenant: ${tenantId}`);
            }

            logger.info(`[LimitsService] Usage updated for tenant: ${tenantId}`);
            return await this.db.findOne(LIMITS_TABLE, { tenantId });
        } catch (error) {
            logger.error(`[LimitsService] Error updating usage: ${(error as any).message}`);
            throw error;
        }
    }
}
