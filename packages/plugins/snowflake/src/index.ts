import { z } from 'zod';
import { actions } from './actions/index.js';

export const snowflakeAuth = {
  type: 'oauth2',
  displayName: 'Snowflake Authentication',
  description: 'Connect to your Snowflake account',
  required: true,
  fields: [
    {
      name: 'account',
      displayName: 'Account',
      description: 'Snowflake account identifier (e.g., xy12345.us-east-1)',
      type: 'string',
      required: true,
    },
    {
      name: 'username',
      displayName: 'Username',
      description: 'Snowflake username',
      type: 'string',
      required: true,
    },
    {
      name: 'password',
      displayName: 'Password',
      description: 'Snowflake password',
      type: 'string',
      required: true,
      secret: true,
    },
  ],
};

export default {
  name: 'snowflake',
  displayName: 'Snowflake',
  description: 'Connect to Snowflake data platform to execute SQL queries and manage your data warehouse',
  logoUrl: 'https://www.snowflake.com/wp-content/themes/snowflake/assets/img/logo-blue.svg',
  version: '1.0.0',
  auth: snowflakeAuth,
  actions,
};
