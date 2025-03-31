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

    /**
     * Get cost metrics for a tenant.
     */
    async getCostMetrics(tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            const costMetrics = await this.db.find(COST_METRICS_TABLE, { tenantId });

            // If no metrics found, initialize with default data
            if (!costMetrics || costMetrics.length === 0) {
                await this.initializeDefaultCostMetrics(tenantId);
                return await this.db.find(COST_METRICS_TABLE, { tenantId });
            }

            return costMetrics;
        } catch (error) {
            logger.error(`[MetricsService] Error fetching cost metrics: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Get cost metrics for a specific period.
     */
    async getCostMetricsByPeriod(tenantId: string, period: string) {
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

            const costMetrics = await this.db.find(COST_METRICS_TABLE, { tenantId, period });

            // If no metrics found, initialize with default data
            if (!costMetrics || costMetrics.length === 0) {
                await this.initializeDefaultCostMetrics(tenantId);
                return await this.db.find(COST_METRICS_TABLE, { tenantId, period });
            }

            return costMetrics;
        } catch (error) {
            logger.error(`[MetricsService] Error fetching cost metrics by period: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Create or update cost metrics.
     */
    async updateCostMetrics(data: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(data.tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${data.tenantId}`);
            }

            // Check if metrics already exist for this tenant and period
            const existingMetrics = await this.db.findOne(COST_METRICS_TABLE, {
                tenantId: data.tenantId,
                period: data.period,
                date: data.date
            });

            if (existingMetrics) {
                // Update existing metrics
                const updatedData = {
                    totalCost: (existingMetrics.totalCost || 0) + (data.totalCost || 0),
                    costByModel: this.mergeModelData(existingMetrics.costByModel || {}, data.costByModel || {}),
                    costByWorkspace: this.mergeModelData(existingMetrics.costByWorkspace || {}, data.costByWorkspace || {})
                };

                const result = await this.db.update(
                    COST_METRICS_TABLE,
                    { costId: existingMetrics.costId },
                    updatedData,
                    undefined
                );

                if (!result) {
                    throw new Error(`Failed to update cost metrics: ${existingMetrics.costId}`);
                }

                logger.info(`[MetricsService] Cost metrics updated: ${existingMetrics.costId}`);
                return await this.db.findOne(COST_METRICS_TABLE, { costId: existingMetrics.costId });
            } else {
                // Create new metrics
                const newMetrics = await this.db.create(COST_METRICS_TABLE, data);
                logger.info(`[MetricsService] Cost metrics created: ${newMetrics.costId}`);
                return newMetrics;
            }
        } catch (error) {
            logger.error(`[MetricsService] Error updating cost metrics: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Initialize default cost metrics for testing purposes.
     * In a production environment, this would be replaced with actual data.
     */
    private async initializeDefaultCostMetrics(tenantId: string) {
        try {
            // Check if we already have cost metrics data
            const existingMetrics = await this.db.find(COST_METRICS_TABLE, { tenantId });
            if (existingMetrics && existingMetrics.length > 0) {
                return; // Data already exists
            }

            // Create default cost metrics
            const defaultCostMetrics = {
                tenantId,
                totalCost: 1534.42,
                costByModel: {
                    'claude-3-sonnet': 982.45,
                    'claude-3-haiku': 356.92,
                    'claude-3-opus': 195.05
                },
                costByWorkspace: {
                    'Default': 1200.50,
                    'Development': 333.92
                },
                period: 'monthly',
                date: new Date()
            };

            await this.db.create(COST_METRICS_TABLE, defaultCostMetrics);
            logger.info(`[MetricsService] Default cost metrics created for tenant: ${tenantId}`);

            // Create daily cost metrics for the past week
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);

                const dailyCost = {
                    tenantId,
                    totalCost: 50 + Math.random() * 50, // Random cost between 50 and 100
                    costByModel: {
                        'claude-3-sonnet': 30 + Math.random() * 30,
                        'claude-3-haiku': 10 + Math.random() * 20,
                        'claude-3-opus': 5 + Math.random() * 15
                    },
                    costByWorkspace: {
                        'Default': 40 + Math.random() * 40,
                        'Development': 10 + Math.random() * 10
                    },
                    period: 'daily',
                    date
                };

                await this.db.create(COST_METRICS_TABLE, dailyCost);
            }

            logger.info(`[MetricsService] Default daily cost metrics created for tenant: ${tenantId}`);
        } catch (error) {
            logger.error(`[MetricsService] Error initializing default cost metrics: ${(error as any).message}`);
            throw error;
        }
    }
}
