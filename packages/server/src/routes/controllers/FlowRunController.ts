import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { FlowRunService } from '../../services/FlowRunService.js';
import { FlowRunValidator } from '../../models/validators/FlowRunValidator.js';
import { checkFields } from './FlowController.js';

const flowRunService = new FlowRunService();

/**
 * Start a new flow run.
 */
export async function startFlowRun(req: Request, res: Response): Promise<any> {
    checkFields(req, res, ['flowId', 'tenantId']);
    try {
        const { error } = FlowRunValidator.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const flowRun = await flowRunService.startFlowRun(req.body);
        return res.status(201).json(flowRun);
    } catch (err: any) {
        logger.error(`[FlowRunController] Error starting flow run: ${err.message}`);
        return res.status(500).json({ error: 'Failed to start flow run' });
    }
}

/**
 * Get all flow runs.
 */
export async function getAllFlowRuns(req: Request, res: Response): Promise<any> {
    checkFields(req, res, ['flowId', 'tenantId']);
    try {
        const flowRuns = await flowRunService.getAllFlowRuns();
        return res.status(200).json(flowRuns);
    } catch (err: any) {
        logger.error(`[FlowRunController] Error fetching flow runs: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch flow runs' });
    }
}

/**
 * Get a single flow run by ID.
 */
export async function getFlowRunById(req: Request, res: Response): Promise<any> {
    checkFields(req, res, ['flowRunId']);
    try {
        const flowRun = await flowRunService.getFlowRunById(req.params.flowRunId);
        if (!flowRun) return res.status(404).json({ error: 'Flow run not found' });

        return res.status(200).json(flowRun);
    } catch (err: any) {
        logger.error(`[FlowRunController] Error fetching flow run: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch flow run' });
    }
}

export async function deleteFlowRun(req: Request, res: Response): Promise<any> {
    checkFields(req, res, ['flowRunId']);
    try {
        await flowRunService.deleteFlowRun(req.params.flowRunId);
        return res.status(204).send();
    } catch (err: any) {
        logger.error(`[FlowRunController] Error deleting flow run: ${err.message}`);
        return res.status(500).json({ error: 'Failed to delete flow run' });
    }
}
