import { DatabaseService } from './DatabaseService.js';
import { logger } from '@mintflow/common';

const TABLE_NAME = 'tenant';
export class TenantService {
    private db = DatabaseService.getInstance();

    async createTenant(data: any) {
        try {
            const tenant = await this.db.create(TABLE_NAME, data);
            logger.info(`[TenantService] Tenant created: ${tenant.tenantId}`);
            return tenant;
        } catch (error) {
            logger.error(`[TenantService] Error creating tenant: ${(error as any).message}`);
            throw error;
        }
    }

    async getAllTenants() {
        try {
            return await this.db.find(TABLE_NAME);
        } catch (error) {
            logger.error(`[TenantService] Error fetching tenants: ${(error as any).message}`);
            throw error;
        }
    }

    async getTenantById(tenantId: string) {
        try {
            const tenant = await this.db.findOne(TABLE_NAME, { '$or': [{ tenantId }, { name: tenantId }] });
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }
            return tenant;
        } catch (error) {
            logger.error(`[TenantService] Error fetching tenant: ${(error as any).message}`);
            throw error;
        }
    }

    async updateTenant(tenantId: string, updateData: any) {
        try {
            const result = await this.db.update(TABLE_NAME, { tenantId }, updateData);
            if (!result) {
                throw new Error('Tenant not found or update failed.');
            }
            logger.info(`[TenantService] Tenant updated: ${tenantId}`);
            return result;
        } catch (error) {
            logger.error(`[TenantService] Error updating tenant: ${(error as any).message}`);
            throw error;
        }
    }

    async deleteTenant(tenantId: string) {
        try {
            const result = await this.db.delete(TABLE_NAME, { tenantId });
            if (!result) {
                throw new Error('Tenant not found or deletion failed.');
            }
            logger.info(`[TenantService] Tenant deleted: ${tenantId}`);
            return result;
        } catch (error) {
            logger.error(`[TenantService] Error deleting tenant: ${(error as any).message}`);
            throw error;
        }
    }
}
