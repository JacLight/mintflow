import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { nodeDefinitions, NodeDefinition } from '../models/NodeDefinition';

const nodeRouter = Router();

/**
 * GET /nodes
 * Returns the list of node definitions, omitting the actual implementation code.
 */
const getNodes: any = (req: Request, res: Response) => {
    try {
        // Remove the actual code from each node before sending
        const safeNodes: Partial<NodeDefinition>[] = nodeDefinitions.map(node => ({
            nodeId: node.nodeId,
            name: node.name,
            description: node.description,
            examples: node.examples,
            documentation: node.documentation,
            icon: node.icon,
            inputSchema: node.inputSchema,
            outputSchema: node.outputSchema,
            uiInputSchema: node.uiInputSchema,
            implementation: { language: node.implementation.language } // Omit code
        }));

        res.json({ nodes: safeNodes });
    } catch (err: any) {
        logger.error('[nodeDefinitions] GET /nodes error', { error: err.message });
        res.status(500).json({ error: err.message });
    }
};
nodeRouter.get('/:nodeId', getNodes);


/**
 * Optionally, provide a route to get a single node definition by nodeId.
 * GET /nodes/:nodeId
 */

const getNode: any = (req: Request, res: Response) => {
    try {
        const { nodeId } = req.params;
        const node = nodeDefinitions.find(n => n.nodeId === nodeId);
        if (!node) return res.status(404).json({ error: 'Node not found' });
        const safeNode: Partial<NodeDefinition> = {
            nodeId: node.nodeId,
            name: node.name,
            description: node.description,
            examples: node.examples,
            documentation: node.documentation,
            icon: node.icon,
            inputSchema: node.inputSchema,
            outputSchema: node.outputSchema,
            uiInputSchema: node.uiInputSchema,
            implementation: { language: node.implementation.language }
        };
        res.json({ node: safeNode });
    } catch (err: any) {
        logger.error('[nodeDefinitions] GET /nodes/:nodeId error', { error: err.message });
        res.status(500).json({ error: err.message });
    }
};
nodeRouter.get('/:nodeId', getNode);

export default nodeRouter;
