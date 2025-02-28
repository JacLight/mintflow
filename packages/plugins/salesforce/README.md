# Salesforce Plugin for MintFlow

The Salesforce plugin provides integration with Salesforce CRM, allowing you to create, update, query, and upsert records in your Salesforce organization.

## Features

- **Create Objects**: Create new records in any Salesforce object (Account, Contact, Lead, etc.)
- **Update Objects**: Update existing records by ID
- **Run SOQL Queries**: Execute Salesforce Object Query Language (SOQL) queries
- **Upsert by External ID**: Create or update records based on an external ID field
- **Bulk Upsert**: Efficiently upsert multiple records in a single operation using CSV format

## Authentication

This plugin requires OAuth 2.0 authentication with Salesforce. You'll need:

1. A Salesforce access token
2. Your Salesforce instance URL

## Usage

### Create Object

Create a new record in a Salesforce object:

```json
{
  "action": "create_object",
  "access_token": "your_access_token",
  "instance_url": "https://your-instance.salesforce.com",
  "object_name": "Account",
  "data": {
    "Name": "Acme Corporation",
    "Industry": "Technology",
    "Phone": "(123) 456-7890"
  }
}
```

### Update Object

Update an existing record by ID:

```json
{
  "action": "update_object",
  "access_token": "your_access_token",
  "instance_url": "https://your-instance.salesforce.com",
  "object_name": "Account",
  "record_id": "001xx000003DGb2AAG",
  "data": {
    "Industry": "Healthcare",
    "Phone": "(987) 654-3210"
  }
}
```

### Run SOQL Query

Execute a SOQL query to retrieve records:

```json
{
  "action": "run_query",
  "access_token": "your_access_token",
  "instance_url": "https://your-instance.salesforce.com",
  "query": "SELECT Id, Name, Industry FROM Account WHERE Industry = 'Technology'"
}
```

### Upsert by External ID

Create or update records based on an external ID field:

```json
{
  "action": "upsert_by_external_id",
  "access_token": "your_access_token",
  "instance_url": "https://your-instance.salesforce.com",
  "object_name": "Account",
  "external_field": "External_ID__c",
  "records": {
    "records": [
      {
        "External_ID__c": "EXT001",
        "Name": "Acme Corporation",
        "Industry": "Technology"
      },
      {
        "External_ID__c": "EXT002",
        "Name": "Globex Corporation",
        "Industry": "Manufacturing"
      }
    ]
  }
}
```

### Bulk Upsert

Efficiently upsert multiple records using CSV format:

```json
{
  "action": "bulk_upsert",
  "access_token": "your_access_token",
  "instance_url": "https://your-instance.salesforce.com",
  "object_name": "Account",
  "external_field": "External_ID__c",
  "csv_records": "External_ID__c,Name,Industry\nEXT001,Acme Corporation,Technology\nEXT002,Globex Corporation,Manufacturing"
}
```

## Error Handling

The plugin provides detailed error messages for common issues:

- Invalid authentication credentials
- Missing required parameters
- Salesforce API errors

## Limitations

- The plugin requires a valid Salesforce access token, which typically expires after a few hours. You'll need to implement token refresh logic in your workflow.
- Bulk operations are subject to Salesforce API limits.
- Some operations may require specific Salesforce permissions.

## Resources

- [Salesforce REST API Documentation](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm)
- [SOQL and SOSL Reference](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql.htm)
- [Salesforce Bulk API 2.0 Documentation](https://developer.salesforce.com/docs/atlas.en-us.api_bulk_v2.meta/api_bulk_v2/introduction_bulk_api_2.htm)
