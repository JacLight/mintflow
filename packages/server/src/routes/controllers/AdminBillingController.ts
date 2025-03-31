import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { BillingService } from '../../services/BillingService.js';

// Get instance of BillingService
const billingService = BillingService.getInstance();

/**
 * Get billing information.
 */
export async function getBillingInfo(req: Request, res: Response): Promise<any> {
    try {
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        try {
            // Get billing info from service
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
        logger.error(`[AdminBillingController] Error fetching billing info: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch billing information' });
    }
}

/**
 * Update billing information.
 */
export async function updateBillingInfo(req: Request, res: Response): Promise<any> {
    try {
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';
        const { paymentMethod, billingAddress } = req.body;

        // Validate request body
        if (!paymentMethod || !billingAddress) {
            return res.status(400).json({ error: 'Payment method and billing address are required' });
        }

        try {
            // Update billing info
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
        logger.error(`[AdminBillingController] Error updating billing info: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update billing information' });
    }
}

/**
 * Get invoices.
 */
export async function getInvoices(req: Request, res: Response): Promise<any> {
    try {
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';

        try {
            // Get invoices from service
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
        logger.error(`[AdminBillingController] Error fetching invoices: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch invoices' });
    }
}

/**
 * Get invoice by ID.
 */
export async function getInvoiceById(req: Request, res: Response): Promise<any> {
    try {
        // Get tenant ID from request (in a real app, this would come from auth middleware)
        const tenantId = req.query.tenantId as string || 'default_tenant';
        const invoiceId = req.params.invoiceId;

        // Validate invoice ID
        if (!invoiceId) {
            return res.status(400).json({ error: 'Invoice ID is required' });
        }

        try {
            // Get invoice from service
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
        logger.error(`[AdminBillingController] Error fetching invoice: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch invoice' });
    }
}
