import { JotformAuth, WebhookInformation, jotformUtils } from '../utils/index.js';

export const newSubmission = {
  name: 'new_submission',
  displayName: 'New Submission',
  description: 'Triggers when a new form submission is received',
  type: 'webhook',
  inputSchema: {
    type: 'object',
    properties: {
      formId: {
        type: 'string',
        description: 'The JotForm form ID',
        required: true,
      },
    },
    required: ['formId'],
  },
  outputSchema: {
    type: 'object',
    properties: {},
  },
  sampleData: {
    formID: '230583697150159',
    submissionID: '5308741572752112119',
    formTitle: 'Sample Form',
    ip: '192.168.1.1',
    submissionDate: '2023-03-15 10:30:45',
    answers: {
      '1': {
        name: 'name',
        type: 'control_fullname',
        answer: {
          first: 'John',
          last: 'Doe',
        },
      },
      '2': {
        name: 'email',
        type: 'control_email',
        answer: 'john.doe@example.com',
      },
      '3': {
        name: 'message',
        type: 'control_textarea',
        answer: 'This is a sample message.',
      },
    },
  },
  async onEnable(input: any, webhookUrl: string, auth: JotformAuth, store: any): Promise<void> {
    await jotformUtils.subscribeWebhook(input.formId, webhookUrl, auth);

    // Store webhook information for later use when disabling
    await store?.put('_new_jotform_submission_trigger', {
      jotformWebhook: webhookUrl,
    });
  },
  async onDisable(input: any, auth: JotformAuth, store: any): Promise<void> {
    const webhookInfo = await store?.get('_new_jotform_submission_trigger') as WebhookInformation;
    
    if (webhookInfo && webhookInfo.jotformWebhook) {
      await jotformUtils.unsubscribeWebhook(input.formId, webhookInfo.jotformWebhook, auth);
    }
  },
  async execute(input: any, payload: any): Promise<any> {
    // Return the webhook payload as is
    return [payload.body];
  },
};
