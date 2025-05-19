import { Node, Edge } from '@xyflow/react';
import { getNodeDefaultData } from '@/components/workflow/node-registry';

// Global state to store the current workflow instance
// This is a simple approach for demo purposes
// In a real app, you would use a more robust state management solution
let currentWorkflowInstance: {
    addNode: (type: string, nodeId: string, position?: { x: number, y: number }) => Node | null;
    getNodes: () => Node[];
    getEdges: () => Edge[];
} | null = null;

export const WorkflowService = {
    // Register the workflow instance
    registerWorkflowInstance: (instance: any) => {
        currentWorkflowInstance = instance;
        console.log('Workflow instance registered:', instance);
    },

    // Add a node to the workflow
    addNode: (type: string, nodeId?: string): Node | null => {
        if (!currentWorkflowInstance) {
            console.error('No workflow instance registered');
            return null;
        }

        // Generate a unique ID if not provided
        const id = nodeId || `${type}-${Date.now()}`;

        // Default position in the center of the viewport
        const position = { x: 250, y: 250 };

        // Add the node to the workflow
        return currentWorkflowInstance.addNode(type, id, position);
    },

    // Get all nodes in the workflow
    getNodes: (): Node[] => {
        if (!currentWorkflowInstance) {
            console.error('No workflow instance registered');
            return [];
        }

        return currentWorkflowInstance.getNodes();
    },

    // Get all edges in the workflow
    getEdges: (): Edge[] => {
        if (!currentWorkflowInstance) {
            console.error('No workflow instance registered');
            return [];
        }

        return currentWorkflowInstance.getEdges();
    }
};

// Export a singleton instance
export default WorkflowService;
