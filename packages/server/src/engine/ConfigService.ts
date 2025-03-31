// src/services/ConfigService.ts

import { ENV } from '../config/env.js';

export interface FlowEngineConfig {
    redis: {
        host: string;
        port: number;
        contextDb: number;
        timeout: number;
        retryStrategy: {
            maxRetries: number;
            minDelay: number;
            maxDelay: number;
        };
    };
    mqtt: {
        url: string;
        options: {
            clientId?: string;
            clean?: boolean;
            keepalive?: number;
            reconnectPeriod?: number;
        };
    };
    timeouts: {
        http: number;
        mqtt: number;
        event: number;
        python: number;
        external: number;
    };
    metrics: {
        enabled: boolean;
        retentionPeriod: number;
        maxSamples: number;
    };
}

export class ConfigService {
    private static instance: ConfigService;
    private config: FlowEngineConfig;

    private constructor() {
        this.config = {
            redis: {
                host: ENV.REDIS_HOST || 'localhost',
                port: ENV.REDIS_PORT || 6379,
                contextDb: 1,
                timeout: 86400,
                retryStrategy: {
                    maxRetries: 3,
                    minDelay: 1000,
                    maxDelay: 5000
                }
            },
            mqtt: {
                url: ENV.MQTT_URL || 'mqtt://localhost:1883',
                options: {
                    clientId: `flow-engine-${Math.random().toString(16).slice(2)}`,
                    clean: true,
                    keepalive: 60,
                    reconnectPeriod: 1000
                }
            },
            timeouts: {
                http: 3600,
                mqtt: 3600,
                event: 3600,
                python: 1800,
                external: 7200
            },
            metrics: {
                enabled: ENV.METRICS_ENABLED,
                retentionPeriod: 86400,
                maxSamples: 1000
            }
        };
    }

    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    getConfig(): FlowEngineConfig {
        return this.config;
    }

    getRedisConfig() {
        return this.config.redis;
    }

    getMqttConfig() {
        return this.config.mqtt;
    }

    getTimeouts() {
        return this.config.timeouts;
    }

    getMetricsConfig() {
        return this.config.metrics;
    }

    updateConfig(partialConfig: Partial<FlowEngineConfig>): void {
        this.config = {
            ...this.config,
            ...partialConfig
        };
    }
}