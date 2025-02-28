# Slack Plugin for MintFlow

This plugin allows you to interact with the Slack API from within MintFlow workflows.

## Installation

```bash
pnpm add @mintflow/slack
```

## Usage

```javascript
import { createWorkflow } from '@mintflow/core';
import slackPlugin from '@mintflow/slack';

const workflow = createWorkflow();

workflow.use(slackPlugin);

workflow.addNode({
  id: 'send-message',
  type: 'slack',
  data: {
    action: 'send_message',
    token: 'xoxb-your-slack-token',
    channel: 'C1234567890',
    text: 'Hello from MintFlow!',
    username: 'MintFlow Bot',
    profilePicture: 'https://example.com/bot-avatar.png'
  }
});
```

## Authentication

To use this plugin, you need a Slack API token. You can obtain one by:

1. Creating a Slack App at <https://api.slack.com/apps>
2. Adding the necessary OAuth scopes (e.g., `chat:write`, `channels:read`, etc.)
3. Installing the app to your workspace
4. Using the Bot User OAuth Token that starts with `xoxb-`

## Available Actions

### send_message

Send a message to a Slack channel.

```javascript
{
  action: 'send_message',
  token: 'xoxb-your-token',
  channel: 'C1234567890',
  text: 'Hello from MintFlow!',
  username: 'MintFlow Bot', // Optional
  profilePicture: 'https://example.com/bot-avatar.png', // Optional
  threadTs: '1503435956.000247', // Optional, for replying to a thread
  blocks: [] // Optional, for Block Kit components
}
```

### send_direct_message

Send a direct message to a Slack user.

```javascript
{
  action: 'send_direct_message',
  token: 'xoxb-your-token',
  userId: 'U1234567890',
  text: 'Hello from MintFlow!',
  username: 'MintFlow Bot', // Optional
  profilePicture: 'https://example.com/bot-avatar.png', // Optional
  threadTs: '1503435956.000247', // Optional, for replying to a thread
  blocks: [] // Optional, for Block Kit components
}
```

### search_messages

Search for messages in Slack.

```javascript
{
  action: 'search_messages',
  token: 'xoxb-your-token',
  query: 'search term',
  count: 10, // Optional, default is 20
  sort: 'timestamp', // Optional, 'score' or 'timestamp'
  sortDir: 'desc', // Optional, 'asc' or 'desc'
  highlight: true // Optional, highlight matching terms
}
```

### update_message

Update an existing message.

```javascript
{
  action: 'update_message',
  token: 'xoxb-your-token',
  channel: 'C1234567890',
  ts: '1503435956.000247',
  text: 'Updated message',
  blocks: [] // Optional, for Block Kit components
}
```

### get_channel_history

Get the message history of a channel.

```javascript
{
  action: 'get_channel_history',
  token: 'xoxb-your-token',
  channel: 'C1234567890',
  count: 10, // Optional, default is 100
  latest: '1503435956.000247', // Optional, end of time range
  oldest: '1503435956.000000', // Optional, start of time range
  inclusive: true // Optional, include messages with latest or oldest timestamp
}
```

### find_user_by_email

Find a user by their email address.

```javascript
{
  action: 'find_user_by_email',
  token: 'xoxb-your-token',
  email: 'user@example.com'
}
```

### find_user_by_handle

Find a user by their username or display name.

```javascript
{
  action: 'find_user_by_handle',
  token: 'xoxb-your-token',
  handle: 'username'
}
```

### create_channel

Create a new channel.

```javascript
{
  action: 'create_channel',
  token: 'xoxb-your-token',
  name: 'new-channel',
  isPrivate: false // Optional, default is false
}
```

### update_profile

Update the user's profile.

```javascript
{
  action: 'update_profile',
  token: 'xoxb-your-token',
  profile: {
    first_name: 'John',
    last_name: 'Doe',
    // Other profile fields
  }
}
```

### set_status

Set the user's status.

```javascript
{
  action: 'set_status',
  token: 'xoxb-your-token',
  statusText: 'In a meeting',
  statusEmoji: ':calendar:',
  statusExpiration: 3600 // Optional, expiration time in seconds
}
```

### add_reaction

Add a reaction to a message.

```javascript
{
  action: 'add_reaction',
  token: 'xoxb-your-token',
  channel: 'C1234567890',
  ts: '1503435956.000247',
  reaction: 'thumbsup'
}
```

### markdown_to_slack

Convert Markdown to Slack's formatting syntax.

```javascript
{
  action: 'markdown_to_slack',
  token: 'xoxb-your-token',
  text: '**Bold** _Italic_ ~~Strikethrough~~ `Code` ```Block``` [Link](https://example.com)'
}
```

## Error Handling

The plugin will throw errors for:

- Missing required parameters
- Invalid Slack tokens
- Unsupported actions
- API errors from Slack

## License

MIT
