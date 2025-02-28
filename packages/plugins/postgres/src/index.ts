import { Client, ClientConfig } from 'pg';
import format from 'pg-format';

interface PostgresConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  enableSsl?: boolean;
  rejectUnauthorized?: boolean;
  certificate?: string;
}

interface QueryResult {
  rows?: any[];
  affectedRows?: number;
}

// Helper function to establish a PostgreSQL connection
async function createConnection(config: PostgresConfig, queryTimeout = 30000, applicationName?: string, connectionTimeoutMillis = 30000): Promise<Client> {
  const {
    host,
    user,
    database,
    password,
    port = 5432,
    enableSsl = true,
    rejectUnauthorized = false,
    certificate,
  } = config;

  const sslConfig = enableSsl ? {
    rejectUnauthorized,
    ca: certificate && certificate.length > 0 ? certificate : undefined,
  } : undefined;

  const clientConfig: ClientConfig = {
    host,
    port: Number(port),
    user,
    password,
    database,
    ssl: sslConfig,
    query_timeout: Number(queryTimeout),
    statement_timeout: Number(queryTimeout),
    application_name: applicationName,
    connectionTimeoutMillis: Number(connectionTimeoutMillis),
  };

  const client = new Client(clientConfig);
  await client.connect();

  return client;
}

const postgresPlugin = {
  name: "PostgreSQL",
  icon: "FaDatabase",
  description: "Connect to PostgreSQL databases to execute queries and manage data",
  id: "postgres",
  runner: "node",
  inputSchema: {
    type: "object",
    properties: {
      host: {
        type: "string",
        title: "Host",
        description: "The hostname or IP address of the PostgreSQL server"
      },
      port: {
        type: "number",
        title: "Port",
        description: "The port number of the PostgreSQL server",
        default: 5432
      },
      user: {
        type: "string",
        title: "Username",
        description: "The username to authenticate with the PostgreSQL server"
      },
      password: {
        type: "string",
        title: "Password",
        description: "The password to authenticate with the PostgreSQL server",
        format: "password"
      },
      database: {
        type: "string",
        title: "Database",
        description: "The name of the database to connect to"
      },
      enableSsl: {
        type: "boolean",
        title: "Enable SSL",
        description: "Connect to the PostgreSQL database over SSL",
        default: true
      },
      rejectUnauthorized: {
        type: "boolean",
        title: "Verify Server Certificate",
        description: "Verify the server certificate against trusted CAs",
        default: false
      },
      certificate: {
        type: "string",
        title: "Certificate",
        description: "The CA certificate to use for verification of server certificate",
        format: "textarea"
      }
    },
    required: ["host", "user", "password", "database"]
  },
  outputSchema: {
    type: "object",
    properties: {
      rows: {
        type: "array",
        items: {
          type: "object"
        }
      },
      affectedRows: {
        type: "number"
      }
    }
  },
  exampleInput: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "password",
    database: "mydatabase",
    enableSsl: true,
    rejectUnauthorized: false
  },
  exampleOutput: {
    rows: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" }
    ]
  },
  documentation: "https://github.com/mintflow/plugins/postgres",
  method: "exec",
  actions: [
    {
      name: 'executeQuery',
      displayName: 'Execute Query',
      description: 'Execute a custom SQL query on the PostgreSQL database',
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            title: "SQL Query",
            description: "The SQL query to execute. Use $1, $2, etc. as placeholders for parameters to prevent SQL injection."
          },
          params: {
            type: "array",
            title: "Parameters",
            description: "Parameters to replace placeholders in the query",
            items: {
              type: "string"
            }
          },
          queryTimeout: {
            type: "number",
            title: "Query Timeout (ms)",
            description: "Maximum time in milliseconds to wait for a query to complete",
            default: 30000
          },
          connectionTimeout: {
            type: "number",
            title: "Connection Timeout (ms)",
            description: "Maximum time in milliseconds to wait for a connection to be established",
            default: 30000
          },
          applicationName: {
            type: "string",
            title: "Application Name",
            description: "Name of the client application connecting to the server"
          }
        },
        required: ["query"]
      },
      async execute(input: { data: { query: string; params?: any[]; queryTimeout?: number; connectionTimeout?: number; applicationName?: string } }, config: { data: PostgresConfig }): Promise<QueryResult> {
        const client = await createConnection(
          config.data,
          input.data.queryTimeout,
          input.data.applicationName,
          input.data.connectionTimeout
        );
        
        try {
          const { query } = input.data;
          const params = input.data.params || [];
          
          const result = await client.query(query, params);
          return { rows: result.rows };
        } catch (error: any) {
          throw new Error(`PostgreSQL query error: ${error.message}`);
        } finally {
          await client.end();
        }
      }
    },
    {
      name: 'getTables',
      displayName: 'Get Tables',
      description: 'Get a list of all tables in the database',
      inputSchema: {
        type: "object",
        properties: {
          schema: {
            type: "string",
            title: "Schema",
            description: "Database schema to list tables from (default: public)",
            default: "public"
          }
        }
      },
      async execute(input: { data: { schema?: string } }, config: { data: PostgresConfig }): Promise<QueryResult> {
        const client = await createConnection(config.data);
        
        try {
          const schema = input.data.schema || 'public';
          const query = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = $1 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
          `;
          
          const result = await client.query(query, [schema]);
          return { rows: result.rows.map(row => row.table_name) };
        } catch (error: any) {
          throw new Error(`PostgreSQL error: ${error.message}`);
        } finally {
          await client.end();
        }
      }
    },
    {
      name: 'selectRows',
      displayName: 'Select Rows',
      description: 'Select rows from a table with optional filtering',
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            title: "Table",
            description: "The name of the table to select from"
          },
          schema: {
            type: "string",
            title: "Schema",
            description: "Database schema the table belongs to",
            default: "public"
          },
          columns: {
            type: "array",
            title: "Columns",
            description: "The columns to select (leave empty to select all columns)",
            items: {
              type: "string"
            }
          },
          where: {
            type: "object",
            title: "Where Conditions",
            description: "Conditions for filtering rows (column name as key, value to match as value)"
          },
          orderBy: {
            type: "string",
            title: "Order By",
            description: "Column to order results by"
          },
          orderDirection: {
            type: "string",
            title: "Order Direction",
            description: "Direction to order results",
            enum: ["ASC", "DESC"],
            default: "ASC"
          },
          limit: {
            type: "number",
            title: "Limit",
            description: "Maximum number of rows to return"
          }
        },
        required: ["table"]
      },
      async execute(input: { 
        data: { 
          table: string;
          schema?: string;
          columns?: string[];
          where?: Record<string, any>;
          orderBy?: string;
          orderDirection?: string;
          limit?: number;
        } 
      }, config: { data: PostgresConfig }): Promise<QueryResult> {
        const client = await createConnection(config.data);
        
        try {
          const { 
            table, 
            schema = 'public',
            columns, 
            where, 
            orderBy, 
            orderDirection = 'ASC', 
            limit 
          } = input.data;
          
          // Build the SELECT part
          const columnsStr = columns && columns.length > 0 
            ? columns.map(col => format.ident(col)).join(', ')
            : '*';
          
          // Start building the query
          let query = format('SELECT %s FROM %I.%I', columnsStr, schema, table);
          const params: any[] = [];
          let paramIndex = 1;
          
          // Add WHERE clause if conditions are provided
          if (where && Object.keys(where).length > 0) {
            const whereConditions: string[] = [];
            Object.entries(where).forEach(([column, value]) => {
              whereConditions.push(`${format.ident(column)} = $${paramIndex}`);
              params.push(value);
              paramIndex++;
            });
            query += ` WHERE ${whereConditions.join(' AND ')}`;
          }
          
          // Add ORDER BY if specified
          if (orderBy) {
            query += ` ORDER BY ${format.ident(orderBy)} ${orderDirection}`;
          }
          
          // Add LIMIT if specified
          if (limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(limit);
          }
          
          const result = await client.query(query, params);
          return { rows: result.rows };
        } catch (error: any) {
          throw new Error(`PostgreSQL select error: ${error.message}`);
        } finally {
          await client.end();
        }
      }
    },
    {
      name: 'insertRow',
      displayName: 'Insert Row',
      description: 'Insert a new row into a table',
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            title: "Table",
            description: "The name of the table to insert into"
          },
          schema: {
            type: "string",
            title: "Schema",
            description: "Database schema the table belongs to",
            default: "public"
          },
          values: {
            type: "object",
            title: "Values",
            description: "The values to insert (column name as key, value to insert as value)"
          },
          returnColumns: {
            type: "array",
            title: "Return Columns",
            description: "Columns to return after insert (e.g., for auto-generated IDs)",
            items: {
              type: "string"
            }
          }
        },
        required: ["table", "values"]
      },
      async execute(input: { 
        data: { 
          table: string;
          schema?: string;
          values: Record<string, any>;
          returnColumns?: string[];
        } 
      }, config: { data: PostgresConfig }): Promise<QueryResult> {
        const client = await createConnection(config.data);
        
        try {
          const { table, schema = 'public', values, returnColumns } = input.data;
          
          if (!values || Object.keys(values).length === 0) {
            throw new Error("No values provided for insert operation");
          }
          
          const columns = Object.keys(values);
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          const columnsStr = columns.map(col => format.ident(col)).join(', ');
          const params = columns.map(col => values[col]);
          
          let query = format('INSERT INTO %I.%I (%s) VALUES (%s)', 
            schema, 
            table, 
            columnsStr, 
            placeholders
          );
          
          // Add RETURNING clause if returnColumns is specified
          if (returnColumns && returnColumns.length > 0) {
            const returningStr = returnColumns.map(col => format.ident(col)).join(', ');
            query += ` RETURNING ${returningStr}`;
          }
          
          const result = await client.query(query, params);
          
          return { 
            rows: result.rows,
            affectedRows: result.rowCount ?? undefined 
          };
        } catch (error: any) {
          throw new Error(`PostgreSQL insert error: ${error.message}`);
        } finally {
          await client.end();
        }
      }
    },
    {
      name: 'updateRows',
      displayName: 'Update Rows',
      description: 'Update rows in a table that match specified conditions',
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            title: "Table",
            description: "The name of the table to update"
          },
          schema: {
            type: "string",
            title: "Schema",
            description: "Database schema the table belongs to",
            default: "public"
          },
          values: {
            type: "object",
            title: "Values",
            description: "The values to update (column name as key, new value as value)"
          },
          where: {
            type: "object",
            title: "Where Conditions",
            description: "Conditions for filtering rows to update (column name as key, value to match as value)"
          },
          returnColumns: {
            type: "array",
            title: "Return Columns",
            description: "Columns to return after update",
            items: {
              type: "string"
            }
          }
        },
        required: ["table", "values"]
      },
      async execute(input: { 
        data: { 
          table: string;
          schema?: string;
          values: Record<string, any>;
          where?: Record<string, any>;
          returnColumns?: string[];
        } 
      }, config: { data: PostgresConfig }): Promise<QueryResult> {
        const client = await createConnection(config.data);
        
        try {
          const { table, schema = 'public', values, where, returnColumns } = input.data;
          
          if (!values || Object.keys(values).length === 0) {
            throw new Error("No values provided for update operation");
          }
          
          // Build SET clause
          const setColumns = Object.keys(values);
          let paramIndex = 1;
          const setClauses = setColumns.map(col => {
            const clause = `${format.ident(col)} = $${paramIndex}`;
            paramIndex++;
            return clause;
          }).join(', ');
          
          const params = [...setColumns.map(col => values[col])];
          
          // Start building the query
          let query = format('UPDATE %I.%I SET %s', schema, table, setClauses);
          
          // Add WHERE clause if conditions are provided
          if (where && Object.keys(where).length > 0) {
            const whereColumns = Object.keys(where);
            const whereClauses = whereColumns.map(col => {
              const clause = `${format.ident(col)} = $${paramIndex}`;
              paramIndex++;
              return clause;
            }).join(' AND ');
            
            query += ` WHERE ${whereClauses}`;
            params.push(...whereColumns.map(col => where[col]));
          }
          
          // Add RETURNING clause if returnColumns is specified
          if (returnColumns && returnColumns.length > 0) {
            const returningStr = returnColumns.map(col => format.ident(col)).join(', ');
            query += ` RETURNING ${returningStr}`;
          }
          
          const result = await client.query(query, params);
          
          return { 
            rows: result.rows,
            affectedRows: result.rowCount ?? undefined 
          };
        } catch (error: any) {
          throw new Error(`PostgreSQL update error: ${error.message}`);
        } finally {
          await client.end();
        }
      }
    },
    {
      name: 'deleteRows',
      displayName: 'Delete Rows',
      description: 'Delete rows from a table that match specified conditions',
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            title: "Table",
            description: "The name of the table to delete from"
          },
          schema: {
            type: "string",
            title: "Schema",
            description: "Database schema the table belongs to",
            default: "public"
          },
          where: {
            type: "object",
            title: "Where Conditions",
            description: "Conditions for filtering rows to delete (column name as key, value to match as value)"
          },
          returnColumns: {
            type: "array",
            title: "Return Columns",
            description: "Columns to return from deleted rows",
            items: {
              type: "string"
            }
          }
        },
        required: ["table", "where"]
      },
      async execute(input: { 
        data: { 
          table: string;
          schema?: string;
          where: Record<string, any>;
          returnColumns?: string[];
        } 
      }, config: { data: PostgresConfig }): Promise<QueryResult> {
        const client = await createConnection(config.data);
        
        try {
          const { table, schema = 'public', where, returnColumns } = input.data;
          
          if (!where || Object.keys(where).length === 0) {
            throw new Error("No conditions provided for delete operation. To delete all rows, use executeQuery with a DELETE statement.");
          }
          
          // Start building the query
          let query = format('DELETE FROM %I.%I', schema, table);
          
          // Add WHERE clause
          const whereColumns = Object.keys(where);
          const params: any[] = [];
          const whereClauses = whereColumns.map((col, index) => {
            const clause = `${format.ident(col)} = $${index + 1}`;
            params.push(where[col]);
            return clause;
          }).join(' AND ');
          
          query += ` WHERE ${whereClauses}`;
          
          // Add RETURNING clause if returnColumns is specified
          if (returnColumns && returnColumns.length > 0) {
            const returningStr = returnColumns.map(col => format.ident(col)).join(', ');
            query += ` RETURNING ${returningStr}`;
          }
          
          const result = await client.query(query, params);
          
          return { 
            rows: result.rows,
            affectedRows: result.rowCount ?? undefined 
          };
        } catch (error: any) {
          throw new Error(`PostgreSQL delete error: ${error.message}`);
        } finally {
          await client.end();
        }
      }
    }
  ]
};

export default postgresPlugin;
