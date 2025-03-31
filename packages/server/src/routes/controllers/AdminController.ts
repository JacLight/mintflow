import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { AdminService } from '../../services/AdminService.js';
import { ProfileService } from '../../services/ProfileService.js';
import { MemberService } from '../../services/MemberService.js';
import { WorkspaceService } from '../../services/WorkspaceService.js';
import { LimitsService } from '../../services/LimitsService.js';
import { PrivacyService } from '../../services/PrivacyService.js';
import { BillingService } from '../../services/BillingService.js';

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
        // Get user ID from request (in a real app, this would come from auth middleware)
        const userId = req.query.userId as string || 'user_123';

        try {
            // Get profile from service
            const profileService = ProfileService.getInstance();
            const profile = await profileService.getProfileByUserId(userId);
            return res.status(200).json(profile);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Profile not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get user ID from request (in a real app, this would come from auth middleware)
        const userId = req.query.userId as string || 'user_123';

        // Validate input data
        if (!name || !email) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Name and email are required']
            });
        }

        try {
            // Update profile using service
            const profileService = ProfileService.getInstance();
            const updatedProfile = await profileService.updateProfile(userId, {
                name,
                email,
                avatar,
                preferences
            });

            return res.status(200).json(updatedProfile);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Profile not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        try {
            // Get members from service
            const memberService = MemberService.getInstance();
            const members = await memberService.getAllMembers(tenantId);
            return res.status(200).json(members);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!memberId) {
            return res.status(400).json({ error: 'Member ID is required' });
        }

        try {
            // Get member from service
            const memberService = MemberService.getInstance();
            const member = await memberService.getMemberById(memberId, tenantId);
            return res.status(200).json(member);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Member not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate input data
        if (!email || !role) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Email and role are required']
            });
        }

        try {
            // Invite member using service
            const memberService = MemberService.getInstance();
            const newMember = await memberService.inviteMember({
                name: email.split('@')[0], // Default name from email
                email,
                role,
                workspaces,
                tenantId
            });

            return res.status(201).json(newMember);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Member with email')) {
                return res.status(400).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

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

        try {
            // Update member using service
            const memberService = MemberService.getInstance();
            const updatedMember = await memberService.updateMember(memberId, {
                name,
                email,
                role,
                status,
                workspaces
            }, tenantId);

            return res.status(200).json(updatedMember);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Member not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!memberId) {
            return res.status(400).json({ error: 'Member ID is required' });
        }

        try {
            // Remove member using service
            const memberService = MemberService.getInstance();
            await memberService.removeMember(memberId, tenantId);
            return res.status(204).send();
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Member not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        try {
            // Get workspaces from service
            const workspaceService = WorkspaceService.getInstance();
            const workspaces = await workspaceService.getAllWorkspaces(tenantId);
            return res.status(200).json(workspaces);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!workspaceId) {
            return res.status(400).json({ error: 'Workspace ID is required' });
        }

        try {
            // Get workspace from service
            const workspaceService = WorkspaceService.getInstance();
            const workspace = await workspaceService.getWorkspaceById(workspaceId, tenantId);
            return res.status(200).json(workspace);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Workspace not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        const { name, description, members } = req.body;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate input data
        if (!name) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Name is required']
            });
        }

        try {
            // Create workspace using service
            const workspaceService = WorkspaceService.getInstance();
            const newWorkspace = await workspaceService.createWorkspace({
                name,
                description,
                members,
                tenantId
            });

            return res.status(201).json(newWorkspace);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        const { name, description, members } = req.body;
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

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

        try {
            // Update workspace using service
            const workspaceService = WorkspaceService.getInstance();
            const updatedWorkspace = await workspaceService.updateWorkspace(workspaceId, {
                name,
                description,
                members
            }, tenantId);

            return res.status(200).json(updatedWorkspace);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Workspace not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!workspaceId) {
            return res.status(400).json({ error: 'Workspace ID is required' });
        }

        try {
            // Delete workspace using service
            const workspaceService = WorkspaceService.getInstance();
            await workspaceService.deleteWorkspace(workspaceId, tenantId);
            return res.status(204).send();
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Workspace not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        try {
            // Get billing info from service
            const billingService = BillingService.getInstance();
            const billingInfo = await billingService.getBillingInfo(tenantId);
            return res.status(200).json(billingInfo);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Billing information not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate input data
        if (!paymentMethod || !billingAddress) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['Payment method and billing address are required']
            });
        }

        try {
            // Update billing info using service
            const billingService = BillingService.getInstance();
            const updatedBillingInfo = await billingService.updateBillingInfo(tenantId, {
                paymentMethod,
                billingAddress
            });

            return res.status(200).json(updatedBillingInfo);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Billing information not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        try {
            // Get invoices from service
            const billingService = BillingService.getInstance();
            const invoices = await billingService.getInvoices(tenantId);
            return res.status(200).json(invoices);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate parameters
        if (!invoiceId) {
            return res.status(400).json({ error: 'Invoice ID is required' });
        }

        try {
            // Get invoice from service
            const billingService = BillingService.getInstance();
            const invoice = await billingService.getInvoiceById(invoiceId, tenantId);
            return res.status(200).json(invoice);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            if (serviceErr.message && serviceErr.message.includes('Invoice not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        try {
            // Get limits from service
            const limitsService = LimitsService.getInstance();
            const limits = await limitsService.getLimits(tenantId);
            return res.status(200).json(limits);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate input data
        if (!apiRateLimit || !maxWorkspaces || !maxMembers || !maxStorage) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['All limit parameters are required']
            });
        }

        try {
            // Update limits using service
            const limitsService = LimitsService.getInstance();
            const updatedLimits = await limitsService.updateLimits(tenantId, {
                apiRateLimit,
                maxWorkspaces,
                maxMembers,
                maxStorage
            });

            return res.status(200).json(updatedLimits);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        try {
            // Get privacy settings from service
            const privacyService = PrivacyService.getInstance();
            const privacySettings = await privacyService.getPrivacySettings(tenantId);
            return res.status(200).json(privacySettings);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
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
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        // Validate input data
        if (dataRetention === undefined || dataSharingConsent === undefined ||
            marketingEmails === undefined || twoFactorAuth === undefined) {
            return res.status(400).json({
                error: 'Validation error',
                details: ['All privacy settings are required']
            });
        }

        try {
            // Update privacy settings using service
            const privacyService = PrivacyService.getInstance();
            const updatedSettings = await privacyService.updatePrivacySettings(tenantId, {
                dataRetention,
                dataSharingConsent,
                marketingEmails,
                twoFactorAuth
            });

            return res.status(200).json(updatedSettings);
        } catch (serviceErr: any) {
            // Check for specific error types
            if (serviceErr.message && serviceErr.message.includes('Tenant not found')) {
                return res.status(404).json({ error: serviceErr.message });
            }
            throw serviceErr;
        }
    } catch (err: any) {
        logger.error(`[AdminController] Error updating privacy settings: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update privacy settings' });
    }
}
