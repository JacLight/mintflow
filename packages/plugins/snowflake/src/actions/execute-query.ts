import { z } from 'zod';
import { SnowflakeClient } from '../utils/api.js';

export const executeQuery = {
  name: 'execute_query',
  displayName: 'Execute Query',
  description: 'Execute a custom SQL query on Snowflake',
  props: {
    database: {
      type: 'string',
      displayName: 'Database',
      description: 'Database name',
      required: false,
    },
    schema: {
      type: 'string',
      displayName: 'Schema',
      description: 'Schema name',
      required: false,
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
    query: {
      type: 'string',
      displayName: 'SQL Query',
      description: 'SQL query to execute',
      required: true,
    },
    binds: {
      type: 'array',
      displayName: 'Bind Parameters',
      description: 'Array of bind parameters for the query',
      required: false,
    },
  },
  
  async run(context: any) {
    const { database, schema, warehouse, role, query, binds } = context.propsValue;
    
    const client = new SnowflakeClient({
      account: context.auth.fields.account,
      username: context.auth.fields.username,
      password: context.auth.fields.password,
      database,
      schema,
      warehouse,
      role,
    });

    try {
      await client.connect();
      const rows = await client.executeQuery(query, binds || []);
      await client.disconnect();
      
      return { rows };
    } catch (error: any) {
      await client.disconnect().catch(() => {});
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  },
};
