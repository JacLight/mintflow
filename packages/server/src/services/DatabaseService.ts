import { ENV } from '../config/env.js';
import { MongoProvider } from './MongoProvider.js';
import { PostgresProvider } from './PostgresProvider.js';

export class DatabaseService {
    private static provider: any;
    private static readonly MAX_RETRIES = 3;
    private static readonly RETRY_DELAY = 1000; // 1 second

    static getInstance(): any {
        if (!DatabaseService.provider) {
            if (ENV.DB_PROVIDER === 'postgres') {
                DatabaseService.provider = PostgresProvider.getInstance();
            } else {
                DatabaseService.provider = MongoProvider.getInstance();
            }
        }
        return DatabaseService.provider;
    }

    private async retryOperation(operation: Function, ...args: any[]): Promise<any> {
        let attempts = 0;
        while (attempts < DatabaseService.MAX_RETRIES) {
            try {
                return await operation(...args);
            } catch (error) {
                attempts++;
                if (attempts >= DatabaseService.MAX_RETRIES) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, DatabaseService.RETRY_DELAY));
            }
        }
    }

    async create(collection: string, data: any) {
        return await this.retryOperation(DatabaseService.getInstance().create, collection, data);
    }

    async find(collection: string, query: any = {}) {
        return await this.retryOperation(DatabaseService.getInstance().find, collection, query);
    }

    async findOne(collection: string, query: any) {
        return await this.retryOperation(DatabaseService.getInstance().findOne, collection, query);
    }

    async update(collection: string, query: any, updateData: any) {
        return await this.retryOperation(DatabaseService.getInstance().update, collection, query, updateData);
    }

    async delete(collection: string, query: any) {
        return await this.retryOperation(DatabaseService.getInstance().delete, collection, query);
    }

    async saveFlow(flow: any) {
        return await this.update('flow', { flowId: flow.flowId }, flow);
    }

    async getFlow(tenantId: string, flowId: string) {
        return await this.findOne('flow', { tenantId, flowId });
    }

    async getFlows(tenantId: string) {
        return await this.find('flow', { tenantId });
    }
}
