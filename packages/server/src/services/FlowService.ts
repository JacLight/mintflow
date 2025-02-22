import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';

export class FlowService {
    private db = DatabaseService.getInstance();

    async createFlow(data: any) {
        try {
            const flow = await this.db.create('flows', data);
            logger.info(`[FlowService] Flow created: ${flow.flowId}`);
            return flow;
        } catch (error) {
            logger.error(`[FlowService] Error creating flow: ${(error as any).message}`);
            throw new Error('Failed to create flow.');
        }
    }

    async getAllFlows() {
        try {
            return await this.db.find('flows');
        } catch (error) {
            logger.error(`[FlowService] Error fetching flows: ${(error as any).message}`);
            throw new Error('Failed to fetch flows.');
        }
    }

    async getFlowById(flowId: string) {
        try {
            const flow = await this.db.findOne('flows', { flowId });
            if (!flow) {
                throw new Error('Flow not found.');
            }
            return flow;
        } catch (error) {
            logger.error(`[FlowService] Error fetching flow: ${(error as any).message}`);
            throw new Error((error as any).message);
        }
    }

    async updateFlow(flowId: string, updateData: any) {
        try {
            const result = await this.db.update('flows', { flowId }, updateData);
            if (!result) {
                throw new Error('Flow not found or update failed.');
            }
            logger.info(`[FlowService] Flow updated: ${flowId}`);
            return result;
        } catch (error) {
            logger.error(`[FlowService] Error updating flow: ${(error as any).message}`);
            throw new Error((error as any).message);
        }
    }

    async deleteFlow(flowId: string) {
        try {
            const result = await this.db.delete('flows', { flowId });
            if (!result) {
                throw new Error('Flow not found or deletion failed.');
            }
            logger.info(`[FlowService] Flow deleted: ${flowId}`);
            return result;
        } catch (error) {
            logger.error(`[FlowService] Error deleting flow: ${(error as any).message}`);
            throw new Error((error as any).message);
        }
    }
}
