import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js';

// Table names for different metrics resources
const USAGE_METRICS_TABLE = 'usage_metrics';
const COST_METRICS_TABLE = 'cost_metrics';

export class MetricsService {
    private db = DatabaseService.getInstance();
    private static instance: MetricsService;
    private tenantService: TenantService;

    private constructor() {
        this.tenantService = new TenantService();
    }

    static getInstance(): MetricsService {
        if (!MetricsService.instance) {
            MetricsService.instance = new MetricsService();
        }
        return MetricsService.instance;
    }

    // ==================== Usage Metrics ====================

    /**
     * Get usage metrics for a tenant.
     */
    async getUsageMetrics(tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            const usageMetrics = await this.db.find(USAGE_METRICS_TABLE, { tenantId });
            return usageMetrics;
        } catch (error) {
            logger.error(`[MetricsService] Error fetching usage metrics: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Get usage metrics for a specific period.
     */
    async getUsageMetricsByPeriod(tenantId: string, period: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Validate period
            if (!['daily', 'weekly', 'monthly'].includes(period)) {
                throw new Error(`Invalid period: ${period}. Must be one of: daily, weekly, monthly`);
            }

            const usageMetrics = await this.db.find(USAGE_METRICS_TABLE, { tenantId, period });
            return usageMetrics;
        } catch (error) {
            logger.error(`[MetricsService] Error fetching usage metrics by period: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Create or update usage metrics.
     */
    async updateUsageMetrics(data: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(data.tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${data.tenantId}`);
            }

            // Check if metrics already exist for this tenant and period
            const existingMetrics = await this.db.findOne(USAGE_METRICS_TABLE, {
                tenantId: data.tenantId,
                period: data.period,
                date: data.date
            });

            if (existingMetrics) {
                // Update existing metrics
                const updatedData = {
                    totalRequests: (existingMetrics.totalRequests || 0) + (data.totalRequests || 0),
                    totalTokens: (existingMetrics.totalTokens || 0) + (data.totalTokens || 0),
                    requestsByModel: this.mergeModelData(existingMetrics.requestsByModel || {}, data.requestsByModel || {}),
                    tokensByModel: this.mergeModelData(existingMetrics.tokensByModel || {}, data.tokensByModel || {})
                };

                const result = await this.db.update(
                    USAGE_METRICS_TABLE,
                    { usageId: existingMetrics.usageId },
                    updatedData,
                    undefined
                );

                if (!result) {
                    throw new Error(`Failed to update usage metrics: ${existingMetrics.usageId}`);
                }

                logger.info(`[MetricsService] Usage metrics updated: ${existingMetrics.usageId}`);
                return await this.db.findOne(USAGE_METRICS_TABLE, { usageId: existingMetrics.usageId });
            } else {
                // Create new metrics
                const newMetrics = await this.db.create(USAGE_METRICS_TABLE, data);
                logger.info(`[MetricsService] Usage metrics created: ${newMetrics.usageId}`);
                return newMetrics;
            }
        } catch (error) {
            logger.error(`[MetricsService] Error updating usage metrics: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Delete usage metrics.
     */
    async deleteUsageMetrics(usageId: string, tenantId: string) {
        try {
            const result = await this.db.delete(USAGE_METRICS_TABLE, { usageId, tenantId });
            if (!result) {
                throw new Error(`Usage metrics not found or deletion failed: ${usageId}`);
            }
            logger.info(`[MetricsService] Usage metrics deleted: ${usageId}`);
            return result;
        } catch (error) {
            logger.error(`[MetricsService] Error deleting usage metrics: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Helper method to merge model data.
     */
    private mergeModelData(existing: Record<string, number>, update: Record<string, number>): Record<string, number> {
        const result = { ...existing };

        // Add or update values from the update object
        for (const [model, value] of Object.entries(update)) {
            result[model] = (result[model] || 0) + value;
        }

        return result;
    }

    // ==================== Cost Metrics ====================
    // TODO: Implement cost metrics methods
}
