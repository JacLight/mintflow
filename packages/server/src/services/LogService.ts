import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';

export class LogService {
    private db = DatabaseService.getInstance();

    async createLog(data: any) {
        try {
            const log = await this.db.create('logs', data);
            logger.info(`[LogService] Log created: ${log.logId}`);
            return log;
        } catch (error) {
            logger.error(`[LogService] Error creating log: ${(error as any).message}`);
            throw new Error('Failed to create log.');
        }
    }

    async getAllLogs() {
        try {
            return await this.db.find('logs');
        } catch (error) {
            logger.error(`[LogService] Error fetching logs: ${(error as any).message}`);
            throw new Error('Failed to fetch logs.');
        }
    }

    async getLogsByFlow(flowId: string) {
        try {
            return await this.db.find('logs', { flowId });
        } catch (error) {
            logger.error(`[LogService] Error fetching logs for flow ${flowId}: ${(error as any).message}`);
            throw new Error('Failed to fetch logs.');
        }
    }

    async getLogsByRun(runId: string) {
        try {
            return await this.db.find('logs', { runId });
        } catch (error) {
            logger.error(`[LogService] Error fetching logs for run ${runId}: ${(error as any).message}`);
            throw new Error('Failed to fetch logs.');
        }
    }

    async deleteLogsByFlow(flowId: string) {
        try {
            const result = await this.db.delete('logs', { flowId });
            if (!result) {
                throw new Error('No logs found for the specified flow.');
            }
            logger.info(`[LogService] Logs deleted for flow: ${flowId}`);
            return result;
        } catch (error) {
            logger.error(`[LogService] Error deleting logs for flow ${flowId}: ${(error as any).message}`);
            throw new Error((error as any).message);
        }
    }

    async deleteLog(logId: string) {
        try {
            const result = await this.db.delete('logs', { logId });
            if (!result) {
                throw new Error('Log not found or deletion failed.');
            }
            logger.info(`[LogService] Log deleted: ${logId}`);
            return result;
        } catch (error) {
            logger.error(`[LogService] Error deleting log: ${(error as any).message}`);
            throw new Error((error as any).message);
        }
    }
}
