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

    async getAllLogs() {
        try {
            return await this.db.find(TABLE_NAME);
        } catch (error) {
            logger.error(`[LogService] Error fetching logs: ${(error as any).message}`);
            throw error;
        }
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
