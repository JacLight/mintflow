import pg from 'pg';
const { Pool } = pg
import { IDatabaseProvider } from '../../interfaces/IDatabaseProvider.js';
import { ENV } from '../../config/env.js';
import { logger } from '@mintflow/common';

/**
 * Postgres provider, implementing IDatabaseProvider.
 */
export class PostgresProvider implements IDatabaseProvider {
    private static instance: PostgresProvider;
    private pool: any | null = null;

    private constructor() { }

    public static getInstance(): PostgresProvider {
        if (!PostgresProvider.instance) {
            PostgresProvider.instance = new PostgresProvider();
        }
        return PostgresProvider.instance;
    }

    public async connect(): Promise<void> {
        try {
            this.pool = new Pool({ connectionString: ENV.POSTGRES_URI });
            await this.pool.query('SELECT NOW()'); // test query
            logger.info('[PostgresProvider] Connected to Postgres', { uri: ENV.POSTGRES_URI });
        } catch (err) {
            logger.error('[PostgresProvider] Connection error', { error: err });
            throw err;
        }
    }

    public async createTenant(tenantId: string): Promise<void> {
        if (!this.pool) throw new Error('[PostgresProvider] Not connected to Postgres.');
        const schemaName = `tenant_${tenantId}`;
        try {
            await this.pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            logger.info(`[PostgresProvider] Schema created/ensured for tenant`, { schema: schemaName });
        } catch (err) {
            logger.error('[PostgresProvider] Error creating tenant schema', { tenantId, error: err });
            throw err;
        }
    }
}
