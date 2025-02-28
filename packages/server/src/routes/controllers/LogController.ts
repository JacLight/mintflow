import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { LogService } from '../../services/LogService.js';
import { LogValidator } from '../../models/validators/LogValidator.js';

const logService = new LogService();

/**
 * Create a new log entry.
 */
export async function createLog(req: Request, res: Response): Promise<any> {
    try {
        const { error } = LogValidator.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const log = await logService.createLog(req.body);
        return res.status(201).json(log);
    } catch (err: any) {
        logger.error(`[LogController] Error creating log: ${err.message}`);
        return res.status(500).json({ error: 'Failed to create log' });
    }
}

/**
 * Get all logs.
 */
export async function getAllLogs(req: Request, res: Response): Promise<any> {
    try {
        const logs = await logService.getAllLogs();
        return res.status(200).json(logs);
    } catch (err: any) {
        logger.error(`[LogController] Error fetching logs: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch logs' });
    }
}

/**
 * Get logs for a specific flow.
 */
export async function getLogsByFlow(req: Request, res: Response): Promise<any> {
    try {
        const logs = await logService.getLogsByFlow(req.params.flowId);
        return res.status(200).json(logs);
    } catch (err: any) {
        logger.error(`[LogController] Error fetching logs for flow ${req.params.flowId}: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch logs' });
    }
}

/**
 * Delete a log entry.
 */
export async function deleteLog(req: Request, res: Response): Promise<any> {
    try {
        const deletedLog = await logService.deleteLog(req.params.logId);
        if (!deletedLog) return res.status(404).json({ error: 'Log not found' });

        return res.status(200).json({ message: 'Log deleted successfully' });
    } catch (err: any) {
        logger.error(`[LogController] Error deleting log: ${err.message}`);
        return res.status(500).json({ error: 'Failed to delete log' });
    }
}
