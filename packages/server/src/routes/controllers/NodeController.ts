import { logger, PluginDescriptor } from "@mintflow/common";
import { getPlugin, getPlugins } from "../../plugins-register.js";
import { Request, Response } from "express";
import { IFlowNodeState, INodeDefinition } from "../../engine/FlowInterfaces.js";
import { FlowEngine } from "../../engine/FlowEngine.js";
import { NodeExecutorService } from "../../engine/NodeExecutorService.js";

export const getNodes = async (req: Request, res: Response): Promise<any> => {
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


export const getNode = async (req: Request, res: Response): Promise<any> => {
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


export const runNode = async (req: Request, res: Response): Promise<any> => {
    try {
        // const { nodeId } = req.params;
        const { tenantId, flowId, input, action, nodeType } = req.body;
        const nodeDef: INodeDefinition = { nodeId: nodeType, input, action, type: nodeType, runner: 'node' };
        const output = await NodeExecutorService.getInstance().testNode(nodeDef, input)
        return res.json(output);
    } catch (err: any) {
        logger.error('[nodeDefinitions] POST /nodes/:nodeId/run error', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
}

