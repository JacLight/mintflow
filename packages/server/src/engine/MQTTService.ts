// src/services/MQTTService.ts

import mqtt from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from './ConfigService.js';
import { RedisService } from './RedisService.js';
import { logger } from '@mintflow/common';
import { ExternalServiceError } from './FlowErrors.js';
import { EventEmitter } from 'events';

export class MQTTService {
    private static instance: MQTTService;
    private client: any;//typemqtt.Client;
    private config = ConfigService.getInstance().getMqttConfig();
    private redis = RedisService.getInstance();
    private eventEmitter = new EventEmitter();
    private activeSubscriptions = new Map<string, Set<string>>();

    private constructor() {
        this.initializeClient();
    }

    private initializeClient(): void {
        this.client = mqtt.connect(this.config.url, this.config.options);

        this.client.on('connect', () => {
            logger.info('MQTT client connected');
            this.resubscribeToTopics();
        });

        this.client.on('message', (topic: string, message: any) => {
            this.handleMessage(topic, message);
        });

        this.client.on('error', (error: any) => {
            logger.error('MQTT client error', { error });
        });

        this.client.on('offline', () => {
            logger.warn('MQTT client offline');
        });

        this.client.on('reconnect', () => {
            logger.info('MQTT client reconnecting');
        });
    }

    static getInstance(): MQTTService {
        if (!MQTTService.instance) {
            MQTTService.instance = new MQTTService();
        }
        return MQTTService.instance;
    }

    private async resubscribeToTopics(): Promise<void> {
        for (const [topic, correlationIds] of this.activeSubscriptions.entries()) {
            if (correlationIds.size > 0) {
                try {
                    await this.client.subscribe(topic);
                    logger.info('Resubscribed to topic', { topic });
                } catch (error) {
                    logger.error('Failed to resubscribe to topic', { topic, error });
                }
            }
        }
    }

    async subscribeToTopic(topic: string, correlationId: string): Promise<void> {
        try {
            if (!this.activeSubscriptions.has(topic)) {
                this.activeSubscriptions.set(topic, new Set());
                await this.client.subscribe(topic);
            }
            this.activeSubscriptions.get(topic)?.add(correlationId);
        } catch (error: any) {
            throw new ExternalServiceError('MQTT', `Failed to subscribe to topic ${topic}: ${error.message}`);
        }
    }

    async unsubscribeFromTopic(topic: string, correlationId: string): Promise<void> {
        const subscribers = this.activeSubscriptions.get(topic);
        if (subscribers) {
            subscribers.delete(correlationId);
            if (subscribers.size === 0) {
                await this.client.unsubscribe(topic);
                this.activeSubscriptions.delete(topic);
            }
        }
    }

    async publishToTopic(topic: string, message: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.publish(topic, JSON.stringify(message), (error: any) => {
                if (error) {
                    reject(new ExternalServiceError('MQTT', `Failed to publish to topic ${topic}: ${error.message}`));
                } else {
                    resolve();
                }
            });
        });
    }

    private async handleMessage(topic: string, message: Buffer): Promise<void> {
        try {
            const subscribers = this.activeSubscriptions.get(topic);
            if (!subscribers) return;

            const messageData = JSON.parse(message.toString());

            for (const correlationId of subscribers) {
                const waitingState = await this.redis.getWaitingState(`mqtt:${correlationId}`);
                if (waitingState) {
                    this.eventEmitter.emit(`mqtt:${correlationId}`, {
                        topic,
                        message: messageData
                    });
                }
            }
        } catch (error) {
            logger.error('Error handling MQTT message', { topic, error });
        }
    }

    async waitForMessage(topic: string, timeout: number): Promise<any> {
        const correlationId = uuidv4();

        try {
            await this.subscribeToTopic(topic, correlationId);

            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    this.cleanup(topic, correlationId);
                    reject(new ExternalServiceError('MQTT', `Timeout waiting for message on topic ${topic}`));
                }, timeout);

                this.eventEmitter.once(`mqtt:${correlationId}`, (data) => {
                    clearTimeout(timer);
                    this.cleanup(topic, correlationId);
                    resolve(data);
                });
            });
        } catch (error) {
            await this.cleanup(topic, correlationId);
            throw error;
        }
    }

    private async cleanup(topic: string, correlationId: string): Promise<void> {
        await this.unsubscribeFromTopic(topic, correlationId);
        await this.redis.deleteWaitingState(`mqtt:${correlationId}`);
        this.eventEmitter.removeAllListeners(`mqtt:${correlationId}`);
    }

    getClient(): any { //mqtt.Client {
        return this.client;
    }

    async disconnect(): Promise<void> {
        return new Promise((resolve) => {
            this.client.end(false, {}, () => {
                this.activeSubscriptions.clear();
                resolve();
            });
        });
    }
}