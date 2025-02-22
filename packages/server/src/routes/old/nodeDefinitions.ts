import { Router, Request, Response } from 'express';
import { logger, PluginDescriptor } from '@mintflow/common';
import { getNodeAction, getPlugin, getPlugins } from '../../plugins-register.js';
import { FlowEngine } from '../../engine/FlowEngine.js';
import { IFlowNodeState } from '../../models/FlowModel.js';

const nodeRouter: Router = Router();

/**
 * GET /nodes
 * Returns the list of node definitions, omitting the actual implementation code.
 */
const getNodes: any = (req: Request, res: Response) => {
    try {
        // Remove the actual code from each node before sending
        const pluginMap = getPlugins();
        logger.info('[nodeDefinitions] GET /nodes', pluginMap);
        const nodeDefinitions = Array.from(pluginMap.values());
        const safeNodes: Partial<PluginDescriptor>[] = nodeDefinitions.map(node => ({
            id: node.id,
            name: node.name,
            description: node.description,
            documentation: node.documentation,
            icon: node.icon,
            actions: node.actions?.map(action => ({
                name: action.name,
                description: action.description,
                inputSchema: action.inputSchema,
                outputSchema: action.outputSchema,
                entry: action.entry,
                exampleInput: action.exampleInput,
                exampleOutput: action.exampleOutput,
                method: action.method,
                documentation: action.documentation,


            }))
        }));

        res.json({ nodes: safeNodes });
    } catch (err: any) {
        logger.error('[nodeDefinitions] GET /nodes error', { error: err.message });
        res.status(500).json({ error: err.message });
    }
};
nodeRouter.get('/all', getNodes);


/**
 * Optionally, provide a route to get a single node definition by nodeId.
 * GET /nodes/:nodeId
 */

const getNode: any = (req: Request, res: Response) => {
    try {
        const { nodeId } = req.params;
        const node = getPlugin(nodeId);
        if (!node) return res.status(404).json({ error: 'Node not found' });
        const safeNode: Partial<PluginDescriptor> = {
            id: node.id,
            name: node.name,
            description: node.description,
            documentation: node.documentation,
            icon: node.icon,
            actions: node.actions.map((action: any) => ({
                name: action.name,
                description: action.description,
                inputSchema: action.inputSchema,
                outputSchema: action.outputSchema,
                entry: action.entry,
                exampleInput: action.exampleInput,
                exampleOutput: action.exampleOutput,
                method: action.method,
                documentation: action.documentation,
            }))
        };
        return res.json({ node: safeNode });
    } catch (err: any) {
        logger.error('[nodeDefinitions] GET /nodes/:nodeId error', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};
nodeRouter.get('/:nodeId', getNode);


const runNode: any = async (req: Request, res: Response) => {
    try {
        const { nodeId } = req.params;
        const { tenantId, flowId, input, action } = req.body;
        const nodeState: IFlowNodeState = FlowEngine.createNodeState();
        const nodeDef = { nodeId, input, action }
        const output = await FlowEngine.runNode(tenantId, flowId, nodeState, nodeDef)
        return res.json({ state: nodeState, output });
    } catch (err: any) {
        logger.error('[nodeDefinitions] POST /nodes/:nodeId/run error', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};
nodeRouter.post('/:nodeId/run', runNode);

export default nodeRouter;
