# MintFlow Airtable Plugin

A MintFlow plugin for interacting with Airtable databases.

## Features

- **Create Records**: Add new records to Airtable tables
- **Find Records**: Search for records in Airtable tables
- **Update Records**: Modify existing records in Airtable tables
- **Delete Records**: Remove records from Airtable tables

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Usage

### Authentication

The Airtable plugin requires a Personal Access Token for authentication. You can create a token in your Airtable account settings:

1. Log in to your Airtable account
2. Visit <https://airtable.com/create/tokens/> to create a new token
3. Click on "+ Add a base" and select the base you want to use or all bases
4. Click on "+ Add a scope" and select "data.records.read", "data.records.write" and "schema.bases.read"
5. Click on "Create token" and copy the token

### Actions

#### Create Record

Creates a new record in an Airtable table.

```json
{
  "action": "create_record",
  "token": "your-airtable-token",
  "baseId": "app12345abcdef",
  "tableId": "tbl12345abcdef",
  "fields": {
    "Name": "John Doe",
    "Email": "john@example.com",
    "Status": "Active"
  }
}
```

#### Find Record

Searches for records in an Airtable table.

```json
{
  "action": "find_record",
  "token": "your-airtable-token",
  "baseId": "app12345abcdef",
  "tableId": "tbl12345abcdef",
  "searchField": "Status",
  "searchValue": "Active",
  "viewId": "viw12345abcdef",
  "maxRecords": 10
}
```

#### Update Record

Updates an existing record in an Airtable table.

```json
{
  "action": "update_record",
  "token": "your-airtable-token",
  "baseId": "app12345abcdef",
  "tableId": "tbl12345abcdef",
  "recordId": "rec12345abcdef",
  "fields": {
    "Status": "Inactive"
  }
}
```

#### Delete Record

Deletes a record from an Airtable table.

```json
{
  "action": "delete_record",
  "token": "your-airtable-token",
  "baseId": "app12345abcdef",
  "tableId": "tbl12345abcdef",
  "recordId": "rec12345abcdef"
}
```

## Example Workflow

Here's an example of how to use the Airtable plugin in a MintFlow workflow:

```javascript
// Create a new customer record in Airtable when a form is submitted
const formData = input.data;

// Create a record with the form data
const result = await mintflow.execute('airtable', {
  action: 'create_record',
  token: process.env.AIRTABLE_TOKEN,
  baseId: 'app12345abcdef',
  tableId: 'tbl12345abcdef',
  fields: {
    'Name': `${formData.firstName} ${formData.lastName}`,
    'Email': formData.email,
    'Phone': formData.phone,
    'Status': 'New Lead'
  }
});

// Return the record ID
return {
  recordId: result.id,
  message: `Customer ${formData.firstName} ${formData.lastName} added to Airtable`
};
```

## Finding Base and Table IDs

To find your Base ID and Table ID:

1. Open your Airtable base in the browser
2. Look at the URL, which will be in the format: `https://airtable.com/app12345abcdef/tbl12345abcdef/viw12345abcdef`
3. The Base ID is the part after `/` starting with `app`
4. The Table ID is the part after the Base ID starting with `tbl`

## Error Handling

The plugin provides descriptive error messages for common issues:

- Invalid token
- Missing required parameters
- Unsupported actions
- API errors from Airtable

## Security Considerations

- Never hardcode your Airtable token in your workflows. Use environment variables or a secure secret management system.
- Use the minimum required scopes for your Airtable token.
- Consider using a dedicated Airtable account for production workflows.

## Development

### Building the Plugin

```bash
cd packages/plugins/airtable
pnpm build
```

### Running Tests

```bash
cd packages/plugins/airtable
pnpm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
