// Redis service for the langchain plugin

import { ConfigService } from './ConfigService.js';
import { logger } from '@mintflow/common';

/**
 * Mock Redis client for development
 */
class MockRedisClient {
    private storage: Map<string, string> = new Map();
    private expirations: Map<string, NodeJS.Timeout> = new Map();

    public keys: any = {};
    json: any = {};

    async set(key: string, value: string, options?: { EX?: number }): Promise<string> {
        this.storage.set(key, value);

        // Handle expiration
        if (options?.EX) {
            // Clear any existing expiration
            if (this.expirations.has(key)) {
                clearTimeout(this.expirations.get(key)!);
            }

            // Set new expiration
            const timeout = setTimeout(() => {
                this.storage.delete(key);
                this.expirations.delete(key);
            }, options.EX * 1000);

            this.expirations.set(key, timeout);
        }

        return 'OK';
    }

    async get(key: string): Promise<string | null> {
        return this.storage.get(key) || null;
    }

    async del(key: string): Promise<number> {
        const existed = this.storage.has(key);
        this.storage.delete(key);

        // Clear any expiration
        if (this.expirations.has(key)) {
            clearTimeout(this.expirations.get(key)!);
            this.expirations.delete(key);
        }

        return existed ? 1 : 0;
    }

    async expire(key: string, seconds: number): Promise<number> {
        if (!this.storage.has(key)) {
            return 0;
        }

        // Clear any existing expiration
        if (this.expirations.has(key)) {
            clearTimeout(this.expirations.get(key)!);
        }

        // Set new expiration
        const timeout = setTimeout(() => {
            this.storage.delete(key);
            this.expirations.delete(key);
        }, seconds * 1000);

        this.expirations.set(key, timeout);
        return 1;
    }

    async exists(key: string): Promise<number> {
        return this.storage.has(key) ? 1 : 0;
    }

    async rpush(key: string, value: string): Promise<number> {
        let list: string[] = [];

        // Get existing list
        const existingList = this.storage.get(key);
        if (existingList) {
            list = JSON.parse(existingList);
        }

        // Add value to list
        list.push(value);

        // Save list
        this.storage.set(key, JSON.stringify(list));

        return list.length;
    }

    async lpop(key: string): Promise<string | null> {
        const existingList = this.storage.get(key);
        if (!existingList) {
            return null;
        }

        const list: string[] = JSON.parse(existingList);
        if (list.length === 0) {
            return null;
        }

        const value = list.shift()!;
        this.storage.set(key, JSON.stringify(list));

        return value;
    }

    async lrange(key: string, start: number, stop: number): Promise<string[]> {
        const existingList = this.storage.get(key);
        if (!existingList) {
            return [];
        }

        const list: string[] = JSON.parse(existingList);
        return list.slice(start, stop === -1 ? undefined : stop + 1);
    }

    async flushall(): Promise<string> {
        this.storage.clear();

        // Clear all expirations
        for (const timeout of this.expirations.values()) {
            clearTimeout(timeout);
        }
        this.expirations.clear();

        return 'OK';
    }
}

/**
 * Service for managing Redis connections
 */
export class RedisService {
    private static instance: RedisService;
    private _client: MockRedisClient;
    private config = ConfigService.getInstance();

    private constructor() {
        // Initialize Redis client
        this._client = new MockRedisClient();
        logger.info('Using mock Redis client for development');
    }

    /**
     * Get singleton instance
     */
    static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    /**
     * Get Redis client
     */
    get client(): MockRedisClient {
        return this._client;
    }

    /**
     * Set key-value pair with optional TTL
     */
    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.client.set(key, value, { EX: ttl });
        } else {
            await this.client.set(key, value);
        }
    }

    /**
     * Get value by key
     */
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    /**
     * Delete key
     */
    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    /**
     * Set key expiration
     */
    async expire(key: string, ttl: number): Promise<void> {
        await this.client.expire(key, ttl);
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }
}
