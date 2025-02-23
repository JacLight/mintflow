import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { FlowService } from '../../services/FlowService.js';
import { FlowValidator } from '../../models/validators/FlowValidator.js';
import { FlowEngine } from '../../engine/FlowEngine.js';
import { DatabaseService } from '../../services/DatabaseService.js';
import { FlowNotFoundError } from '../../engine/FlowErrors.js';

const flowService = new FlowService();

/**
 * Create a new flow.
 */
export async function createFlow(req: Request, res: Response): Promise<any> {
    try {
        const { error } = FlowValidator.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
        const flow = await flowService.createFlow(req.body);
        return res.status(201).json(flow);
    } catch (err: any) {
        logger.error(`[FlowController] Error creating flow: ${err.message}`);
        if (err.message.includes('Tenant not found')) {
            return res.status(400).json({ error: 'Invalid tenant ID' });
        }
        return res.status(500).json({ error: `Failed to create flow: ${err.message}` });
    }
}

/**
 * Get all flows.
 */
export async function getAllFlows(req: Request, res: Response): Promise<any> {
    try {
        const flows = await flowService.getAllFlows();
        return res.status(200).json(flows);
    } catch (err: any) {
        logger.error(`[FlowController] Error fetching flows: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch flows' });
    }
}

/**
 * Get a single flow by ID.
 */
export async function getFlowById(req: Request, res: Response): Promise<any> {
    try {
        const flow = await flowService.getFlowById(req.params.flowId);
        if (!flow) return res.status(404).json({ error: 'Flow not found' });

        return res.status(200).json(flow);
    } catch (err: any) {
        logger.error(`[FlowController] Error fetching flow: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch flow' });
    }
}

/**
 * Update a flow.
 */
export async function updateFlow(req: Request, res: Response): Promise<any> {
    try {
        const { error } = FlowValidator.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const updatedFlow = await flowService.updateFlow(req.params.flowId, req.body);
        if (!updatedFlow) return res.status(404).json({ error: 'Flow not found' });

        return res.status(200).json(updatedFlow);
    } catch (err: any) {
        logger.error(`[FlowController] Error updating flow: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update flow' });
    }
}

/**
 * Delete a flow.
 */
export async function deleteFlow(req: Request, res: Response): Promise<any> {
    try {
        const deletedFlow = await flowService.deleteFlow(req.params.flowId);
        if (!deletedFlow) return res.status(404).json({ error: 'Flow not found' });

        return res.status(200).json({ message: 'Flow deleted successfully' });
    } catch (err: any) {
        logger.error(`[FlowController] Error deleting flow: ${err.message}`);
        return res.status(500).json({ error: 'Failed to delete flow' });
    }
}


export async function getManualNodeStatus(req: Request & { tenantId: string }, res: Response) {
    const { flowId, nodeId } = req.params;
    const flow = await FlowService.getInstance().getFlow(req.tenantId, flowId);

    const nodeState = flow.nodeStates.find((ns: any) => ns.nodeId === nodeId);
    const nodeDef = flow.definition.nodes.find((n: any) => n.nodeId === nodeId);

    res.json({
        status: nodeState.status,
        availableNextNodes: nodeState.availableNextNodes,
        inputRequirements: nodeState.inputRequirements
    });
}

// Endpoint to progress manual node
export async function progressManualNode(req: Request & { tenantId: string }, res: Response) {
    const { flowId, nodeId } = req.params;
    const { selectedNext, input } = req.body;

    await FlowEngine.getInstance().progressManualNode(
        req.tenantId,
        flowId,
        nodeId,
        selectedNext,
        input
    );

    res.json({ success: true });
}

// Endpoint for external service callback
export async function handleExternalCallback(req: Request & { tenantId: string }, res: Response) {
    const { flowId, nodeId } = req.params;
    const result = req.body;

    await FlowEngine.getInstance().completeNode(
        req.tenantId,
        flowId,
        nodeId,
        result
    );

    res.json({ success: true });
}


export async function startFlow(req: Request, res: Response): Promise<any> {
    const error = checkFields(req, res, ['flowId', 'tenantId']);
    if (error) return error;
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        const flow = await FlowEngine.getInstance().startFlow(tenantId as string, flowId);
        return res.status(200).json(flow);
    } catch (err: any) {
        logger.error(`[FlowController] Error starting flow: ${err.message}`);
        if (err instanceof FlowNotFoundError) {
            return res.status(404).json({ error: 'Flow not found' });
        }
        return res.status(500).json({ error: `Failed to start flow: ${err.message}` });
    }
}

export async function getFlowRuns(req: Request, res: Response): Promise<any> {
    const error = checkFields(req, res, ['flowId', 'tenantId']);
    if (error) return error;
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        const flow = await FlowEngine.getInstance().getFlowRuns(tenantId as string, flowId);
        return res.status(200).json(flow);
    } catch (err: any) {
        logger.error(`[FlowController] Error starting flow: ${err.message}`);
        if (err instanceof FlowNotFoundError) {
            return res.status(404).json({ error: 'Flow not found' });
        }
        return res.status(500).json({ error: `Failed to start flow: ${err.message}` });
    }
}


export async function pauseFlowRun(req: Request & { tenantId?: string }, res: Response): Promise<any> {
    const error = checkFields(req, res, ['flowId', 'tenantId', 'flowRunId']);
    if (error) return error;

    try {
        const { flowId, flowRunId } = req.params;
        const { tenantId } = req.query;
        const flow = await FlowEngine.getInstance().pauseFlowRun(tenantId as string, flowId, flowRunId);
        return res.status(200).json(flow);
    } catch (err: any) {
        logger.error(`[FlowController] Error pausing flow: ${err.message}`);
        if (err instanceof FlowNotFoundError) {
            return res.status(404).json({ error: 'Flow not found' });
        }
        return res.status(500).json({ error: `Failed to pause flow: ${err.message}` });
    }
}

export async function stopFlowRun(req: Request & { tenantId?: string }, res: Response): Promise<any> {
    const error = checkFields(req, res, ['flowId', 'tenantId', 'flowRunId']);
    if (error) return error;
    try {
        const { flowId, flowRunId } = req.params;
        const { tenantId } = req.query;
        const flow = await FlowEngine.getInstance().stopFlowRun(tenantId as string, flowId, flowRunId);
        return res.status(200).json(flow);
    } catch (err: any) {
        logger.error(`[FlowController] Error stopping flow: ${err.message}`);
        if (err instanceof FlowNotFoundError) {
            return res.status(404).json({ error: 'Flow not found' });
        }
        return res.status(500).json({ error: `Failed to stop flow: ${err.message}` });
    }
}

export async function pauseAllFlowRuns(req: Request & { tenantId?: string }, res: Response): Promise<any> {
    const error = checkFields(req, res, ['flowId', 'tenantId']);
    if (error) return error;
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        const result = await FlowEngine.getInstance().pauseAllFlowRuns(tenantId as string, flowId);
        return res.status(200).json(result);
    } catch (err: any) {
        logger.error(`[FlowController] Error pausing flow instances: ${err.message}`);
        return res.status(500).json({ error: `Failed to pause flow instances: ${err.message}` });
    }
}

export async function stopAllFlowRuns(req: Request & { tenantId?: string }, res: Response): Promise<any> {
    const error = checkFields(req, res, ['flowId', 'tenantId']);
    if (error) return error;
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        const result = await FlowEngine.getInstance().stopAllFlowRuns(tenantId as string, flowId);
        return res.status(200).json(result);
    } catch (err: any) {
        logger.error(`[FlowController] Error stopping flow instances: ${err.message}`);
        return res.status(500).json({ error: `Failed to stop flow instances: ${err.message}` });
    }
}

const checkFields = (req: Request, res: Response, fields: string[]) => {
    if (fields.includes('flowRunId') && !req.params.flowRunId) {
        return res.status(400).json({ error: 'Flow run ID is required' });
    }
    if (fields.includes('flowId') && !req.params.flowId) {
        return res.status(400).json({ error: 'Flow ID is required' });
    }
    if (fields.includes('tenantId') && !req.query.tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
};

