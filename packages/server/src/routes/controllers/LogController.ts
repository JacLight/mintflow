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
 * Get all logs with filtering, pagination, and sorting.
 */
export async function getAllLogs(req: Request, res: Response): Promise<any> {
    try {
        // Extract query parameters
        const {
            type,
            source,
            startDate,
            endDate,
            search,
            page = '1',
            limit = '20',
            sortBy = 'timestamp',
            sortOrder = 'desc',
            tenantId = 'default_tenant'
        } = req.query as { [key: string]: string };

        // Parse pagination parameters
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Build filter object
        const filter: any = { tenantId };

        if (type) filter.type = type;
        if (source) filter.source = source;

        // Add date range filter
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        // Add search filter (search in message and details fields)
        if (search) {
            filter.$or = [
                { message: { $regex: search, $options: 'i' } },
                { details: { $regex: search, $options: 'i' } }
            ];
        }

        // Get logs with pagination
        const result = await logService.getLogsWithPagination(
            filter,
            pageNum,
            limitNum,
            sortBy,
            sortOrder === 'desc' ? -1 : 1
        );

        return res.status(200).json(result);
    } catch (err: any) {
        logger.error(`[LogController] Error fetching logs: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch logs' });
    }
}

/**
 * Get logs for a specific flow with filtering and pagination.
 */
export async function getLogsByFlow(req: Request, res: Response): Promise<any> {
    try {
        const { flowId } = req.params;

        // Extract query parameters
        const {
            type,
            startDate,
            endDate,
            search,
            page = '1',
            limit = '20',
            sortBy = 'timestamp',
            sortOrder = 'desc',
            tenantId = 'default_tenant'
        } = req.query as { [key: string]: string };

        // Parse pagination parameters
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Build filter object
        const filter: any = { flowId, tenantId };

        if (type) filter.type = type;

        // Add date range filter
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        // Add search filter (search in message and details fields)
        if (search) {
            filter.$or = [
                { message: { $regex: search, $options: 'i' } },
                { details: { $regex: search, $options: 'i' } }
            ];
        }

        // Get logs with pagination
        const result = await logService.getLogsWithPagination(
            filter,
            pageNum,
            limitNum,
            sortBy,
            sortOrder === 'desc' ? -1 : 1
        );

        return res.status(200).json(result);
    } catch (err: any) {
        logger.error(`[LogController] Error fetching logs for flow ${req.params.flowId}: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch logs' });
    }
}

/**
 * Export logs as CSV.
 */
export async function exportLogs(req: Request, res: Response): Promise<any> {
    try {
        // Extract query parameters
        const {
            type,
            source,
            startDate,
            endDate,
            search,
            tenantId = 'default_tenant',
            format = 'csv'
        } = req.query as { [key: string]: string };

        // Build filter object
        const filter: any = { tenantId };

        if (type) filter.type = type;
        if (source) filter.source = source;

        // Add date range filter
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        // Add search filter (search in message and details fields)
        if (search) {
            filter.$or = [
                { message: { $regex: search, $options: 'i' } },
                { details: { $regex: search, $options: 'i' } }
            ];
        }

        // Get all logs matching the filter
        const logs = await logService.getAllLogsForExport(filter);

        // Generate CSV
        if (format === 'csv') {
            const csvData = await logService.generateCsv(logs);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=logs-${new Date().toISOString().split('T')[0]}.csv`);
            return res.status(200).send(csvData);
        }

        // Default to JSON if format is not specified or not supported
        return res.status(200).json(logs);
    } catch (err: any) {
        logger.error(`[LogController] Error exporting logs: ${err.message}`);
        return res.status(500).json({ error: 'Failed to export logs' });
    }
}

/**
 * Get log retention policy.
 */
export async function getRetentionPolicy(req: Request, res: Response): Promise<any> {
    try {
        const { tenantId = 'default_tenant' } = req.query as { [key: string]: string };

        // Get retention policy from service
        const policy = await logService.getRetentionPolicy(tenantId);

        return res.status(200).json(policy);
    } catch (err: any) {
        logger.error(`[LogController] Error fetching retention policy: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch retention policy' });
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
