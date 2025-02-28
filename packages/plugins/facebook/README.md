# Facebook Plugin for MintFlow

This plugin provides integration with Facebook Pages API, allowing you to manage and publish content to Facebook Pages.

## Features

- Create text posts on Facebook Pages
- Upload and post photos to Facebook Pages
- Upload and post videos to Facebook Pages
- Retrieve a list of Facebook Pages you manage

## Authentication

To use this plugin, you need a Facebook access token with the following permissions:

- `pages_show_list`
- `pages_manage_posts`
- `business_management`
- `pages_read_engagement`

### How to obtain a Facebook access token

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

## Usage

### Create a Post

```javascript
{
  "action": "create_post",
  "token": "your-facebook-access-token",
  "pageId": "your-page-id",
  "message": "Hello from MintFlow!",
  "link": "https://example.com" // Optional
}
```

### Create a Photo Post

```javascript
{
  "action": "create_photo_post",
  "token": "your-facebook-access-token",
  "pageId": "your-page-id",
  "photoUrl": "https://example.com/image.jpg",
  "caption": "Check out this photo!" // Optional
}
```

### Create a Video Post

```javascript
{
  "action": "create_video_post",
  "token": "your-facebook-access-token",
  "pageId": "your-page-id",
  "videoUrl": "https://example.com/video.mp4",
  "title": "My Video Title", // Optional
  "description": "This is a description of my video" // Optional
}
```

### Get Pages

```javascript
{
  "action": "get_pages",
  "token": "your-facebook-access-token"
}
```

## Response Examples

### Create Post Response

```json
{
  "id": "page-id_post-id"
}
```

### Create Photo Post Response

```json
{
  "id": "photo-id",
  "post_id": "page-id_post-id"
}
```

### Create Video Post Response

```json
{
  "id": "video-id"
}
```

### Get Pages Response

```json
[
  {
    "id": "page-id-1",
    "name": "My Page Name",
    "access_token": "page-specific-access-token"
  },
  {
    "id": "page-id-2",
    "name": "My Other Page",
    "access_token": "page-specific-access-token"
  }
]
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid access token
- Insufficient permissions
- API rate limits exceeded
- Invalid page ID
- Invalid media URLs

## Limitations

- Photo URLs must be publicly accessible
- Video URLs must be publicly accessible
- Video files are limited to 1GB or 20 minutes in length
- API rate limits apply as per Facebook's policies

## Documentation

For more information about the Facebook Pages API, refer to the [official documentation](https://developers.facebook.com/docs/pages-api).
