import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Table names for different admin resources
const API_KEYS_TABLE = 'api_key';

export class AdminService {
    private db = DatabaseService.getInstance();
    private static instance: AdminService;
    private tenantService: TenantService;

    private constructor() {
        this.tenantService = new TenantService();
    }

    static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    // ==================== API Keys ====================

    /**
     * Get all API keys for a tenant.
     */
    async getAllApiKeys(tenantId: string) {
        try {
            const apiKeys = await this.db.find(API_KEYS_TABLE, { tenantId });
            // Transform the data to match UI expectations
            return apiKeys.map(key => {
                const { fullKey, ...safeKey } = key;
                return {
                    id: key.apiKeyId,
                    name: key.name,
                    prefix: key.apiKeyId.substring(0, 8),
                    secret: '••••••••••••••••',
                    fullSecret: key.fullKey || `${key.apiKeyId.substring(0, 8)}...`,
                    created: key.createdAt,
                    workspace: key.workspace,
                    environment: key.environment,
                    lastUsed: key.lastUsed || key.createdAt
                };
            });
        } catch (error) {
            logger.error(`[AdminService] Error fetching API keys: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Get API key by ID.
     */
    async getApiKeyById(apiKeyId: string, tenantId: string) {
        try {
            const apiKey = await this.db.findOne(API_KEYS_TABLE, { apiKeyId, tenantId });
            if (!apiKey) {
                throw new Error(`API key not found: ${apiKeyId}`);
            }

            // Don't return the full key in the response
            const { fullKey, ...safeKey } = apiKey;
            return safeKey;
        } catch (error) {
            logger.error(`[AdminService] Error fetching API key: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Create a new API key.
     */
    async createApiKey(data: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(data.tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${data.tenantId}`);
            }

            // Generate a secure API key
            const fullKey = this.generateApiKey();
            const prefix = fullKey.substring(0, 8);

            const apiKeyData = {
                name: data.name,
                prefix,
                fullKey,
                created: new Date(),
                workspace: data.workspace,
                environment: data.environment,
                lastUsed: null,
                tenantId: data.tenantId
            };

            const apiKey = await this.db.create(API_KEYS_TABLE, apiKeyData);
            logger.info(`[AdminService] API key created: ${apiKey.apiKeyId}`);

            // Return the full key only on creation
            return apiKey;
        } catch (error) {
            logger.error(`[AdminService] Error creating API key: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update an API key.
     */
    async updateApiKey(apiKeyId: string, data: any, tenantId: string) {
        try {
            const apiKey = await this.db.findOne(API_KEYS_TABLE, { apiKeyId, tenantId });
            if (!apiKey) {
                throw new Error(`API key not found: ${apiKeyId}`);
            }

            const updatedData = { ...data };
            delete updatedData.apiKeyId;
            delete updatedData.prefix;
            delete updatedData.fullKey;
            delete updatedData.created;
            delete updatedData.tenantId;
            updatedData.updatedAt = new Date();

            const result = await this.db.update(API_KEYS_TABLE, { apiKeyId, tenantId }, updatedData, undefined);
            if (!result) {
                throw new Error(`API key update failed: ${apiKeyId}`);
            }

            logger.info(`[AdminService] API key updated: ${apiKeyId}`);
            return this.getApiKeyById(apiKeyId, tenantId);
        } catch (error) {
            logger.error(`[AdminService] Error updating API key: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Delete an API key.
     */
    async deleteApiKey(apiKeyId: string, tenantId: string) {
        try {
            const result = await this.db.delete(API_KEYS_TABLE, { apiKeyId, tenantId });
            if (!result) {
                throw new Error(`API key not found or deletion failed: ${apiKeyId}`);
            }
            logger.info(`[AdminService] API key deleted: ${apiKeyId}`);
            return result;
        } catch (error) {
            logger.error(`[AdminService] Error deleting API key: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update the last used timestamp for an API key.
     */
    async updateApiKeyLastUsed(apiKeyId: string) {
        try {
            const result = await this.db.update(API_KEYS_TABLE, { apiKeyId }, { lastUsed: new Date() }, undefined);
            if (!result) {
                throw new Error(`API key not found or update failed: ${apiKeyId}`);
            }
            return result;
        } catch (error) {
            logger.error(`[AdminService] Error updating API key last used: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Validate an API key.
     */
    async validateApiKey(apiKey: string) {
        try {
            const prefix = apiKey.substring(0, 8);
            const keys = await this.db.find(API_KEYS_TABLE, { prefix });

            for (const key of keys) {
                if (key.fullKey === apiKey) {
                    // Update last used timestamp
                    await this.updateApiKeyLastUsed(key.apiKeyId);
                    return key;
                }
            }

            return null;
        } catch (error) {
            logger.error(`[AdminService] Error validating API key: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Generate a secure API key.
     */
    private generateApiKey(): string {
        const prefix = 'sk_';
        const randomBytes = crypto.randomBytes(24).toString('hex');
        return `${prefix}${randomBytes}`;
    }

    // ==================== Profile ====================
    // TODO: Implement profile methods

    // ==================== Members ====================
    // TODO: Implement members methods

    // ==================== Workspaces ====================
    // TODO: Implement workspaces methods

    // ==================== Billing ====================
    // TODO: Implement billing methods

    // ==================== Limits ====================
    // TODO: Implement limits methods

    // ==================== Privacy ====================
    // TODO: Implement privacy methods
}
