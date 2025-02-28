// src/services/HTTPCallbackService.ts

import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from './ConfigService.js';
import { RedisService } from './RedisService.js';
import { logger } from '@mintflow/common';
import { ExternalServiceError } from './FlowErrors.js';
import { EventEmitter } from 'events';
import { IFlow, INodeDefinition, IFlowNodeState, IFlowRun } from './FlowInterfaces.js';

export class HTTPCallbackService {
    private static instance: HTTPCallbackService;
    private redis = RedisService.getInstance();
    private config = ConfigService.getInstance().getConfig();
    private eventEmitter = new EventEmitter();

    private constructor() { }

    static getInstance(): HTTPCallbackService {
        if (!HTTPCallbackService.instance) {
            HTTPCallbackService.instance = new HTTPCallbackService();
        }
        return HTTPCallbackService.instance;
    }

    async setupCallback(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,
    ): Promise<string> {
        const callbackId = uuidv4();
        const timeout = nodeDef.http?.timeout || this.config.timeouts.http;

        try {
            await this.redis.setWaitingState(
                `http_callback:${callbackId}`,
                { flow, flowRun, nodeDef },
                timeout
            );
            return callbackId;
        } catch (error: any) {
            throw new ExternalServiceError(
                'HTTPCallback',
                `Failed to setup callback: ${error.message}`
            );
        }
    }

    async handleCallback(callbackId: string, data: any): Promise<void> {
        try {
            const waitingState = await this.redis.getWaitingState(`http_callback:${callbackId}`);
            if (!waitingState) {
                logger.warn('No waiting state found for callback', { callbackId });
                return;
            }

            const { flow, nodeDef, nodeState } = waitingState;

            // Update node state
            nodeState.status = 'completed';
            nodeState.result = data;
            nodeState.finishedAt = new Date();
            nodeState.logs.push(`Received callback data at ${new Date().toISOString()}`);

            // Emit event for any waiting promises
            this.eventEmitter.emit(`callback:${callbackId}`, { data, flow, nodeDef, nodeState });

            // Cleanup
            await this.cleanup(callbackId);
        } catch (error: any) {
            logger.error('Error handling HTTP callback', { callbackId, error });
            throw new ExternalServiceError(
                'HTTPCallback',
                `Failed to handle callback: ${error.message}`
            );
        }
    }

    async waitForCallback(callbackId: string, timeout: number): Promise<any> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.cleanup(callbackId);
                reject(new ExternalServiceError('HTTPCallback', 'Callback timeout'));
            }, timeout);

            this.eventEmitter.once(`callback:${callbackId}`, (data) => {
                clearTimeout(timer);
                resolve(data);
            });
        });
    }

    private async cleanup(callbackId: string): Promise<void> {
        try {
            await this.redis.deleteWaitingState(`http_callback:${callbackId}`);
            this.eventEmitter.removeAllListeners(`callback:${callbackId}`);
        } catch (error) {
            logger.error('Error during callback cleanup', { callbackId, error });
        }
    }

    generateCallbackUrl(baseUrl: string, callbackId: string): string {
        const url = new URL(baseUrl);
        url.searchParams.append('callbackId', callbackId);
        return url.toString();
    }
}