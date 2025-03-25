import { z } from 'zod';
import { actions } from './actions/index.js';
import { triggers } from './triggers/index.js';

export const calcomAuth = {
  type: 'secret_text',
  displayName: 'API Key',
  description: 'API Key provided by Cal.com',
  required: true,
};

export default {
  name: 'calcom',
  displayName: 'Cal.com',
  description: 'Open-source scheduling infrastructure',
  logoUrl: 'https://cal.com/logo.svg',
  version: '1.0.0',
  auth: calcomAuth,
  actions,
  triggers,
};
