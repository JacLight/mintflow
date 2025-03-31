# Discord Plugin for MintFlow

This plugin provides integration with Discord, allowing you to interact with Discord servers, channels, and users through the Discord API.

## Features

- Send messages to Discord channels
- Get information about guilds, channels, and roles
- Create and delete channels
- Add and remove roles from members
- Ban and unban users
- Find members by username
- Create and delete roles

## Installation

```bash
pnpm add @mintflow/discord
```

## Usage

```javascript
import discordPlugin from '@mintflow/discord';

// Example: Send a message to a Discord channel
const result = await discordPlugin.actions[0].execute({
  action: 'send_message',
  token: 'your-discord-bot-token',
  channelId: 'your-channel-id',
  content: 'Hello from MintFlow!'
});

console.log(result);
```

## Available Actions

### Send Message

Sends a message to a Discord channel.

```javascript
{
  action: 'send_message',
  token: 'your-discord-bot-token',
  channelId: 'your-channel-id',
  content: 'Hello from MintFlow!',
  tts: false, // Optional: Text-to-speech
  embeds: [], // Optional: Message embeds
  components: [] // Optional: Message components
}
```

### Get Guilds

Gets a list of guilds the bot is a member of.

```javascript
{
  action: 'get_guilds',
  token: 'your-discord-bot-token'
}
```

### Get Channels

Gets a list of channels in a guild.

```javascript
{
  action: 'get_channels',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id'
}
```

### Get Roles

Gets a list of roles in a guild.

```javascript
{
  action: 'get_roles',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id'
}
```

### Create Channel

Creates a new channel in a guild.

```javascript
{
  action: 'create_channel',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id',
  name: 'channel-name',
  type: 0, // Optional: Channel type (0: text, 2: voice, 4: category, 5: announcement, 13: stage, 15: forum)
  topic: 'Channel topic', // Optional
  position: 0, // Optional
  nsfw: false, // Optional
  bitrate: 64000, // Optional (for voice channels)
  userLimit: 0, // Optional (for voice channels)
  parentId: 'category-id', // Optional
  permissionOverwrites: [] // Optional
}
```

### Delete Channel

Deletes a channel.

```javascript
{
  action: 'delete_channel',
  token: 'your-discord-bot-token',
  channelId: 'your-channel-id'
}
```

### Add Role to Member

Adds a role to a guild member.

```javascript
{
  action: 'add_role_to_member',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id',
  userId: 'user-id',
  roleId: 'role-id'
}
```

### Remove Role from Member

Removes a role from a guild member.

```javascript
{
  action: 'remove_role_from_member',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id',
  userId: 'user-id',
  roleId: 'role-id'
}
```

### Ban Member

Bans a member from a guild.

```javascript
{
  action: 'ban_member',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id',
  userId: 'user-id',
  reason: 'Ban reason', // Optional
  deleteMessageDays: 7 // Optional: Number of days of messages to delete (0-7)
}
```

### Remove Ban

Removes a ban from a user.

```javascript
{
  action: 'remove_ban',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id',
  userId: 'user-id'
}
```

### Find Member by Username

Finds a guild member by username.

```javascript
{
  action: 'find_member_by_username',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id',
  username: 'username'
}
```

### Create Role

Creates a new role in a guild.

```javascript
{
  action: 'create_role',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id',
  name: 'role-name',
  color: 0xFF0000, // Optional: Role color (decimal color value)
  hoist: true, // Optional: Whether to display role members separately
  position: 1, // Optional: Role position
  permissions: '0', // Optional: Role permissions
  mentionable: true // Optional: Whether the role is mentionable
}
```

### Delete Role

Deletes a role from a guild.

```javascript
{
  action: 'delete_role',
  token: 'your-discord-bot-token',
  guildId: 'your-guild-id',
  roleId: 'role-id'
}
```

## Getting a Discord Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under the "TOKEN" section, click "Copy" to copy your bot token
5. Make sure to enable the necessary "Privileged Gateway Intents" for your bot
6. Go to the "OAuth2" tab, select "bot" under "SCOPES" and select the necessary permissions
7. Use the generated URL to invite the bot to your server

## License

MIT
