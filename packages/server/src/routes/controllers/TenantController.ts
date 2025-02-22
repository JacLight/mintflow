import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { TenantService } from '../../services/TenantService.js';
import { TenantValidator } from '../../models/validators/TenantValidator.js';

const tenantService = new TenantService();

/**
 * Create a new tenant.
 */
export async function createTenant(req: Request, res: Response): Promise<any> {
    try {
        const { error } = TenantValidator.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const tenant = await tenantService.createTenant(req.body);
        return res.status(201).json(tenant);
    } catch (err: any) {
        logger.error(`[TenantController] Error creating tenant: ${err.message}`);
        return res.status(500).json({ error: 'Failed to create tenant' });
    }
}

/**
 * Get all tenants.
 */
export async function getAllTenants(req: Request, res: Response): Promise<any> {
    try {
        const tenants = await tenantService.getAllTenants();
        return res.status(200).json(tenants);
    } catch (err: any) {
        logger.error(`[TenantController] Error fetching tenants: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch tenants' });
    }
}

/**
 * Get a single tenant by ID.
 */
export async function getTenantById(req: Request, res: Response): Promise<any> {
    try {
        const tenant = await tenantService.getTenantById(req.params.tenantId);
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        return res.status(200).json(tenant);
    } catch (err: any) {
        logger.error(`[TenantController] Error fetching tenant: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch tenant' });
    }
}

/**
 * Update a tenant.
 */
export async function updateTenant(req: Request, res: Response): Promise<any> {
    try {
        const { error } = TenantValidator.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const updatedTenant = await tenantService.updateTenant(req.params.tenantId, req.body);
        if (!updatedTenant) return res.status(404).json({ error: 'Tenant not found' });

        return res.status(200).json(updatedTenant);
    } catch (err: any) {
        logger.error(`[TenantController] Error updating tenant: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update tenant' });
    }
}

/**
 * Delete a tenant.
 */
export async function deleteTenant(req: Request, res: Response): Promise<any> {
    try {
        const deletedTenant = await tenantService.deleteTenant(req.params.tenantId);
        if (!deletedTenant) return res.status(404).json({ error: 'Tenant not found' });

        return res.status(200).json({ message: 'Tenant deleted successfully' });
    } catch (err: any) {
        logger.error(`[TenantController] Error deleting tenant: ${err.message}`);
        return res.status(500).json({ error: 'Failed to delete tenant' });
    }
}
