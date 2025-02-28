# HubSpot Plugin for MintFlow

This plugin provides integration with HubSpot, a powerful CRM platform that offers tools for sales, customer service, and marketing automation.

## Features

The HubSpot plugin currently supports the following operations:

### Contact Management

- **Create Contact**: Create a new contact in HubSpot with customizable properties
- **Get Contact**: Retrieve a contact by ID with all its properties
- **Update Contact**: Update an existing contact's properties
- **Find Contact**: Search for contacts using queries and filters

## Authentication

This plugin requires OAuth authentication with HubSpot. You'll need to:

1. Create a HubSpot developer account at [developers.hubspot.com](https://developers.hubspot.com/)
2. Create a new app in the HubSpot developer portal
3. Configure the OAuth settings for your app
4. Obtain an access token using the OAuth flow

The plugin requires the following scopes:
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`

## Usage Examples

### Create a Contact

```javascript
const result = await mintflow.run({
  plugin: "hubspot",
  action: "createContact",
  auth: {
    access_token: "your-hubspot-access-token"
  },
  params: {
    properties: {
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      company: "Acme Inc."
    }
  }
});
```

### Get a Contact

```javascript
const result = await mintflow.run({
  plugin: "hubspot",
  action: "getContact",
  auth: {
    access_token: "your-hubspot-access-token"
  },
  params: {
    contactId: "12345",
    additionalPropertiesToRetrieve: ["website", "address", "city", "state"]
  }
});
```

### Update a Contact

```javascript
const result = await mintflow.run({
  plugin: "hubspot",
  action: "updateContact",
  auth: {
    access_token: "your-hubspot-access-token"
  },
  params: {
    contactId: "12345",
    properties: {
      email: "john.updated@example.com",
      phone: "987-654-3210"
    }
  }
});
```

### Find Contacts

```javascript
const result = await mintflow.run({
  plugin: "hubspot",
  action: "findContact",
  auth: {
    access_token: "your-hubspot-access-token"
  },
  params: {
    searchQuery: "john",
    limit: 10,
    properties: ["firstname", "lastname", "email", "phone"],
    filterGroups: [
      {
        filters: [
          {
            propertyName: "company",
            operator: "EQ",
            value: "Acme Inc."
          }
        ]
      }
    ]
  }
});
```

## API Reference

### createContact

Creates a new contact in HubSpot.

**Parameters:**

- `auth.access_token` (string, required): HubSpot OAuth access token
- `properties` (object, required): Contact properties to set
- `additionalPropertiesToRetrieve` (string[], optional): Additional properties to retrieve in the response

**Returns:**

- `id` (string): The ID of the created contact
- `properties` (object): All properties of the created contact
- `createdAt` (string): ISO timestamp of when the contact was created
- `updatedAt` (string): ISO timestamp of when the contact was last updated
- `archived` (boolean): Whether the contact is archived

### getContact

Retrieves a contact by ID.

**Parameters:**

- `auth.access_token` (string, required): HubSpot OAuth access token
- `contactId` (string, required): The ID of the contact to retrieve
- `additionalPropertiesToRetrieve` (string[], optional): Additional properties to retrieve

**Returns:**

- `id` (string): The ID of the contact
- `properties` (object): All properties of the contact
- `createdAt` (string): ISO timestamp of when the contact was created
- `updatedAt` (string): ISO timestamp of when the contact was last updated
- `archived` (boolean): Whether the contact is archived

### updateContact

Updates an existing contact in HubSpot.

**Parameters:**

- `auth.access_token` (string, required): HubSpot OAuth access token
- `contactId` (string, required): The ID of the contact to update
- `properties` (object, required): Contact properties to update
- `additionalPropertiesToRetrieve` (string[], optional): Additional properties to retrieve in the response

**Returns:**

- `id` (string): The ID of the updated contact
- `properties` (object): All properties of the updated contact
- `createdAt` (string): ISO timestamp of when the contact was created
- `updatedAt` (string): ISO timestamp of when the contact was last updated
- `archived` (boolean): Whether the contact is archived

### findContact

Searches for contacts in HubSpot.

**Parameters:**

- `auth.access_token` (string, required): HubSpot OAuth access token
- `searchQuery` (string, required): The search query to find contacts
- `limit` (number, optional): Maximum number of results to return (default: 10)
- `after` (string, optional): Pagination cursor for fetching the next page of results
- `properties` (string[], optional): Properties to include in the results
- `filterGroups` (object[], optional): Filter groups to apply to the search

**Returns:**

- `results` (array): Array of contacts matching the search criteria
  - Each contact has the same structure as the getContact response
- `paging` (object, optional): Pagination information
  - `next.after` (string): Cursor for the next page of results

## Error Handling

The plugin throws descriptive error messages when operations fail. Common errors include:

- Authentication errors (invalid or expired access token)
- Not found errors (contact ID doesn't exist)
- Validation errors (missing required properties)
- Rate limiting errors (too many requests to the HubSpot API)

## Dependencies

- @hubspot/api-client: Official HubSpot API client for Node.js
- axios: HTTP client for making requests to the HubSpot API

## Resources

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [HubSpot CRM API](https://developers.hubspot.com/docs/api/crm/contacts)
