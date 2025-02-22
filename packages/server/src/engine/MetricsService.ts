// src/services/MetricsService.ts

import { logger } from '@mintflow/common';

export interface IMetrics {
    nodeExecutionTime: Record<string, number[]>;
    nodeFailureCount: Record<string, number>;
    flowCompletionTime: Record<string, number[]>;
    activeFlows: number;
}

export class MetricsService {
    private static instance: MetricsService;
    private metrics: IMetrics = {
        nodeExecutionTime: {},
        nodeFailureCount: {},
        flowCompletionTime: {},
        activeFlows: 0
    };

    private constructor() { }

    static getInstance(): MetricsService {
        if (!MetricsService.instance) {
            MetricsService.instance = new MetricsService();
        }
        return MetricsService.instance;
    }

    recordNodeExecution(nodeId: string, duration: number): void {
        if (!this.metrics.nodeExecutionTime[nodeId]) {
            this.metrics.nodeExecutionTime[nodeId] = [];
        }
        this.metrics.nodeExecutionTime[nodeId].push(duration);

        // Keep only last 100 executions for memory management
        if (this.metrics.nodeExecutionTime[nodeId].length > 100) {
            this.metrics.nodeExecutionTime[nodeId].shift();
        }
    }

    recordNodeFailure(nodeId: string): void {
        this.metrics.nodeFailureCount[nodeId] = (this.metrics.nodeFailureCount[nodeId] || 0) + 1;
        logger.warn('Node failure recorded', { nodeId, totalFailures: this.metrics.nodeFailureCount[nodeId] });
    }

    recordFlowStart(): void {
        this.metrics.activeFlows++;
    }

    recordFlowCompletion(flowId: string, duration: number): void {
        if (!this.metrics.flowCompletionTime[flowId]) {
            this.metrics.flowCompletionTime[flowId] = [];
        }
        this.metrics.flowCompletionTime[flowId].push(duration);
        this.metrics.activeFlows = Math.max(0, this.metrics.activeFlows - 1);

        // Keep only last 100 completions
        if (this.metrics.flowCompletionTime[flowId].length > 100) {
            this.metrics.flowCompletionTime[flowId].shift();
        }
    }

    getMetrics(): IMetrics {
        return this.metrics;
    }

    getNodeMetrics(nodeId: string) {
        return {
            executionTimes: this.metrics.nodeExecutionTime[nodeId] || [],
            failures: this.metrics.nodeFailureCount[nodeId] || 0,
            averageExecutionTime: this.calculateAverage(this.metrics.nodeExecutionTime[nodeId] || [])
        };
    }

    getFlowMetrics(flowId: string) {
        return {
            completionTimes: this.metrics.flowCompletionTime[flowId] || [],
            averageCompletionTime: this.calculateAverage(this.metrics.flowCompletionTime[flowId] || []),
            activeFlows: this.metrics.activeFlows
        };
    }

    private calculateAverage(numbers: number[]): number {
        if (numbers.length === 0) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }
}