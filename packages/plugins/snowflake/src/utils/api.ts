import * as snowflake from 'snowflake-sdk';

export interface SnowflakeConfig {
  account: string;
  username: string;
  password: string;
  database?: string;
  schema?: string;
  warehouse?: string;
  role?: string;
}

export class SnowflakeClient {
  private connection: snowflake.Connection;
  private config: SnowflakeConfig;

  constructor(config: SnowflakeConfig) {
    this.config = config;
    this.connection = snowflake.createConnection({
      account: config.account,
      username: config.username,
      password: config.password,
      database: config.database,
      schema: config.schema,
      warehouse: config.warehouse,
      role: config.role,
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.connect((err: any) => {
        if (err) {
          reject(new Error(`Failed to connect to Snowflake: ${err.message}`));
          return;
        }
        resolve();
      });
    });
  }

  async executeQuery(query: string, binds: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: query,
        binds: binds,
        complete: (err: any, stmt: any, rows: any[]) => {
          if (err) {
            reject(new Error(`Failed to execute query: ${err.message}`));
            return;
          }
          resolve(rows || []);
        },
      });
    });
  }

  async listDatabases(): Promise<any[]> {
    return this.executeQuery('SHOW DATABASES');
  }

  async listSchemas(database?: string): Promise<any[]> {
    const db = database || this.config.database;
    if (!db) {
      throw new Error('Database name is required');
    }
    return this.executeQuery(`SHOW SCHEMAS IN DATABASE ${db}`);
  }

  async listTables(database?: string, schema?: string): Promise<any[]> {
    const db = database || this.config.database;
    const schm = schema || this.config.schema;
    if (!db || !schm) {
      throw new Error('Database and schema names are required');
    }
    return this.executeQuery(`SHOW TABLES IN ${db}.${schm}`);
  }

  async describeTable(tableName: string, database?: string, schema?: string): Promise<any[]> {
    const db = database || this.config.database;
    const schm = schema || this.config.schema;
    if (!db || !schm) {
      throw new Error('Database and schema names are required');
    }
    return this.executeQuery(`DESCRIBE TABLE ${db}.${schm}.${tableName}`);
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.destroy((err: any) => {
        if (err) {
          reject(new Error(`Failed to disconnect from Snowflake: ${err.message}`));
          return;
        }
        resolve();
      });
    });
  }
}
