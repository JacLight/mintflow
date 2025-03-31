# Monday.com Plugin for MintFlow

The Monday.com plugin provides integration with Monday.com's work operating system, allowing you to manage boards, items, columns, groups, and more.

## Features

- **Workspace Management**: List all workspaces and boards
- **Board Management**: Create and manage boards, groups, and columns
- **Item Management**: Create, update, and retrieve items and their column values
- **User Management**: List all users in your Monday.com account
- **Webhook Management**: Create and delete webhooks for real-time updates

## Authentication

This plugin requires authentication with Monday.com. You'll need:

- A Monday.com API Token

To get your API Token:

1. Log into your Monday.com account
2. Click on your avatar/profile picture in the top right corner
3. Select **Administration** (requires admin permissions)
4. Go to the **API** section
5. Copy your personal API v2 Token

## Usage

### List Workspaces

Retrieve all workspaces from your Monday.com account:

```json
{
  "action": "list_workspaces",
  "apiToken": "your-api-token"
}
```

### List Boards in a Workspace

Retrieve all boards from a specific workspace:

```json
{
  "action": "list_workspace_boards",
  "apiToken": "your-api-token",
  "workspaceId": "workspace-id"
}
```

### List Groups in a Board

Retrieve all groups from a specific board:

```json
{
  "action": "list_board_groups",
  "apiToken": "your-api-token",
  "boardId": "board-id"
}
```

### List Columns in a Board

Retrieve all columns from a specific board:

```json
{
  "action": "list_board_columns",
  "apiToken": "your-api-token",
  "boardId": "board-id"
}
```

### List Items in a Board

Retrieve all items from a specific board:

```json
{
  "action": "list_board_items",
  "apiToken": "your-api-token",
  "boardId": "board-id"
}
```

### Create an Item

Create a new item in a board:

```json
{
  "action": "create_item",
  "apiToken": "your-api-token",
  "boardId": "board-id",
  "itemName": "New Task",
  "groupId": "group-id",
  "columnValues": {
    "status": "Working on it",
    "text": "This is a description",
    "date": "2023-12-31",
    "numbers": 42
  },
  "createLabelsIfMissing": true
}
```

### Update an Item

Update an existing item in a board:

```json
{
  "action": "update_item",
  "apiToken": "your-api-token",
  "boardId": "board-id",
  "itemId": "item-id",
  "columnValues": {
    "status": "Done",
    "text": "Updated description",
    "date": "2024-01-15"
  }
}
```

### Update an Item's Name

Update the name of an existing item:

```json
{
  "action": "update_item_name",
  "apiToken": "your-api-token",
  "boardId": "board-id",
  "itemId": "item-id",
  "itemName": "Updated Task Name"
}
```

### Get Column Values for an Item

Retrieve column values for a specific item:

```json
{
  "action": "get_item_column_values",
  "apiToken": "your-api-token",
  "boardId": "board-id",
  "itemId": "item-id",
  "columnIds": ["status", "text", "date", "numbers"]
}
```

### Get All Items with Column Values

Retrieve all items with their column values from a board:

```json
{
  "action": "get_board_item_values",
  "apiToken": "your-api-token",
  "boardId": "board-id",
  "columnIds": ["status", "text", "date", "numbers"]
}
```

### Create a Column

Create a new column in a board:

```json
{
  "action": "create_column",
  "apiToken": "your-api-token",
  "boardId": "board-id",
  "columnTitle": "Priority",
  "columnType": "status"
}
```

### Create a Group

Create a new group in a board:

```json
{
  "action": "create_group",
  "apiToken": "your-api-token",
  "boardId": "board-id",
  "groupName": "New Group"
}
```

### Create an Update

Create an update (comment) for an item:

```json
{
  "action": "create_update",
  "apiToken": "your-api-token",
  "itemId": "item-id",
  "body": "This is a comment or update on the item."
}
```

### List Users

Retrieve all users from your Monday.com account:

```json
{
  "action": "list_users",
  "apiToken": "your-api-token"
}
```

### Create a Webhook

Create a webhook for a board:

```json
{
  "action": "create_webhook",
  "apiToken": "your-api-token",
  "boardId": "board-id",
  "url": "https://your-webhook-url.com",
  "event": "create_item",
  "config": {}
}
```

### Delete a Webhook

Delete an existing webhook:

```json
{
  "action": "delete_webhook",
  "apiToken": "your-api-token",
  "webhookId": "webhook-id"
}
```

## Column Types and Values

Monday.com has many different column types, each requiring specific formatting for values:

- **Text**: Simple text string
- **Long Text**: Longer text content
- **Numbers**: Numeric values
- **Status**: Status label (e.g., "Done", "Working on it")
- **Date**: Date in YYYY-MM-DD format
- **Timeline**: Start and end dates separated by semicolon (e.g., "2023-01-01;2023-01-31")
- **People**: User IDs
- **Checkbox**: Boolean value (true/false)
- **Dropdown**: Label or array of labels
- **Email**: Email address
- **Phone**: Phone number with country code (e.g., "1234567890-US")
- **Link**: URL
- **Location**: Latitude, longitude, and address separated by pipe (e.g., "37.7749|-122.4194|San Francisco")
- **Rating**: Number between 1 and 5
- **Week**: Start and end dates separated by semicolon (must be 7 days apart)
- **World Clock**: Timezone in "Continent/City" format (e.g., "America/New_York")

## Error Handling

The plugin provides detailed error messages for common issues:

- Invalid authentication credentials
- Missing required parameters
- Monday.com API errors

## Limitations

- The plugin requires a valid Monday.com API token
- Some operations may require specific Monday.com permissions
- Rate limits apply based on your Monday.com plan

## Resources

- [Monday.com API Documentation](https://developer.monday.com/api-reference/docs)
- [Monday.com GraphQL API Explorer](https://monday.com/developers/v2/api_reference)
- [Monday.com Developer Center](https://monday.com/developers/apps)
