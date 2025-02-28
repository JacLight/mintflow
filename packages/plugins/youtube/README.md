# YouTube Plugin for MintFlow

This plugin provides integration with the YouTube Data API, allowing you to search for videos, retrieve channel information, and manage subscriptions.

## Features

- Search for videos on YouTube
- Get videos from a specific channel
- Get detailed information about a video
- Get channel details by ID or username
- Subscribe to a channel
- Check if the authenticated user is subscribed to a channel

## Authentication

To use this plugin, you need a YouTube API OAuth token with the following scopes:

- `https://www.googleapis.com/auth/youtube`
- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/youtube.force-ssl` (for subscription management)

### How to obtain a YouTube API OAuth token

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** and click **Enable APIs & Services**
4. Search for "YouTube Data API v3" and enable it
5. Go to **OAuth consent screen** and configure it:
   - Select External or Internal user type
   - Fill in the required fields (App name, User support email, Developer contact information)
   - Add the required scopes
   - Add test users if needed
6. Go to **Credentials** and click **Create Credentials** > **OAuth client ID**
7. Select "Web application" as the application type
8. Add your redirect URI
9. Copy the Client ID and Client Secret
10. Use these credentials to obtain an OAuth token with the required scopes

## Usage

### Search for Videos

```javascript
{
  "action": "search_videos",
  "token": "your-youtube-api-token",
  "query": "MintFlow tutorial",
  "maxResults": 5, // Optional, default: 10
  "order": "relevance", // Optional, default: relevance
  "channelId": "channel-id" // Optional, to search within a specific channel
}
```

### Get Channel Videos

```javascript
{
  "action": "get_channel_videos",
  "token": "your-youtube-api-token",
  "channelId": "channel-id",
  "maxResults": 10, // Optional, default: 10
  "order": "date" // Optional, default: date
}
```

### Get Video Details

```javascript
{
  "action": "get_video_details",
  "token": "your-youtube-api-token",
  "videoId": "video-id"
}
```

### Get Channel Details

```javascript
{
  "action": "get_channel_details",
  "token": "your-youtube-api-token",
  "channelId": "channel-id" // Either channelId or username is required
}
```

Or using a username:

```javascript
{
  "action": "get_channel_details",
  "token": "your-youtube-api-token",
  "username": "channel-username"
}
```

### Subscribe to a Channel

```javascript
{
  "action": "subscribe_to_channel",
  "token": "your-youtube-api-token",
  "channelId": "channel-id"
}
```

### Check Subscription Status

```javascript
{
  "action": "check_subscription",
  "token": "your-youtube-api-token",
  "channelId": "channel-id"
}
```

## Response Examples

### Search Videos Response

```json
[
  {
    "id": "video-id-1",
    "title": "Getting Started with MintFlow",
    "description": "Learn how to use MintFlow for workflow automation",
    "publishedAt": "2023-01-01T00:00:00Z",
    "thumbnails": {
      "default": { "url": "https://i.ytimg.com/vi/video-id-1/default.jpg", "width": 120, "height": 90 },
      "medium": { "url": "https://i.ytimg.com/vi/video-id-1/mqdefault.jpg", "width": 320, "height": 180 },
      "high": { "url": "https://i.ytimg.com/vi/video-id-1/hqdefault.jpg", "width": 480, "height": 360 }
    },
    "channelId": "channel-id",
    "channelTitle": "MintFlow Official"
  }
]
```

### Video Details Response

```json
{
  "id": "video-id",
  "title": "Getting Started with MintFlow",
  "description": "Learn how to use MintFlow for workflow automation",
  "publishedAt": "2023-01-01T00:00:00Z",
  "thumbnails": {
    "default": { "url": "https://i.ytimg.com/vi/video-id/default.jpg", "width": 120, "height": 90 },
    "medium": { "url": "https://i.ytimg.com/vi/video-id/mqdefault.jpg", "width": 320, "height": 180 },
    "high": { "url": "https://i.ytimg.com/vi/video-id/hqdefault.jpg", "width": 480, "height": 360 }
  },
  "channelId": "channel-id",
  "channelTitle": "MintFlow Official",
  "tags": ["mintflow", "automation", "tutorial"],
  "categoryId": "28",
  "duration": "PT15M33S",
  "viewCount": "1234",
  "likeCount": "123",
  "commentCount": "12"
}
```

### Channel Details Response

```json
{
  "id": "channel-id",
  "title": "MintFlow Official",
  "description": "Official channel for MintFlow workflow automation platform",
  "customUrl": "@mintflow",
  "thumbnails": {
    "default": { "url": "https://yt3.ggpht.com/channel-id/default.jpg", "width": 88, "height": 88 },
    "medium": { "url": "https://yt3.ggpht.com/channel-id/medium.jpg", "width": 240, "height": 240 },
    "high": { "url": "https://yt3.ggpht.com/channel-id/high.jpg", "width": 800, "height": 800 }
  }
}
```

### Subscribe to Channel Response

```json
{
  "kind": "youtube#subscription",
  "etag": "etag",
  "id": "subscription-id",
  "snippet": {
    "publishedAt": "2023-01-01T00:00:00Z",
    "channelTitle": "Your Channel",
    "title": "MintFlow Official",
    "description": "Official channel for MintFlow workflow automation platform",
    "resourceId": {
      "kind": "youtube#channel",
      "channelId": "channel-id"
    }
  }
}
```

### Check Subscription Response

```json
true
```

or

```json
false
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid access token
- Insufficient permissions
- API rate limits exceeded
- Invalid video or channel IDs
- Video or channel not found

## Limitations

- API rate limits apply as per YouTube Data API quotas
- Some actions require specific OAuth scopes
- Subscription management requires the user to have a YouTube channel

## Documentation

For more information about the YouTube Data API, refer to the [official documentation](https://developers.google.com/youtube/v3/docs).
