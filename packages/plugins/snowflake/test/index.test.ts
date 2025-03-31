/// <reference types="jest" />

import snowflakePlugin from '../src/index.js';
import { executeQuery } from '../src/actions/execute-query.js';
import { listDatabases } from '../src/actions/list-databases.js';
import { listSchemas } from '../src/actions/list-schemas.js';
import { listTables } from '../src/actions/list-tables.js';
import { describeTable } from '../src/actions/describe-table.js';
import { customApiCall } from '../src/actions/custom-api-call.js';
import { SnowflakeClient } from '../src/utils/api.js';

// Mock the SnowflakeClient
jest.mock('../src/utils/api.js', () => {
  return {
    SnowflakeClient: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue(undefined),
        executeQuery: jest.fn().mockResolvedValue([
          { ID: 1, NAME: 'John Doe', EMAIL: 'john@example.com' },
          { ID: 2, NAME: 'Jane Smith', EMAIL: 'jane@example.com' },
        ]),
        listDatabases: jest.fn().mockResolvedValue([
          { name: 'MY_DB', created_on: '2023-01-01T00:00:00Z' },
          { name: 'ANOTHER_DB', created_on: '2023-02-01T00:00:00Z' },
        ]),
        listSchemas: jest.fn().mockResolvedValue([
          { name: 'PUBLIC', created_on: '2023-01-01T00:00:00Z' },
          { name: 'INFORMATION_SCHEMA', created_on: '2023-01-01T00:00:00Z' },
        ]),
        listTables: jest.fn().mockResolvedValue([
          { name: 'MY_TABLE', kind: 'TABLE', created_on: '2023-01-01T00:00:00Z' },
          { name: 'ANOTHER_TABLE', kind: 'TABLE', created_on: '2023-02-01T00:00:00Z' },
        ]),
        describeTable: jest.fn().mockResolvedValue([
          { name: 'ID', type: 'NUMBER(38,0)', nullable: 'N', default: null },
          { name: 'NAME', type: 'VARCHAR(100)', nullable: 'Y', default: null },
          { name: 'EMAIL', type: 'VARCHAR(255)', nullable: 'Y', default: null },
        ]),
        disconnect: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

// Mock axios for customApiCall
jest.mock('axios', () => {
  return jest.fn().mockImplementation(() => {
    return Promise.resolve({
      status: 200,
      statusText: 'OK',
      data: {
        statementHandle: '01a2b3c4-5d6e-7f8g-9h0i-j1k2l3m4n5o6',
        message: 'Statement executed successfully.',
      },
      headers: {
        'content-type': 'application/json',
        'date': 'Wed, 01 Jan 2023 00:00:00 GMT',
      },
    });
  });
});

describe('Snowflake Plugin', () => {
  it('should have the correct name and description', () => {
    expect(snowflakePlugin.name).toBe('snowflake');
    expect(snowflakePlugin.description).toContain('Connect to Snowflake');
  });

  it('should have the correct actions', () => {
    expect(snowflakePlugin.actions).toContain(executeQuery);
    expect(snowflakePlugin.actions).toContain(listDatabases);
    expect(snowflakePlugin.actions).toContain(listSchemas);
    expect(snowflakePlugin.actions).toContain(listTables);
    expect(snowflakePlugin.actions).toContain(describeTable);
    expect(snowflakePlugin.actions).toContain(customApiCall);
  });
});

describe('Execute Query Action', () => {
  it('should execute a query and return rows', async () => {
    const context = {
      auth: {
        fields: {
          account: 'xy12345.us-east-1',
          username: 'user',
          password: 'password',
        }
      },
      propsValue: {
        database: 'MY_DB',
        schema: 'PUBLIC',
        warehouse: 'COMPUTE_WH',
        role: 'ACCOUNTADMIN',
        query: 'SELECT * FROM MY_TABLE LIMIT 10',
        binds: [],
      }
    };

    const result = await executeQuery.run(context);
    
    expect(result).toHaveProperty('rows');
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0]).toHaveProperty('ID', 1);
    expect(result.rows[0]).toHaveProperty('NAME', 'John Doe');
    expect(result.rows[0]).toHaveProperty('EMAIL', 'john@example.com');
  });
});

describe('List Databases Action', () => {
  it('should list databases', async () => {
    const context = {
      auth: {
        fields: {
          account: 'xy12345.us-east-1',
          username: 'user',
          password: 'password',
        }
      },
      propsValue: {
        warehouse: 'COMPUTE_WH',
        role: 'ACCOUNTADMIN',
      }
    };

    const result = await listDatabases.run(context);
    
    expect(result).toHaveProperty('databases');
    expect(Array.isArray(result.databases)).toBe(true);
    expect(result.databases.length).toBe(2);
    expect(result.databases[0]).toHaveProperty('name', 'MY_DB');
    expect(result.databases[0]).toHaveProperty('created_on', '2023-01-01T00:00:00Z');
  });
});

describe('List Schemas Action', () => {
  it('should list schemas', async () => {
    const context = {
      auth: {
        fields: {
          account: 'xy12345.us-east-1',
          username: 'user',
          password: 'password',
        }
      },
      propsValue: {
        database: 'MY_DB',
        warehouse: 'COMPUTE_WH',
        role: 'ACCOUNTADMIN',
      }
    };

    const result = await listSchemas.run(context);
    
    expect(result).toHaveProperty('schemas');
    expect(Array.isArray(result.schemas)).toBe(true);
    expect(result.schemas.length).toBe(2);
    expect(result.schemas[0]).toHaveProperty('name', 'PUBLIC');
    expect(result.schemas[0]).toHaveProperty('created_on', '2023-01-01T00:00:00Z');
  });
});

describe('List Tables Action', () => {
  it('should list tables', async () => {
    const context = {
      auth: {
        fields: {
          account: 'xy12345.us-east-1',
          username: 'user',
          password: 'password',
        }
      },
      propsValue: {
        database: 'MY_DB',
        schema: 'PUBLIC',
        warehouse: 'COMPUTE_WH',
        role: 'ACCOUNTADMIN',
      }
    };

    const result = await listTables.run(context);
    
    expect(result).toHaveProperty('tables');
    expect(Array.isArray(result.tables)).toBe(true);
    expect(result.tables.length).toBe(2);
    expect(result.tables[0]).toHaveProperty('name', 'MY_TABLE');
    expect(result.tables[0]).toHaveProperty('kind', 'TABLE');
    expect(result.tables[0]).toHaveProperty('created_on', '2023-01-01T00:00:00Z');
  });
});

describe('Describe Table Action', () => {
  it('should describe a table', async () => {
    const context = {
      auth: {
        fields: {
          account: 'xy12345.us-east-1',
          username: 'user',
          password: 'password',
        }
      },
      propsValue: {
        database: 'MY_DB',
        schema: 'PUBLIC',
        tableName: 'MY_TABLE',
        warehouse: 'COMPUTE_WH',
        role: 'ACCOUNTADMIN',
      }
    };

    const result = await describeTable.run(context);
    
    expect(result).toHaveProperty('columns');
    expect(Array.isArray(result.columns)).toBe(true);
    expect(result.columns.length).toBe(3);
    expect(result.columns[0]).toHaveProperty('name', 'ID');
    expect(result.columns[0]).toHaveProperty('type', 'NUMBER(38,0)');
    expect(result.columns[0]).toHaveProperty('nullable', 'N');
  });
});

describe('Custom API Call Action', () => {
  it('should make a custom API call', async () => {
    const context = {
      auth: {
        fields: {
          account: 'xy12345.us-east-1',
          username: 'user',
          password: 'password',
        }
      },
      propsValue: {
        baseUrl: 'https://xy12345.us-east-1.snowflakecomputing.com/api/v2',
        endpoint: '/statements',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        queryParams: {
          warehouse: 'COMPUTE_WH',
          role: 'ACCOUNTADMIN',
          database: 'MY_DB',
          schema: 'PUBLIC',
        },
        body: {
          statement: 'SELECT * FROM MY_TABLE LIMIT 10',
        },
        authToken: 'your-auth-token',
      }
    };

    const result = await customApiCall.run(context);
    
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('statusText', 'OK');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('statementHandle');
    expect(result.data).toHaveProperty('message', 'Statement executed successfully.');
    expect(result).toHaveProperty('headers');
    expect(result.headers).toHaveProperty('content-type', 'application/json');
  });
});
