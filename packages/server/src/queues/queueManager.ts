import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/dist/src/queueAdapters/bull.js'; // Fix import
import Bull from 'bull';
import { RedisOptions } from 'ioredis';
import { ENV } from '../config/env.js';
import { logger } from '@mintflow/common';
import express from 'express';

/**
 * A singleton that manages per-tenant Bull queues.
 */
export class QueueManager {
    private static instance: QueueManager;
    private queues = new Map<string, Bull.Queue>();
    private redisOptions: RedisOptions;
    private serverAdapter?: ExpressAdapter; // Lazy initialization
    private app?: express.Application; // Store app reference

    private constructor() {
        this.redisOptions = {
            host: ENV.REDIS_HOST,
            port: ENV.REDIS_PORT,
        };
        logger.info('[QueueManager] Initialized with redisOptions', this.redisOptions);
    }

    public static getInstance(): QueueManager {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
        }
        return QueueManager.instance;
    }

    public attachBullBoard(app: express.Application) {
        if (this.serverAdapter) {
            return; // Already attached
        }

        this.app = app;
        this.serverAdapter = new ExpressAdapter();
        this.serverAdapter.setBasePath('/admin/queues');

        createBullBoard({
            queues: [...this.queues.values()].map(q => new BullAdapter(q)),
            serverAdapter: this.serverAdapter,
        });

        app.use('/admin/queues', this.serverAdapter.getRouter());
        logger.info('[QueueManager] Bull Board attached to Express at /admin/queues');
    }

    public getTenantQueue(tenantId: string): Bull.Queue {
        if (!this.queues.has(tenantId)) {
            const queueName = `queue_${tenantId}`;
            const queue = new Bull(queueName, { redis: this.redisOptions });
            this.queues.set(tenantId, queue);
            logger.info('[QueueManager] Created new Bull queue', { queueName });

            // Attach Bull Board if an app exists
            if (this.app) {
                this.attachBullBoard(this.app);
            }

            this.addQueueToBullBoard(queue);
        }
        return this.queues.get(tenantId)!;
    }

    private addQueueToBullBoard(queue: Bull.Queue) {
        if (!this.serverAdapter) {
            return;
        }

        createBullBoard({
            queues: [...this.queues.values()].map(q => new BullAdapter(q)),
            serverAdapter: this.serverAdapter,
        });
    }
}
