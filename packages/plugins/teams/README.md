# Microsoft Teams Plugin for MintFlow

This plugin provides integration with the Microsoft Teams API, allowing you to create channels, send messages, and manage team resources.

## Features

- Create channels in teams
- Send messages to channels and chats
- List teams, channels, and chats
- Get details about teams, channels, and chats
- List messages in channels and chats

## Authentication

To use this plugin, you need a Microsoft Teams API OAuth token. You'll need to register an application in the Azure Portal and obtain the necessary credentials.

### How to obtain a Microsoft Teams API token

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Enter a name for your application
5. Select the appropriate account types (single tenant or multi-tenant)
6. Add a redirect URI (e.g., `https://your-app.com/auth/callback`)
7. Click "Register"
8. Note the Application (client) ID and Directory (tenant) ID
9. Under "Certificates & secrets", create a new client secret
10. Under "API permissions", add the following Microsoft Graph permissions:
    - `Channel.Create`
    - `Channel.ReadBasic.All`
    - `ChannelMessage.Send`
    - `Team.ReadBasic.All`
    - `Chat.ReadWrite`
11. Request admin consent for these permissions
12. Use these credentials to obtain an OAuth token via the OAuth 2.0 flow

## Usage

### Create a Channel

```javascript
{
  "action": "create_channel",
  "token": "your-microsoft-teams-api-token",
  "teamId": "team-id",
  "channelDisplayName": "General Discussion",
  "channelDescription": "Channel for general team discussions" // Optional
}
```

### Send a Channel Message

```javascript
{
  "action": "send_channel_message",
  "token": "your-microsoft-teams-api-token",
  "teamId": "team-id",
  "channelId": "channel-id",
  "contentType": "text", // Options: text, html
  "content": "Hello from MintFlow!"
}
```

### Send a Chat Message

```javascript
{
  "action": "send_chat_message",
  "token": "your-microsoft-teams-api-token",
  "chatId": "chat-id",
  "contentType": "text", // Options: text, html
  "content": "Hello from MintFlow!"
}
```

### List Teams

```javascript
{
  "action": "list_teams",
  "token": "your-microsoft-teams-api-token"
}
```

### List Channels

```javascript
{
  "action": "list_channels",
  "token": "your-microsoft-teams-api-token",
  "teamId": "team-id"
}
```

### List Chats

```javascript
{
  "action": "list_chats",
  "token": "your-microsoft-teams-api-token"
}
```

### Get Team Details

```javascript
{
  "action": "get_team",
  "token": "your-microsoft-teams-api-token",
  "teamId": "team-id"
}
```

### Get Channel Details

```javascript
{
  "action": "get_channel",
  "token": "your-microsoft-teams-api-token",
  "teamId": "team-id",
  "channelId": "channel-id"
}
```

### Get Chat Details

```javascript
{
  "action": "get_chat",
  "token": "your-microsoft-teams-api-token",
  "chatId": "chat-id"
}
```

### List Channel Messages

```javascript
{
  "action": "list_channel_messages",
  "token": "your-microsoft-teams-api-token",
  "teamId": "team-id",
  "channelId": "channel-id"
}
```

### List Chat Messages

```javascript
{
  "action": "list_chat_messages",
  "token": "your-microsoft-teams-api-token",
  "chatId": "chat-id"
}
```

## Response Examples

### Create Channel Response

```json
{
  "id": "19:channel-id",
  "displayName": "General Discussion",
  "description": "Channel for general team discussions",
  "email": "channel-email@example.com",
  "webUrl": "https://teams.microsoft.com/l/channel/channel-id/General%20Discussion",
  "membershipType": "standard"
}
```

### Send Message Response

```json
{
  "id": "1234567890",
  "etag": "1234567890",
  "messageType": "message",
  "createdDateTime": "2023-01-01T12:00:00Z",
  "lastModifiedDateTime": "2023-01-01T12:00:00Z",
  "importance": "normal",
  "locale": "en-us",
  "body": {
    "contentType": "text",
    "content": "Hello from MintFlow!"
  },
  "from": {
    "user": {
      "id": "user-id",
      "displayName": "User Name"
    }
  }
}
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid API token
- API rate limits exceeded
- Resource not found
- Validation errors from Microsoft Teams API

## Limitations

- This plugin requires a valid Microsoft Teams API token
- API rate limits apply as per Microsoft's policies
- Some operations may require additional permissions or features enabled on your Microsoft Teams account
- For security reasons, this plugin should only be used in server-side contexts

## Documentation

For more information about the Microsoft Teams API, refer to the [official documentation](https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview).
