import { typeformNewSubmission } from '../src/triggers/new-submission.js';
import { typeformCommon } from '../src/common/index.js';

// Mock typeformCommon
jest.mock('../src/common/index.js', () => ({
  typeformCommon: {
    subscribeWebhook: jest.fn(),
    unsubscribeWebhook: jest.fn(),
    baseUrl: 'https://api.typeform.com',
  },
  formsDropdown: {},
}));

describe('typeformNewSubmission trigger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct properties', () => {
    expect(typeformNewSubmission.name).toBe('new_submission');
    expect(typeformNewSubmission.displayName).toBe('New Submission');
    expect(typeformNewSubmission.description).toBe('Triggers when Typeform receives a new submission');
    expect(typeformNewSubmission.type).toBe('webhook');
    expect(typeformNewSubmission.props).toHaveProperty('form_id');
  });

  it('should subscribe to webhook on enable', async () => {
    // Mock context
    const context = {
      propsValue: { form_id: 'test-form-id' },
      webhookUrl: 'https://example.com/webhook',
      auth: { access_token: 'test-token' },
      store: {
        put: jest.fn().mockResolvedValue(true),
      },
    };

    // Mock successful subscription
    (typeformCommon.subscribeWebhook as jest.Mock).mockResolvedValue({ success: true });

    // Call onEnable
    await typeformNewSubmission.onEnable(context);

    // Assertions
    expect(typeformCommon.subscribeWebhook).toHaveBeenCalledWith(
      'test-form-id',
      expect.stringContaining('mintflow_new_submission_'),
      'https://example.com/webhook',
      'test-token'
    );
    expect(context.store.put).toHaveBeenCalledWith('_new_submission_trigger', {
      tag: expect.stringContaining('mintflow_new_submission_'),
    });
  });

  it('should unsubscribe from webhook on disable', async () => {
    // Mock context
    const context = {
      propsValue: { form_id: 'test-form-id' },
      auth: { access_token: 'test-token' },
      store: {
        get: jest.fn().mockResolvedValue({ tag: 'existing-tag' }),
      },
    };

    // Mock successful unsubscription
    (typeformCommon.unsubscribeWebhook as jest.Mock).mockResolvedValue({ success: true });

    // Call onDisable
    await typeformNewSubmission.onDisable(context);

    // Assertions
    expect(context.store.get).toHaveBeenCalledWith('_new_submission_trigger');
    expect(typeformCommon.unsubscribeWebhook).toHaveBeenCalledWith(
      'test-form-id',
      'existing-tag',
      'test-token'
    );
  });

  it('should not unsubscribe if no tag is found', async () => {
    // Mock context
    const context = {
      propsValue: { form_id: 'test-form-id' },
      auth: { access_token: 'test-token' },
      store: {
        get: jest.fn().mockResolvedValue(null),
      },
    };

    // Call onDisable
    await typeformNewSubmission.onDisable(context);

    // Assertions
    expect(context.store.get).toHaveBeenCalledWith('_new_submission_trigger');
    expect(typeformCommon.unsubscribeWebhook).not.toHaveBeenCalled();
  });

  it('should process form submission data correctly', async () => {
    // Mock form response
    const formResponse = {
      form_id: 'test-form-id',
      token: 'test-token',
      submitted_at: '2023-01-01T12:00:00Z',
      answers: [{ type: 'text', text: 'Test answer' }],
    };

    // Mock context
    const context = {
      payload: {
        body: {
          form_response: formResponse,
        },
      },
    };

    // Call run
    const result = await typeformNewSubmission.run(context);

    // Assertions
    expect(result).toEqual([formResponse]);
  });
});
