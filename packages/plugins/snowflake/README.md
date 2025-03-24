# Snowflake Plugin for MintFlow

The Snowflake plugin provides integration with Snowflake, a cloud data platform, allowing you to execute SQL queries, list databases, schemas, and tables, and describe table structures.

## Features

- Execute custom SQL queries on your Snowflake instance
- List all databases in your Snowflake account
- List all schemas in a specific database
- List all tables in a specific schema
- Get detailed information about a table's structure
- Make custom API calls to the Snowflake REST API

## Authentication

The Snowflake plugin requires the following authentication parameters:

- **Account**: Your Snowflake account identifier (e.g., xy12345.us-east-1)
- **Username**: Your Snowflake username
- **Password**: Your Snowflake password

## Actions

### Execute Query

Execute a custom SQL query on your Snowflake instance.

**Parameters:**

- **Database** (optional): Database name
- **Schema** (optional): Schema name
- **Warehouse** (optional): Warehouse name
- **Role** (optional): Role name
- **Query** (required): SQL query to execute
- **Binds** (optional): Array of bind parameters for the query

**Example:**

```json
{
  "database": "MY_DB",
  "schema": "PUBLIC",
  "warehouse": "COMPUTE_WH",
  "role": "ACCOUNTADMIN",
  "query": "SELECT * FROM MY_TABLE LIMIT 10",
  "binds": []
}
```

### List Databases

Get a list of all databases in your Snowflake account.

**Parameters:**

- **Warehouse** (optional): Warehouse name
- **Role** (optional): Role name

**Example:**

```json
{
  "warehouse": "COMPUTE_WH",
  "role": "ACCOUNTADMIN"
}
```

### List Schemas

Get a list of all schemas in a specific database.

**Parameters:**

- **Database** (required): Database name
- **Warehouse** (optional): Warehouse name
- **Role** (optional): Role name

**Example:**

```json
{
  "database": "MY_DB",
  "warehouse": "COMPUTE_WH",
  "role": "ACCOUNTADMIN"
}
```

### List Tables

Get a list of all tables in a specific schema.

**Parameters:**

- **Database** (required): Database name
- **Schema** (required): Schema name
- **Warehouse** (optional): Warehouse name
- **Role** (optional): Role name

**Example:**

```json
{
  "database": "MY_DB",
  "schema": "PUBLIC",
  "warehouse": "COMPUTE_WH",
  "role": "ACCOUNTADMIN"
}
```

### Describe Table

Get detailed information about a table's structure.

**Parameters:**

- **Database** (required): Database name
- **Schema** (required): Schema name
- **TableName** (required): Table name
- **Warehouse** (optional): Warehouse name
- **Role** (optional): Role name

**Example:**

```json
{
  "database": "MY_DB",
  "schema": "PUBLIC",
  "tableName": "MY_TABLE",
  "warehouse": "COMPUTE_WH",
  "role": "ACCOUNTADMIN"
}
```

### Custom API Call

Make a custom API call to the Snowflake REST API.

**Parameters:**

- **BaseUrl** (required): Base URL for the Snowflake REST API
- **Endpoint** (required): API endpoint
- **Method** (required): HTTP method (GET, POST, PUT, DELETE)
- **Headers** (optional): HTTP headers
- **QueryParams** (optional): Query parameters
- **Body** (optional): Request body
- **AuthToken** (required): Authentication token

**Example:**

```json
{
  "baseUrl": "https://xy12345.us-east-1.snowflakecomputing.com/api/v2",
  "endpoint": "/statements",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "queryParams": {
    "warehouse": "COMPUTE_WH",
    "role": "ACCOUNTADMIN",
    "database": "MY_DB",
    "schema": "PUBLIC"
  },
  "body": {
    "statement": "SELECT * FROM MY_TABLE LIMIT 10"
  },
  "authToken": "your-auth-token"
}
```

## Usage Examples

### Execute a Query and Process Results

```javascript
// Execute a query to get customer data
const queryResult = await actions.snowflake.execute_query({
  database: "SALES_DB",
  schema: "PUBLIC",
  warehouse: "ANALYTICS_WH",
  query: "SELECT customer_id, name, email FROM customers WHERE signup_date > '2023-01-01'"
});

// Process the results
const customers = queryResult.rows;
for (const customer of customers) {
  console.log(`Customer: ${customer.NAME} (${customer.EMAIL})`);
}
```

### List Tables and Describe Structure

```javascript
// Get all tables in a schema
const tablesResult = await actions.snowflake.list_tables({
  database: "ANALYTICS_DB",
  schema: "REPORTING"
});

// For each table, get its structure
for (const table of tablesResult.tables) {
  const tableStructure = await actions.snowflake.describe_table({
    database: "ANALYTICS_DB",
    schema: "REPORTING",
    tableName: table.name
  });
  
  console.log(`Table: ${table.name}`);
  for (const column of tableStructure.columns) {
    console.log(`  - ${column.name}: ${column.type} (${column.nullable === 'Y' ? 'Nullable' : 'Not Nullable'})`);
  }
}
```

## Best Practices

1. **Use Warehouses Efficiently**: Snowflake charges based on warehouse usage. Consider specifying a smaller warehouse for simple queries and larger ones for complex operations.

2. **Limit Query Results**: Always include a LIMIT clause in your queries when possible to avoid retrieving unnecessarily large result sets.

3. **Use Bind Parameters**: For queries with variable inputs, use bind parameters to prevent SQL injection and improve query caching.

4. **Manage Roles Properly**: Use the appropriate role for each operation to ensure proper security controls.

5. **Close Sessions**: The plugin automatically handles connection management, but be aware that Snowflake has session limits.

## Troubleshooting

- **Connection Issues**: Ensure your account identifier is correct and includes the region (e.g., xy12345.us-east-1).
- **Query Errors**: Check your SQL syntax and verify that the specified database, schema, and table names exist.
- **Permission Errors**: Verify that the user has the necessary permissions for the operations you're trying to perform.
- **Warehouse Suspension**: If queries are timing out, your warehouse might be suspended. Specify a warehouse parameter to ensure it's active.

## Additional Resources

- [Snowflake Documentation](https://docs.snowflake.com/)
- [Snowflake SQL Reference](https://docs.snowflake.com/en/sql-reference.html)
- [Snowflake REST API Documentation](https://docs.snowflake.com/en/developer-guide/sql-api/index.html)
