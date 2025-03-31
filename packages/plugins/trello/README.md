# Trello Plugin for MintFlow

The Trello plugin provides integration with Trello's project management platform, allowing you to manage boards, lists, cards, labels, and webhooks.

## Features

- **Board Management**: Get boards and board details
- **List Management**: Get lists, create and update lists
- **Card Management**: Create, read, update, and delete cards
- **Label Management**: Get labels, add and remove labels from cards
- **Webhook Management**: Create, delete, and list webhooks, process webhook payloads

## Authentication

This plugin requires authentication with Trello. You'll need:

1. A Trello API Key
2. A Trello Token

To get your API Key and Token:

1. Go to <https://trello.com/power-ups/admin>
2. Click **New** to create a new power-up
3. Enter power-up information, and click **Create**
4. From the API Key page, click **Generate a new API key**
5. Copy **API Key** and use it as the `apiKey` parameter
6. Click **manually generate a Token** next to the API key field
7. Copy the token and use it as the `token` parameter

## Usage

### Get Boards

Retrieve all boards the authenticated user has access to:

```json
{
  "action": "get_boards",
  "apiKey": "your-api-key",
  "token": "your-token"
}
```

### Get Board Lists

Retrieve all lists in a specific board:

```json
{
  "action": "get_board_lists",
  "apiKey": "your-api-key",
  "token": "your-token",
  "boardId": "board-id"
}
```

### Create a Card

Create a new card in a list:

```json
{
  "action": "create_card",
  "apiKey": "your-api-key",
  "token": "your-token",
  "listId": "list-id",
  "cardName": "New Task",
  "cardDescription": "This is a new task",
  "cardPosition": "top",
  "cardDue": "2023-12-31T23:59:59Z"
}
```

### Update a Card

Update an existing card:

```json
{
  "action": "update_card",
  "apiKey": "your-api-key",
  "token": "your-token",
  "cardId": "card-id",
  "cardName": "Updated Task",
  "cardDescription": "This task has been updated",
  "cardPosition": "bottom",
  "listId": "new-list-id",
  "cardDueComplete": true
}
```

### Add a Comment to a Card

Add a comment to an existing card:

```json
{
  "action": "add_comment_to_card",
  "apiKey": "your-api-key",
  "token": "your-token",
  "cardId": "card-id",
  "cardComment": "This is a comment on the card"
}
```

### Create a Webhook

Create a webhook to receive notifications for changes to a board or list:

```json
{
  "action": "create_webhook",
  "apiKey": "your-api-key",
  "token": "your-token",
  "webhookModelId": "board-id-or-list-id",
  "webhookCallbackUrl": "https://your-webhook-endpoint.com/webhook",
  "webhookDescription": "Webhook for board changes"
}
```

### Process a Webhook Payload

Process a webhook payload received from Trello:

```json
{
  "action": "process_webhook",
  "apiKey": "your-api-key",
  "token": "your-token",
  "webhookPayload": {
    "action": {
      "type": "createCard",
      "data": {
        "card": {
          "id": "card-id",
          "name": "Card Name"
        }
      }
    }
  }
}
```

## Available Actions

### Board Actions

- `get_boards`: Get all boards the authenticated user has access to
- `get_board`: Get a specific board by ID

### List Actions

- `get_board_lists`: Get all lists in a board
- `create_list`: Create a new list in a board
- `update_list`: Update an existing list

### Card Actions

- `get_card`: Get a specific card by ID
- `create_card`: Create a new card in a list
- `update_card`: Update an existing card
- `delete_card`: Delete a card
- `add_comment_to_card`: Add a comment to a card
- `get_board_cards`: Get all cards in a board
- `get_list_cards`: Get all cards in a list

### Label Actions

- `get_board_labels`: Get all labels in a board
- `add_label_to_card`: Add a label to a card
- `remove_label_from_card`: Remove a label from a card

### Webhook Actions

- `create_webhook`: Create a new webhook
- `delete_webhook`: Delete a webhook
- `list_webhooks`: List all webhooks
- `process_webhook`: Process a webhook payload

## Error Handling

The plugin provides detailed error messages for common issues:

- Invalid authentication credentials
- Missing required parameters
- Trello API errors

## Limitations

- The plugin requires a valid Trello API key and token
- Some operations may require specific Trello permissions
- Webhook callbacks require a publicly accessible URL

## Resources

- [Trello API Documentation](https://developer.atlassian.com/cloud/trello/rest/)
- [Trello API Introduction](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/)
- [Trello Webhooks](https://developer.atlassian.com/cloud/trello/guides/rest-api/webhooks/)
