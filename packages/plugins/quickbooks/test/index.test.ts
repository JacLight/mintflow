import quickbooksPlugin from '../src/index.js';

describe('QuickBooks Plugin', () => {
  it('should be defined', () => {
    expect(quickbooksPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(quickbooksPlugin.name).toBe('QuickBooks');
    expect(quickbooksPlugin.id).toBe('quickbooks');
    expect(quickbooksPlugin.runner).toBe('node');
    expect(quickbooksPlugin.type).toBe('node');
    expect(quickbooksPlugin.actions).toHaveLength(4);
    expect(quickbooksPlugin.triggers).toHaveLength(1);
  });

  it('should have the correct actions', () => {
    const actionNames = quickbooksPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
    expect(actionNames).toContain('get_customer');
    expect(actionNames).toContain('create_invoice');
    expect(actionNames).toContain('get_profit_loss_report');
  });

  it('should have the correct triggers', () => {
    const triggerNames = quickbooksPlugin.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain('new_invoice');
  });

  it('should have the correct authentication schema', () => {
    expect(quickbooksPlugin.inputSchema.type).toBe('object');
    expect(quickbooksPlugin.inputSchema.properties).toHaveProperty('clientId');
    expect(quickbooksPlugin.inputSchema.properties).toHaveProperty('clientSecret');
    expect(quickbooksPlugin.inputSchema.properties).toHaveProperty('refreshToken');
    expect(quickbooksPlugin.inputSchema.properties).toHaveProperty('realmId');
    expect(quickbooksPlugin.inputSchema.properties).toHaveProperty('environment');
    expect(quickbooksPlugin.inputSchema.required).toContain('clientId');
    expect(quickbooksPlugin.inputSchema.required).toContain('clientSecret');
    expect(quickbooksPlugin.inputSchema.required).toContain('refreshToken');
    expect(quickbooksPlugin.inputSchema.required).toContain('realmId');
  });

  it('should have the custom_api_call action with correct properties', () => {
    const customApiCallAction = quickbooksPlugin.actions.find(action => action.name === 'custom_api_call');
    expect(customApiCallAction).toBeDefined();
    expect(customApiCallAction?.displayName).toBe('Custom API Call');
    expect(customApiCallAction?.description).toContain('Make a custom API call');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('endpoint');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('method');
    expect(customApiCallAction?.inputSchema.required).toContain('endpoint');
    expect(customApiCallAction?.inputSchema.required).toContain('method');
  });

  it('should have the get_customer action with correct properties', () => {
    const getCustomerAction = quickbooksPlugin.actions.find(action => action.name === 'get_customer');
    expect(getCustomerAction).toBeDefined();
    expect(getCustomerAction?.displayName).toBe('Get Customer');
    expect(getCustomerAction?.description).toContain('Retrieve a customer');
    expect(getCustomerAction?.inputSchema.properties).toHaveProperty('customerId');
    expect(getCustomerAction?.inputSchema.properties).toHaveProperty('includeDetails');
    expect(getCustomerAction?.inputSchema.required).toContain('customerId');
  });

  it('should have the create_invoice action with correct properties', () => {
    const createInvoiceAction = quickbooksPlugin.actions.find(action => action.name === 'create_invoice');
    expect(createInvoiceAction).toBeDefined();
    expect(createInvoiceAction?.displayName).toBe('Create Invoice');
    expect(createInvoiceAction?.description).toContain('Create a new invoice');
    expect(createInvoiceAction?.inputSchema.properties).toHaveProperty('customerId');
    expect(createInvoiceAction?.inputSchema.properties).toHaveProperty('lineItems');
    expect(createInvoiceAction?.inputSchema.required).toContain('customerId');
    expect(createInvoiceAction?.inputSchema.required).toContain('lineItems');
  });

  it('should have the get_profit_loss_report action with correct properties', () => {
    const getProfitLossReportAction = quickbooksPlugin.actions.find(action => action.name === 'get_profit_loss_report');
    expect(getProfitLossReportAction).toBeDefined();
    expect(getProfitLossReportAction?.displayName).toBe('Get Profit and Loss Report');
    expect(getProfitLossReportAction?.description).toContain('Generate a profit and loss report');
    expect(getProfitLossReportAction?.inputSchema.properties).toHaveProperty('startDate');
    expect(getProfitLossReportAction?.inputSchema.properties).toHaveProperty('endDate');
    expect(getProfitLossReportAction?.inputSchema.required).toContain('startDate');
    expect(getProfitLossReportAction?.inputSchema.required).toContain('endDate');
  });

  it('should have the new_invoice trigger with correct properties', () => {
    const newInvoiceTrigger = quickbooksPlugin.triggers.find(trigger => trigger.name === 'new_invoice');
    expect(newInvoiceTrigger).toBeDefined();
    expect(newInvoiceTrigger?.displayName).toBe('New Invoice');
    expect(newInvoiceTrigger?.description).toContain('Triggers when a new invoice is created');
    expect(newInvoiceTrigger?.type).toBe('webhook');
    expect(newInvoiceTrigger?.sampleData).toHaveProperty('invoice');
  });
});
