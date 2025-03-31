import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';

const TABLE_NAME = 'log';
export class LogService {
    private db = DatabaseService.getInstance();

    async createLog(data: any) {
        try {
            const log = await this.db.create(TABLE_NAME, data);
            logger.info(`[LogService] Log created: ${log.logId}`);
            return log;
        } catch (error) {
            logger.error(`[LogService] Error creating log: ${(error as any).message}`);
            throw error;
        }
    }

    async getAllLogs(filter: any = {}) {
        try {
            return await this.db.find(TABLE_NAME, filter);
        } catch (error) {
            logger.error(`[LogService] Error fetching logs: ${(error as any).message}`);
            throw error;
        }
    }

    async getLogsWithPagination(
        filter: any = {},
        page: number = 1,
        limit: number = 20,
        sortBy: string = 'timestamp',
        sortOrder: number = -1
    ) {
        try {
            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Create sort object
            const sort: any = {};
            sort[sortBy] = sortOrder;

            // Get logs with pagination
            const logs = await this.db.find(TABLE_NAME, filter, {
                skip,
                limit,
                sort
            });

            // Get total count for pagination
            const total = await this.db.count(TABLE_NAME, filter);

            // Calculate total pages
            const totalPages = Math.ceil(total / limit);

            return {
                logs,
                total,
                page,
                totalPages
            };
        } catch (error) {
            logger.error(`[LogService] Error fetching logs with pagination: ${(error as any).message}`);
            throw error;
        }
    }

    async getAllLogsForExport(filter: any = {}) {
        try {
            // For exports, we don't use pagination but we still want to sort by timestamp
            const sort: any = { timestamp: -1 };

            // Get all logs matching the filter
            return await this.db.find(TABLE_NAME, filter, { sort });
        } catch (error) {
            logger.error(`[LogService] Error fetching logs for export: ${(error as any).message}`);
            throw error;
        }
    }

    async generateCsv(logs: any[]) {
        try {
            // Define CSV headers
            const headers = [
                'Log ID', 'Timestamp', 'Type', 'Source', 'Message',
                'Details', 'Flow ID', 'User ID', 'Tenant ID'
            ];

            // Format logs for CSV
            const formattedLogs = logs.map(log => {
                const timestamp = log.timestamp ? new Date(log.timestamp).toISOString() : '';
                const details = typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || '');

                return [
                    log.logId || '',
                    timestamp,
                    log.type || '',
                    log.source || '',
                    this.escapeCsvField(log.message || ''),
                    this.escapeCsvField(details),
                    log.flowId || '',
                    log.userId || '',
                    log.tenantId || ''
                ].join(',');
            });

            // Generate CSV
            const csv = [
                headers.join(','),
                ...formattedLogs
            ].join('\n');

            return csv;
        } catch (error) {
            logger.error(`[LogService] Error generating CSV: ${(error as any).message}`);
            throw error;
        }
    }

    // Helper method to escape CSV fields
    private escapeCsvField(field: string): string {
        // If the field contains commas, quotes, or newlines, wrap it in quotes
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            // Double up any quotes
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
    }

    async getLogsByFlow(flowId: string) {
        try {
            return await this.db.find(TABLE_NAME, { flowId });
        } catch (error) {
            logger.error(`[LogService] Error fetching logs for flow ${flowId}: ${(error as any).message}`);
            throw error;
        }
    }

    async getLogsByRun(runId: string) {
        try {
            return await this.db.find(TABLE_NAME, { runId });
        } catch (error) {
            logger.error(`[LogService] Error fetching logs for run ${runId}: ${(error as any).message}`);
            throw error;
        }
    }

    async getRetentionPolicy(tenantId: string = 'default_tenant') {
        try {
            // In a real implementation, this would fetch the retention policy from a database
            // For now, we'll return a default policy
            return {
                days: 30,
                extendedRetention: false
            };
        } catch (error) {
            logger.error(`[LogService] Error fetching retention policy: ${(error as any).message}`);
            throw error;
        }
    }

    async deleteLogsByFlow(flowId: string) {
        try {
            const result = await this.db.delete(TABLE_NAME, { flowId });
            if (!result) {
                throw new Error('No logs found for the specified flow.');
            }
            logger.info(`[LogService] Logs deleted for flow: ${flowId}`);
            return result;
        } catch (error) {
            logger.error(`[LogService] Error deleting logs for flow ${flowId}: ${(error as any).message}`);
            throw error;
        }
    }

    async deleteLog(logId: string) {
        try {
            const result = await this.db.delete(TABLE_NAME, { logId });
            if (!result) {
                throw new Error('Log not found or deletion failed.');
            }
            logger.info(`[LogService] Log deleted: ${logId}`);
            return result;
        } catch (error) {
            logger.error(`[LogService] Error deleting log: ${(error as any).message}`);
            throw error;
        }
    }
}
