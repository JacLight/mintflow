import { useSiteStore } from '@/context/site-store';
import { getAppEngineClient } from './appmint-client';
import { appmintEndpoints } from './appmint-endpoints';
import { BaseModel, BaseModelDTO } from './models/base.model';
import { createNewFlowBaseData } from './models/flow-model';
import { getResponseErrorMessage } from '@/lib-client/helpers';

/**
 * Service for managing mintflow data
 */
export class MintflowService {
    private appEngineClient = getAppEngineClient();

    /**
     * Save a new mintflow
     * @param name Name of the flow
     * @param title Title of the flow
     * @param description Description of the flow
     * @param flowData Flow data to save
     * @returns Promise with the saved flow
     */
    async saveFlow(name: string, title: string, description: string, flowData: any): Promise<BaseModel<any>> {
        // Create a new flow base data
        const newFlow = createNewFlowBaseData(name, title, description);

        // Add the flow data
        newFlow.data.flow = flowData;

        try {
            // Save the flow
            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.create.method,
                appmintEndpoints.create.path,
                { data: newFlow }
            );

            return response;
        } catch (error) {
            console.error('Error saving flow:', error);
            throw error;
        }
    }

    /**
     * Update an existing mintflow
     * @param flowId ID of the flow to update
     * @param flowData Updated flow data
     * @returns Promise with the updated flow
     */
    async updateFlow(flowId: string, flowData: any): Promise<BaseModel<any>> {
        try {
            // Get the existing flow
            const existingFlow = await this.getFlow(flowId);

            if (!existingFlow) {
                throw new Error(`Flow with ID ${flowId} not found`);
            }

            // Update the flow data
            existingFlow.data.flow = flowData;

            // Save the updated flow
            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.update.method,
                appmintEndpoints.update.path,
                { data: existingFlow }
            );

            return response;
        } catch (error) {
            console.error(`Error updating flow with ID ${flowId}:`, error);
            throw error;
        }
    }

    /**
     * Get a flow by ID
     * @param flowId ID of the flow to retrieve
     * @returns Promise with the flow or null if not found
     */
    async getFlow(flowId: string): Promise<BaseModel<any> | null> {
        try {
            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.get.method,
                `${appmintEndpoints.get.path}/${flowId}`
            );

            return response;
        } catch (error) {
            console.error(`Error fetching flow with ID ${flowId}:`, error);
            return null;
        }
    }

    /**
     * Get all flows
     * @returns Promise with an array of flows
     */
    async getFlows(): Promise<BaseModelDTO<any>> {
        try {
            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.find_by_attribute.method,
                `${appmintEndpoints.find_by_attribute.path}/mintflow`,
                { datatype: 'mintflow' }
            );
            return response;
        } catch (error) {
            const msg = getResponseErrorMessage(error);
            useSiteStore().ui.getState().
                console.error('Error fetching flows:', error);
            throw error;
        }
    }

    /**
     * Delete a flow
     * @param flowId ID of the flow to delete
     * @returns Promise with the result of the deletion
     */
    async deleteFlow(flowId: string): Promise<any> {
        try {
            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.delete.method,
                appmintEndpoints.delete.path,
                { id: flowId }
            );

            return response;
        } catch (error) {
            console.error(`Error deleting flow with ID ${flowId}:`, error);
            throw error;
        }
    }
}

// Singleton instance
let mintflowService: MintflowService;

/**
 * Get the MintflowService instance
 * @returns MintflowService instance
 */
export const getMintflowService = (): MintflowService => {
    if (!mintflowService) {
        mintflowService = new MintflowService();
    }
    return mintflowService;
};
