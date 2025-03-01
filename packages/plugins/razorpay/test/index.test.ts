import razorpayPlugin from '../src/index.js';

describe('Razorpay Plugin', () => {
  it('should be defined', () => {
    expect(razorpayPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(razorpayPlugin.name).toBe('Razorpay');
    expect(razorpayPlugin.id).toBe('razorpay');
    expect(razorpayPlugin.runner).toBe('node');
    expect(razorpayPlugin.type).toBe('node');
    expect(razorpayPlugin.actions).toHaveLength(2);
  });

  it('should have the correct actions', () => {
    const actionNames = razorpayPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('create_payment_link');
    expect(actionNames).toContain('custom_api_call');
  });

  it('should have the correct authentication schema', () => {
    expect(razorpayPlugin.inputSchema.type).toBe('object');
    expect(razorpayPlugin.inputSchema.properties).toHaveProperty('keyID');
    expect(razorpayPlugin.inputSchema.properties).toHaveProperty('keySecret');
    expect(razorpayPlugin.inputSchema.required).toContain('keyID');
    expect(razorpayPlugin.inputSchema.required).toContain('keySecret');
  });
});
