import { SurveyMonkeyAuth, WebhookInformation, smUtils } from '../utils/index.js';

export const newResponse = {
  name: 'new_response',
  displayName: 'New Response',
  description: 'Triggers when a new survey response is submitted',
  type: 'webhook',
  inputSchema: {
    type: 'object',
    properties: {
      survey: {
        type: 'string',
        description: 'The SurveyMonkey survey ID',
        required: true,
      },
    },
    required: ['survey'],
  },
  outputSchema: {
    type: 'object',
    properties: {},
  },
  sampleData: {
    id: '123456789',
    survey_id: '987654321',
    collector_id: '12345',
    date_created: '2023-03-15T10:30:45+00:00',
    date_modified: '2023-03-15T10:30:45+00:00',
    response_status: 'completed',
    custom_variables: {},
    edit_url: 'https://www.surveymonkey.com/r/?sm=abcdefg',
    analyze_url: 'https://www.surveymonkey.com/analyze/browse/abcdefg',
    ip_address: '192.168.1.1',
    pages: [
      {
        id: 'page_id',
        questions: [
          {
            id: 'question_id',
            answers: [
              {
                choice_id: 'choice_id',
                text: 'Sample answer text'
              }
            ]
          }
        ]
      }
    ]
  },
  async onEnable(input: any, webhookUrl: string, auth: SurveyMonkeyAuth, store: any): Promise<void> {
    const webhookId = await smUtils.subscribeWebhook(
      input.survey,
      webhookUrl,
      auth.access_token
    );

    // Store webhook information for later use when disabling
    await store?.put('_new_response_trigger', {
      webhookId: webhookId,
    });
  },
  async onDisable(input: any, auth: SurveyMonkeyAuth, store: any): Promise<void> {
    const webhookInfo = await store?.get('_new_response_trigger') as WebhookInformation;
    
    if (webhookInfo && webhookInfo.webhookId) {
      await smUtils.unsubscribeWebhook(webhookInfo.webhookId, auth.access_token);
    }
  },
  async execute(input: any, payload: any, auth: SurveyMonkeyAuth): Promise<any> {
    const payloadBody = payload.body as { object_id: string | number };
    
    // Get detailed response data
    const responseData = await smUtils.getResponseDetails(
      auth.access_token,
      input.survey,
      payloadBody.object_id
    );
    
    return [responseData];
  },
};
