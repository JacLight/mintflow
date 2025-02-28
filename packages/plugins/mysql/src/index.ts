import * as mysql from 'mysql2/promise';

interface MySQLConfig {
    host: string;
    port?: number;
    username: string;
    password: string;
    database: string;
    timezone?: string;
}

interface QueryResult {
    results?: any[];
    affectedRows?: number;
    insertId?: number;
}

interface WhereCondition {
    [key: string]: any;
}

// Helper function to establish a MySQL connection
async function createConnection(config: MySQLConfig): Promise<mysql.Connection> {
    return await mysql.createConnection({
        host: config.host,
        port: config.port || 3306,
        user: config.username,
        password: config.password,
        database: config.database,
        timezone: config.timezone || 'local',
        multipleStatements: false // For security reasons
    });
}

// Helper function to sanitize column names to prevent SQL injection
function sanitizeColumnName(name: string): string {
    if (name === '*') {
        return name;
    }
    return `\`${name.replace(/`/g, '``')}\``;
}

const mysqlPlugin = {
    name: "MySQL",
    icon: "FaDatabase",
    description: "Connect to MySQL databases to execute queries and manage data",
    id: "mysql",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            host: {
                type: "string",
                title: "Host",
                description: "The hostname or IP address of the MySQL server"
            },
            port: {
                type: "number",
                title: "Port",
                description: "The port number of the MySQL server",
                default: 3306
            },
            username: {
                type: "string",
                title: "Username",
                description: "The username to authenticate with the MySQL server"
            },
            password: {
                type: "string",
                title: "Password",
                description: "The password to authenticate with the MySQL server",
                format: "password"
            },
            database: {
                type: "string",
                title: "Database",
                description: "The name of the database to connect to"
            },
            timezone: {
                type: "string",
                title: "Timezone",
                description: "The timezone to use for date/time operations",
                default: "local"
            }
        },
        required: ["host", "username", "password", "database"]
    },
    outputSchema: {
        type: "object",
        properties: {
            results: {
                type: "array",
                items: {
                    type: "object"
                }
            },
            affectedRows: {
                type: "number"
            },
            insertId: {
                type: "number"
            }
        }
    },
    documentation: "https://github.com/mintflow/plugins/mysql",
    method: "exec",
    actions: [
        {
            name: 'executeQuery',
            displayName: 'Execute Query',
            description: 'Execute a custom SQL query on the MySQL database',
            inputSchema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        title: "SQL Query",
                        description: "The SQL query to execute. Use ? as placeholders for parameters to prevent SQL injection."
                    },
                    params: {
                        type: "array",
                        title: "Parameters",
                        description: "Parameters to replace ? placeholders in the query",
                        items: {
                            type: "string"
                        }
                    }
                },
                required: ["query"]
            },
            async execute(input: { data: { query: string; params?: any[] } }, config: { data: MySQLConfig }): Promise<QueryResult> {
                const connection = await createConnection(config.data);
                try {
                    const [rows] = await connection.execute(
                        input.data.query,
                        input.data.params || []
                    );
                    return { results: rows as any[] };
                } catch (error: any) {
                    throw new Error(`MySQL query error: ${error.message}`);
                } finally {
                    await connection.end();
                }
            }
        },
        {
            name: 'getTables',
            displayName: 'Get Tables',
            description: 'Get a list of all tables in the database',
            inputSchema: {
                type: "object",
                properties: {}
            },
            async execute(input: any, config: { data: MySQLConfig }): Promise<QueryResult> {
                const connection = await createConnection(config.data);
                try {
                    const [rows] = await connection.execute('SHOW TABLES');
                    const tables = (rows as any[]).map(row => Object.values(row)[0]);
                    return { results: tables };
                } catch (error: any) {
                    throw new Error(`MySQL error: ${error.message}`);
                } finally {
                    await connection.end();
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
                    columns?: string[]; 
                    where?: WhereCondition; 
                    orderBy?: string; 
                    orderDirection?: string; 
                    limit?: number 
                } 
            }, config: { data: MySQLConfig }): Promise<QueryResult> {
                const connection = await createConnection(config.data);
                try {
                    const { table, columns, where, orderBy, orderDirection, limit } = input.data;
                    
                    // Build the SELECT part
                    const columnsStr = columns && columns.length > 0 
                        ? columns.map(col => sanitizeColumnName(col)).join(', ')
                        : '*';
                    
                    // Start building the query
                    let query = `SELECT ${columnsStr} FROM ${sanitizeColumnName(table)}`;
                    const params: any[] = [];
                    
                    // Add WHERE clause if conditions are provided
                    if (where && Object.keys(where).length > 0) {
                        const whereConditions: string[] = [];
                        Object.entries(where).forEach(([column, value]) => {
                            whereConditions.push(`${sanitizeColumnName(column)} = ?`);
                            params.push(value);
                        });
                        query += ` WHERE ${whereConditions.join(' AND ')}`;
                    }
                    
                    // Add ORDER BY if specified
                    if (orderBy) {
                        query += ` ORDER BY ${sanitizeColumnName(orderBy)} ${orderDirection || 'ASC'}`;
                    }
                    
                    // Add LIMIT if specified
                    if (limit) {
                        query += ` LIMIT ?`;
                        params.push(limit);
                    }
                    
                    const [rows] = await connection.execute(query, params);
                    return { results: rows as any[] };
                } catch (error: any) {
                    throw new Error(`MySQL select error: ${error.message}`);
                } finally {
                    await connection.end();
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
                    values: {
                        type: "object",
                        title: "Values",
                        description: "The values to insert (column name as key, value to insert as value)"
                    }
                },
                required: ["table", "values"]
            },
            async execute(input: { data: { table: string; values: Record<string, any> } }, config: { data: MySQLConfig }): Promise<QueryResult> {
                const connection = await createConnection(config.data);
                try {
                    const { table, values } = input.data;
                    
                    if (!values || Object.keys(values).length === 0) {
                        throw new Error("No values provided for insert operation");
                    }
                    
                    const columns = Object.keys(values);
                    const placeholders = columns.map(() => '?').join(', ');
                    const columnsStr = columns.map(col => sanitizeColumnName(col)).join(', ');
                    const params = columns.map(col => values[col]);
                    
                    const query = `INSERT INTO ${sanitizeColumnName(table)} (${columnsStr}) VALUES (${placeholders})`;
                    
                    const [result] = await connection.execute(query, params);
                    return {
                        affectedRows: (result as mysql.ResultSetHeader).affectedRows,
                        insertId: (result as mysql.ResultSetHeader).insertId
                    };
                } catch (error: any) {
                    throw new Error(`MySQL insert error: ${error.message}`);
                } finally {
                    await connection.end();
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
                    values: {
                        type: "object",
                        title: "Values",
                        description: "The values to update (column name as key, new value as value)"
                    },
                    where: {
                        type: "object",
                        title: "Where Conditions",
                        description: "Conditions for filtering rows to update (column name as key, value to match as value)"
                    }
                },
                required: ["table", "values"]
            },
            async execute(input: { 
                data: { 
                    table: string; 
                    values: Record<string, any>; 
                    where?: WhereCondition 
                } 
            }, config: { data: MySQLConfig }): Promise<QueryResult> {
                const connection = await createConnection(config.data);
                try {
                    const { table, values, where } = input.data;
                    
                    if (!values || Object.keys(values).length === 0) {
                        throw new Error("No values provided for update operation");
                    }
                    
                    // Build SET clause
                    const setClause = Object.keys(values)
                        .map(col => `${sanitizeColumnName(col)} = ?`)
                        .join(', ');
                    
                    const params: any[] = Object.keys(values).map(col => values[col]);
                    
                    // Start building the query
                    let query = `UPDATE ${sanitizeColumnName(table)} SET ${setClause}`;
                    
                    // Add WHERE clause if conditions are provided
                    if (where && Object.keys(where).length > 0) {
                        const whereConditions: string[] = [];
                        Object.entries(where).forEach(([column, value]) => {
                            whereConditions.push(`${sanitizeColumnName(column)} = ?`);
                            params.push(value);
                        });
                        query += ` WHERE ${whereConditions.join(' AND ')}`;
                    }
                    
                    const [result] = await connection.execute(query, params);
                    return { affectedRows: (result as mysql.ResultSetHeader).affectedRows };
                } catch (error: any) {
                    throw new Error(`MySQL update error: ${error.message}`);
                } finally {
                    await connection.end();
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
                    where: {
                        type: "object",
                        title: "Where Conditions",
                        description: "Conditions for filtering rows to delete (column name as key, value to match as value)"
                    }
                },
                required: ["table", "where"]
            },
            async execute(input: { data: { table: string; where: WhereCondition } }, config: { data: MySQLConfig }): Promise<QueryResult> {
                const connection = await createConnection(config.data);
                try {
                    const { table, where } = input.data;
                    
                    if (!where || Object.keys(where).length === 0) {
                        throw new Error("No conditions provided for delete operation. To delete all rows, use executeQuery with a DELETE statement.");
                    }
                    
                    // Start building the query
                    let query = `DELETE FROM ${sanitizeColumnName(table)}`;
                    const params: any[] = [];
                    
                    // Add WHERE clause
                    const whereConditions: string[] = [];
                    Object.entries(where).forEach(([column, value]) => {
                        whereConditions.push(`${sanitizeColumnName(column)} = ?`);
                        params.push(value);
                    });
                    query += ` WHERE ${whereConditions.join(' AND ')}`;
                    
                    const [result] = await connection.execute(query, params);
                    return { affectedRows: (result as mysql.ResultSetHeader).affectedRows };
                } catch (error: any) {
                    throw new Error(`MySQL delete error: ${error.message}`);
                } finally {
                    await connection.end();
                }
            }
        }
    ]
};

export default mysqlPlugin;
