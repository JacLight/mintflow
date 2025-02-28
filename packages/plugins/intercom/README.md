# Intercom Plugin for MintFlow

The Intercom plugin provides integration with Intercom's customer messaging platform, allowing you to manage contacts, conversations, companies, tickets, and more.

## Features

- **Contact Management**: Create, update, and search for contacts (users and leads)
- **Conversation Management**: Create, retrieve, and reply to conversations
- **Company Management**: Find and search for companies
- **Ticket Management**: Create and update support tickets
- **Tag Management**: Add and remove tags from contacts, companies, and conversations
- **Article Management**: Create help center articles
- **Webhook Processing**: Process Intercom webhook payloads

## Authentication

This plugin requires authentication with Intercom. You'll need:

1. An Intercom Access Token
2. Your Intercom region (US, EU, or AU)

To get your Access Token:

1. Log in to your Intercom account
2. Go to **Settings > Apps & Integrations > Developer Hub**
3. Click on **New App** and fill in the required information
4. Once created, go to the **Authentication** section
5. Generate an Access Token with the necessary scopes for your integration

## Usage

### List Contacts

Retrieve all contacts (users and leads) from your Intercom workspace:

```json
{
  "action": "list_contacts",
  "accessToken": "your-access-token",
  "region": "intercom"
}
```

### Find a Contact

Find a specific contact by ID:

```json
{
  "action": "find_contact",
  "accessToken": "your-access-token",
  "region": "intercom",
  "contactId": "contact-id"
}
```

### Create a User

Create a new user in Intercom:

```json
{
  "action": "create_user",
  "accessToken": "your-access-token",
  "region": "intercom",
  "contactData": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "custom_attributes": {
      "plan": "premium",
      "signup_date": "2023-01-01"
    }
  }
}
```

### Add a Note to a User

Add a note to a user's profile:

```json
{
  "action": "add_note_to_user",
  "accessToken": "your-access-token",
  "region": "intercom",
  "contactId": "contact-id",
  "noteBody": "This user requested a demo call next week."
}
```

### Create a Conversation

Create a new conversation:

```json
{
  "action": "create_conversation",
  "accessToken": "your-access-token",
  "region": "intercom",
  "conversationData": {
    "from": {
      "type": "admin",
      "id": "admin-id"
    },
    "to": {
      "type": "user",
      "id": "user-id"
    },
    "body": "Hello, how can I help you today?"
  }
}
```

### Reply to a Conversation

Reply to an existing conversation:

```json
{
  "action": "reply_to_conversation",
  "accessToken": "your-access-token",
  "region": "intercom",
  "conversationId": "conversation-id",
  "replyData": {
    "type": "admin",
    "body": "Thanks for reaching out. I'll look into this for you."
  }
}
```

### Create a Ticket

Create a support ticket:

```json
{
  "action": "create_ticket",
  "accessToken": "your-access-token",
  "region": "intercom",
  "ticketData": {
    "title": "Account Access Issue",
    "contact_id": "contact-id",
    "priority": "high",
    "state": "in_progress"
  }
}
```

### Process a Webhook

Process an Intercom webhook payload:

```json
{
  "action": "process_webhook",
  "accessToken": "your-access-token",
  "region": "intercom",
  "webhookPayload": {
    "body": {
      "type": "notification_event",
      "app_id": "app-id",
      "topic": "user.created",
      "data": {
        "item": {
          "type": "user",
          "id": "user-id"
        }
      }
    }
  },
  "webhookSecret": "your-webhook-secret"
}
```

## Available Actions

### Contact Actions

- `list_contacts`: List all contacts
- `find_contact`: Find a contact by ID
- `search_contacts`: Search for contacts
- `create_user`: Create a new user
- `update_user`: Update an existing user
- `create_or_update_user`: Create or update a user
- `create_or_update_lead`: Create or update a lead
- `add_note_to_user`: Add a note to a user
- `add_tag_to_contact`: Add a tag to a contact
- `remove_tag_from_contact`: Remove a tag from a contact

### Company Actions

- `list_companies`: List all companies
- `find_company`: Find a company by ID
- `search_companies`: Search for companies
- `add_tag_to_company`: Add a tag to a company
- `remove_tag_from_company`: Remove a tag from a company

### Conversation Actions

- `list_conversations`: List all conversations
- `get_conversation`: Get a specific conversation
- `search_conversations`: Search for conversations
- `create_conversation`: Create a new conversation
- `reply_to_conversation`: Reply to a conversation
- `add_note_to_conversation`: Add a note to a conversation
- `add_tag_to_conversation`: Add a tag to a conversation
- `remove_tag_from_conversation`: Remove a tag from a conversation

### Message Actions

- `send_message`: Send a message to a contact

### Article Actions

- `create_article`: Create a help center article

### Ticket Actions

- `create_ticket`: Create a support ticket
- `update_ticket`: Update an existing ticket

### Tag Actions

- `list_tags`: List all tags

### Admin Actions

- `list_admins`: List all admins
- `get_admin`: Get a specific admin

### Webhook Actions

- `process_webhook`: Process a webhook payload

## Error Handling

The plugin provides detailed error messages for common issues:

- Invalid authentication credentials
- Missing required parameters
- Intercom API errors

## Limitations

- The plugin requires a valid Intercom access token
- Some operations may require specific Intercom permissions
- Rate limits apply based on your Intercom plan

## Resources

- [Intercom API Documentation](https://developers.intercom.com/intercom-api-reference/reference)
- [Intercom Developer Hub](https://developers.intercom.com/)
- [Intercom Webhooks](https://developers.intercom.com/intercom-api-reference/reference/webhooks)
