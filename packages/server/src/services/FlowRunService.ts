import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { FlowService } from './FlowService.js';
import { IFlowRun } from '../engine/FlowInterfaces.js';

const TABLE_NAME = 'flow_run';
export class FlowRunService {
    private db = DatabaseService.getInstance();
    private static instance: FlowRunService;
    private flowService: FlowService = FlowService.getInstance();

    static getInstance(): FlowRunService {
        if (!FlowRunService.instance) {
            FlowRunService.instance = new FlowRunService();
        }
        return FlowRunService.instance;
    }

    async startFlowRun(data: any): Promise<IFlowRun> {
        try {
            const flowRun = await this.db.create(TABLE_NAME, {
                status: 'pending',
                logs: [],
                startedAt: new Date(),
                finishedAt: null,
                ...data,
            });
            logger.info(`[FlowRunService] FlowRun started: ${flowRun.flowRunId}`);
            return flowRun;
        } catch (error) {
            logger.error(`[FlowRunService] Error starting flow run: ${(error as any).message}`);
            throw error;
        }
    }

    async saveFlowRun(data: IFlowRun) {
        if (data.flowRunId) {
            return this.updateFlowRun(data.flowRunId, data);
        }
        return this.startFlowRun(data);
    };

    async updateFlowRun(flowRunId: string, data: any) {
        try {

            const flow = await this.flowService.getFlowById(data.flowId);
            if (!flow) {
                throw new Error(`Flow not found: ${data.flowId}`);
            }

            // const existingFlow = await this.db.findOne(TABLE_NAME, { flowId });
            // if (!existingFlow) {
            //     throw new Error('Flow not found.');
            // }

            const updatedData = { ...data };
            updatedData.tenantId = flow.flowId;
            delete updatedData._id;
            delete updatedData.flowRunId;
            delete updatedData.createdAt;
            updatedData.updatedAt = new Date().toISOString();


            const result = await this.db.update(TABLE_NAME, { flowRunId }, updatedData);
            if (!result) {
                throw new Error(`FlowRun not found or update failed: ${flowRunId}`);
            }
            logger.info(`[FlowService] Flow updated: ${flowRunId}`);
            return this.getFlowRunById(flowRunId);
        } catch (error) {
            logger.error(`[FlowRunService] Error updating flow run: ${(error as any).message}`);
            throw error;
        }
    }

    async updateFlowStatus(flowId: string, status: string) {
        try {
            const result = await this.db.update(TABLE_NAME, { flowId }, { overallStatus: status });
            if (!result) {
                throw new Error('Flow not found or update failed.');
            }
            logger.info(`[FlowService] Flow status updated: ${flowId} → ${status}`);
            return result;
        } catch (error) {
            logger.error(`[FlowService] Error updating flow status: ${(error as any).message}`);
            throw error;
        }
    }

    async getActiveFlowRun(flowId: string): Promise<any | null> {
        try {
            const activeRun = await this.db.findOne(TABLE_NAME, {
                flowId,
                status: { $in: ['pending', 'running', 'paused', 'waiting'] },
                finishedAt: null
            });
            return activeRun;
        } catch (error) {
            logger.error(`[FlowRunService] Error finding active flow run: ${(error as any).message}`);
            return null;
        }
    }

    async cleanupStaleRuns(flowId: string): Promise<void> {
        try {
            // Find runs that are marked as running but haven't been updated recently
            const staleTimeout = new Date();
            staleTimeout.setHours(staleTimeout.getHours() - 1); // 1 hour timeout
            await this.db.update(TABLE_NAME,
                {
                    flowId,
                    status: 'running',
                    updatedAt: { $lt: staleTimeout }
                },
                {
                    status: 'failed',
                    finishedAt: new Date(),
                    $push: { logs: 'Flow run marked as failed due to inactivity' }
                },
            );
        } catch (error) {
            logger.error(`[FlowRunService] Error cleaning up stale runs: ${(error as any).message}`);
        }
    }

    async getAllFlowRuns() {
        try {
            return await this.db.find(TABLE_NAME);
        } catch (error) {
            logger.error(`[FlowRunService] Error fetching flow runs: ${(error as any).message}`);
            throw error;
        }
    }


    async getFlowRuns(query) {
        try {
            return await this.db.find(TABLE_NAME, query);
        } catch (error) {
            logger.error(`[FlowRunService] Error fetching flow runs: ${(error as any).message}`);
            throw error;
        }
    }

    async getFlowRunById(flowRunId: string) {
        try {
            const flowRun = await this.db.findOne(TABLE_NAME, { flowRunId });
            if (!flowRun) {
                throw new Error('FlowRun not found.');
            }
            return flowRun;
        } catch (error) {
            logger.error(`[FlowRunService] Error fetching flow run: ${(error as any).message}`);
            throw error;
        }
    }

    async updateFlowRunStatus(flowRunId: string, status: string) {
        try {
            const result = await this.db.update(TABLE_NAME, { flowRunId }, { status });
            if (!result) {
                throw new Error('FlowRun not found or update failed.');
            }
            logger.info(`[FlowRunService] FlowRun status updated: ${flowRunId} → ${status}`);
            return result;
        } catch (error) {
            logger.error(`[FlowRunService] Error updating flow run status: ${(error as any).message}`);
            throw error;
        }
    }

    async logFlowRun(flowRunId: string, log: string) {
        try {
            const result = await this.db.update(TABLE_NAME, { flowRunId }, { $push: { logs: log } });
            if (!result) {
                throw new Error('FlowRun not found or log update failed.');
            }
            logger.info(`[FlowRunService] Log added to FlowRun: ${flowRunId}`);
            return result;
        } catch (error) {
            logger.error(`[FlowRunService] Error logging flow run: ${(error as any).message}`);
            throw error;
        }
    }

    async completeFlowRun(flowRunId: string) {
        try {
            const result = await this.db.update(TABLE_NAME, { flowRunId }, {
                status: 'completed',
                finishedAt: new Date()
            });
            if (!result) {
                throw new Error('FlowRun not found or completion failed.');
            }
            logger.info(`[FlowRunService] FlowRun completed: ${flowRunId}`);
            return result;
        } catch (error) {
            logger.error(`[FlowRunService] Error completing flow run: ${(error as any).message}`);
            throw error;
        }
    }

    async deleteFlowRun(flowRunId: string) {
        try {
            const result = await this.db.delete(TABLE_NAME, { flowRunId });
            if (!result) {
                throw new Error('FlowRun not found or deletion failed.');
            }
            logger.info(`[FlowRunService] FlowRun deleted: ${flowRunId}`);
            return result;
        } catch (error) {
            logger.error(`[FlowRunService] Error deleting flow run: ${(error as any).message}`);
            throw error;
        }
    }
}
