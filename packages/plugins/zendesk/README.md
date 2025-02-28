# Zendesk Plugin for MintFlow

The Zendesk plugin provides integration with Zendesk's customer service platform, allowing you to manage tickets, views, users, groups, and organizations.

## Features

- **Ticket Management**: Create, read, update, delete tickets and add comments
- **View Management**: Get views and tickets from views
- **User Management**: Get users and user details
- **Group Management**: Get groups and group details
- **Organization Management**: Get organizations and organization details
- **Webhook Processing**: Process Zendesk webhook events

## Authentication

This plugin requires authentication with Zendesk. You'll need:

1. Your Zendesk subdomain (e.g., if your Zendesk URL is example.zendesk.com, use "example")
2. Your agent email address (the email you use to log in to Zendesk)
3. An API token

To get an API token:

1. Log in to your Zendesk account
2. Click on the Admin icon (gear icon) in the sidebar
3. Go to Settings → API
4. Enable Token Access if it's not already enabled
5. Click the "Add API token" button
6. Give your token a description and click "Create"
7. Copy the API token (you won't be able to see it again)

## Usage

### Get Tickets from a View

Retrieve tickets from a specific view in your Zendesk account:

```json
{
  "action": "get_tickets_from_view",
  "email": "agent@example.com",
  "token": "your-api-token",
  "subdomain": "example",
  "viewId": "12345",
  "sortOrder": "desc",
  "sortBy": "created_at",
  "perPage": 100
}
```

### Create a Ticket

Create a new ticket in your Zendesk account:

```json
{
  "action": "create_ticket",
  "email": "agent@example.com",
  "token": "your-api-token",
  "subdomain": "example",
  "ticketData": {
    "subject": "Help with product",
    "description": "I need help with your product",
    "priority": "normal",
    "status": "new",
    "requester_id": 12345,
    "assignee_id": 67890,
    "group_id": 11223,
    "tags": ["product", "help"]
  }
}
```

### Add a Comment to a Ticket

Add a comment to an existing ticket:

```json
{
  "action": "add_ticket_comment",
  "email": "agent@example.com",
  "token": "your-api-token",
  "subdomain": "example",
  "ticketId": "12345",
  "comment": "This is a comment on the ticket",
  "isPublic": true
}
```

### Search Tickets

Search for tickets using Zendesk's search syntax:

```json
{
  "action": "search_tickets",
  "email": "agent@example.com",
  "token": "your-api-token",
  "subdomain": "example",
  "searchQuery": "status:open priority:high"
}
```

### Get Views

Retrieve a list of views from your Zendesk account:

```json
{
  "action": "get_views",
  "email": "agent@example.com",
  "token": "your-api-token",
  "subdomain": "example"
}
```

### Process a Webhook

Process a webhook payload from Zendesk:

```json
{
  "action": "process_webhook",
  "email": "agent@example.com",
  "token": "your-api-token",
  "subdomain": "example",
  "webhookPayload": {
    "id": 12345,
    "title": "Ticket Created",
    "ticket": {
      "id": 12345,
      "subject": "Help with product"
    }
  }
}
```

## Available Actions

### Ticket Actions

- `get_ticket`: Get a specific ticket by ID
- `create_ticket`: Create a new ticket
- `update_ticket`: Update an existing ticket
- `delete_ticket`: Delete a ticket
- `add_ticket_comment`: Add a comment to a ticket
- `search_tickets`: Search for tickets

### View Actions

- `get_views`: Get all views
- `get_view`: Get a specific view by ID
- `get_tickets_from_view`: Get tickets from a specific view

### User Actions

- `get_users`: Get all users
- `get_user`: Get a specific user by ID

### Group Actions

- `get_groups`: Get all groups
- `get_group`: Get a specific group by ID

### Organization Actions

- `get_organizations`: Get all organizations
- `get_organization`: Get a specific organization by ID

### Webhook Actions

- `process_webhook`: Process a webhook payload from Zendesk

## Error Handling

The plugin provides detailed error messages for common issues:

- Invalid authentication credentials
- Missing required parameters
- Zendesk API errors

## Limitations

- The plugin requires a valid Zendesk API token
- Some operations may require specific Zendesk permissions
- The plugin uses Zendesk API v2

## Resources

- [Zendesk API Documentation](https://developer.zendesk.com/api-reference/)
- [Zendesk API Introduction](https://developer.zendesk.com/documentation/ticketing/getting-started/zendesk-api-introduction/)
- [Zendesk Search Reference](https://developer.zendesk.com/documentation/ticketing/using-the-zendesk-api/searching-with-the-zendesk-api/)
