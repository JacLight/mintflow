// src/services/RedisService.ts

import { Redis } from 'ioredis';
import { ConfigService } from './ConfigService.js';
import { logger } from '@mintflow/common';
import { ExternalServiceError } from './FlowErrors.js';

export class RedisService {
    private static instance: RedisService;
    private mainClient: Redis;
    private contextClient: Redis;
    private config = ConfigService.getInstance().getRedisConfig();

    private constructor() {
        const { host, port, retryStrategy } = this.config;

        const createClient = (db: number = 0) => new Redis({
            host,
            port,
            db,
            retryStrategy: (times) => {
                if (times > retryStrategy.maxRetries) {
                    return null; // Stop retrying
                }
                const delay = Math.min(
                    times * retryStrategy.minDelay,
                    retryStrategy.maxDelay
                );
                return delay;
            },
            enableOfflineQueue: true,
            maxRetriesPerRequest: 3
        });

        this.mainClient = createClient();
        this.contextClient = createClient(this.config.contextDb);

        this.setupErrorHandling();
    }

    private setupErrorHandling() {
        [this.mainClient, this.contextClient].forEach(client => {
            client.on('error', (error) => {
                logger.error('Redis client error', { error });
            });

            client.on('reconnecting', (params: any) => {
                logger.info('Redis client reconnecting', { params });
            });

            client.on('ready', () => {
                logger.info('Redis client ready');
            });
        });
    }

    static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    async setFlowContext(key: string, value: any, ttl: number = this.config.timeout): Promise<void> {
        try {
            await this.withRetry(() =>
                this.contextClient.set(
                    `flow_context:${key}`,
                    JSON.stringify(value),
                    'EX',
                    ttl
                )
            );
        } catch (error: any) {
            throw new ExternalServiceError('Redis', `Failed to set flow context: ${error.message}`);
        }
    }

    async getFlowContext(key: string): Promise<any | null> {
        try {
            const data = await this.withRetry(() =>
                this.contextClient.get(`flow_context:${key}`)
            );
            return data ? JSON.parse(data) : null;
        } catch (error: any) {
            throw new ExternalServiceError('Redis', `Failed to get flow context: ${error.message}`);
        }
    }

    async setWaitingState(key: string, value: any, ttl: number): Promise<void> {
        try {
            await this.withRetry(() =>
                this.mainClient.set(
                    `waiting_state:${key}`,
                    JSON.stringify(value),
                    'EX',
                    ttl
                )
            );
        } catch (error: any) {
            throw new ExternalServiceError('Redis', `Failed to set waiting state: ${error.message}`);
        }
    }

    async getWaitingState(key: string): Promise<any | null> {
        try {
            const data = await this.withRetry(() =>
                this.mainClient.get(`waiting_state:${key}`)
            );
            return data ? JSON.parse(data) : null;
        } catch (error: any) {
            throw new ExternalServiceError('Redis', `Failed to get waiting state: ${error.message}`);
        }
    }

    async deleteWaitingState(key: string): Promise<void> {
        try {
            await this.withRetry(() =>
                this.mainClient.del(`waiting_state:${key}`)
            );
        } catch (error: any) {
            throw new ExternalServiceError('Redis', `Failed to delete waiting state: ${error.message}`);
        }
    }

    async enqueuePythonTask(queueKey: string, task: any): Promise<void> {
        try {
            await this.withRetry(() =>
                this.mainClient.rpush(
                    `python_queue:${queueKey}`,
                    JSON.stringify(task)
                )
            );
        } catch (error: any) {
            throw new ExternalServiceError('Redis', `Failed to enqueue Python task: ${error.message}`);
        }
    }

    async enqueueExternalTask(task: any): Promise<void> {
        try {
            await this.withRetry(() =>
                this.mainClient.rpush(
                    'external_tasks',
                    JSON.stringify(task)
                )
            );
        } catch (error: any) {
            throw new ExternalServiceError('Redis', `Failed to enqueue external task: ${error.message}`);
        }
    }

    private async withRetry<T>(operation: () => Promise<T>, maxRetries = this.config.retryStrategy.maxRetries): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;
                logger.warn('Redis operation failed, retrying', {
                    attempt,
                    error: error.message
                });
                await new Promise(resolve =>
                    setTimeout(resolve, attempt * this.config.retryStrategy.minDelay)
                );
            }
        }

        throw new ExternalServiceError(
            'Redis',
            `Operation failed after ${maxRetries} attempts: ${lastError?.message}`
        );
    }

    getMainClient(): Redis {
        return this.mainClient;
    }

    getContextClient(): Redis {
        return this.contextClient;
    }

    async cleanup(): Promise<void> {
        await this.mainClient.quit();
        await this.contextClient.quit();
    }
}