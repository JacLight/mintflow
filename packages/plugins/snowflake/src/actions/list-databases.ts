import { z } from 'zod';
import { SnowflakeClient } from '../utils/api.js';

export const listDatabases = {
  name: 'list_databases',
  displayName: 'List Databases',
  description: 'List all databases in Snowflake',
  props: {
    warehouse: {
      type: 'string',
      displayName: 'Warehouse',
      description: 'Warehouse name',
      required: false,
    },
    role: {
      type: 'string',
      displayName: 'Role',
      description: 'Role name',
      required: false,
    },
  },
  
  async run(context: any) {
    const { warehouse, role } = context.propsValue;
    
    const client = new SnowflakeClient({
      account: context.auth.fields.account,
      username: context.auth.fields.username,
      password: context.auth.fields.password,
      warehouse,
      role,
    });

    try {
      await client.connect();
      const databases = await client.listDatabases();
      await client.disconnect();
      
      return { databases };
    } catch (error: any) {
      await client.disconnect().catch(() => {});
      throw new Error(`Failed to list databases: ${error.message}`);
    }
  },
};
