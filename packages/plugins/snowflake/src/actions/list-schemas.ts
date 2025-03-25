import { z } from 'zod';
import { SnowflakeClient } from '../utils/api.js';

export const listSchemas = {
  name: 'list_schemas',
  displayName: 'List Schemas',
  description: 'List all schemas in a Snowflake database',
  props: {
    database: {
      type: 'string',
      displayName: 'Database',
      description: 'Database name',
      required: true,
    },
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
    const { database, warehouse, role } = context.propsValue;
    
    const client = new SnowflakeClient({
      account: context.auth.fields.account,
      username: context.auth.fields.username,
      password: context.auth.fields.password,
      database,
      warehouse,
      role,
    });

    try {
      await client.connect();
      const schemas = await client.listSchemas(database);
      await client.disconnect();
      
      return { schemas };
    } catch (error: any) {
      await client.disconnect().catch(() => {});
      throw new Error(`Failed to list schemas: ${error.message}`);
    }
  },
};
