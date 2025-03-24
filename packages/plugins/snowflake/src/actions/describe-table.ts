import { z } from 'zod';
import { SnowflakeClient } from '../utils/api.js';

export const describeTable = {
  name: 'describe_table',
  displayName: 'Describe Table',
  description: 'Get column information for a Snowflake table',
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
    tableName: {
      type: 'string',
      displayName: 'Table Name',
      description: 'Table name',
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
    const { database, schema, tableName, warehouse, role } = context.propsValue;
    
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
      const columns = await client.describeTable(database, schema, tableName);
      await client.disconnect();
      
      return { columns };
    } catch (error: any) {
      await client.disconnect().catch(() => {});
      throw new Error(`Failed to describe table: ${error.message}`);
    }
  },
};
