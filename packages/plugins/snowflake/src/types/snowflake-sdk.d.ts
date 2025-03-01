declare module 'snowflake-sdk' {
  export interface ConnectionOptions {
    account: string;
    username: string;
    password: string;
    database?: string;
    schema?: string;
    warehouse?: string;
    role?: string;
  }

  export interface ExecuteOptions {
    sqlText: string;
    binds?: any[];
    complete: (err: any, stmt: any, rows: any[]) => void;
  }

  export interface Connection {
    connect: (callback: (err: any) => void) => void;
    execute: (options: ExecuteOptions) => void;
    destroy: (callback: (err: any) => void) => void;
  }

  export function createConnection(options: ConnectionOptions): Connection;
}
