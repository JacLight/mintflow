# Mastodon Plugin for MintFlow

The Mastodon plugin for MintFlow provides integration with Mastodon, an open-source decentralized social network, allowing you to automate posting, account management, and more.

## Features

- **Status Management**: Post statuses with optional media attachments
- **Account Management**: Retrieve account information
- **Custom API Access**: Make custom API calls to the Mastodon API

## Authentication

The Mastodon plugin requires the following credentials:

1. **Base URL**: The base URL of your Mastodon instance (e.g., 'https://mastodon.social')
2. **Access Token**: Your Mastodon access token

To obtain an access token:

1. Log in to your Mastodon instance
2. Go to **Preferences** > **Development** > **New Application**
3. Fill in the application details
4. Click on **Create Application**
5. Copy the **Access token** from the application details page

## Actions

### Post Status

Post a status to Mastodon with optional media attachments.

#### Input

```json
{
  "status": "Hello, Mastodon!",
  "mediaBase64": "base64-encoded-media-content",
  "mediaFilename": "image.jpg",
  "mediaDescription": "A description of the image for accessibility",
  "visibility": "public",
  "sensitive": false,
  "spoilerText": "Optional spoiler warning"
}
```

#### Parameters

- **status** (required): The text of your status
- **mediaBase64** (optional): Base64-encoded media to attach to the status
- **mediaFilename** (optional, required if mediaBase64 is provided): Filename for the media attachment
- **mediaDescription** (optional): Description of the media for accessibility
- **visibility** (optional): Visibility of the status. Options: "public", "unlisted", "private", "direct". Default: "public"
- **sensitive** (optional): Whether the status contains sensitive content. Default: false
- **spoilerText** (optional): Text to be shown as a spoiler warning

#### Output

```json
{
  "status": {
    "id": "123456789",
    "created_at": "2023-01-01T00:00:00.000Z",
    "in_reply_to_id": null,
    "in_reply_to_account_id": null,
    "sensitive": false,
    "spoiler_text": "",
    "visibility": "public",
    "language": "en",
    "uri": "https://mastodon.social/users/user/statuses/123456789",
    "url": "https://mastodon.social/@user/123456789",
    "replies_count": 0,
    "reblogs_count": 0,
    "favourites_count": 0,
    "content": "<p>Hello, Mastodon!</p>",
    "account": {
      "id": "123456789",
      "username": "user",
      "acct": "user",
      "display_name": "User Name"
    },
    "media_attachments": [],
    "mentions": [],
    "tags": [],
    "emojis": []
  }
}
```

### Get Account

Retrieve a Mastodon account by ID.

#### Input

```json
{
  "accountId": "123456789"
}
```

#### Parameters

- **accountId** (required): The ID of the account to retrieve

#### Output

```json
{
  "account": {
    "id": "123456789",
    "username": "user",
    "acct": "user",
    "display_name": "User Name",
    "locked": false,
    "bot": false,
    "created_at": "2023-01-01T00:00:00.000Z",
    "note": "User bio",
    "url": "https://mastodon.social/@user",
    "avatar": "https://mastodon.social/avatars/original/missing.png",
    "avatar_static": "https://mastodon.social/avatars/original/missing.png",
    "header": "https://mastodon.social/headers/original/missing.png",
    "header_static": "https://mastodon.social/headers/original/missing.png",
    "followers_count": 100,
    "following_count": 100,
    "statuses_count": 100,
    "last_status_at": "2023-01-01",
    "emojis": [],
    "fields": []
  }
}
```

### Custom API Call

Make a custom API call to the Mastodon API.

#### Input

```json
{
  "endpoint": "/accounts/verify_credentials",
  "method": "GET",
  "data": {}
}
```

#### Parameters

- **endpoint** (required): The Mastodon API endpoint to call (e.g., "/statuses", "/accounts/verify_credentials")
- **method** (required): The HTTP method to use. Options: "GET", "POST", "PUT", "DELETE". Default: "GET"
- **data** (optional): The request data (for POST, PUT methods)

#### Output

```json
{
  "data": {
    "id": "123456789",
    "username": "user",
    "acct": "user",
    "display_name": "User Name",
    "locked": false,
    "bot": false,
    "created_at": "2023-01-01T00:00:00.000Z",
    "note": "User bio",
    "url": "https://mastodon.social/@user",
    "avatar": "https://mastodon.social/avatars/original/missing.png",
    "avatar_static": "https://mastodon.social/avatars/original/missing.png",
    "header": "https://mastodon.social/headers/original/missing.png",
    "header_static": "https://mastodon.social/headers/original/missing.png",
    "followers_count": 100,
    "following_count": 100,
    "statuses_count": 100,
    "last_status_at": "2023-01-01",
    "emojis": [],
    "fields": []
  }
}
```

## Resources

- [Mastodon API Documentation](https://docs.joinmastodon.org/api/)
- [Mastodon Website](https://joinmastodon.org/)
