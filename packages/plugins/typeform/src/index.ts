import { typeformNewSubmission } from './triggers/new-submission.js';
import { customApiCall } from './actions/custom-api-call.js';

// Define the OAuth2 authentication
export const typeformAuth = {
  type: 'oauth2',
  required: true,
  tokenUrl: 'https://api.typeform.com/oauth/token',
  authUrl: 'https://admin.typeform.com/oauth/authorize',
  scope: ['webhooks:write', 'forms:read'],
};

const typeformPlugin = {
  name: 'Typeform',
  icon: '',
  description: 'Create beautiful online forms and surveys',
  id: 'typeform',
  runner: 'node',
  auth: typeformAuth,
  triggers: [typeformNewSubmission],
  actions: [customApiCall],
};

export default typeformPlugin;
