import freshdeskPlugin from '../src/index.js';

describe('Freshdesk Plugin', () => {
  it('should be defined', () => {
    expect(freshdeskPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(freshdeskPlugin.name).toBe('Freshdesk');
    expect(freshdeskPlugin.id).toBe('freshdesk');
    expect(freshdeskPlugin.runner).toBe('node');
    expect(freshdeskPlugin.type).toBe('node');
    expect(freshdeskPlugin.actions).toHaveLength(4);
    expect(freshdeskPlugin.triggers).toHaveLength(2);
  });

  it('should have the correct actions', () => {
    const actionNames = freshdeskPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
    expect(actionNames).toContain('get_ticket');
    expect(actionNames).toContain('create_ticket');
    expect(actionNames).toContain('get_contact');
  });

  it('should have the correct triggers', () => {
    const triggerNames = freshdeskPlugin.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain('new_ticket');
    expect(triggerNames).toContain('updated_ticket');
  });

  it('should have the correct authentication schema', () => {
    expect(freshdeskPlugin.inputSchema.type).toBe('object');
    expect(freshdeskPlugin.inputSchema.properties).toHaveProperty('apiKey');
    expect(freshdeskPlugin.inputSchema.properties).toHaveProperty('domain');
    expect(freshdeskPlugin.inputSchema.required).toContain('apiKey');
    expect(freshdeskPlugin.inputSchema.required).toContain('domain');
  });

  it('should have the custom_api_call action with correct properties', () => {
    const customApiCallAction = freshdeskPlugin.actions.find(action => action.name === 'custom_api_call');
    expect(customApiCallAction).toBeDefined();
    expect(customApiCallAction?.displayName).toBe('Custom API Call');
    expect(customApiCallAction?.description).toContain('Make a custom API call');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('endpoint');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('method');
    expect(customApiCallAction?.inputSchema.required).toContain('endpoint');
    expect(customApiCallAction?.inputSchema.required).toContain('method');
  });

  it('should have the get_ticket action with correct properties', () => {
    const getTicketAction = freshdeskPlugin.actions.find(action => action.name === 'get_ticket');
    expect(getTicketAction).toBeDefined();
    expect(getTicketAction?.displayName).toBe('Get Ticket');
    expect(getTicketAction?.description).toContain('Retrieve a ticket');
    expect(getTicketAction?.inputSchema.properties).toHaveProperty('ticketId');
    expect(getTicketAction?.inputSchema.required).toContain('ticketId');
  });

  it('should have the create_ticket action with correct properties', () => {
    const createTicketAction = freshdeskPlugin.actions.find(action => action.name === 'create_ticket');
    expect(createTicketAction).toBeDefined();
    expect(createTicketAction?.displayName).toBe('Create Ticket');
    expect(createTicketAction?.description).toContain('Create a new ticket');
    expect(createTicketAction?.inputSchema.properties).toHaveProperty('subject');
    expect(createTicketAction?.inputSchema.properties).toHaveProperty('description');
    expect(createTicketAction?.inputSchema.properties).toHaveProperty('email');
    expect(createTicketAction?.inputSchema.required).toContain('subject');
    expect(createTicketAction?.inputSchema.required).toContain('description');
    expect(createTicketAction?.inputSchema.required).toContain('email');
  });

  it('should have the get_contact action with correct properties', () => {
    const getContactAction = freshdeskPlugin.actions.find(action => action.name === 'get_contact');
    expect(getContactAction).toBeDefined();
    expect(getContactAction?.displayName).toBe('Get Contact');
    expect(getContactAction?.description).toContain('Retrieve a contact');
    expect(getContactAction?.inputSchema.properties).toHaveProperty('contactId');
    expect(getContactAction?.inputSchema.required).toContain('contactId');
  });

  it('should have the new_ticket trigger with correct properties', () => {
    const newTicketTrigger = freshdeskPlugin.triggers.find(trigger => trigger.name === 'new_ticket');
    expect(newTicketTrigger).toBeDefined();
    expect(newTicketTrigger?.displayName).toBe('New Ticket');
    expect(newTicketTrigger?.description).toContain('Triggers when a new ticket is created');
    expect(newTicketTrigger?.type).toBe('polling');
    expect(newTicketTrigger?.sampleData).toHaveProperty('ticket');
  });

  it('should have the updated_ticket trigger with correct properties', () => {
    const updatedTicketTrigger = freshdeskPlugin.triggers.find(trigger => trigger.name === 'updated_ticket');
    expect(updatedTicketTrigger).toBeDefined();
    expect(updatedTicketTrigger?.displayName).toBe('Updated Ticket');
    expect(updatedTicketTrigger?.description).toContain('Triggers when a ticket is updated');
    expect(updatedTicketTrigger?.type).toBe('polling');
    expect(updatedTicketTrigger?.sampleData).toHaveProperty('ticket');
  });
});
