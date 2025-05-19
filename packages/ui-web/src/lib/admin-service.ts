/**
 * Admin Service
 * 
 * A central service for fetching, caching, and accessing admin data throughout the application.
 * This service can be used both inside and outside of React components.
 */

import axios from 'axios';
import { getProxiedUrl } from './proxy-utils';

// API Key type definition
export interface ApiKey {
    apiKeyId: string;
    name: string;
    workspace: string;
    environment: string;
    createdAt: string;
    lastUsed?: string;
    fullKey?: string; // Only returned when creating a new key
}

// Profile type definition
export interface Profile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    createdAt: string;
    preferences?: {
        theme: string;
        notifications: boolean;
    };
}

// Member type definition
export interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    joinedAt: string;
    workspaces?: string[];
}

// Workspace type definition
export interface Workspace {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    memberCount?: number;
    members?: { id: string; name: string; role: string }[];
}

// Billing info type definition
export interface BillingInfo {
    plan: string;
    status: string;
    nextBillingDate: string;
    paymentMethod: {
        type: string;
        last4: string;
        expiryMonth: number;
        expiryYear: number;
        brand: string;
    };
    billingAddress: {
        name: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
}

// Invoice type definition
export interface Invoice {
    id: string;
    amount: number;
    status: string;
    date: string;
    pdf: string;
    items?: { description: string; amount: number }[];
    subtotal?: number;
    tax?: number;
    total?: number;
}

// Limits type definition
export interface Limits {
    apiRateLimit: number;
    maxWorkspaces: number;
    maxMembers: number;
    maxStorage: number;
    currentUsage: {
        apiCalls: number;
        workspaces: number;
        members: number;
        storage: number;
    };
}

// Privacy settings type definition
export interface PrivacySettings {
    dataRetention: {
        logs: number; // days
        analytics: number; // days
    };
    dataSharingConsent: boolean;
    marketingEmails: boolean;
    twoFactorAuth: boolean;
}

/**
 * Get all API keys for a tenant
 * @param tenantId Tenant ID
 * @returns Promise that resolves to an array of API keys
 */
export async function getAllApiKeys(tenantId: string = 'default_tenant'): Promise<ApiKey[]> {
    try {
        const url = getProxiedUrl(`api/admin/api-keys?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching API keys:', error);
        throw error;
    }
}

/**
 * Get API key by ID
 * @param apiKeyId API key ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves to an API key
 */
export async function getApiKeyById(apiKeyId: string, tenantId: string = 'default_tenant'): Promise<ApiKey> {
    try {
        const url = getProxiedUrl(`api/admin/api-keys/${apiKeyId}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching API key ${apiKeyId}:`, error);
        throw error;
    }
}

/**
 * Create a new API key
 * @param data API key data
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the created API key
 */
export async function createApiKey(
    data: { name: string; workspace: string; environment: string },
    tenantId: string = 'default_tenant'
): Promise<ApiKey> {
    try {
        const url = getProxiedUrl(`api/admin/api-keys?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.post(url, data);
        return response.data;
    } catch (error: any) {
        console.error('Error creating API key:', error);
        throw error;
    }
}

/**
 * Update an API key
 * @param apiKeyId API key ID
 * @param data API key data to update
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the updated API key
 */
export async function updateApiKey(
    apiKeyId: string,
    data: { name: string; workspace: string; environment: string },
    tenantId: string = 'default_tenant'
): Promise<ApiKey> {
    try {
        const url = getProxiedUrl(`api/admin/api-keys/${apiKeyId}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.put(url, data);
        return response.data;
    } catch (error: any) {
        console.error(`Error updating API key ${apiKeyId}:`, error);
        throw error;
    }
}

/**
 * Delete an API key
 * @param apiKeyId API key ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves when the API key is deleted
 */
export async function deleteApiKey(apiKeyId: string, tenantId: string = 'default_tenant'): Promise<void> {
    try {
        const url = getProxiedUrl(`api/admin/api-keys/${apiKeyId}?tenantId=${tenantId}`, '', 'mintflow');
        await axios.delete(url);
    } catch (error: any) {
        console.error(`Error deleting API key ${apiKeyId}:`, error);
        throw error;
    }
}

/**
 * Get user profile
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the user profile
 */
export async function getProfile(tenantId: string = 'default_tenant'): Promise<Profile> {
    try {
        const url = getProxiedUrl(`api/admin/profile?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

/**
 * Update user profile
 * @param data Profile data to update
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the updated profile
 */
export async function updateProfile(
    data: { name: string; email: string; avatar?: string; preferences?: any },
    tenantId: string = 'default_tenant'
): Promise<Profile> {
    try {
        const url = getProxiedUrl(`api/admin/profile?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.put(url, data);
        return response.data;
    } catch (error: any) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

/**
 * Get all members
 * @param tenantId Tenant ID
 * @returns Promise that resolves to an array of members
 */
export async function getAllMembers(tenantId: string = 'default_tenant'): Promise<Member[]> {
    try {
        const url = getProxiedUrl(`api/admin/members?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching members:', error);
        throw error;
    }
}

/**
 * Get member by ID
 * @param memberId Member ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves to a member
 */
export async function getMemberById(memberId: string, tenantId: string = 'default_tenant'): Promise<Member> {
    try {
        const url = getProxiedUrl(`api/admin/members/${memberId}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching member ${memberId}:`, error);
        throw error;
    }
}

/**
 * Invite a new member
 * @param data Member data
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the invitation
 */
export async function inviteMember(
    data: { email: string; role: string; workspaces?: string[] },
    tenantId: string = 'default_tenant'
): Promise<any> {
    try {
        const url = getProxiedUrl(`api/admin/members/invite?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.post(url, data);
        return response.data;
    } catch (error: any) {
        console.error('Error inviting member:', error);
        throw error;
    }
}

/**
 * Update a member
 * @param memberId Member ID
 * @param data Member data to update
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the updated member
 */
export async function updateMember(
    memberId: string,
    data: { name: string; email: string; role: string; status: string; workspaces?: string[] },
    tenantId: string = 'default_tenant'
): Promise<Member> {
    try {
        const url = getProxiedUrl(`api/admin/members/${memberId}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.put(url, data);
        return response.data;
    } catch (error: any) {
        console.error(`Error updating member ${memberId}:`, error);
        throw error;
    }
}

/**
 * Remove a member
 * @param memberId Member ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves when the member is removed
 */
export async function removeMember(memberId: string, tenantId: string = 'default_tenant'): Promise<void> {
    try {
        const url = getProxiedUrl(`api/admin/members/${memberId}?tenantId=${tenantId}`, '', 'mintflow');
        await axios.delete(url);
    } catch (error: any) {
        console.error(`Error removing member ${memberId}:`, error);
        throw error;
    }
}

/**
 * Get all workspaces
 * @param tenantId Tenant ID
 * @returns Promise that resolves to an array of workspaces
 */
export async function getAllWorkspaces(tenantId: string = 'default_tenant'): Promise<Workspace[]> {
    try {
        const url = getProxiedUrl(`api/admin/workspaces?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching workspaces:', error);
        throw error;
    }
}

/**
 * Get workspace by ID
 * @param workspaceId Workspace ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves to a workspace
 */
export async function getWorkspaceById(workspaceId: string, tenantId: string = 'default_tenant'): Promise<Workspace> {
    try {
        const url = getProxiedUrl(`api/admin/workspaces/${workspaceId}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching workspace ${workspaceId}:`, error);
        throw error;
    }
}

/**
 * Create a new workspace
 * @param data Workspace data
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the created workspace
 */
export async function createWorkspace(
    data: { name: string; description?: string },
    tenantId: string = 'default_tenant'
): Promise<Workspace> {
    try {
        const url = getProxiedUrl(`api/admin/workspaces?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.post(url, data);
        return response.data;
    } catch (error: any) {
        console.error('Error creating workspace:', error);
        throw error;
    }
}

/**
 * Update a workspace
 * @param workspaceId Workspace ID
 * @param data Workspace data to update
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the updated workspace
 */
export async function updateWorkspace(
    workspaceId: string,
    data: { name: string; description?: string },
    tenantId: string = 'default_tenant'
): Promise<Workspace> {
    try {
        const url = getProxiedUrl(`api/admin/workspaces/${workspaceId}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.put(url, data);
        return response.data;
    } catch (error: any) {
        console.error(`Error updating workspace ${workspaceId}:`, error);
        throw error;
    }
}

/**
 * Delete a workspace
 * @param workspaceId Workspace ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves when the workspace is deleted
 */
export async function deleteWorkspace(workspaceId: string, tenantId: string = 'default_tenant'): Promise<void> {
    try {
        const url = getProxiedUrl(`api/admin/workspaces/${workspaceId}?tenantId=${tenantId}`, '', 'mintflow');
        await axios.delete(url);
    } catch (error: any) {
        console.error(`Error deleting workspace ${workspaceId}:`, error);
        throw error;
    }
}

/**
 * Get billing information
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the billing information
 */
export async function getBillingInfo(tenantId: string = 'default_tenant'): Promise<BillingInfo> {
    try {
        const url = getProxiedUrl(`api/admin/billing?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching billing info:', error);
        throw error;
    }
}

/**
 * Update billing information
 * @param data Billing data to update
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the updated billing information
 */
export async function updateBillingInfo(
    data: { paymentMethod: any; billingAddress: any },
    tenantId: string = 'default_tenant'
): Promise<BillingInfo> {
    try {
        const url = getProxiedUrl(`api/admin/billing?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.put(url, data);
        return response.data;
    } catch (error: any) {
        console.error('Error updating billing info:', error);
        throw error;
    }
}

/**
 * Get all invoices
 * @param tenantId Tenant ID
 * @returns Promise that resolves to an array of invoices
 */
export async function getInvoices(tenantId: string = 'default_tenant'): Promise<Invoice[]> {
    try {
        const url = getProxiedUrl(`api/admin/billing/invoices?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
}

/**
 * Get invoice by ID
 * @param invoiceId Invoice ID
 * @param tenantId Tenant ID
 * @returns Promise that resolves to an invoice
 */
export async function getInvoiceById(invoiceId: string, tenantId: string = 'default_tenant'): Promise<Invoice> {
    try {
        const url = getProxiedUrl(`api/admin/billing/invoices/${invoiceId}?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching invoice ${invoiceId}:`, error);
        throw error;
    }
}

/**
 * Get account limits
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the account limits
 */
export async function getLimits(tenantId: string = 'default_tenant'): Promise<Limits> {
    try {
        const url = getProxiedUrl(`api/admin/limits?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching limits:', error);
        throw error;
    }
}

/**
 * Update account limits
 * @param data Limits data to update
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the updated limits
 */
export async function updateLimits(
    data: { apiRateLimit: number; maxWorkspaces: number; maxMembers: number; maxStorage: number },
    tenantId: string = 'default_tenant'
): Promise<Limits> {
    try {
        const url = getProxiedUrl(`api/admin/limits?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.put(url, data);
        return response.data;
    } catch (error: any) {
        console.error('Error updating limits:', error);
        throw error;
    }
}

/**
 * Get privacy settings
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the privacy settings
 */
export async function getPrivacySettings(tenantId: string = 'default_tenant'): Promise<PrivacySettings> {
    try {
        const url = getProxiedUrl(`api/admin/privacy?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching privacy settings:', error);
        throw error;
    }
}

/**
 * Update privacy settings
 * @param data Privacy settings data to update
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the updated privacy settings
 */
export async function updatePrivacySettings(
    data: {
        dataRetention: { logs: number; analytics: number };
        dataSharingConsent: boolean;
        marketingEmails: boolean;
        twoFactorAuth: boolean;
    },
    tenantId: string = 'default_tenant'
): Promise<PrivacySettings> {
    try {
        const url = getProxiedUrl(`api/admin/privacy?tenantId=${tenantId}`, '', 'mintflow');
        const response = await axios.put(url, data);
        return response.data;
    } catch (error: any) {
        console.error('Error updating privacy settings:', error);
        throw error;
    }
}
