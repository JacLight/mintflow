import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';

const TABLE_NAME = 'flow_run';
export class FlowRunService {
    private db = DatabaseService.getInstance();

    async startFlowRun(data: any) {
        try {
            const flowRun = await this.db.create(TABLE_NAME, {
                ...data,
                status: 'pending',
                logs: [],
                startedAt: new Date(),
                finishedAt: null
            });
            logger.info(`[FlowRunService] FlowRun started: ${flowRun.flowRunId}`);
            return flowRun;
        } catch (error) {
            logger.error(`[FlowRunService] Error starting flow run: ${(error as any).message}`);
            throw error;
        }
    }

    async getAllFlowRuns() {
        try {
            return await this.db.find('flowruns');
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
