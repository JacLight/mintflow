import mongoose from 'mongoose';
import { logger } from '@mintflow/common';
import { ENV } from '../config/env.js';
import * as models from '../models/mongo-models/index.js';

export class MongoProvider {
    private static instance: MongoProvider;

    private constructor() {
        mongoose.connect(ENV.MONGO_URI, { dbName: ENV.DB_NAME })
            .then(() => {
                logger.info(`[MongoDB] Connected to ${ENV.MONGO_URI}`);
                // Register all models
                Object.values(models).forEach(model => mongoose.model(model.modelName, model.schema));
            })
            .catch(err => logger.error('[MongoDB] Connection error', err));
    }

    static getInstance(): MongoProvider {
        if (!MongoProvider.instance) {
            MongoProvider.instance = new MongoProvider();
        }
        return MongoProvider.instance;
    }

    async create(collection: string, data: any) {
        const Model = mongoose.model(collection);
        return await Model.create(data);
    }

    async find(collection: string, query: any = {}) {
        const Model = mongoose.model(collection);
        return await Model.find(query);
    }

    async findOne(collection: string, query: any) {
        const Model = mongoose.model(collection);
        return await Model.findOne(query);
    }

    async update(collection: string, query: any, updateData: any, arrayUpdate?: { [key: string]: any }) {
        const Model = mongoose.model(collection);
        const updateQuery = { $set: updateData };
        if (arrayUpdate) {
            Object.keys(arrayUpdate).forEach(key => {
                updateQuery['$push'] = { [key]: arrayUpdate[key] };
            });
        }
        return await Model.updateOne(query, updateQuery);
    }

    async delete(collection: string, query: any) {
        const Model = mongoose.model(collection);
        return await Model.deleteOne(query);
    }

    async deleteMany(collection: string, query: any) {
        const Model = mongoose.model(collection);
        return await Model.deleteMany(query);
    }
}
