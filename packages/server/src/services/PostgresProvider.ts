import { Sequelize } from 'sequelize';
import { logger } from '@mintflow/common';
import { ENV } from '../config/env.js';

export const sequelize = new Sequelize(ENV.POSTGRES_URI, {
    dialect: 'postgres',
    logging: false, // Disable logging SQL queries for production
});

export class PostgresProvider {
    private static instance: PostgresProvider;

    private constructor() {
        sequelize.authenticate()
            .then(() => logger.info(`[PostgreSQL] Connected to ${ENV.POSTGRES_URI}`))
            .catch(err => logger.error('[PostgreSQL] Connection error', err));
    }

    static getInstance(): PostgresProvider {
        if (!PostgresProvider.instance) {
            PostgresProvider.instance = new PostgresProvider();
        }
        return PostgresProvider.instance;
    }

    async create(table: string, data: any) {
        const Model = sequelize.models[table];
        return await Model.create(data);
    }

    async find(table: string, query: any = {}) {
        const Model = sequelize.models[table];
        return await Model.findAll({ where: query });
    }

    async findOne(table: string, query: any) {
        const Model = sequelize.models[table];
        return await Model.findOne({ where: query });
    }

    async update(table: string, query: any, updateData: any) {
        const Model = sequelize.models[table];
        return await Model.update(updateData, { where: query });
    }

    async delete(table: string, query: any) {
        const Model = sequelize.models[table];
        return await Model.destroy({ where: query });
    }
}
