import { logger } from '@mintflow/common';

/**
 * Service for managing workflows
 * This is a simple implementation that will be expanded in the future
 */
export class WorkflowService {
    private static instance: WorkflowService;
    private flows: Map<string, any> = new Map();

    private constructor() { }

    /**
     * Get singleton instance
     */
    public static getInstance(): WorkflowService {
        if (!WorkflowService.instance) {
            WorkflowService.instance = new WorkflowService();
        }
        return WorkflowService.instance;
    }

    /**
     * Add a node to a flow
     * @param flowId The flow ID
     * @param nodeType The node type
     * @param nodeId The node ID
     * @returns The created node
     */
    public addNode(flowId: string, nodeType: string, nodeId: string): any {
        try {
            logger.info(`[WorkflowService] Adding node to flow`, {
                flowId,
                nodeType,
                nodeId
            });

            // Create a new node
            const node = {
                id: nodeId,
                type: nodeType,
                position: { x: 250, y: 250 },
                data: {
                    label: `${nodeType} Node`,
                    nodeId
                }
            };

            // Get the flow or create a new one if it doesn't exist
            let flow = this.flows.get(flowId);
            if (!flow) {
                flow = {
                    id: flowId,
                    name: `Flow ${flowId}`,
                    nodes: [],
                    edges: []
                };
                this.flows.set(flowId, flow);
            }

            // Add the node to the flow
            flow.nodes.push(node);

            logger.info(`[WorkflowService] Node added to flow`, {
                flowId,
                nodeId
            });

            return node;
        } catch (error: any) {
            logger.error(`[WorkflowService] Error adding node to flow`, {
                error: error.message,
                flowId,
                nodeType,
                nodeId
            });
            throw error;
        }
    }

    /**
     * Create a new flow
     * @param name The flow name
     * @returns The created flow
     */
    public createFlow(name: string): any {
        try {
            const flowId = `flow-${Date.now()}`;

            logger.info(`[WorkflowService] Creating flow`, {
                flowId,
                name
            });

            // Create a new flow
            const flow = {
                id: flowId,
                name,
                nodes: [],
                edges: []
            };

            // Add the flow to the map
            this.flows.set(flowId, flow);

            logger.info(`[WorkflowService] Flow created`, {
                flowId,
                name
            });

            return flow;
        } catch (error: any) {
            logger.error(`[WorkflowService] Error creating flow`, {
                error: error.message,
                name
            });
            throw error;
        }
    }

    /**
     * Get all flows
     * @returns Array of flows
     */
    public getFlows(): any[] {
        return Array.from(this.flows.values());
    }

    /**
     * Get a flow by ID
     * @param flowId The flow ID
     * @returns The flow or null if not found
     */
    public getFlow(flowId: string): any {
        return this.flows.get(flowId) || null;
    }
}

// Export singleton instance
export const workflowService = WorkflowService.getInstance();
