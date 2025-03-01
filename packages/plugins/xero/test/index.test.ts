import xeroPlugin from '../src/index.js';

describe('Xero Plugin', () => {
  it('should be defined', () => {
    expect(xeroPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(xeroPlugin.name).toBe('Xero');
    expect(xeroPlugin.id).toBe('xero');
    expect(xeroPlugin.runner).toBe('node');
    expect(xeroPlugin.type).toBe('node');
    expect(xeroPlugin.actions).toHaveLength(4);
    expect(xeroPlugin.triggers).toHaveLength(1);
  });

  it('should have the correct actions', () => {
    const actionNames = xeroPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
    expect(actionNames).toContain('get_contact');
    expect(actionNames).toContain('create_invoice');
    expect(actionNames).toContain('get_profit_loss_report');
  });

  it('should have the correct triggers', () => {
    const triggerNames = xeroPlugin.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain('new_invoice');
  });

  it('should have the correct authentication schema', () => {
    expect(xeroPlugin.inputSchema.type).toBe('object');
    expect(xeroPlugin.inputSchema.properties).toHaveProperty('clientId');
    expect(xeroPlugin.inputSchema.properties).toHaveProperty('clientSecret');
    expect(xeroPlugin.inputSchema.properties).toHaveProperty('refreshToken');
    expect(xeroPlugin.inputSchema.properties).toHaveProperty('tenantId');
    expect(xeroPlugin.inputSchema.required).toContain('clientId');
    expect(xeroPlugin.inputSchema.required).toContain('clientSecret');
    expect(xeroPlugin.inputSchema.required).toContain('refreshToken');
    expect(xeroPlugin.inputSchema.required).toContain('tenantId');
  });

  it('should have the custom_api_call action with correct properties', () => {
    const customApiCallAction = xeroPlugin.actions.find(action => action.name === 'custom_api_call');
    expect(customApiCallAction).toBeDefined();
    expect(customApiCallAction?.displayName).toBe('Custom API Call');
    expect(customApiCallAction?.description).toContain('Make a custom API call');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('endpoint');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('method');
    expect(customApiCallAction?.inputSchema.required).toContain('endpoint');
    expect(customApiCallAction?.inputSchema.required).toContain('method');
  });

  it('should have the get_contact action with correct properties', () => {
    const getContactAction = xeroPlugin.actions.find(action => action.name === 'get_contact');
    expect(getContactAction).toBeDefined();
    expect(getContactAction?.displayName).toBe('Get Contact');
    expect(getContactAction?.description).toContain('Retrieve a contact');
    expect(getContactAction?.inputSchema.properties).toHaveProperty('contactId');
    expect(getContactAction?.inputSchema.required).toContain('contactId');
  });

  it('should have the create_invoice action with correct properties', () => {
    const createInvoiceAction = xeroPlugin.actions.find(action => action.name === 'create_invoice');
    expect(createInvoiceAction).toBeDefined();
    expect(createInvoiceAction?.displayName).toBe('Create Invoice');
    expect(createInvoiceAction?.description).toContain('Create a new invoice');
    expect(createInvoiceAction?.inputSchema.properties).toHaveProperty('contactId');
    expect(createInvoiceAction?.inputSchema.properties).toHaveProperty('lineItems');
    expect(createInvoiceAction?.inputSchema.required).toContain('contactId');
    expect(createInvoiceAction?.inputSchema.required).toContain('lineItems');
  });

  it('should have the get_profit_loss_report action with correct properties', () => {
    const getProfitLossReportAction = xeroPlugin.actions.find(action => action.name === 'get_profit_loss_report');
    expect(getProfitLossReportAction).toBeDefined();
    expect(getProfitLossReportAction?.displayName).toBe('Get Profit and Loss Report');
    expect(getProfitLossReportAction?.description).toContain('Generate a profit and loss report');
    expect(getProfitLossReportAction?.inputSchema.properties).toHaveProperty('fromDate');
    expect(getProfitLossReportAction?.inputSchema.properties).toHaveProperty('toDate');
    expect(getProfitLossReportAction?.inputSchema.required).toContain('fromDate');
    expect(getProfitLossReportAction?.inputSchema.required).toContain('toDate');
  });

  it('should have the new_invoice trigger with correct properties', () => {
    const newInvoiceTrigger = xeroPlugin.triggers.find(trigger => trigger.name === 'new_invoice');
    expect(newInvoiceTrigger).toBeDefined();
    expect(newInvoiceTrigger?.displayName).toBe('New Invoice');
    expect(newInvoiceTrigger?.description).toContain('Triggers when a new invoice is created');
    expect(newInvoiceTrigger?.type).toBe('polling');
    expect(newInvoiceTrigger?.sampleData).toHaveProperty('invoice');
  });
});
