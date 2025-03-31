import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { FlowExecutionService } from '../../services/FlowExecutionService.js';

// Get instance of FlowExecutionService
const flowExecutionService = FlowExecutionService.getInstance();

/**
 * Get all flow executions.
 */
export async function getAllFlowExecutions(req: Request, res: Response): Promise<any> {
    try {
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';
        const status = req.query.status as string || 'all';

        try {
            // Get flow executions from service
            const executions = await flowExecutionService.getAllFlowExecutions(tenantId, status);
            return res.status(200).json(executions);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[ExecutionsController] Error fetching flow executions: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch flow executions' });
    }
}

/**
 * Get flow execution by ID.
 */
export async function getFlowExecutionById(req: Request, res: Response): Promise<any> {
    try {
        const executionId = req.params.executionId;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!executionId) {
            return res.status(400).json({ error: 'Execution ID is required' });
        }

        try {
            // Get flow execution from service
            const execution = await flowExecutionService.getFlowExecutionById(executionId, tenantId);
            return res.status(200).json(execution);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Flow execution not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[ExecutionsController] Error fetching flow execution: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch flow execution' });
    }
}

/**
 * Get flow execution statistics.
 */
export async function getFlowExecutionStats(req: Request, res: Response): Promise<any> {
    try {
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        try {
            // Get flow execution stats from service
            const stats = await flowExecutionService.getFlowExecutionStats(tenantId);
            return res.status(200).json(stats);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[ExecutionsController] Error fetching flow execution stats: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch flow execution statistics' });
    }
}

/**
 * Pause a flow execution.
 */
export async function pauseFlowExecution(req: Request, res: Response): Promise<any> {
    try {
        const executionId = req.params.executionId;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!executionId) {
            return res.status(400).json({ error: 'Execution ID is required' });
        }

        try {
            // Update flow execution status
            await flowExecutionService.updateFlowExecutionStatus(executionId, tenantId, 'paused');
            return res.status(200).json({ message: `Flow execution ${executionId} paused successfully` });
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Flow execution not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[ExecutionsController] Error pausing flow execution: ${err.message}`);
        return res.status(500).json({ error: 'Failed to pause flow execution' });
    }
}

/**
 * Resume a flow execution.
 */
export async function resumeFlowExecution(req: Request, res: Response): Promise<any> {
    try {
        const executionId = req.params.executionId;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!executionId) {
            return res.status(400).json({ error: 'Execution ID is required' });
        }

        try {
            // Update flow execution status
            await flowExecutionService.updateFlowExecutionStatus(executionId, tenantId, 'running');
            return res.status(200).json({ message: `Flow execution ${executionId} resumed successfully` });
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Flow execution not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[ExecutionsController] Error resuming flow execution: ${err.message}`);
        return res.status(500).json({ error: 'Failed to resume flow execution' });
    }
}

/**
 * Restart a flow execution.
 */
export async function restartFlowExecution(req: Request, res: Response): Promise<any> {
    try {
        const executionId = req.params.executionId;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!executionId) {
            return res.status(400).json({ error: 'Execution ID is required' });
        }

        try {
            // Update flow execution status
            await flowExecutionService.updateFlowExecutionStatus(executionId, tenantId, 'running');
            return res.status(200).json({ message: `Flow execution ${executionId} restarted successfully` });
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Flow execution not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[ExecutionsController] Error restarting flow execution: ${err.message}`);
        return res.status(500).json({ error: 'Failed to restart flow execution' });
    }
}

/**
 * Cancel a flow execution.
 */
export async function cancelFlowExecution(req: Request, res: Response): Promise<any> {
    try {
        const executionId = req.params.executionId;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!executionId) {
            return res.status(400).json({ error: 'Execution ID is required' });
        }

        try {
            // Update flow execution status
            await flowExecutionService.updateFlowExecutionStatus(executionId, tenantId, 'error');
            return res.status(200).json({ message: `Flow execution ${executionId} cancelled successfully` });
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Flow execution not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[ExecutionsController] Error cancelling flow execution: ${err.message}`);
        return res.status(500).json({ error: 'Failed to cancel flow execution' });
    }
}
