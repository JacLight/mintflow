# Instagram Plugin for MintFlow

This plugin provides integration with Instagram Business API, allowing you to upload photos and reels to Instagram Business accounts.

## Features

- Upload photos to Instagram Business accounts
- Upload reels (videos) to Instagram Business accounts
- Retrieve a list of Instagram Business accounts you manage

## Authentication

To use this plugin, you need a Facebook access token with the following permissions:

- `instagram_basic`
- `instagram_content_publish`
- `business_management`
- `pages_show_list`

### How to obtain a Facebook access token for Instagram

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Register for a Facebook Developer account if you don't have one
3. Create a new app by clicking "Create App"
4. Select "Other" for use cases
5. Choose "Business" as the app type
6. Provide application details (name and contact email)
7. Once your application is created, add a new product of type "Facebook Login"
8. In Facebook Login settings, add your redirect URL in "Valid OAuth Redirect URIs"
9. Add your domain name in "Allowed Domains for the JavaScript SDK"
10. Get your application ID and secret from your app dashboard in Settings > Basic
11. Use these credentials to obtain an access token with the required permissions
12. Ensure your Instagram account is a Business account and is connected to a Facebook Page

## Usage

### Get Instagram Business Accounts

```javascript
{
  "action": "get_accounts",
  "token": "your-facebook-access-token"
}
```

### Upload a Photo

```javascript
{
  "action": "upload_photo",
  "token": "your-facebook-access-token",
  "accountId": "your-instagram-business-account-id",
  "photoUrl": "https://example.com/image.jpg",
  "caption": "Check out this photo!" // Optional
}
```

### Upload a Reel (Video)

```javascript
{
  "action": "upload_reel",
  "token": "your-facebook-access-token",
  "accountId": "your-instagram-business-account-id",
  "videoUrl": "https://example.com/video.mp4",
  "caption": "Check out my new reel!" // Optional
}
```

## Response Examples

### Get Accounts Response

```json
[
  {
    "id": "instagram-account-id-1",
    "name": "My Instagram Business Account",
    "access_token": "page-specific-access-token"
  },
  {
    "id": "instagram-account-id-2",
    "name": "My Other Instagram Business Account",
    "access_token": "page-specific-access-token"
  }
]
```

### Upload Photo Response

```json
{
  "id": "media-id"
}
```

### Upload Reel Response

```json
{
  "id": "media-id"
}
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid access token
- Insufficient permissions
- API rate limits exceeded
- Invalid Instagram Business Account ID
- Invalid media URLs
- Video processing failures

## Limitations

- Photo URLs must be publicly accessible and in JPG format
- Video URLs must be publicly accessible
- Video files are limited to 1GB or 15 minutes in length
- API rate limits apply as per Instagram's policies
- Only Instagram Business accounts can be used with this plugin
- The Instagram account must be connected to a Facebook Page

## Documentation

For more information about the Instagram Graph API, refer to the [official documentation](https://developers.facebook.com/docs/instagram-api/).
