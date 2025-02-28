# TikTok Plugin for MintFlow

This plugin provides integration with the TikTok API, allowing you to retrieve user videos, get video details, and upload content to TikTok.

## Features

- Get videos from a user's TikTok account
- Get detailed information about a specific TikTok video
- Get user profile information
- Upload videos to TikTok

## Authentication

To use this plugin, you need a TikTok API OAuth token with the appropriate scopes:

- `user.info.basic`
- `user.info.profile`
- `video.list`
- `video.upload`

### How to obtain a TikTok API OAuth token

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a developer account if you don't have one
3. Create a new app in the TikTok Developer Portal
4. Configure your app:
   - Add the required scopes
   - Set up your redirect URI
   - Complete the app information
5. Submit your app for review (required for production use)
6. Once approved, you can use the client ID and client secret to obtain OAuth tokens
7. Implement the OAuth 2.0 flow to get user access tokens

## Usage

### Get User Videos

```javascript
{
  "action": "get_user_videos",
  "token": "your-tiktok-api-token",
  "userId": "user-id", // Optional, if not provided will use the authenticated user
  "maxResults": 10 // Optional, default: 10
}
```

### Get Video Details

```javascript
{
  "action": "get_video_details",
  "token": "your-tiktok-api-token",
  "videoId": "video-id"
}
```

### Get User Details

```javascript
{
  "action": "get_user_details",
  "token": "your-tiktok-api-token",
  "userId": "user-id" // Either userId or username is required
}
```

Or using a username:

```javascript
{
  "action": "get_user_details",
  "token": "your-tiktok-api-token",
  "username": "username"
}
```

### Upload Video

```javascript
{
  "action": "upload_video",
  "token": "your-tiktok-api-token",
  "videoUrl": "https://example.com/video.mp4",
  "description": "Check out my new video!", // Optional
  "privacy": "public", // Optional, default: public, options: public, private, friends
  "disableComments": false, // Optional, default: false
  "disableDuet": false, // Optional, default: false
  "disableStitch": false // Optional, default: false
}
```

## Response Examples

### Get User Videos Response

```json
[
  {
    "id": "video-id-1",
    "title": "My TikTok Video",
    "description": "Check out this cool video!",
    "createTime": "2023-01-01T00:00:00Z",
    "coverUrl": "https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/cover-image.jpeg",
    "shareUrl": "https://www.tiktok.com/@username/video/video-id-1",
    "videoUrl": "https://v16-webapp.tiktok.com/video.mp4",
    "duration": 15,
    "width": 1080,
    "height": 1920,
    "statistics": {
      "commentCount": 100,
      "likeCount": 1000,
      "shareCount": 50,
      "viewCount": 10000
    }
  }
]
```

### Video Details Response

```json
{
  "id": "video-id",
  "title": "My TikTok Video",
  "description": "Check out this cool video!",
  "createTime": "2023-01-01T00:00:00Z",
  "coverUrl": "https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/cover-image.jpeg",
  "shareUrl": "https://www.tiktok.com/@username/video/video-id",
  "videoUrl": "https://v16-webapp.tiktok.com/video.mp4",
  "duration": 15,
  "width": 1080,
  "height": 1920,
  "statistics": {
    "commentCount": 100,
    "likeCount": 1000,
    "shareCount": 50,
    "viewCount": 10000
  }
}
```

### User Details Response

```json
{
  "id": "user-id",
  "username": "username",
  "displayName": "Display Name",
  "avatarUrl": "https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/avatar.jpeg",
  "bio": "This is my TikTok bio",
  "followingCount": 500,
  "followerCount": 1000,
  "likeCount": 5000,
  "videoCount": 50
}
```

### Upload Video Response

```json
{
  "uploadId": "upload-id",
  "status": "SUCCEEDED"
}
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid access token
- Insufficient permissions
- API rate limits exceeded
- Invalid video or user IDs
- Video or user not found
- Video upload failures

## Limitations

- Video URLs must be publicly accessible
- Video uploads are processed asynchronously and may take time to complete
- API rate limits apply as per TikTok's policies
- Some actions require specific OAuth scopes
- TikTok API may have restrictions on commercial usage

## Documentation

For more information about the TikTok API, refer to the [official documentation](https://developers.tiktok.com/doc/).
