import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { FlowService } from '../../services/FlowService.js';
import { FlowValidator } from '../../models/validators/FlowValidator.js';

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
