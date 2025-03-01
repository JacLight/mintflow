# Freshdesk Plugin for MintFlow

The Freshdesk plugin for MintFlow provides integration with Freshdesk's customer support and helpdesk platform, allowing you to automate ticket management, contact management, and more.

## Features

- **Ticket Management**: Create, retrieve, and update tickets
- **Contact Management**: Retrieve contact information
- **Polling Integration**: Trigger workflows when new tickets are created or existing tickets are updated
- **Custom API Access**: Make custom API calls to the Freshdesk API

## Authentication

The Freshdesk plugin requires API key authentication with the following credentials:

1. **API Key**: Your Freshdesk API key
2. **Domain**: Your Freshdesk domain (e.g., 'company' for company.freshdesk.com)

To obtain these credentials:

1. Log in to your Freshdesk account
2. Go to Profile Settings > API Key
3. Copy your API key
4. Note your domain from the URL (e.g., 'company' from company.freshdesk.com)

## Actions

### Get Ticket

Retrieve a ticket from Freshdesk by ID.

#### Input

```json
{
  "ticketId": 1
}
```

#### Parameters

- **ticketId** (required): The ID of the ticket to retrieve

#### Output

```json
{
  "ticket": {
    "id": 1,
    "subject": "Support Needed",
    "description": "I need help with your product",
    "status": 2,
    "priority": 1,
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:30:00Z",
    "requester_id": 123,
    "responder_id": 456,
    "group_id": 789,
    "type": "Question",
    "tags": ["urgent", "customer"],
    "source": 1,
    "custom_fields": {
      "cf_department": "Sales",
      "cf_product": "Product A"
    }
  }
}
```

### Create Ticket

Create a new ticket in Freshdesk.

#### Input

```json
{
  "subject": "Support Needed",
  "description": "I need help with your product",
  "email": "customer@example.com",
  "priority": 2,
  "status": 2,
  "tags": ["urgent", "customer"],
  "custom_fields": {
    "cf_department": "Sales",
    "cf_product": "Product A"
  }
}
```

#### Parameters

- **subject** (required): The subject of the ticket
- **description** (required): The description of the ticket
- **email** (required): The email of the requester
- **priority** (optional): The priority of the ticket (1-4: Low, Medium, High, Urgent). Default: 2
- **status** (optional): The status of the ticket (2-5: Open, Pending, Resolved, Closed). Default: 2
- **type** (optional): The type of the ticket
- **tags** (optional): The tags to add to the ticket
- **cc_emails** (optional): The CC emails for the ticket
- **custom_fields** (optional): The custom fields for the ticket
- **due_by** (optional): The due date of the ticket (ISO 8601 format)
- **group_id** (optional): The ID of the group to assign the ticket to
- **responder_id** (optional): The ID of the agent to assign the ticket to

#### Output

```json
{
  "ticket": {
    "id": 1,
    "subject": "Support Needed",
    "description": "I need help with your product",
    "status": 2,
    "priority": 2,
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z",
    "requester_id": 123,
    "responder_id": null,
    "group_id": null,
    "type": null,
    "tags": ["urgent", "customer"],
    "source": 1,
    "custom_fields": {
      "cf_department": "Sales",
      "cf_product": "Product A"
    }
  }
}
```

### Get Contact

Retrieve a contact from Freshdesk by ID.

#### Input

```json
{
  "contactId": 123
}
```

#### Parameters

- **contactId** (required): The ID of the contact to retrieve

#### Output

```json
{
  "contact": {
    "id": 123,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "555-555-5555",
    "mobile": "555-555-5556",
    "address": "123 Main St, Anytown, CA 12345",
    "company_id": 456,
    "description": "VIP Customer",
    "job_title": "CEO",
    "language": "en",
    "time_zone": "Eastern Time (US & Canada)",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:30:00Z",
    "custom_fields": {
      "cf_department": "Executive",
      "cf_account_type": "Enterprise"
    },
    "tags": ["vip", "enterprise"]
  }
}
```

### Custom API Call

Make a custom API call to the Freshdesk API.

#### Input

```json
{
  "endpoint": "/tickets",
  "method": "GET",
  "params": {
    "per_page": 10,
    "page": 1
  }
}
```

#### Parameters

- **endpoint** (required): The Freshdesk API endpoint to call (e.g., "/tickets", "/contacts")
- **method** (required): The HTTP method to use. Options: "GET", "POST", "PUT", "DELETE". Default: "GET"
- **data** (optional): The request data (for POST, PUT methods)
- **params** (optional): The query parameters to include in the request

#### Output

```json
{
  "data": [
    {
      "id": 1,
      "subject": "Support Needed",
      "description": "I need help with your product",
      "status": 2,
      "priority": 1,
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-01-01T12:30:00Z"
    }
  ]
}
```

## Triggers

### New Ticket

Triggers when a new ticket is created in Freshdesk.

#### Output

```json
{
  "ticket": {
    "id": 1,
    "subject": "Support Needed",
    "description": "I need help with your product",
    "status": 2,
    "priority": 1,
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:30:00Z",
    "requester_id": 123,
    "responder_id": 456,
    "group_id": 789,
    "type": "Question",
    "tags": ["urgent", "customer"],
    "source": 1,
    "custom_fields": {
      "cf_department": "Sales",
      "cf_product": "Product A"
    }
  }
}
```

### Updated Ticket

Triggers when a ticket is updated in Freshdesk.

#### Output

```json
{
  "ticket": {
    "id": 1,
    "subject": "Support Needed",
    "description": "I need help with your product",
    "status": 3,
    "priority": 1,
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T13:30:00Z",
    "requester_id": 123,
    "responder_id": 456,
    "group_id": 789,
    "type": "Question",
    "tags": ["urgent", "customer"],
    "source": 1,
    "custom_fields": {
      "cf_department": "Sales",
      "cf_product": "Product A"
    }
  }
}
```

## Resources

- [Freshdesk API Documentation](https://developers.freshdesk.com/api/)
- [Freshdesk Website](https://freshdesk.com/)
