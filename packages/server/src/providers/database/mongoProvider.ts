import mongoose from 'mongoose';
import { logger } from '../../utils/logger';
import { ENV } from '../../config/env';
import { IDatabaseProvider } from '../../interfaces/IDatabaseProvider';

/**
 * A robust Mongo DB provider, implementing IDatabaseProvider.
 */
export class MongoProvider implements IDatabaseProvider {
    private static instance: MongoProvider;

    private constructor() {
        // Private to enforce singleton usage via getInstance().
    }

    public static getInstance(): MongoProvider {
        if (!MongoProvider.instance) {
            MongoProvider.instance = new MongoProvider();
        }
        return MongoProvider.instance;
    }

    public async connect(): Promise<void> {
        try {
            await mongoose.connect(ENV.MONGO_URI);
            logger.info('[MongoProvider] Connected to MongoDB', { uri: ENV.MONGO_URI });
        } catch (err) {
            logger.error('[MongoProvider] Connection error', { error: err });
            throw err;
        }
    }

    public async createTenant(tenantId: string): Promise<void> {
        // Example: maybe you create a tenant-specific collection or config doc.
        logger.info(`[MongoProvider] createTenant(${tenantId}): not implemented, but a placeholder.`);
    }
}
