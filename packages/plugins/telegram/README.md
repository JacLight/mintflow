# Telegram Plugin for MintFlow

The Telegram plugin provides integration with the Telegram Bot API, allowing you to send messages, media, create invite links, and get chat member information through your Telegram bot.

## Features

- Send text messages to Telegram chats
- Send media (photos, videos, stickers, animations) to Telegram chats
- Create invite links for Telegram chats
- Get information about chat members
- Receive new messages from Telegram chats (webhook trigger)

## Prerequisites

To use this plugin, you need to:

1. Create a Telegram bot using [BotFather](https://t.me/botfather)
2. Obtain your bot token
3. Start a conversation with your bot or add it to a group

## Authentication

The plugin uses the Telegram Bot Token for authentication. You'll need to provide this token for each action.

## Actions

### Send Message

Sends a text message to a Telegram chat.

**Input:**

- `bot_token` (string, required): Your Telegram Bot Token
- `chat_id` (string, required): The ID of the chat to send the message to
- `message` (string, required): The text message to send
- `format` (string, optional): The format of the message (MarkdownV2 or HTML)
- `message_thread_id` (string, optional): Unique identifier for the target message thread
- `web_page_preview` (boolean, optional): Whether to disable web page previews
- `reply_markup` (object, optional): Additional interface options

**Example:**

```json
{
  "bot_token": "123456789:ABCdefGhIJKlmnOPQRstUVwxYZ",
  "chat_id": "123456789",
  "message": "Hello from MintFlow!",
  "format": "MarkdownV2"
}
```

### Send Media

Sends media (photo, video, sticker, animation) to a Telegram chat.

**Input:**

- `bot_token` (string, required): Your Telegram Bot Token
- `chat_id` (string, required): The ID of the chat to send the media to
- `media_type` (string, required): The type of media to send (photo, video, sticker, animation)
- `media_url` (string, optional): URL of the media to send
- `media_id` (string, optional): File ID of previously uploaded media
- `caption` (string, optional): Caption for the media
- `format` (string, optional): The format of the caption (MarkdownV2 or HTML)
- `message_thread_id` (string, optional): Unique identifier for the target message thread
- `reply_markup` (object, optional): Additional interface options

**Example:**

```json
{
  "bot_token": "123456789:ABCdefGhIJKlmnOPQRstUVwxYZ",
  "chat_id": "123456789",
  "media_type": "photo",
  "media_url": "https://example.com/image.jpg",
  "caption": "Check out this image!",
  "format": "MarkdownV2"
}
```

### Create Invite Link

Creates an invite link for a Telegram chat.

**Input:**

- `bot_token` (string, required): Your Telegram Bot Token
- `chat_id` (string, required): The ID of the chat to create an invite link for
- `name` (string, optional): Name of the invite link (max 32 chars)
- `expire_date` (string, optional): Point in time when the link will expire
- `member_limit` (number, optional): Maximum number of users that can join via this link

**Example:**

```json
{
  "bot_token": "123456789:ABCdefGhIJKlmnOPQRstUVwxYZ",
  "chat_id": "-100123456789",
  "name": "MintFlow Invite",
  "expire_date": "2023-12-31T23:59:59Z",
  "member_limit": 10
}
```

### Get Chat Member

Gets information about a member of a chat.

**Input:**

- `bot_token` (string, required): Your Telegram Bot Token
- `chat_id` (string, required): The ID of the chat to get member information from
- `user_id` (string, required): Unique identifier of the target user

**Example:**

```json
{
  "bot_token": "123456789:ABCdefGhIJKlmnOPQRstUVwxYZ",
  "chat_id": "-100123456789",
  "user_id": "987654321"
}
```

## Triggers

### New Message

Triggers when a new message is received in a Telegram chat.

**Input:**

- `bot_token` (string, required): Your Telegram Bot Token

**Output:**

- Message details including sender, chat, text, etc.

## How to Get Chat ID

To get your chat ID:

1. Search for the bot "@getmyid_bot" in Telegram
2. Start a conversation with the bot
3. Send the command "/my_id" to the bot
4. The bot will reply with your chat ID

For group chats, add your bot to the group and use one of these methods:

- Send a message in the group and check the webhook payload
- Use the getUpdates API method to see incoming messages

## Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/botfather) - For creating and managing bots
- [Telegram Bot API Methods](https://core.telegram.org/bots/api#available-methods)
