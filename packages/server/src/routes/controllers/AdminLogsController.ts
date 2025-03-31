import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { LogService } from '../../services/LogService.js';

const logService = new LogService();

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
        logger.error(`[AdminLogsController] Error fetching logs: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch logs' });
    }
}

/**
 * Get log by ID.
 */
export async function getLogById(req: Request, res: Response): Promise<any> {
    try {
        const logId = req.params.logId;
        const tenantId = req.query.tenantId as string || 'default_tenant';

        if (!logId) {
            return res.status(400).json({ error: 'Log ID is required' });
        }

        // Get log by ID using the LogService
        const logs = await logService.getAllLogs();
        const log = logs.find(l => l.logId === logId && (!tenantId || l.tenantId === tenantId));

        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }

        return res.status(200).json(log);

    } catch (err: any) {
        logger.error(`[AdminLogsController] Error fetching log: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch log' });
    }
}

/**
 * Get logs for a specific flow.
 */
export async function getFlowLogs(req: Request, res: Response): Promise<any> {
    try {
        // Extract query parameters
        const {
            flowId,
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

        if (!flowId) {
            return res.status(400).json({ error: 'Flow ID is required' });
        }

        // Parse pagination parameters
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Build filter object
        const filter: any = { tenantId, flowId };

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
        logger.error(`[AdminLogsController] Error fetching flow logs: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch flow logs' });
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
        logger.error(`[AdminLogsController] Error exporting logs: ${err.message}`);
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
        logger.error(`[AdminLogsController] Error fetching retention policy: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch retention policy' });
    }
}
