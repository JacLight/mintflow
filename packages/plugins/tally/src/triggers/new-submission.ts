export const newSubmission = {
  name: 'new_submission',
  displayName: 'New Submission',
  description: 'Triggers when form receives a new submission',
  type: 'webhook',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  outputSchema: {
    type: 'object',
    properties: {},
  },
  sampleData: {
    formId: 'abcdefg',
    responseId: '123456789',
    submittedAt: '2023-03-15T10:30:45Z',
    respondent: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'TEXT',
        value: 'John Doe',
      },
      {
        key: 'email',
        label: 'Email',
        type: 'EMAIL',
        value: 'john.doe@example.com',
      },
      {
        key: 'message',
        label: 'Message',
        type: 'TEXTAREA',
        value: 'This is a sample message.',
      },
    ],
  },
  async onEnable(input: any, webhookUrl: string, auth: any, store: any): Promise<void> {
    // Tally forms don't require any API calls to enable webhooks
    // The user manually sets up the webhook in the Tally dashboard
  },
  async onDisable(input: any, auth: any, store: any): Promise<void> {
    // Tally forms don't require any API calls to disable webhooks
    // The user manually removes the webhook in the Tally dashboard
  },
  async execute(input: any, payload: any): Promise<any> {
    // Return the webhook payload as is
    return [payload.body];
  },
  instructions: `
To set up the trigger for new form submissions, follow these steps:

1. Go to the "Dashboard" section in Tally.
2. Select the form where you want the trigger to occur.
3. Click on the "Integrations" section.
4. Find the "Webhooks" integration and click on "Connect" to activate it.
5. In the webhook settings, paste the webhook URL provided by MintFlow.
6. Click on "Submit".

The webhook will now send all new form submissions to your MintFlow workflow.
  `,
};
