import { Sequelize } from 'sequelize';
import { logger } from '@mintflow/common';
import { ENV } from '../config/env.js';
import { User } from '../models/postgres-models/User.js';
import { Tenant } from '../models/postgres-models/Tenant.js';
import { Log } from '../models/postgres-models/Log.js';
import { FlowRun } from '../models/postgres-models/FlowRun.js';
import { Flow } from '../models/postgres-models/Flow.js';

export const sequelize = new Sequelize(ENV.POSTGRES_URI, {
    dialect: 'postgres',
    logging: false, // Disable logging SQL queries for production
});

export class PostgresProvider {
    private static instance: PostgresProvider;

    private constructor() {
        sequelize.authenticate()
            .then(() => {
                logger.info(`[PostgreSQL] Connected to ${ENV.POSTGRES_URI}`);
                // Register all models
                User.initModel(sequelize);
                Tenant.initModel(sequelize);
                Log.initModel(sequelize);
                FlowRun.initModel(sequelize);
                Flow.initModel(sequelize);
            })
            .catch(err => logger.error('[PostgreSQL] Connection error', err));
    }

    static getInstance(): PostgresProvider {
        if (!PostgresProvider.instance) {
            PostgresProvider.instance = new PostgresProvider();
        }
        return PostgresProvider.instance;
    }

    async create(model: any, data: any) {
        return await model.create(data);
    }

    async find(model: any, query: any = {}) {
        return await model.findAll({ where: query });
    }

    async findOne(model: any, query: any) {
        return await model.findOne({ where: query });
    }

    async update(model: any, query: any, updateData: any) {
        const record = await model.findOne({ where: query });
        if (record) {
            return await record.update(updateData);
        }
        return null;
    }

    async delete(model: any, query: any) {
        const record = await model.findOne({ where: query });
        if (record) {
            await record.destroy();
            return record;
        }
        return null;
    }
}
