weaviate pin# MintFlow PostgreSQL Plugin

A MintFlow plugin for connecting to PostgreSQL databases and performing database operations.

## Features

- **Execute Custom Queries**: Run any SQL query with parameterized statements for security
- **Get Tables**: Retrieve a list of all tables in a database schema
- **Select Rows**: Query data from tables with filtering, sorting, and pagination
- **Insert Rows**: Add new records to tables with support for returning generated values
- **Update Rows**: Modify existing records in tables with conditional updates
- **Delete Rows**: Remove records from tables with safety conditions

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Configuration

The PostgreSQL plugin requires the following configuration:

```json
{
  "host": "localhost",
  "port": 5432,
  "user": "postgres",
  "password": "your-password",
  "database": "your-database",
  "enableSsl": true,
  "rejectUnauthorized": false,
  "certificate": "optional-ca-certificate"
}
```

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| host | The hostname or IP address of the PostgreSQL server | Yes | - |
| port | The port number of the PostgreSQL server | No | 5432 |
| user | The username to authenticate with the PostgreSQL server | Yes | - |
| password | The password to authenticate with the PostgreSQL server | Yes | - |
| database | The name of the database to connect to | Yes | - |
| enableSsl | Whether to connect to the PostgreSQL database over SSL | No | true |
| rejectUnauthorized | Whether to verify the server certificate against trusted CAs | No | false |
| certificate | The CA certificate to use for verification of server certificate | No | - |

## Usage

### Execute Query

Execute a custom SQL query on the PostgreSQL database.

```javascript
const result = await mintflow.execute('postgres', {
  action: 'executeQuery',
  query: 'SELECT * FROM users WHERE age > $1',
  params: [18],
  queryTimeout: 30000,
  connectionTimeout: 30000,
  applicationName: 'MintFlow'
});

console.log(result.rows); // Array of matching rows
```

### Get Tables

Get a list of all tables in a database schema.

```javascript
const result = await mintflow.execute('postgres', {
  action: 'getTables',
  schema: 'public' // Optional, defaults to 'public'
});

console.log(result.rows); // Array of table names
```

### Select Rows

Select rows from a table with optional filtering, sorting, and pagination.

```javascript
const result = await mintflow.execute('postgres', {
  action: 'selectRows',
  table: 'users',
  schema: 'public', // Optional, defaults to 'public'
  columns: ['id', 'name', 'email'], // Optional, leave empty for all columns
  where: { // Optional
    status: 'active',
    role: 'admin'
  },
  orderBy: 'created_at', // Optional
  orderDirection: 'DESC', // Optional, 'ASC' or 'DESC'
  limit: 10 // Optional
});

console.log(result.rows); // Array of matching rows
```

### Insert Row

Insert a new row into a table.

```javascript
const result = await mintflow.execute('postgres', {
  action: 'insertRow',
  table: 'users',
  schema: 'public', // Optional, defaults to 'public'
  values: {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    created_at: new Date().toISOString()
  },
  returnColumns: ['id'] // Optional, columns to return after insert
});

console.log(result.rows); // Array containing returned columns
console.log(result.affectedRows); // Number of affected rows (should be 1)
```

### Update Rows

Update rows in a table that match specified conditions.

```javascript
const result = await mintflow.execute('postgres', {
  action: 'updateRows',
  table: 'users',
  schema: 'public', // Optional, defaults to 'public'
  values: {
    status: 'inactive',
    updated_at: new Date().toISOString()
  },
  where: { // Optional, if omitted all rows will be updated
    email: 'john@example.com'
  },
  returnColumns: ['id', 'status'] // Optional, columns to return after update
});

console.log(result.rows); // Array containing returned columns
console.log(result.affectedRows); // Number of rows updated
```

### Delete Rows

Delete rows from a table that match specified conditions.

```javascript
const result = await mintflow.execute('postgres', {
  action: 'deleteRows',
  table: 'users',
  schema: 'public', // Optional, defaults to 'public'
  where: { // Required for safety
    id: 123
  },
  returnColumns: ['id', 'name'] // Optional, columns to return from deleted rows
});

console.log(result.rows); // Array containing returned columns
console.log(result.affectedRows); // Number of rows deleted
```

## PostgreSQL-Specific Features

### Schema Support

PostgreSQL organizes tables into schemas. By default, the plugin uses the 'public' schema, but you can specify a different schema for each operation:

```javascript
const result = await mintflow.execute('postgres', {
  action: 'selectRows',
  table: 'users',
  schema: 'custom_schema'
});
```

### RETURNING Clause

PostgreSQL supports returning data from modified rows. You can use the `returnColumns` parameter to specify which columns to return:

```javascript
const result = await mintflow.execute('postgres', {
  action: 'insertRow',
  table: 'users',
  values: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  returnColumns: ['id', 'created_at'] // Return auto-generated ID and timestamp
});
```

## Security Considerations

- The plugin uses parameterized queries to prevent SQL injection attacks
- Column and table names are properly escaped using pg-format
- The `deleteRows` action requires a `where` condition to prevent accidental deletion of all rows
- SSL connections are enabled by default for secure communication

## Error Handling

All actions will throw an error if the operation fails. The error message will include details about what went wrong.

```javascript
try {
  const result = await mintflow.execute('postgres', {
    action: 'executeQuery',
    query: 'SELECT * FROM non_existent_table'
  });
} catch (error) {
  console.error('PostgreSQL error:', error.message);
  // Handle the error appropriately
}
```

## Example Workflow

Here's an example of how to use the PostgreSQL plugin in a MintFlow workflow:

```javascript
// Get user data from a form submission
const userData = {
  name: input.data.name,
  email: input.data.email,
  status: 'active',
  created_at: new Date().toISOString()
};

// Insert the user into the database
const insertResult = await mintflow.execute('postgres', {
  action: 'insertRow',
  table: 'users',
  values: userData,
  returnColumns: ['id']
});

// Get the user's ID
const userId = insertResult.rows[0].id;

// Insert user preferences
const preferencesResult = await mintflow.execute('postgres', {
  action: 'insertRow',
  table: 'user_preferences',
  values: {
    user_id: userId,
    theme: 'dark',
    notifications: true
  }
});

// Return success message
return {
  success: true,
  message: `User created with ID: ${userId}`,
  user: {
    id: userId,
    ...userData
  }
};
```

## Development

### Building the Plugin

```bash
cd packages/plugins/postgres
pnpm build
```

### Running Tests

```bash
cd packages/plugins/postgres
pnpm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
