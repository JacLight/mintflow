import freshbooksPlugin from '../src/index.js';

describe('Freshbooks Plugin', () => {
  it('should be defined', () => {
    expect(freshbooksPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(freshbooksPlugin.name).toBe('Freshbooks');
    expect(freshbooksPlugin.id).toBe('freshbooks');
    expect(freshbooksPlugin.runner).toBe('node');
    expect(freshbooksPlugin.type).toBe('node');
    expect(freshbooksPlugin.actions).toHaveLength(5);
    expect(freshbooksPlugin.triggers).toHaveLength(2);
  });

  it('should have the correct actions', () => {
    const actionNames = freshbooksPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
    expect(actionNames).toContain('get_client');
    expect(actionNames).toContain('create_invoice');
    expect(actionNames).toContain('get_expense');
    expect(actionNames).toContain('get_time_entry');
  });

  it('should have the correct triggers', () => {
    const triggerNames = freshbooksPlugin.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain('new_invoice');
    expect(triggerNames).toContain('new_expense');
  });

  it('should have the correct authentication schema', () => {
    expect(freshbooksPlugin.inputSchema.type).toBe('object');
    expect(freshbooksPlugin.inputSchema.properties).toHaveProperty('apiToken');
    expect(freshbooksPlugin.inputSchema.properties).toHaveProperty('accountId');
    expect(freshbooksPlugin.inputSchema.required).toContain('apiToken');
    expect(freshbooksPlugin.inputSchema.required).toContain('accountId');
  });

  it('should have the custom_api_call action with correct properties', () => {
    const customApiCallAction = freshbooksPlugin.actions.find(action => action.name === 'custom_api_call');
    expect(customApiCallAction).toBeDefined();
    expect(customApiCallAction?.displayName).toBe('Custom API Call');
    expect(customApiCallAction?.description).toContain('Make a custom API call');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('endpoint');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('method');
    expect(customApiCallAction?.inputSchema.required).toContain('endpoint');
    expect(customApiCallAction?.inputSchema.required).toContain('method');
  });

  it('should have the get_client action with correct properties', () => {
    const getClientAction = freshbooksPlugin.actions.find(action => action.name === 'get_client');
    expect(getClientAction).toBeDefined();
    expect(getClientAction?.displayName).toBe('Get Client');
    expect(getClientAction?.description).toContain('Retrieve a client');
    expect(getClientAction?.inputSchema.properties).toHaveProperty('clientId');
    expect(getClientAction?.inputSchema.required).toContain('clientId');
  });

  it('should have the create_invoice action with correct properties', () => {
    const createInvoiceAction = freshbooksPlugin.actions.find(action => action.name === 'create_invoice');
    expect(createInvoiceAction).toBeDefined();
    expect(createInvoiceAction?.displayName).toBe('Create Invoice');
    expect(createInvoiceAction?.description).toContain('Create a new invoice');
    expect(createInvoiceAction?.inputSchema.properties).toHaveProperty('clientId');
    expect(createInvoiceAction?.inputSchema.properties).toHaveProperty('lineItems');
    expect(createInvoiceAction?.inputSchema.required).toContain('clientId');
    expect(createInvoiceAction?.inputSchema.required).toContain('lineItems');
  });

  it('should have the get_expense action with correct properties', () => {
    const getExpenseAction = freshbooksPlugin.actions.find(action => action.name === 'get_expense');
    expect(getExpenseAction).toBeDefined();
    expect(getExpenseAction?.displayName).toBe('Get Expense');
    expect(getExpenseAction?.description).toContain('Retrieve an expense');
    expect(getExpenseAction?.inputSchema.properties).toHaveProperty('expenseId');
    expect(getExpenseAction?.inputSchema.required).toContain('expenseId');
  });

  it('should have the get_time_entry action with correct properties', () => {
    const getTimeEntryAction = freshbooksPlugin.actions.find(action => action.name === 'get_time_entry');
    expect(getTimeEntryAction).toBeDefined();
    expect(getTimeEntryAction?.displayName).toBe('Get Time Entry');
    expect(getTimeEntryAction?.description).toContain('Retrieve a time entry');
    expect(getTimeEntryAction?.inputSchema.properties).toHaveProperty('timeEntryId');
    expect(getTimeEntryAction?.inputSchema.required).toContain('timeEntryId');
  });

  it('should have the new_invoice trigger with correct properties', () => {
    const newInvoiceTrigger = freshbooksPlugin.triggers.find(trigger => trigger.name === 'new_invoice');
    expect(newInvoiceTrigger).toBeDefined();
    expect(newInvoiceTrigger?.displayName).toBe('New Invoice');
    expect(newInvoiceTrigger?.description).toContain('Triggers when a new invoice is created');
    expect(newInvoiceTrigger?.type).toBe('polling');
    expect(newInvoiceTrigger?.sampleData).toHaveProperty('invoice');
  });

  it('should have the new_expense trigger with correct properties', () => {
    const newExpenseTrigger = freshbooksPlugin.triggers.find(trigger => trigger.name === 'new_expense');
    expect(newExpenseTrigger).toBeDefined();
    expect(newExpenseTrigger?.displayName).toBe('New Expense');
    expect(newExpenseTrigger?.description).toContain('Triggers when a new expense is created');
    expect(newExpenseTrigger?.type).toBe('polling');
    expect(newExpenseTrigger?.sampleData).toHaveProperty('expense');
  });
});
