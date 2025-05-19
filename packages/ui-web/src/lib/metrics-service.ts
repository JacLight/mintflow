/**
 * Metrics Service
 * 
 * A central service for fetching, caching, and accessing metrics data throughout the application.
 * This service can be used both inside and outside of React components.
 */

import axios from 'axios';
import { getProxiedUrl } from './proxy-utils';

// Usage stats type definition
export interface UsageStats {
    totalRequests: number;
    totalTokens: number;
    requestsByModel: Record<string, number>;
    tokensByModel: Record<string, number>;
}

// Usage by period type definition
export interface UsageByPeriod {
    period: string;
    data: Array<{
        date: string | null;
        requests: number;
        tokens: number;
        requestsByModel: Record<string, number>;
        tokensByModel: Record<string, number>;
    }>;
}

// Cost stats type definition
export interface CostStats {
    totalCost: number;
    costByModel: Record<string, number>;
    costByWorkspace: Record<string, number>;
}

// Cost by period type definition
export interface CostByPeriod {
    period: string;
    data: Array<{
        date: string;
        cost: number;
    }>;
}

/**
 * Get overall usage statistics
 * @param tenantId Tenant ID
 * @returns Promise that resolves to usage statistics
 */
export async function getUsageStats(tenantId: string = 'default_tenant'): Promise<UsageStats> {
    try {
        const url = getProxiedUrl(`api/metrics/usage?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching usage stats:', error);
        throw error;
    }
}

/**
 * Get usage statistics for a specific period
 * @param period Period ('daily', 'weekly', 'monthly')
 * @param tenantId Tenant ID
 * @returns Promise that resolves to usage statistics by period
 */
export async function getUsageByPeriod(
    period: string = 'daily',
    tenantId: string = 'default_tenant'
): Promise<UsageByPeriod> {
    try {
        const url = getProxiedUrl(`api/metrics/usage/${period}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching usage stats for period ${period}:`, error);
        throw error;
    }
}

/**
 * Get overall cost statistics
 * @param tenantId Tenant ID
 * @returns Promise that resolves to cost statistics
 */
export async function getCostStats(tenantId: string = 'default_tenant'): Promise<CostStats> {
    try {
        const url = getProxiedUrl(`api/metrics/cost?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching cost stats:', error);
        throw error;
    }
}

/**
 * Get cost statistics for a specific period
 * @param period Period ('daily', 'weekly', 'monthly')
 * @param tenantId Tenant ID
 * @returns Promise that resolves to cost statistics by period
 */
export async function getCostByPeriod(
    period: string = 'daily',
    tenantId: string = 'default_tenant'
): Promise<CostByPeriod> {
    try {
        const url = getProxiedUrl(`api/metrics/cost/${period}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching cost stats for period ${period}:`, error);
        throw error;
    }
}

/**
 * Create usage metrics (for testing purposes)
 * @param data Usage metrics data
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the created usage metrics
 */
export async function createUsageMetrics(
    data: {
        totalRequests: number;
        totalTokens: number;
        requestsByModel: Record<string, number>;
        tokensByModel: Record<string, number>;
        period: string;
        date: string;
    },
    tenantId: string = 'default_tenant'
): Promise<any> {
    try {
        const url = getProxiedUrl(`api/metrics/usage?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.post(url, data);
        return response.data;
    } catch (error: any) {
        console.error('Error creating usage metrics:', error);
        throw error;
    }
}
