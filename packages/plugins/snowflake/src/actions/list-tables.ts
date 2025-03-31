import { z } from 'zod';
import { SnowflakeClient } from '../utils/api.js';

export const listTables = {
  name: 'list_tables',
  displayName: 'List Tables',
  description: 'List all tables in a Snowflake schema',
  props: {
    database: {
      type: 'string',
      displayName: 'Database',
      description: 'Database name',
      required: true,
    },
    schema: {
      type: 'string',
      displayName: 'Schema',
      description: 'Schema name',
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
    const { database, schema, warehouse, role } = context.propsValue;
    
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
      const tables = await client.listTables(database, schema);
      await client.disconnect();
      
      return { tables };
    } catch (error: any) {
      await client.disconnect().catch(() => {});
      throw new Error(`Failed to list tables: ${error.message}`);
    }
  },
};
