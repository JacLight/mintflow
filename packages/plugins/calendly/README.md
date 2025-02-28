# Calendly Plugin for MintFlow

This plugin provides integration with Calendly, allowing you to manage events, scheduled events, invitees, and webhooks in your Calendly account.

## Features

- Get user information
- List and retrieve event types
- List and retrieve scheduled events
- List and retrieve invitees
- Cancel invitees
- Manage webhooks

## Installation

```bash
npm install @mintflow/calendly
```

## Authentication

To use this plugin, you need a Calendly Personal Token. You can get one by following these steps:

1. Go to [https://calendly.com/integrations/api_webhooks](https://calendly.com/integrations/api_webhooks)
2. Click on "Create New Token"
3. Copy the token and use it in your MintFlow workflows

## Usage

### Get User Information

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "get_user",
    token: "your-calendly-personal-token"
  }
});
```

### List Event Types

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "list_events",
    token: "your-calendly-personal-token",
    organization: false, // Optional, use organization scope instead of user scope
    count: 10, // Optional, number of results to return
    page_token: "next_page_token" // Optional, token for pagination
  }
});
```

### Get Event Type

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "get_event",
    token: "your-calendly-personal-token",
    eventUuid: "event-uuid"
  }
});
```

### List Scheduled Events

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "list_scheduled_events",
    token: "your-calendly-personal-token",
    organization: false, // Optional, use organization scope instead of user scope
    count: 10, // Optional, number of results to return
    page_token: "next_page_token", // Optional, token for pagination
    min_start_time: "2023-01-01T00:00:00Z", // Optional, minimum start time (ISO 8601)
    max_start_time: "2023-12-31T23:59:59Z", // Optional, maximum start time (ISO 8601)
    status: "active" // Optional, status of the scheduled event (active or canceled)
  }
});
```

### Get Scheduled Event

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "get_scheduled_event",
    token: "your-calendly-personal-token",
    scheduledEventUuid: "scheduled-event-uuid"
  }
});
```

### List Invitees

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "list_invitees",
    token: "your-calendly-personal-token",
    scheduledEventUuid: "scheduled-event-uuid",
    count: 10, // Optional, number of results to return
    page_token: "next_page_token", // Optional, token for pagination
    email: "john@example.com", // Optional, filter by email
    status: "active" // Optional, status of the invitee (active or canceled)
  }
});
```

### Get Invitee

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "get_invitee",
    token: "your-calendly-personal-token",
    inviteeUuid: "invitee-uuid"
  }
});
```

### Cancel Invitee

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "cancel_invitee",
    token: "your-calendly-personal-token",
    inviteeUuid: "invitee-uuid",
    reason: "Schedule conflict" // Optional, reason for cancellation
  }
});
```

### List Webhooks

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "list_webhooks",
    token: "your-calendly-personal-token",
    organization: false, // Optional, use organization scope instead of user scope
    scope: "user", // Optional, scope of the webhook (user or organization)
    count: 10, // Optional, number of results to return
    page_token: "next_page_token" // Optional, token for pagination
  }
});
```

### Create Webhook

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "create_webhook",
    token: "your-calendly-personal-token",
    url: "https://example.com/webhook", // URL to send webhook events to
    events: ["invitee.created", "invitee.canceled"], // Events to subscribe to
    scope: "user", // Scope of the webhook (user or organization)
    organization: false // Optional, use organization scope instead of user scope
  }
});
```

### Delete Webhook

```javascript
const result = await mintflow.run({
  plugin: "calendly",
  input: {
    action: "delete_webhook",
    token: "your-calendly-personal-token",
    webhookUuid: "webhook-uuid"
  }
});
```

## API Reference

### Actions

- `get_user`: Get user information
- `list_events`: List event types
- `get_event`: Get a specific event type
- `list_scheduled_events`: List scheduled events
- `get_scheduled_event`: Get a specific scheduled event
- `list_invitees`: List invitees for a scheduled event
- `get_invitee`: Get a specific invitee
- `cancel_invitee`: Cancel an invitee
- `list_webhooks`: List webhooks
- `create_webhook`: Create a webhook
- `delete_webhook`: Delete a webhook

### Parameters

#### Common Parameters

- `action`: The action to perform (required)
- `token`: Your Calendly Personal Token (required)

#### Action-Specific Parameters

##### list_events, list_scheduled_events, list_webhooks, create_webhook

- `organization`: Use organization scope instead of user scope (optional)
- `count`: Number of results to return (optional)
- `page_token`: Token for pagination (optional)

##### get_event

- `eventUuid`: UUID of the event (required)

##### list_scheduled_events

- `min_start_time`: Minimum start time (ISO 8601) (optional)
- `max_start_time`: Maximum start time (ISO 8601) (optional)
- `status`: Status of the scheduled event (active or canceled) (optional)

##### get_scheduled_event

- `scheduledEventUuid`: UUID of the scheduled event (required)

##### list_invitees

- `scheduledEventUuid`: UUID of the scheduled event (required)
- `email`: Email of the invitee (optional)
- `status`: Status of the invitee (active or canceled) (optional)

##### get_invitee, cancel_invitee

- `inviteeUuid`: UUID of the invitee (required)
- `reason`: Reason for cancellation (optional, only for cancel_invitee)

##### list_webhooks, create_webhook

- `scope`: Scope of the webhook (user or organization) (optional for list_webhooks, required for create_webhook)

##### create_webhook

- `url`: URL to send webhook events to (required)
- `events`: Events to subscribe to (required)

##### delete_webhook

- `webhookUuid`: UUID of the webhook (required)

## Resources

- [Calendly API Documentation](https://developer.calendly.com/api-docs)
- [Calendly API Authentication](https://developer.calendly.com/getting-started/authentication)
