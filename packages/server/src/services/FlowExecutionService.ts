import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js';

// Table names for different flow execution resources
const FLOW_EXECUTION_TABLE = 'flow_execution';

export class FlowExecutionService {
    private db = DatabaseService.getInstance();
    private static instance: FlowExecutionService;
    private tenantService: TenantService;

    private constructor() {
        this.tenantService = new TenantService();
        this.initializeDefaultData();
    }

    static getInstance(): FlowExecutionService {
        if (!FlowExecutionService.instance) {
            FlowExecutionService.instance = new FlowExecutionService();
        }
        return FlowExecutionService.instance;
    }

    /**
     * Initialize default flow execution data for testing purposes.
     * In a production environment, this would be replaced with actual data.
     */
    private async initializeDefaultData() {
        try {
            // Check if we already have flow execution data
            const existingExecutions = await this.db.find(FLOW_EXECUTION_TABLE);
            if (existingExecutions && existingExecutions.length > 0) {
                return; // Data already exists
            }

            // Create default flow executions
            const defaultExecutions = [
                {
                    tenantId: 'default_tenant',
                    flowId: 'flow-123456',
                    name: 'User Onboarding Flow',
                    status: 'running',
                    startTime: new Date('2025-03-28T09:15:22Z'),
                    duration: '1h 24m',
                    progress: 78,
                    nextStep: 'Send welcome email',
                    triggers: 142,
                    errors: 0,
                    type: 'scheduled',
                    steps: [
                        { name: 'Initialize', status: 'completed', duration: '2s' },
                        { name: 'Validate user data', status: 'completed', duration: '5s' },
                        { name: 'Create user account', status: 'completed', duration: '12s' },
                        { name: 'Send welcome email', status: 'running', duration: '1h 23m' },
                        { name: 'Log completion', status: 'pending', duration: '0s' }
                    ]
                },
                {
                    tenantId: 'default_tenant',
                    flowId: 'flow-789012',
                    name: 'Payment Processing',
                    status: 'paused',
                    startTime: new Date('2025-03-28T10:42:05Z'),
                    duration: '47m',
                    progress: 52,
                    nextStep: 'Validate transaction',
                    triggers: 89,
                    errors: 3,
                    type: 'api',
                    steps: [
                        { name: 'Initialize', status: 'completed', duration: '1s' },
                        { name: 'Validate payment details', status: 'completed', duration: '3s' },
                        { name: 'Process payment', status: 'paused', duration: '43m' },
                        { name: 'Send confirmation', status: 'pending', duration: '0s' }
                    ]
                },
                {
                    tenantId: 'default_tenant',
                    flowId: 'flow-345678',
                    name: 'Data Sync: Google Analytics',
                    status: 'error',
                    startTime: new Date('2025-03-28T08:30:18Z'),
                    duration: '2h 12m',
                    progress: 43,
                    nextStep: 'Transform data',
                    triggers: 1,
                    errors: 2,
                    type: 'scheduled',
                    steps: [
                        { name: 'Initialize', status: 'completed', duration: '2s' },
                        { name: 'Fetch data', status: 'completed', duration: '1h 45m' },
                        { name: 'Transform data', status: 'error', duration: '25m' },
                        { name: 'Save data', status: 'pending', duration: '0s' }
                    ]
                },
                {
                    tenantId: 'default_tenant',
                    flowId: 'flow-901234',
                    name: 'Customer Notification Service',
                    status: 'running',
                    startTime: new Date('2025-03-28T11:05:33Z'),
                    duration: '32m',
                    progress: 91,
                    nextStep: 'Log notification',
                    triggers: 324,
                    errors: 0,
                    type: 'webhook',
                    steps: [
                        { name: 'Initialize', status: 'completed', duration: '1s' },
                        { name: 'Prepare notification', status: 'completed', duration: '5s' },
                        { name: 'Send notification', status: 'completed', duration: '25m' },
                        { name: 'Log notification', status: 'running', duration: '1m' }
                    ]
                },
                {
                    tenantId: 'default_tenant',
                    flowId: 'flow-567890',
                    name: 'Automated Monthly Report',
                    status: 'completed',
                    startTime: new Date('2025-03-28T07:00:00Z'),
                    endTime: new Date('2025-03-28T07:23:00Z'),
                    duration: '23m',
                    progress: 100,
                    nextStep: 'None',
                    triggers: 1,
                    errors: 0,
                    type: 'scheduled',
                    steps: [
                        { name: 'Initialize', status: 'completed', duration: '1s' },
                        { name: 'Gather data', status: 'completed', duration: '15m' },
                        { name: 'Generate report', status: 'completed', duration: '5m' },
                        { name: 'Send report', status: 'completed', duration: '2m' },
                        { name: 'Log completion', status: 'completed', duration: '1s' }
                    ]
                }
            ];

            for (const execution of defaultExecutions) {
                await this.db.create(FLOW_EXECUTION_TABLE, execution);
            }
            logger.info('[FlowExecutionService] Default flow executions created');
        } catch (error) {
            logger.error(`[FlowExecutionService] Error initializing default data: ${(error as any).message}`);
        }
    }

    /**
     * Get all flow executions for a tenant.
     */
    async getAllFlowExecutions(tenantId: string, status: string = 'all') {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get flow executions
            let query: any = { tenantId };

            // Filter by status if provided
            if (status !== 'all') {
                if (status === 'active') {
                    query.status = { $in: ['running', 'paused', 'waiting'] };
                } else {
                    query.status = status;
                }
            }

            const executions = await this.db.find(FLOW_EXECUTION_TABLE, query);

            // If no executions found, initialize with default data
            if (!executions || executions.length === 0) {
                await this.initializeDefaultData();
                return await this.db.find(FLOW_EXECUTION_TABLE, query);
            }

            return executions;
        } catch (error) {
            logger.error(`[FlowExecutionService] Error fetching flow executions: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Get flow execution by ID.
     */
    async getFlowExecutionById(executionId: string, tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get flow execution
            const execution = await this.db.findOne(FLOW_EXECUTION_TABLE, { executionId, tenantId });
            if (!execution) {
                throw new Error(`Flow execution not found: ${executionId}`);
            }

            return execution;
        } catch (error) {
            logger.error(`[FlowExecutionService] Error fetching flow execution: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Get flow execution statistics.
     */
    async getFlowExecutionStats(tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get all flow executions
            const executions = await this.db.find(FLOW_EXECUTION_TABLE, { tenantId });

            // If no executions found, initialize with default data
            if (!executions || executions.length === 0) {
                await this.initializeDefaultData();
                return this.getFlowExecutionStats(tenantId);
            }

            // Calculate statistics
            const activeFlows = {
                total: 0,
                running: 0,
                paused: 0,
                waiting: 0
            };

            let totalDurationMinutes = 0;
            let totalSuccessfulExecutions = 0;
            let totalExecutions = executions.length;
            let totalSteps = 0;

            const recentErrors: any[] = [];

            executions.forEach(execution => {
                // Count active flows
                if (['running', 'paused', 'waiting'].includes(execution.status)) {
                    activeFlows.total++;
                    activeFlows[execution.status as keyof typeof activeFlows]++;
                }

                // Calculate duration in minutes
                if (execution.duration) {
                    const durationMatch = execution.duration.match(/(\d+)h\s*(\d+)m/);
                    if (durationMatch) {
                        const hours = parseInt(durationMatch[1]);
                        const minutes = parseInt(durationMatch[2]);
                        totalDurationMinutes += hours * 60 + minutes;
                    } else {
                        const minutesMatch = execution.duration.match(/(\d+)m/);
                        if (minutesMatch) {
                            totalDurationMinutes += parseInt(minutesMatch[1]);
                        }
                    }
                }

                // Count successful executions
                if (execution.status === 'completed' && execution.errors === 0) {
                    totalSuccessfulExecutions++;
                }

                // Count steps
                if (execution.steps) {
                    totalSteps += execution.steps.length;
                }

                // Collect recent errors
                if (execution.errors > 0 && execution.status === 'error') {
                    const errorStep = execution.steps?.find(step => step.status === 'error');
                    if (errorStep) {
                        // Calculate time ago
                        const now = new Date();
                        const startTime = new Date(execution.startTime);
                        const diffMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));

                        let timeAgo;
                        if (diffMinutes < 60) {
                            timeAgo = `${diffMinutes}m ago`;
                        } else {
                            const hours = Math.floor(diffMinutes / 60);
                            const minutes = diffMinutes % 60;
                            timeAgo = `${hours}h ${minutes}m ago`;
                        }

                        recentErrors.push({
                            flowName: execution.name,
                            timeAgo,
                            errorMessage: 'Error in execution',
                            step: errorStep.name
                        });
                    }
                }
            });

            // Calculate average duration
            const avgDurationMinutes = totalExecutions > 0 ? totalDurationMinutes / totalExecutions : 0;
            const avgDurationHours = Math.floor(avgDurationMinutes / 60);
            const avgDurationMins = Math.floor(avgDurationMinutes % 60);
            const avgDuration = `${avgDurationHours}h ${avgDurationMins}m`;

            // Calculate success rate
            const successRate = totalExecutions > 0 ? (totalSuccessfulExecutions / totalExecutions) * 100 : 0;

            // Calculate average steps
            const avgSteps = totalExecutions > 0 ? totalSteps / totalExecutions : 0;

            // Sort recent errors by time
            recentErrors.sort((a, b) => {
                const aTime = a.timeAgo.match(/(\d+)h/) ? parseInt(a.timeAgo.match(/(\d+)h/)![1]) * 60 + parseInt(a.timeAgo.match(/(\d+)m/)![1]) : parseInt(a.timeAgo.match(/(\d+)m/)![1]);
                const bTime = b.timeAgo.match(/(\d+)h/) ? parseInt(b.timeAgo.match(/(\d+)h/)![1]) * 60 + parseInt(b.timeAgo.match(/(\d+)m/)![1]) : parseInt(b.timeAgo.match(/(\d+)m/)![1]);
                return aTime - bTime;
            });

            return {
                activeFlows,
                performance: {
                    avgDuration,
                    successRate: parseFloat(successRate.toFixed(1)),
                    totalExecutions,
                    avgSteps: parseFloat(avgSteps.toFixed(1))
                },
                recentErrors: recentErrors.slice(0, 3) // Get only the 3 most recent errors
            };
        } catch (error) {
            logger.error(`[FlowExecutionService] Error fetching flow execution stats: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update flow execution status.
     */
    async updateFlowExecutionStatus(executionId: string, tenantId: string, status: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get flow execution
            const execution = await this.db.findOne(FLOW_EXECUTION_TABLE, { executionId, tenantId });
            if (!execution) {
                throw new Error(`Flow execution not found: ${executionId}`);
            }

            // Update status
            const result = await this.db.update(
                FLOW_EXECUTION_TABLE,
                { executionId, tenantId },
                { status, updatedAt: new Date() },
                undefined
            );

            if (!result) {
                throw new Error(`Failed to update flow execution status: ${executionId}`);
            }

            logger.info(`[FlowExecutionService] Flow execution status updated: ${executionId} -> ${status}`);
            return await this.db.findOne(FLOW_EXECUTION_TABLE, { executionId, tenantId });
        } catch (error) {
            logger.error(`[FlowExecutionService] Error updating flow execution status: ${(error as any).message}`);
            throw error;
        }
    }
}
