import { ENV } from '../config/env.js';
import { MongoProvider } from './MongoProvider.js';
import { PostgresProvider } from './PostgresProvider.js';

export class DatabaseService {
    private static provider: any;

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

    async create(collection: string, data: any) {
        return await DatabaseService.getInstance().create(collection, data);
    }

    async find(collection: string, query: any = {}) {
        return await DatabaseService.getInstance().find(collection, query);
    }

    async findOne(collection: string, query: any) {
        return await DatabaseService.getInstance().findOne(collection, query);
    }

    async update(collection: string, query: any, updateData: any) {
        return await DatabaseService.getInstance().update(collection, query, updateData);
    }

    async delete(collection: string, query: any) {
        return await DatabaseService.getInstance().delete(collection, query);
    }
}
