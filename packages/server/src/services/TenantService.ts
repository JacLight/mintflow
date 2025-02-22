import { DatabaseService } from './DatabaseService.js';
import { logger } from '@mintflow/common';

export class TenantService {
    private db = DatabaseService.getInstance();

    async createTenant(data: any) {
        try {
            const tenant = await this.db.create('tenants', data);
            logger.info(`[TenantService] Tenant created: ${tenant.tenantId}`);
            return tenant;
        } catch (error) {
            logger.error(`[TenantService] Error creating tenant: ${(error as any).message}`);
            throw new Error('Failed to create tenant.');
        }
    }

    async getAllTenants() {
        try {
            return await this.db.find('tenants');
        } catch (error) {
            logger.error(`[TenantService] Error fetching tenants: ${(error as any).message}`);
            throw new Error('Failed to fetch tenants.');
        }
    }

    async getTenantById(tenantId: string) {
        try {
            const tenant = await this.db.findOne('tenants', { tenantId });
            if (!tenant) {
                throw new Error('Tenant not found.');
            }
            return tenant;
        } catch (error) {
            logger.error(`[TenantService] Error fetching tenant: ${(error as any).message}`);
            throw new Error((error as any).message);
        }
    }

    async updateTenant(tenantId: string, updateData: any) {
        try {
            const result = await this.db.update('tenants', { tenantId }, updateData);
            if (!result) {
                throw new Error('Tenant not found or update failed.');
            }
            logger.info(`[TenantService] Tenant updated: ${tenantId}`);
            return result;
        } catch (error) {
            logger.error(`[TenantService] Error updating tenant: ${(error as any).message}`);
            throw new Error((error as any).message);
        }
    }

    async deleteTenant(tenantId: string) {
        try {
            const result = await this.db.delete('tenants', { tenantId });
            if (!result) {
                throw new Error('Tenant not found or deletion failed.');
            }
            logger.info(`[TenantService] Tenant deleted: ${tenantId}`);
            return result;
        } catch (error) {
            logger.error(`[TenantService] Error deleting tenant: ${(error as any).message}`);
            throw new Error((error as any).message);
        }
    }
}
