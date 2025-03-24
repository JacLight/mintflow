import squarePlugin from '../src/index.js';

describe('Square Plugin', () => {
  it('should be defined', () => {
    expect(squarePlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(squarePlugin.name).toBe('Square');
    expect(squarePlugin.id).toBe('square');
    expect(squarePlugin.runner).toBe('node');
    expect(squarePlugin.type).toBe('node');
    expect(squarePlugin.triggers).toHaveLength(7);
    expect(squarePlugin.actions).toHaveLength(0);
  });

  it('should have the correct triggers', () => {
    const triggerNames = squarePlugin.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain('new_order');
    expect(triggerNames).toContain('order_updated');
    expect(triggerNames).toContain('new_customer');
    expect(triggerNames).toContain('customer_updated');
    expect(triggerNames).toContain('new_payment');
    expect(triggerNames).toContain('new_invoice');
    expect(triggerNames).toContain('new_appointment');
  });

  it('should have the correct authentication schema', () => {
    expect(squarePlugin.inputSchema.type).toBe('object');
    expect(squarePlugin.inputSchema.properties).toHaveProperty('clientId');
    expect(squarePlugin.inputSchema.properties).toHaveProperty('clientSecret');
    expect(squarePlugin.inputSchema.properties).toHaveProperty('redirectUri');
    expect(squarePlugin.inputSchema.required).toContain('clientId');
    expect(squarePlugin.inputSchema.required).toContain('clientSecret');
    expect(squarePlugin.inputSchema.required).toContain('redirectUri');
  });
});
