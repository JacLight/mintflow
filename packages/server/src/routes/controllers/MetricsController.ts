import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { MetricsService } from '../../services/MetricsService.js';

// Get instance of MetricsService
const metricsService = MetricsService.getInstance();

/**
 * Get overall usage statistics.
 */
export async function getUsageStats(req: Request, res: Response): Promise<any> {
    try {
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate tenant ID
        if (!tenantId) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Tenant ID is required']
            });
        }

        try {
            // Get usage metrics from service
            const usageMetrics = await metricsService.getUsageMetrics(tenantId);

            // If no metrics found, return empty data
            if (!usageMetrics || usageMetrics.length === 0) {
                return res.status(200).json({
                    totalRequests: 0,
                    totalTokens: 0,
                    requestsByModel: {},
                    tokensByModel: {}
                });
            }

            // Aggregate metrics
            let totalRequests = 0;
            let totalTokens = 0;
            const requestsByModel: Record<string, number> = {};
            const tokensByModel: Record<string, number> = {};

            usageMetrics.forEach(metric => {
                totalRequests += metric.totalRequests || 0;
                totalTokens += metric.totalTokens || 0;

                // Merge model data
                if (metric.requestsByModel) {
                    Object.entries(metric.requestsByModel).forEach(([model, count]) => {
                        requestsByModel[model] = (requestsByModel[model] || 0) + (count as number);
                    });
                }

                if (metric.tokensByModel) {
                    Object.entries(metric.tokensByModel).forEach(([model, count]) => {
                        tokensByModel[model] = (tokensByModel[model] || 0) + (count as number);
                    });
                }
            });

            return res.status(200).json({
                totalRequests,
                totalTokens,
                requestsByModel,
                tokensByModel
            });
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[MetricsController] Error fetching usage stats: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }
}

/**
 * Get usage statistics for a specific time period.
 */
export async function getUsageByPeriod(req: Request, res: Response): Promise<any> {
    try {
        const period = req.params.period; // 'daily', 'weekly', 'monthly'

        // Validate period
        if (!period) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Period is required']
            });
        }

        if (!['daily', 'weekly', 'monthly'].includes(period)) {
            return res.status(400).json({
                error: 'Validation error',
                details: [`Invalid period: ${period}. Must be one of: daily, weekly, monthly`]
            });
        }

        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate tenant ID
        if (!tenantId) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Tenant ID is required']
            });
        }

        try {
            // Get usage metrics from service
            const usageMetrics = await metricsService.getUsageMetricsByPeriod(tenantId, period);

            // If no metrics found, return empty data
            if (!usageMetrics || usageMetrics.length === 0) {
                return res.status(200).json({
                    period,
                    data: []
                });
            }

            // Format data for response
            const data = usageMetrics.map(metric => ({
                date: metric.date ? new Date(metric.date).toISOString().split('T')[0] : null,
                requests: metric.totalRequests || 0,
                tokens: metric.totalTokens || 0,
                requestsByModel: metric.requestsByModel || {},
                tokensByModel: metric.tokensByModel || {}
            }));

            // Sort by date
            data.sort((a, b) => {
                if (!a.date) return 1;
                if (!b.date) return -1;
                return a.date.localeCompare(b.date);
            });

            return res.status(200).json({
                period,
                data
            });
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[MetricsController] Error fetching usage by period: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch usage statistics by period' });
    }
}

/**
 * Get overall cost statistics.
 */
export async function getCostStats(req: Request, res: Response): Promise<any> {
    try {
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate tenant ID
        if (!tenantId) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Tenant ID is required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const costData = {
            totalCost: 1534.42,
            costByModel: {
                'claude-3-sonnet': 982.45,
                'claude-3-haiku': 356.92,
                'claude-3-opus': 195.05
            },
            costByWorkspace: {
                'Default': 1200.50,
                'Development': 333.92
            }
        };

        return res.status(200).json(costData);
    } catch (err: any) {
        logger.error(`[MetricsController] Error fetching cost stats: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch cost statistics' });
    }
}

/**
 * Get cost statistics for a specific time period.
 */
export async function getCostByPeriod(req: Request, res: Response): Promise<any> {
    try {
        const period = req.params.period; // 'daily', 'weekly', 'monthly'

        // Validate period
        if (!period) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Period is required']
            });
        }

        if (!['daily', 'weekly', 'monthly'].includes(period)) {
            return res.status(400).json({
                error: 'Validation error',
                details: [`Invalid period: ${period}. Must be one of: daily, weekly, monthly`]
            });
        }

        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate tenant ID
        if (!tenantId) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Tenant ID is required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const costData = {
            period,
            data: [
                { date: '2025-03-01', cost: 98.00 },
                { date: '2025-03-02', cost: 105.00 },
                { date: '2025-03-03', cost: 75.00 },
                { date: '2025-03-04', cost: 25.00 },
                { date: '2025-03-05', cost: 65.00 },
                { date: '2025-03-06', cost: 5.00 },
                { date: '2025-03-07', cost: 70.00 },
                // More data points would be here
            ]
        };

        return res.status(200).json(costData);
    } catch (err: any) {
        logger.error(`[MetricsController] Error fetching cost by period: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch cost statistics by period' });
    }
}
