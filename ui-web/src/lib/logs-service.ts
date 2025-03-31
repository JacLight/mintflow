/**
 * Logs Service
 * 
 * A central service for fetching, caching, and accessing logs data throughout the application.
 * This service can be used both inside and outside of React components.
 */

import axios from 'axios';
import { getProxiedUrl } from './proxy-utils';

// Log entry type definition
export interface LogEntry {
    id: string;
    timestamp: string;
    type: 'info' | 'warning' | 'error' | 'debug';
    message: string;
    details: string;
    source?: string;
    flowId?: string;
    userId?: string;
}

// Log filter options
export interface LogFilterOptions {
    type?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Get all logs with optional filtering
 * @param options Filter options
 * @param tenantId Tenant ID
 * @returns Promise that resolves to an array of log entries and pagination info
 */
export async function getLogs(
    options: LogFilterOptions = {},
    tenantId: string = 'default_tenant'
): Promise<{ logs: LogEntry[]; total: number; page: number; totalPages: number }> {
    try {
        // Build query string from options
        const queryParams = new URLSearchParams();
        queryParams.append('tenantId', tenantId);

        if (options.type) queryParams.append('type', options.type);
        if (options.source) queryParams.append('source', options.source);
        if (options.startDate) queryParams.append('startDate', options.startDate);
        if (options.endDate) queryParams.append('endDate', options.endDate);
        if (options.search) queryParams.append('search', options.search);
        if (options.page) queryParams.append('page', options.page.toString());
        if (options.limit) queryParams.append('limit', options.limit.toString());

        const url = getProxiedUrl(`api/admin/logs?${queryParams.toString()}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching logs:', error);
        throw error;
    }
}

/**
 * Get log entry by ID
 * @param logId Log ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves to a log entry
 */
export async function getLogById(
    logId: string,
    tenantId: string = 'default_tenant'
): Promise<LogEntry> {
    try {
        const url = getProxiedUrl(`api/admin/logs/${logId}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching log ${logId}:`, error);
        throw error;
    }
}

/**
 * Get logs for a specific flow
 * @param flowId Flow ID
 * @param options Filter options
 * @param tenantId Tenant ID
 * @returns Promise that resolves to an array of log entries and pagination info
 */
export async function getFlowLogs(
    flowId: string,
    options: LogFilterOptions = {},
    tenantId: string = 'default_tenant'
): Promise<{ logs: LogEntry[]; total: number; page: number; totalPages: number }> {
    try {
        // Build query string from options
        const queryParams = new URLSearchParams();
        queryParams.append('tenantId', tenantId);
        queryParams.append('flowId', flowId);

        if (options.type) queryParams.append('type', options.type);
        if (options.startDate) queryParams.append('startDate', options.startDate);
        if (options.endDate) queryParams.append('endDate', options.endDate);
        if (options.search) queryParams.append('search', options.search);
        if (options.page) queryParams.append('page', options.page.toString());
        if (options.limit) queryParams.append('limit', options.limit.toString());

        const url = getProxiedUrl(`api/admin/logs/flow?${queryParams.toString()}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching logs for flow ${flowId}:`, error);
        throw error;
    }
}

/**
 * Export logs as CSV
 * @param options Filter options
 * @param tenantId Tenant ID
 * @returns Promise that resolves to a Blob containing the CSV data
 */
export async function exportLogsAsCsv(
    options: LogFilterOptions = {},
    tenantId: string = 'default_tenant'
): Promise<Blob> {
    try {
        // Build query string from options
        const queryParams = new URLSearchParams();
        queryParams.append('tenantId', tenantId);
        queryParams.append('format', 'csv');

        if (options.type) queryParams.append('type', options.type);
        if (options.source) queryParams.append('source', options.source);
        if (options.startDate) queryParams.append('startDate', options.startDate);
        if (options.endDate) queryParams.append('endDate', options.endDate);
        if (options.search) queryParams.append('search', options.search);

        const url = getProxiedUrl(`api/admin/logs/export?${queryParams.toString()}`, '', 'mintflow');
        const response = await axios.get(url, { responseType: 'blob' });
        return response.data;
    } catch (error: any) {
        console.error('Error exporting logs:', error);
        throw error;
    }
}

/**
 * Get log retention policy
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the log retention policy
 */
export async function getLogRetentionPolicy(
    tenantId: string = 'default_tenant'
): Promise<{ days: number; extendedRetention: boolean }> {
    try {
        const url = getProxiedUrl(`api/admin/logs/retention?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching log retention policy:', error);
        throw error;
    }
}
