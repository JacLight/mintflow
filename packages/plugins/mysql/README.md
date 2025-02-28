# MintFlow MySQL Plugin

A MintFlow plugin for connecting to MySQL databases and performing database operations.

## Features

- **Execute Custom Queries**: Run any SQL query with parameterized statements for security
- **Get Tables**: Retrieve a list of all tables in a database
- **Select Rows**: Query data from tables with filtering, sorting, and pagination
- **Insert Rows**: Add new records to tables
- **Update Rows**: Modify existing records in tables
- **Delete Rows**: Remove records from tables

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Configuration

The MySQL plugin requires the following configuration:

```json
{
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "your-password",
  "database": "your-database",
  "timezone": "local"
}
```

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| host | The hostname or IP address of the MySQL server | Yes | - |
| port | The port number of the MySQL server | No | 3306 |
| username | The username to authenticate with the MySQL server | Yes | - |
| password | The password to authenticate with the MySQL server | Yes | - |
| database | The name of the database to connect to | Yes | - |
| timezone | The timezone to use for date/time operations | No | "local" |

## Usage

### Execute Custom Query

Execute a custom SQL query on the MySQL database.

```javascript
const result = await mintflow.execute('mysql', {
  action: 'executeQuery',
  query: 'SELECT * FROM users WHERE age > ?',
  params: [18]
});

console.log(result.results); // Array of matching rows
```

### Get Tables

Get a list of all tables in the database.

```javascript
const result = await mintflow.execute('mysql', {
  action: 'getTables'
});

console.log(result.results); // Array of table names
```

### Select Rows

Select rows from a table with optional filtering, sorting, and pagination.

```javascript
const result = await mintflow.execute('mysql', {
  action: 'selectRows',
  table: 'users',
  columns: ['id', 'name', 'email'], // Optional, leave empty for all columns
  where: { // Optional
    status: 'active',
    role: 'admin'
  },
  orderBy: 'created_at', // Optional
  orderDirection: 'DESC', // Optional, 'ASC' or 'DESC'
  limit: 10 // Optional
});

console.log(result.results); // Array of matching rows
```

### Insert Row

Insert a new row into a table.

```javascript
const result = await mintflow.execute('mysql', {
  action: 'insertRow',
  table: 'users',
  values: {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    created_at: new Date().toISOString()
  }
});

console.log(result.insertId); // ID of the newly inserted row
console.log(result.affectedRows); // Number of affected rows (should be 1)
```

### Update Rows

Update rows in a table that match specified conditions.

```javascript
const result = await mintflow.execute('mysql', {
  action: 'updateRows',
  table: 'users',
  values: {
    status: 'inactive',
    updated_at: new Date().toISOString()
  },
  where: { // Optional, if omitted all rows will be updated
    email: 'john@example.com'
  }
});

console.log(result.affectedRows); // Number of rows updated
```

### Delete Rows

Delete rows from a table that match specified conditions.

```javascript
const result = await mintflow.execute('mysql', {
  action: 'deleteRows',
  table: 'users',
  where: { // Required for safety
    id: 123
  }
});

console.log(result.affectedRows); // Number of rows deleted
```

## Security Considerations

- The plugin uses parameterized queries to prevent SQL injection attacks
- Column names are properly escaped to prevent SQL injection
- The `multipleStatements` option is disabled by default for security reasons
- The `deleteRows` action requires a `where` condition to prevent accidental deletion of all rows

## Error Handling

All actions will throw an error if the operation fails. The error message will include details about what went wrong.

```javascript
try {
  const result = await mintflow.execute('mysql', {
    action: 'executeQuery',
    query: 'SELECT * FROM non_existent_table'
  });
} catch (error) {
  console.error('MySQL error:', error.message);
  // Handle the error appropriately
}
```

## Example Workflow

Here's an example of how to use the MySQL plugin in a MintFlow workflow:

```javascript
// Get user data from a form submission
const userData = {
  name: input.data.name,
  email: input.data.email,
  status: 'active',
  created_at: new Date().toISOString()
};

// Insert the user into the database
const insertResult = await mintflow.execute('mysql', {
  action: 'insertRow',
  table: 'users',
  values: userData
});

// Get the user's ID
const userId = insertResult.insertId;

// Insert user preferences
const preferencesResult = await mintflow.execute('mysql', {
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
cd packages/plugins/mysql
pnpm build
```

### Running Tests

```bash
cd packages/plugins/mysql
pnpm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
