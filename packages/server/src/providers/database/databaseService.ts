import { ENV } from '../../config/env.js';
import { IDatabaseProvider } from '../../interfaces/IDatabaseProvider.js';
import { MongoProvider } from './mongoProvider.js';
import { PostgresProvider } from './postgresProvider.js';

export class DatabaseService implements IDatabaseProvider {
    private static provider: IDatabaseProvider;

    static getInstance(): IDatabaseProvider {
        if (ENV.DB_PROVIDER === 'postgres') {
            DatabaseService.provider = PostgresProvider.getInstance();
        } else {
            DatabaseService.provider = MongoProvider.getInstance();
        }
        return DatabaseService.provider;
    }

    connect(): Promise<void> {
        return DatabaseService.provider.connect();
    }
    createTenant(tenantId: string): Promise<void> {
        return DatabaseService.provider.createTenant(tenantId);
    }

}
