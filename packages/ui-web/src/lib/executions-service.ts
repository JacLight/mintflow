/**
 * Executions Service
 * 
 * A central service for fetching, caching, and accessing flow execution data throughout the application.
 * This service can be used both inside and outside of React components.
 */

import axios from 'axios';
import { getProxiedUrl } from './proxy-utils';

// Flow execution type definition
export interface FlowExecution {
    id: string;
    name: string;
    status: 'running' | 'paused' | 'error' | 'completed' | 'waiting';
    startTime: string;
    duration: string;
    progress: number;
    nextStep: string;
    triggers: number;
    errors: number;
    type: 'scheduled' | 'webhook' | 'api' | 'manual';
}

// Flow execution stats type definition
export interface FlowExecutionStats {
    activeFlows: {
        total: number;
        running: number;
        paused: number;
        waiting: number;
    };
    performance: {
        avgDuration: string;
        successRate: number;
        totalExecutions: number;
        avgSteps: number;
    };
    recentErrors: Array<{
        flowName: string;
        timeAgo: string;
        errorMessage: string;
        step: string;
    }>;
}

/**
 * Get all flow executions
 * @param status Filter by status ('active', 'completed', 'error', 'scheduled')
 * @param tenantId Tenant ID
 * @returns Promise that resolves to an array of flow executions
 */
export async function getFlowExecutions(
    status: string = 'all',
    tenantId: string = 'default_tenant'
): Promise<FlowExecution[]> {
    try {
        const url = getProxiedUrl(`api/admin/executions?status=${status}&tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching flow executions:', error);
        throw error;
    }
}

/**
 * Get flow execution by ID
 * @param executionId Execution ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves to a flow execution
 */
export async function getFlowExecutionById(
    executionId: string,
    tenantId: string = 'default_tenant'
): Promise<FlowExecution> {
    try {
        const url = getProxiedUrl(`api/admin/executions/${executionId}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching flow execution ${executionId}:`, error);
        throw error;
    }
}

/**
 * Get flow execution statistics
 * @param tenantId Tenant ID
 * @returns Promise that resolves to flow execution statistics
 */
export async function getFlowExecutionStats(tenantId: string = 'default_tenant'): Promise<FlowExecutionStats> {
    try {
        const url = getProxiedUrl(`api/admin/executions/stats?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching flow execution stats:', error);
        throw error;
    }
}

/**
 * Pause a flow execution
 * @param executionId Execution ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves when the flow execution is paused
 */
export async function pauseFlowExecution(
    executionId: string,
    tenantId: string = 'default_tenant'
): Promise<void> {
    try {
        const url = getProxiedUrl(`api/admin/executions/${executionId}/pause?tenantId=${tenantId}`, '', 'mintflow');
        await axios.post(url);
    } catch (error: any) {
        console.error(`Error pausing flow execution ${executionId}:`, error);
        throw error;
    }
}

/**
 * Resume a flow execution
 * @param executionId Execution ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves when the flow execution is resumed
 */
export async function resumeFlowExecution(
    executionId: string,
    tenantId: string = 'default_tenant'
): Promise<void> {
    try {
        const url = getProxiedUrl(`api/admin/executions/${executionId}/resume?tenantId=${tenantId}`, '', 'mintflow');
        await axios.post(url);
    } catch (error: any) {
        console.error(`Error resuming flow execution ${executionId}:`, error);
        throw error;
    }
}

/**
 * Restart a flow execution
 * @param executionId Execution ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves when the flow execution is restarted
 */
export async function restartFlowExecution(
    executionId: string,
    tenantId: string = 'default_tenant'
): Promise<void> {
    try {
        const url = getProxiedUrl(`api/admin/executions/${executionId}/restart?tenantId=${tenantId}`, '', 'mintflow');
        await axios.post(url);
    } catch (error: any) {
        console.error(`Error restarting flow execution ${executionId}:`, error);
        throw error;
    }
}

/**
 * Cancel a flow execution
 * @param executionId Execution ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves when the flow execution is cancelled
 */
export async function cancelFlowExecution(
    executionId: string,
    tenantId: string = 'default_tenant'
): Promise<void> {
    try {
        const url = getProxiedUrl(`api/admin/executions/${executionId}/cancel?tenantId=${tenantId}`, '', 'mintflow');
        await axios.post(url);
    } catch (error: any) {
        console.error(`Error cancelling flow execution ${executionId}:`, error);
        throw error;
    }
}
