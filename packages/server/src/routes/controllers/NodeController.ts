import { logger, PluginDescriptor } from "@mintflow/common";
import { getPlugin, getPlugins } from "../../plugins-register.js";
import { Request, Response } from "express";
import { INodeDefinition } from "../../engine/FlowInterfaces.js";
import { NodeExecutorService } from "../../engine/NodeExecutorService.js";

export const getNodes = async (req: Request, res: Response): Promise<any> => {
    try {
        // Check if fields query parameter exists
        const fieldsParam = req.query.fields as string | undefined;
        const fields = fieldsParam ? fieldsParam.split(',') : null;

        // Remove the actual code from each node before sending
        const pluginMap = getPlugins();
        logger.info('[nodeDefinitions] GET /nodes', { fieldsRequested: fields });
        const nodeDefinitions = Array.from(pluginMap.values());

        const safeNodes: Partial<PluginDescriptor>[] = nodeDefinitions.map(node => {
            // If no fields specified, return all fields
            if (!fields) {
                return {
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
                };
            }

            // If fields are specified, only return those fields
            const filteredNode: Partial<PluginDescriptor> = {};

            // Add requested fields to the filtered node
            fields.forEach(field => {
                if (field === 'actions' && node.actions) {
                    filteredNode.actions = node.actions.map(action => ({
                        name: action.name,
                        description: action.description,
                        inputSchema: action.inputSchema,
                        outputSchema: action.outputSchema,
                        entry: action.entry,
                        exampleInput: action.exampleInput,
                        exampleOutput: action.exampleOutput,
                        method: action.method,
                        documentation: action.documentation,
                    }));
                } else if (field in node) {
                    // Use type assertion to handle dynamic property access
                    (filteredNode as any)[field] = (node as any)[field];
                }
            });

            return filteredNode;
        });
        res.json({ nodes: safeNodes });
    } catch (err: any) {
        logger.error('[nodeDefinitions] GET /nodes error', { error: err.message });
        res.status(500).json({ error: err.message });
    }
};


export const getNode = async (req: Request, res: Response): Promise<any> => {
    try {
        const { nodeId } = req.params;
        // Check if fields query parameter exists
        const fieldsParam = req.query.fields as string | undefined;
        const fields = fieldsParam ? fieldsParam.split(',') : null;

        const node = getPlugin(nodeId);
        if (!node) return res.status(404).json({ error: 'Node not found' });

        let safeNode: Partial<PluginDescriptor>;

        // If no fields specified, return all fields
        if (!fields) {
            safeNode = {
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
        } else {
            // If fields are specified, only return those fields
            safeNode = {};

            // Add requested fields to the filtered node
            fields.forEach(field => {
                if (field === 'actions' && node.actions) {
                    safeNode.actions = node.actions.map((action: any) => ({
                        name: action.name,
                        description: action.description,
                        inputSchema: action.inputSchema,
                        outputSchema: action.outputSchema,
                        entry: action.entry,
                        exampleInput: action.exampleInput,
                        exampleOutput: action.exampleOutput,
                        method: action.method,
                        documentation: action.documentation,
                    }));
                } else if (field in node) {
                    // Use type assertion to handle dynamic property access
                    (safeNode as any)[field] = (node as any)[field];
                }
            });
        }
        return res.json({ node: safeNode });
    } catch (err: any) {
        logger.error('[nodeDefinitions] GET /nodes/:nodeId error', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};


export const runNode = async (req: Request, res: Response): Promise<any> => {
    try {
        // const { nodeId } = req.params;
        const { tenantId, flowId, input, action, plugin, config } = req.body;
        const nodeDef: INodeDefinition & { flowRunId } = { flowRunId: `flow_run_node_${plugin}`, nodeId: `run_node_${plugin}`, input, action, config, type: plugin, plugin, runner: 'node' };
        const output = await NodeExecutorService.getInstance().testNode(nodeDef)
        return res.json(output);
    } catch (err: any) {
        logger.error('[nodeDefinitions] POST /nodes/:nodeId/run error', { error: err.message });
        return res.status(400).json({ error: err.message });
    }
}
