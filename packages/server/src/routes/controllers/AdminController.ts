import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { AdminService } from '../../services/AdminService.js';

// Get instance of AdminService
const adminService = AdminService.getInstance();

// ==================== API Keys ====================

/**
 * Get all API keys.
 */
export async function getAllApiKeys(req: Request, res: Response): Promise<any> {
    try {
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Get API keys from service
        const apiKeys = await adminService.getAllApiKeys(tenantId);

        return res.status(200).json(apiKeys);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching API keys: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch API keys' });
    }
}

/**
 * Get API key by ID.
 */
export async function getApiKeyById(req: Request, res: Response): Promise<any> {
    try {
        const apiKeyId = req.params.keyId;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Get API key from service
        const apiKey = await adminService.getApiKeyById(apiKeyId, tenantId);

        return res.status(200).json(apiKey);
    } catch (err: any) {
        // Check for specific error types
        if (err.message && err.message.includes('API key not found')) {
            return res.status(404).json({ error: err.message });
        }

        logger.error(`[AdminController] Error fetching API key: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch API key' });
    }
}

/**
 * Create a new API key.
 */
export async function createApiKey(req: Request, res: Response): Promise<any> {
    try {
        const { name, workspace, environment } = req.body;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate input data
        const { ApiKeyValidator } = await import('../../models/validators/ApiKeyValidator.js');
        const { error, value } = ApiKeyValidator.validate({
            name,
            workspace,
            environment,
            tenantId
        });

        if (error) {
            logger.warn(`[AdminController] Validation error creating API key: ${error.message}`);
            return res.status(400).json({
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        // Create API key using service
        const newApiKey = await adminService.createApiKey(value);

        return res.status(201).json(newApiKey);
    } catch (err: any) {
        // Check for specific error types
        if (err.message && err.message.includes('Tenant not found')) {
            return res.status(404).json({ error: err.message });
        }

        logger.error(`[AdminController] Error creating API key: ${err.message}`);
        return res.status(500).json({ error: 'Failed to create API key' });
    }
}

/**
 * Update an API key.
 */
export async function updateApiKey(req: Request, res: Response): Promise<any> {
    try {
        const apiKeyId = req.params.keyId;
        const { name, workspace, environment } = req.body;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate input data
        const { ApiKeyValidator } = await import('../../models/validators/ApiKeyValidator.js');
        const { error, value } = ApiKeyValidator.validate({
            apiKeyId,
            name,
            workspace,
            environment,
            tenantId
        });

        if (error) {
            logger.warn(`[AdminController] Validation error updating API key: ${error.message}`);
            return res.status(400).json({
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        // Update API key using service
        const updatedApiKey = await adminService.updateApiKey(apiKeyId, {
            name: value.name,
            workspace: value.workspace,
            environment: value.environment
        }, tenantId);

        return res.status(200).json(updatedApiKey);
    } catch (err: any) {
        // Check for specific error types
        if (err.message && err.message.includes('API key not found')) {
            return res.status(404).json({ error: err.message });
        }

        logger.error(`[AdminController] Error updating API key: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update API key' });
    }
}

/**
 * Delete an API key.
 */
export async function deleteApiKey(req: Request, res: Response): Promise<any> {
    try {
        const apiKeyId = req.params.keyId;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!apiKeyId) {
            return res.status(400).json({ error: 'API key ID is required' });
        }

        // Delete API key using service
        await adminService.deleteApiKey(apiKeyId, tenantId);

        return res.status(204).send();
    } catch (err: any) {
        // Check for specific error types
        if (err.message && err.message.includes('API key not found')) {
            return res.status(404).json({ error: err.message });
        }

        logger.error(`[AdminController] Error deleting API key: ${err.message}`);
        return res.status(500).json({ error: 'Failed to delete API key' });
    }
}

// ==================== Profile ====================

/**
 * Get user profile.
 */
export async function getProfile(req: Request, res: Response): Promise<any> {
    try {
        // Mock data for now - would be replaced with actual service calls
        const profile = {
            id: 'user_123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: 'https://example.com/avatar.jpg',
            role: 'Admin',
            createdAt: '2024-12-01T10:00:00Z',
            preferences: {
                theme: 'light',
                notifications: true
            }
        };

        return res.status(200).json(profile);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching profile: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch profile' });
    }
}

/**
 * Update user profile.
 */
export async function updateProfile(req: Request, res: Response): Promise<any> {
    try {
        const { name, email, avatar, preferences } = req.body;

        // Validate input data
        if (!name || !email) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Name and email are required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const updatedProfile = {
            id: 'user_123',
            name,
            email,
            avatar,
            role: 'Admin',
            createdAt: '2024-12-01T10:00:00Z',
            preferences
        };

        return res.status(200).json(updatedProfile);
    } catch (err: any) {
        logger.error(`[AdminController] Error updating profile: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
}

// ==================== Members ====================

/**
 * Get all members.
 */
export async function getAllMembers(req: Request, res: Response): Promise<any> {
    try {
        // Mock data for now - would be replaced with actual service calls
        const members = [
            {
                id: 'user_123',
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: 'Admin',
                status: 'Active',
                joinedAt: '2024-12-01T10:00:00Z'
            },
            {
                id: 'user_456',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                role: 'Editor',
                status: 'Active',
                joinedAt: '2025-01-15T14:30:00Z'
            }
        ];

        return res.status(200).json(members);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching members: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch members' });
    }
}

/**
 * Get member by ID.
 */
export async function getMemberById(req: Request, res: Response): Promise<any> {
    try {
        const memberId = req.params.memberId;

        // Validate parameters
        if (!memberId) {
            return res.status(400).json({ error: 'Member ID is required' });
        }

        // Mock data for now - would be replaced with actual service calls
        const member = {
            id: memberId,
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            status: 'Active',
            joinedAt: '2024-12-01T10:00:00Z',
            workspaces: ['Default', 'Development']
        };

        return res.status(200).json(member);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching member: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch member' });
    }
}

/**
 * Invite a new member.
 */
export async function inviteMember(req: Request, res: Response): Promise<any> {
    try {
        const { email, role, workspaces } = req.body;

        // Validate input data
        if (!email || !role) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Email and role are required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const invitation = {
            id: `inv_${Date.now()}`,
            email,
            role,
            workspaces,
            status: 'Pending',
            invitedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };

        return res.status(201).json(invitation);
    } catch (err: any) {
        logger.error(`[AdminController] Error inviting member: ${err.message}`);
        return res.status(500).json({ error: 'Failed to invite member' });
    }
}

/**
 * Update a member.
 */
export async function updateMember(req: Request, res: Response): Promise<any> {
    try {
        const memberId = req.params.memberId;
        const { name, email, role, status, workspaces } = req.body;

        // Validate parameters
        if (!memberId) {
            return res.status(400).json({ error: 'Member ID is required' });
        }

        // Validate input data
        if (!name || !email || !role || !status) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Name, email, role, and status are required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const updatedMember = {
            id: memberId,
            name,
            email,
            role,
            status,
            joinedAt: '2024-12-01T10:00:00Z',
            workspaces
        };

        return res.status(200).json(updatedMember);
    } catch (err: any) {
        logger.error(`[AdminController] Error updating member: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update member' });
    }
}

/**
 * Remove a member.
 */
export async function removeMember(req: Request, res: Response): Promise<any> {
    try {
        const memberId = req.params.memberId;

        // Validate parameters
        if (!memberId) {
            return res.status(400).json({ error: 'Member ID is required' });
        }

        // Mock deletion - would be replaced with actual service calls
        return res.status(204).send();
    } catch (err: any) {
        logger.error(`[AdminController] Error removing member: ${err.message}`);
        return res.status(500).json({ error: 'Failed to remove member' });
    }
}

// ==================== Workspaces ====================

/**
 * Get all workspaces.
 */
export async function getAllWorkspaces(req: Request, res: Response): Promise<any> {
    try {
        // Mock data for now - would be replaced with actual service calls
        const workspaces = [
            {
                id: 'ws_123',
                name: 'Default',
                description: 'Default workspace',
                createdAt: '2024-12-01T10:00:00Z',
                memberCount: 5
            },
            {
                id: 'ws_456',
                name: 'Development',
                description: 'Development workspace',
                createdAt: '2025-01-15T14:30:00Z',
                memberCount: 3
            }
        ];

        return res.status(200).json(workspaces);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching workspaces: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
}

/**
 * Get workspace by ID.
 */
export async function getWorkspaceById(req: Request, res: Response): Promise<any> {
    try {
        const workspaceId = req.params.workspaceId;

        // Validate parameters
        if (!workspaceId) {
            return res.status(400).json({ error: 'Workspace ID is required' });
        }

        // Mock data for now - would be replaced with actual service calls
        const workspace = {
            id: workspaceId,
            name: 'Default',
            description: 'Default workspace',
            createdAt: '2024-12-01T10:00:00Z',
            members: [
                { id: 'user_123', name: 'John Doe', role: 'Admin' },
                { id: 'user_456', name: 'Jane Smith', role: 'Editor' }
            ]
        };

        return res.status(200).json(workspace);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching workspace: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch workspace' });
    }
}

/**
 * Create a new workspace.
 */
export async function createWorkspace(req: Request, res: Response): Promise<any> {
    try {
        const { name, description } = req.body;

        // Validate input data
        if (!name) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Name is required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const newWorkspace = {
            id: `ws_${Date.now()}`,
            name,
            description,
            createdAt: new Date().toISOString(),
            members: [
                { id: 'user_123', name: 'John Doe', role: 'Admin' }
            ]
        };

        return res.status(201).json(newWorkspace);
    } catch (err: any) {
        logger.error(`[AdminController] Error creating workspace: ${err.message}`);
        return res.status(500).json({ error: 'Failed to create workspace' });
    }
}

/**
 * Update a workspace.
 */
export async function updateWorkspace(req: Request, res: Response): Promise<any> {
    try {
        const workspaceId = req.params.workspaceId;
        const { name, description } = req.body;

        // Validate parameters
        if (!workspaceId) {
            return res.status(400).json({ error: 'Workspace ID is required' });
        }

        // Validate input data
        if (!name) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Name is required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const updatedWorkspace = {
            id: workspaceId,
            name,
            description,
            createdAt: '2024-12-01T10:00:00Z',
            members: [
                { id: 'user_123', name: 'John Doe', role: 'Admin' },
                { id: 'user_456', name: 'Jane Smith', role: 'Editor' }
            ]
        };

        return res.status(200).json(updatedWorkspace);
    } catch (err: any) {
        logger.error(`[AdminController] Error updating workspace: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update workspace' });
    }
}

/**
 * Delete a workspace.
 */
export async function deleteWorkspace(req: Request, res: Response): Promise<any> {
    try {
        const workspaceId = req.params.workspaceId;

        // Validate parameters
        if (!workspaceId) {
            return res.status(400).json({ error: 'Workspace ID is required' });
        }

        // Mock deletion - would be replaced with actual service calls
        return res.status(204).send();
    } catch (err: any) {
        logger.error(`[AdminController] Error deleting workspace: ${err.message}`);
        return res.status(500).json({ error: 'Failed to delete workspace' });
    }
}

// ==================== Billing ====================

/**
 * Get billing information.
 */
export async function getBillingInfo(req: Request, res: Response): Promise<any> {
    try {
        // Mock data for now - would be replaced with actual service calls
        const billingInfo = {
            plan: 'Pro',
            status: 'Active',
            nextBillingDate: '2025-04-15T00:00:00Z',
            paymentMethod: {
                type: 'card',
                last4: '4242',
                expiryMonth: 12,
                expiryYear: 2027,
                brand: 'Visa'
            },
            billingAddress: {
                name: 'John Doe',
                line1: '123 Main St',
                line2: 'Suite 100',
                city: 'San Francisco',
                state: 'CA',
                postalCode: '94105',
                country: 'US'
            }
        };

        return res.status(200).json(billingInfo);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching billing info: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch billing information' });
    }
}

/**
 * Update billing information.
 */
export async function updateBillingInfo(req: Request, res: Response): Promise<any> {
    try {
        const { paymentMethod, billingAddress } = req.body;

        // Validate input data
        if (!paymentMethod || !billingAddress) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Payment method and billing address are required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const updatedBillingInfo = {
            plan: 'Pro',
            status: 'Active',
            nextBillingDate: '2025-04-15T00:00:00Z',
            paymentMethod,
            billingAddress
        };

        return res.status(200).json(updatedBillingInfo);
    } catch (err: any) {
        logger.error(`[AdminController] Error updating billing info: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update billing information' });
    }
}

/**
 * Get all invoices.
 */
export async function getInvoices(req: Request, res: Response): Promise<any> {
    try {
        // Mock data for now - would be replaced with actual service calls
        const invoices = [
            {
                id: 'inv_123',
                amount: 49.99,
                status: 'Paid',
                date: '2025-03-15T00:00:00Z',
                pdf: 'https://example.com/invoices/inv_123.pdf'
            },
            {
                id: 'inv_456',
                amount: 49.99,
                status: 'Paid',
                date: '2025-02-15T00:00:00Z',
                pdf: 'https://example.com/invoices/inv_456.pdf'
            }
        ];

        return res.status(200).json(invoices);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching invoices: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch invoices' });
    }
}

/**
 * Get invoice by ID.
 */
export async function getInvoiceById(req: Request, res: Response): Promise<any> {
    try {
        const invoiceId = req.params.invoiceId;

        // Validate parameters
        if (!invoiceId) {
            return res.status(400).json({ error: 'Invoice ID is required' });
        }

        // Mock data for now - would be replaced with actual service calls
        const invoice = {
            id: invoiceId,
            amount: 49.99,
            status: 'Paid',
            date: '2025-03-15T00:00:00Z',
            pdf: 'https://example.com/invoices/inv_123.pdf',
            items: [
                { description: 'Pro Plan - Monthly', amount: 49.99 }
            ],
            subtotal: 49.99,
            tax: 0,
            total: 49.99
        };

        return res.status(200).json(invoice);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching invoice: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch invoice' });
    }
}

// ==================== Limits ====================

/**
 * Get account limits.
 */
export async function getLimits(req: Request, res: Response): Promise<any> {
    try {
        // Mock data for now - would be replaced with actual service calls
        const limits = {
            apiRateLimit: 100,
            maxWorkspaces: 5,
            maxMembers: 10,
            maxStorage: 10 * 1024 * 1024 * 1024, // 10 GB
            currentUsage: {
                apiCalls: 42,
                workspaces: 2,
                members: 5,
                storage: 2.5 * 1024 * 1024 * 1024 // 2.5 GB
            }
        };

        return res.status(200).json(limits);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching limits: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch account limits' });
    }
}

/**
 * Update account limits.
 */
export async function updateLimits(req: Request, res: Response): Promise<any> {
    try {
        const { apiRateLimit, maxWorkspaces, maxMembers, maxStorage } = req.body;

        // Validate input data
        if (!apiRateLimit || !maxWorkspaces || !maxMembers || !maxStorage) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['All limit parameters are required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const updatedLimits = {
            apiRateLimit,
            maxWorkspaces,
            maxMembers,
            maxStorage,
            currentUsage: {
                apiCalls: 42,
                workspaces: 2,
                members: 5,
                storage: 2.5 * 1024 * 1024 * 1024 // 2.5 GB
            }
        };

        return res.status(200).json(updatedLimits);
    } catch (err: any) {
        logger.error(`[AdminController] Error updating limits: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update account limits' });
    }
}

// ==================== Privacy ====================

/**
 * Get privacy settings.
 */
export async function getPrivacySettings(req: Request, res: Response): Promise<any> {
    try {
        // Mock data for now - would be replaced with actual service calls
        const privacySettings = {
            dataRetention: {
                logs: 30, // days
                analytics: 90 // days
            },
            dataSharingConsent: true,
            marketingEmails: false,
            twoFactorAuth: true
        };

        return res.status(200).json(privacySettings);
    } catch (err: any) {
        logger.error(`[AdminController] Error fetching privacy settings: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch privacy settings' });
    }
}

/**
 * Update privacy settings.
 */
export async function updatePrivacySettings(req: Request, res: Response): Promise<any> {
    try {
        const { dataRetention, dataSharingConsent, marketingEmails, twoFactorAuth } = req.body;

        // Validate input data
        if (dataRetention === undefined || dataSharingConsent === undefined ||
            marketingEmails === undefined || twoFactorAuth === undefined) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['All privacy settings are required']
            });
        }

        // Mock data for now - would be replaced with actual service calls
        const updatedPrivacySettings = {
            dataRetention,
            dataSharingConsent,
            marketingEmails,
            twoFactorAuth
        };

        return res.status(200).json(updatedPrivacySettings);
    } catch (err: any) {
        logger.error(`[AdminController] Error updating privacy settings: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update privacy settings' });
    }
}
