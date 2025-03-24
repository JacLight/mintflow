import invoiceninjaPlugin from '../src/index.js';

describe('InvoiceNinja Plugin', () => {
  it('should be defined', () => {
    expect(invoiceninjaPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(invoiceninjaPlugin.name).toBe('InvoiceNinja');
    expect(invoiceninjaPlugin.id).toBe('invoiceninja');
    expect(invoiceninjaPlugin.runner).toBe('node');
    expect(invoiceninjaPlugin.type).toBe('node');
    expect(invoiceninjaPlugin.actions).toHaveLength(4);
    expect(invoiceninjaPlugin.triggers).toHaveLength(2);
  });

  it('should have the correct actions', () => {
    const actionNames = invoiceninjaPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
    expect(actionNames).toContain('get_client');
    expect(actionNames).toContain('create_invoice');
    expect(actionNames).toContain('get_payment');
  });

  it('should have the correct triggers', () => {
    const triggerNames = invoiceninjaPlugin.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain('new_invoice');
    expect(triggerNames).toContain('new_payment');
  });

  it('should have the correct authentication schema', () => {
    expect(invoiceninjaPlugin.inputSchema.type).toBe('object');
    expect(invoiceninjaPlugin.inputSchema.properties).toHaveProperty('apiToken');
    expect(invoiceninjaPlugin.inputSchema.properties).toHaveProperty('baseUrl');
    expect(invoiceninjaPlugin.inputSchema.required).toContain('apiToken');
    expect(invoiceninjaPlugin.inputSchema.required).toContain('baseUrl');
  });

  it('should have the custom_api_call action with correct properties', () => {
    const customApiCallAction = invoiceninjaPlugin.actions.find(action => action.name === 'custom_api_call');
    expect(customApiCallAction).toBeDefined();
    expect(customApiCallAction?.displayName).toBe('Custom API Call');
    expect(customApiCallAction?.description).toContain('Make a custom API call');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('endpoint');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('method');
    expect(customApiCallAction?.inputSchema.required).toContain('endpoint');
    expect(customApiCallAction?.inputSchema.required).toContain('method');
  });

  it('should have the get_client action with correct properties', () => {
    const getClientAction = invoiceninjaPlugin.actions.find(action => action.name === 'get_client');
    expect(getClientAction).toBeDefined();
    expect(getClientAction?.displayName).toBe('Get Client');
    expect(getClientAction?.description).toContain('Retrieve a client');
    expect(getClientAction?.inputSchema.properties).toHaveProperty('clientId');
    expect(getClientAction?.inputSchema.properties).toHaveProperty('includeContacts');
    expect(getClientAction?.inputSchema.required).toContain('clientId');
  });

  it('should have the create_invoice action with correct properties', () => {
    const createInvoiceAction = invoiceninjaPlugin.actions.find(action => action.name === 'create_invoice');
    expect(createInvoiceAction).toBeDefined();
    expect(createInvoiceAction?.displayName).toBe('Create Invoice');
    expect(createInvoiceAction?.description).toContain('Create a new invoice');
    expect(createInvoiceAction?.inputSchema.properties).toHaveProperty('clientId');
    expect(createInvoiceAction?.inputSchema.properties).toHaveProperty('lineItems');
    expect(createInvoiceAction?.inputSchema.required).toContain('clientId');
    expect(createInvoiceAction?.inputSchema.required).toContain('lineItems');
  });

  it('should have the get_payment action with correct properties', () => {
    const getPaymentAction = invoiceninjaPlugin.actions.find(action => action.name === 'get_payment');
    expect(getPaymentAction).toBeDefined();
    expect(getPaymentAction?.displayName).toBe('Get Payment');
    expect(getPaymentAction?.description).toContain('Retrieve a payment');
    expect(getPaymentAction?.inputSchema.properties).toHaveProperty('paymentId');
    expect(getPaymentAction?.inputSchema.properties).toHaveProperty('includeInvoices');
    expect(getPaymentAction?.inputSchema.required).toContain('paymentId');
  });

  it('should have the new_invoice trigger with correct properties', () => {
    const newInvoiceTrigger = invoiceninjaPlugin.triggers.find(trigger => trigger.name === 'new_invoice');
    expect(newInvoiceTrigger).toBeDefined();
    expect(newInvoiceTrigger?.displayName).toBe('New Invoice');
    expect(newInvoiceTrigger?.description).toContain('Triggers when a new invoice is created');
    expect(newInvoiceTrigger?.type).toBe('polling');
    expect(newInvoiceTrigger?.sampleData).toHaveProperty('invoice');
  });

  it('should have the new_payment trigger with correct properties', () => {
    const newPaymentTrigger = invoiceninjaPlugin.triggers.find(trigger => trigger.name === 'new_payment');
    expect(newPaymentTrigger).toBeDefined();
    expect(newPaymentTrigger?.displayName).toBe('New Payment');
    expect(newPaymentTrigger?.description).toContain('Triggers when a new payment is created');
    expect(newPaymentTrigger?.type).toBe('polling');
    expect(newPaymentTrigger?.sampleData).toHaveProperty('payment');
  });
});
