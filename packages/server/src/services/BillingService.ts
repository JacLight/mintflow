import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js';

// Table names for different billing resources
const BILLING_TABLE = 'billing';
const INVOICE_TABLE = 'invoice';

export class BillingService {
    private db = DatabaseService.getInstance();
    private static instance: BillingService;
    private tenantService: TenantService;

    private constructor() {
        this.tenantService = new TenantService();
        this.initializeDefaultData();
    }

    static getInstance(): BillingService {
        if (!BillingService.instance) {
            BillingService.instance = new BillingService();
        }
        return BillingService.instance;
    }

    /**
     * Initialize default billing data for testing purposes.
     * In a production environment, this would be replaced with actual data.
     */
    private async initializeDefaultData() {
        try {
            // Check if we already have billing data
            const existingBilling = await this.db.find(BILLING_TABLE);
            if (existingBilling && existingBilling.length > 0) {
                return; // Data already exists
            }

            // Create default billing info
            const defaultBilling = {
                tenantId: 'default_tenant',
                plan: 'Pro Plan',
                status: 'active',
                nextBillingDate: new Date('2025-04-15T00:00:00Z'),
                paymentMethod: {
                    type: 'card',
                    last4: '4242',
                    expiryMonth: 12,
                    expiryYear: 2026,
                    brand: 'Visa'
                },
                billingAddress: {
                    name: 'Jacob Ajiboye',
                    line1: '123 Main St',
                    line2: 'Suite 100',
                    city: 'San Francisco',
                    state: 'CA',
                    postalCode: '94105',
                    country: 'US'
                }
            };

            await this.db.create(BILLING_TABLE, defaultBilling);
            logger.info('[BillingService] Default billing info created');

            // Create default invoices
            const defaultInvoices = [
                {
                    tenantId: 'default_tenant',
                    amount: 49.99,
                    status: 'paid',
                    date: new Date('2025-03-15T00:00:00Z'),
                    pdf: 'https://example.com/invoices/INV-001-2025.pdf',
                    items: [
                        { description: 'Pro Plan - Monthly', amount: 49.99 }
                    ],
                    subtotal: 49.99,
                    tax: 0,
                    total: 49.99
                },
                {
                    tenantId: 'default_tenant',
                    amount: 49.99,
                    status: 'paid',
                    date: new Date('2025-02-15T00:00:00Z'),
                    pdf: 'https://example.com/invoices/INV-002-2025.pdf',
                    items: [
                        { description: 'Pro Plan - Monthly', amount: 49.99 }
                    ],
                    subtotal: 49.99,
                    tax: 0,
                    total: 49.99
                },
                {
                    tenantId: 'default_tenant',
                    amount: 49.99,
                    status: 'paid',
                    date: new Date('2025-01-15T00:00:00Z'),
                    pdf: 'https://example.com/invoices/INV-003-2025.pdf',
                    items: [
                        { description: 'Pro Plan - Monthly', amount: 49.99 }
                    ],
                    subtotal: 49.99,
                    tax: 0,
                    total: 49.99
                },
                {
                    tenantId: 'default_tenant',
                    amount: 10.00,
                    status: 'credited',
                    date: new Date('2025-03-10T00:00:00Z'),
                    pdf: 'https://example.com/invoices/CRD-001-2025.pdf',
                    items: [
                        { description: 'Service Credit', amount: 10.00 }
                    ],
                    subtotal: 10.00,
                    tax: 0,
                    total: 10.00
                }
            ];

            for (const invoice of defaultInvoices) {
                await this.db.create(INVOICE_TABLE, invoice);
            }
            logger.info('[BillingService] Default invoices created');
        } catch (error) {
            logger.error(`[BillingService] Error initializing default data: ${(error as any).message}`);
        }
    }

    /**
     * Get billing information for a tenant.
     */
    async getBillingInfo(tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get billing info
            const billingInfo = await this.db.findOne(BILLING_TABLE, { tenantId });
            if (!billingInfo) {
                throw new Error(`Billing information not found for tenant: ${tenantId}`);
            }

            return billingInfo;
        } catch (error) {
            logger.error(`[BillingService] Error fetching billing info: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update billing information for a tenant.
     */
    async updateBillingInfo(tenantId: string, data: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get existing billing info
            const existingBilling = await this.db.findOne(BILLING_TABLE, { tenantId });
            if (!existingBilling) {
                throw new Error(`Billing information not found for tenant: ${tenantId}`);
            }

            // Update billing info
            const result = await this.db.update(
                BILLING_TABLE,
                { billingId: existingBilling.billingId },
                { ...data, updatedAt: new Date() },
                undefined
            );

            if (!result) {
                throw new Error(`Failed to update billing information for tenant: ${tenantId}`);
            }

            // Get updated billing info
            return await this.db.findOne(BILLING_TABLE, { billingId: existingBilling.billingId });
        } catch (error) {
            logger.error(`[BillingService] Error updating billing info: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Get all invoices for a tenant.
     */
    async getInvoices(tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get invoices
            const invoices = await this.db.find(INVOICE_TABLE, { tenantId });
            return invoices;
        } catch (error) {
            logger.error(`[BillingService] Error fetching invoices: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Get invoice by ID.
     */
    async getInvoiceById(invoiceId: string, tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Get invoice
            const invoice = await this.db.findOne(INVOICE_TABLE, { invoiceId, tenantId });
            if (!invoice) {
                throw new Error(`Invoice not found: ${invoiceId}`);
            }

            return invoice;
        } catch (error) {
            logger.error(`[BillingService] Error fetching invoice: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Create a new invoice.
     */
    async createInvoice(data: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(data.tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${data.tenantId}`);
            }

            // Create invoice
            const invoice = await this.db.create(INVOICE_TABLE, data);
            logger.info(`[BillingService] Invoice created: ${invoice.invoiceId}`);
            return invoice;
        } catch (error) {
            logger.error(`[BillingService] Error creating invoice: ${(error as any).message}`);
            throw error;
        }
    }
}
