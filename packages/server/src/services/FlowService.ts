import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js'; // Import TenantService

const TABLE_NAME = 'flow';

export class FlowService {
    private db = DatabaseService.getInstance();
    private static instance: FlowService;
    private tenantService = new TenantService(); // Initialize TenantService

    static getInstance(): FlowService {
        if (!FlowService.instance) {
            FlowService.instance = new FlowService();
        }
        return FlowService.instance;
    }

    async getAllFlows() {
        try {
            return await this.db.find(TABLE_NAME);
        } catch (error) {
            logger.error(`[FlowService] Error fetching flows: ${(error as any).message}`);
            throw error;
        }
    }

    async getFlows(query) {
        try {
            return await this.db.find(TABLE_NAME, query);
        } catch (error) {
            logger.error(`[FlowService] Error fetching flow: ${(error as any).message}`);
            throw error;
        }
    }

    async getFlow(tenantId: string, flowId: string) {
        try {
            const flow = await this.db.findOne(TABLE_NAME, { flowId, tenantId });
            if (!flow) {
                throw new Error('Flow not found.');
            }
            return flow;
        } catch (error) {
            logger.error(`[FlowService] Error fetching flow: ${(error as any).message}`);
            throw error;
        }
    }

    async getFlowById(flowId: string) {
        try {
            const flow = await this.db.findOne(TABLE_NAME, { flowId });
            if (!flow) {
                throw new Error('Flow not found.');
            }
            return flow;
        } catch (error) {
            logger.error(`[FlowService] Error fetching flow: ${(error as any).message}`);
            throw error;
        }
    }

    async createFlow(data: any) {
        try {
            // Check if tenant ID exists
            const tenant = await this.tenantService.getTenantById(data.tenantId);
            if (!tenant) {
                throw new Error('Invalid tenant ID.');
            }
            data.tenantId = tenant.tenantId;
            data.tenantName = tenant.name;
            const flow = await this.db.create(TABLE_NAME, data);
            logger.info(`[FlowService] Flow created: ${flow.flowId}`);
            return flow;
        } catch (error: any) {
            logger.error(`[FlowService] Error creating flow: ${(error as any).message}`);
            throw error;
        }
    }

    async updateFlow(flowId: string, data: any) {
        try {

            const tenant = await this.tenantService.getTenantById(data.tenantId);
            if (!tenant) {
                throw new Error('Invalid tenant ID.');
            }

            // const existingFlow = await this.db.findOne(TABLE_NAME, { flowId });
            // if (!existingFlow) {
            //     throw new Error('Flow not found.');
            // }

            const updatedData = { ...data };
            updatedData.tenantId = tenant.tenantId;
            updatedData.tenantName = tenant.name;
            delete updatedData._id;
            delete updatedData.flowId;
            delete updatedData.createdAt;
            updatedData.updatedAt = new Date().toISOString();


            const result = await this.db.update(TABLE_NAME, { flowId }, updatedData);
            if (!result) {
                throw new Error('Flow update failed.');
            }
            logger.info(`[FlowService] Flow updated: ${flowId}`);
            return this.getFlowById(flowId);
        } catch (error) {
            logger.error(`[FlowService] Error updating flow: ${(error as any).message}`);
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

    async saveFlow(data: any) {
        if (data.flowId) {
            return this.updateFlow(data.flowId, data);
        }
        return this.createFlow(data);
    };

    async deleteFlow(flowId: string) {
        try {
            const result = await this.db.delete(TABLE_NAME, { flowId });
            if (!result) {
                throw new Error('Flow not found or deletion failed.');
            }
            logger.info(`[FlowService] Flow deleted: ${flowId}`);
            return result;
        } catch (error) {
            logger.error(`[FlowService] Error deleting flow: ${(error as any).message}`);
            throw error;
        }
    }
}