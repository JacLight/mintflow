import { typeformCommon, formsDropdown } from '../common/index.js';
// Use a simple function to generate a random ID instead of nanoid
const generateRandomId = () => Math.random().toString(36).substring(2, 15);

interface WebhookInformation {
  tag: string;
}

export const typeformNewSubmission = {
  name: 'new_submission',
  displayName: 'New Submission',
  description: 'Triggers when Typeform receives a new submission',
  props: {
    form_id: formsDropdown,
  },
  type: 'webhook',
  sampleData: {
    form_id: 'o3TT4IlE',
    token: '9q3v9bp5alonta6239q3q1rfly2c2ukh',
    landed_at: '2023-01-29T20:52:35Z',
    submitted_at: '2023-01-29T20:52:37Z',
    definition: {
      id: 'o3TT4IlE',
      title: 'test2',
      fields: [
        {
          id: 'r2NV4a7LSugq',
          ref: '01GQZMFYAD53N13MC7G0AKFWC6',
          type: 'multiple_choice',
          title: '...',
          properties: {},
          choices: [
            {
              id: 'jNfSosecdD10',
              label: 'Choice 1',
            },
            {
              id: 'pCyKAWMwEbZH',
              label: 'Choice 2',
            },
          ],
        },
      ],
    },
    answers: [
      {
        type: 'choice',
        choice: {
          label: 'Choice 1',
        },
        field: {
          id: 'r2NV4a7LSugq',
          type: 'multiple_choice',
          ref: '01GQZMFYAD53N13MC7G0AKFWC6',
        },
      },
    ],
    thankyou_screen_ref: '01GQZMFYADET9MXFKPGFQG08T9',
  },
  async onEnable(context: any) {
    const randomTag = `mintflow_new_submission_${generateRandomId()}`;
    await typeformCommon.subscribeWebhook(
      context.propsValue['form_id'],
      randomTag,
      context.webhookUrl,
      context.auth.access_token
    );
    if (context.store) {
      await context.store.put('_new_submission_trigger', {
        tag: randomTag,
      });
    }
  },
  async onDisable(context: any) {
    const response = context.store ? 
      await context.store.get('_new_submission_trigger') as WebhookInformation | null : 
      null;
    if (response !== null && response !== undefined) {
      await typeformCommon.unsubscribeWebhook(
        context.propsValue['form_id'],
        response.tag,
        context.auth.access_token
      );
    }
  },
  async run(context: any) {
    const body = context.payload.body as { form_response: unknown };
    return [body.form_response];
  },
};
