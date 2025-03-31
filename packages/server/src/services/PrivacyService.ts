import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js';

// Table name for privacy settings
const PRIVACY_TABLE = 'privacy';

export class PrivacyService {
    private db = DatabaseService.getInstance();
    private static instance: PrivacyService;
    private tenantService: TenantService;

    private constructor() {
        this.tenantService = new TenantService();
        this.initializeDefaultData();
    }

    static getInstance(): PrivacyService {
        if (!PrivacyService.instance) {
            PrivacyService.instance = new PrivacyService();
        }
        return PrivacyService.instance;
    }

    /**
     * Initialize default privacy settings for testing purposes.
     * In a production environment, this would be replaced with actual data.
     */
    private async initializeDefaultData() {
        try {
            // Check if we already have privacy settings
            const existingSettings = await this.db.find(PRIVACY_TABLE);
            if (existingSettings && existingSettings.length > 0) {
                return; // Data already exists
            }

            // Create default privacy settings
            const defaultSettings = {
                tenantId: 'default_tenant',
                dataRetention: {
                    logs: 30, // days
                    analytics: 90 // days
                },
                dataSharingConsent: true,
                marketingEmails: false,
                twoFactorAuth: true
            };

            await this.db.create(PRIVACY_TABLE, defaultSettings);
            logger.info('[PrivacyService] Default privacy settings created');
        } catch (error) {
            logger.error(`[PrivacyService] Error initializing default data: ${(error as any).message}`);
        }
    }

    /**
     * Get privacy settings for a tenant.
     */
    async getPrivacySettings(tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get privacy settings
            const settings = await this.db.findOne(PRIVACY_TABLE, { tenantId });

            // If no settings found, initialize with default data
            if (!settings) {
                await this.initializeDefaultData();
                return await this.db.findOne(PRIVACY_TABLE, { tenantId });
            }

            return settings;
        } catch (error) {
            logger.error(`[PrivacyService] Error fetching privacy settings: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update privacy settings for a tenant.
     */
    async updatePrivacySettings(tenantId: string, data: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Check if settings exist
            const existingSettings = await this.db.findOne(PRIVACY_TABLE, { tenantId });
            if (!existingSettings) {
                // Create new settings
                const newSettings = await this.db.create(PRIVACY_TABLE, {
                    tenantId,
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                logger.info(`[PrivacyService] Privacy settings created for tenant: ${tenantId}`);
                return newSettings;
            }

            // Update settings
            const result = await this.db.update(
                PRIVACY_TABLE,
                { tenantId },
                { ...data, updatedAt: new Date() },
                undefined
            );

            if (!result) {
                throw new Error(`Failed to update privacy settings for tenant: ${tenantId}`);
            }

            logger.info(`[PrivacyService] Privacy settings updated for tenant: ${tenantId}`);
            return await this.db.findOne(PRIVACY_TABLE, { tenantId });
        } catch (error) {
            logger.error(`[PrivacyService] Error updating privacy settings: ${(error as any).message}`);
            throw error;
        }
    }
}
