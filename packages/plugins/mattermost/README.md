# Mattermost Plugin for MintFlow

This plugin provides integration with Mattermost, an open-source, self-hosted messaging platform for team communication.

## Features

- Send messages to Mattermost channels
- Make custom API calls to the Mattermost API

## Installation

```bash
npm install @mintflow/mattermost
```

## Authentication

To use this plugin, you need:

1. **Workspace URL**: The URL of your Mattermost instance (e.g., `https://example.mattermost.com`)
2. **Bot Token**: A bot token for authentication

### Getting a Bot Token

1. Go to your Mattermost instance
2. Navigate to **System Console** > **Integrations** > **Bot Accounts**
3. Click **Add Bot Account**
4. Fill in the required information and create the bot
5. Copy the generated token

## Usage

### Send Message

Send a message to a Mattermost channel.

```javascript
import { sendMessage } from '@mintflow/mattermost';

// Example usage
const result = await sendMessage.execute({
  workspace_url: 'https://example.mattermost.com',
  token: 'your-bot-token',
  channel_id: 'channel-id',
  text: 'Hello from MintFlow!'
}, {});

console.log(result);
```

#### Parameters

- `workspace_url` (string, required): The workspace URL of the Mattermost instance
- `token` (string, required): The bot token to use for authentication
- `channel_id` (string, required): The ID of the channel to send the message to
- `text` (string, required): The text of the message to send

### Custom API Call

Make a custom API call to the Mattermost API.

```javascript
import { customApiCall } from '@mintflow/mattermost';

// Example usage - Get users
const users = await customApiCall.execute({
  workspace_url: 'https://example.mattermost.com',
  token: 'your-bot-token',
  method: 'GET',
  path: '/api/v4/users',
  queryParams: {
    per_page: 100,
    page: 0
  }
}, {});

console.log(users);

// Example usage - Create a channel
const newChannel = await customApiCall.execute({
  workspace_url: 'https://example.mattermost.com',
  token: 'your-bot-token',
  method: 'POST',
  path: '/api/v4/channels',
  body: {
    team_id: 'team-id',
    name: 'channel-name',
    display_name: 'Channel Display Name',
    type: 'O', // 'O' for public, 'P' for private
    purpose: 'Channel purpose',
    header: 'Channel header'
  }
}, {});

console.log(newChannel);
```

#### Parameters

- `workspace_url` (string, required): The workspace URL of the Mattermost instance
- `token` (string, required): The bot token to use for authentication
- `method` (string, required): HTTP method ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
- `path` (string, required): The API path (e.g., '/api/v4/users')
- `body` (object, optional): The request body (for POST, PUT, PATCH requests)
- `queryParams` (object, optional): Query parameters to include in the request

## API Documentation

For more information about the Mattermost API, refer to the [official Mattermost API documentation](https://api.mattermost.com/).

## License

MIT
