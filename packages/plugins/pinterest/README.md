# Pinterest Plugin for MintFlow

This plugin provides integration with the Pinterest API, allowing you to create pins, manage boards, and search for content on Pinterest.

## Features

- Create pins on Pinterest boards
- Create new Pinterest boards
- Get pins from a specific board
- Get a list of user's boards
- Get user profile information
- Search for pins on Pinterest

## Authentication

To use this plugin, you need a Pinterest API OAuth token with the appropriate scopes:

- `boards:read`
- `boards:write`
- `pins:read`
- `pins:write`
- `user_accounts:read`

### How to obtain a Pinterest API OAuth token

1. Go to [Pinterest Developers](https://developers.pinterest.com/)
2. Create a developer account if you don't have one
3. Create a new app in the Pinterest Developer Portal
4. Configure your app:
   - Add the required scopes
   - Set up your redirect URI
   - Complete the app information
5. Submit your app for review (required for production use)
6. Once approved, you can use the client ID and client secret to obtain OAuth tokens
7. Implement the OAuth 2.0 flow to get user access tokens

## Usage

### Create a Pin

```javascript
{
  "action": "create_pin",
  "token": "your-pinterest-api-token",
  "boardId": "12345678",
  "title": "My Pinterest Pin",
  "description": "This is a great pin!", // Optional
  "imageUrl": "https://example.com/image.jpg",
  "link": "https://example.com", // Optional
  "altText": "Description of the image" // Optional
}
```

### Create a Board

```javascript
{
  "action": "create_board",
  "token": "your-pinterest-api-token",
  "name": "My New Board",
  "description": "A collection of my favorite things", // Optional
  "privacy": "PUBLIC" // Optional, default: PUBLIC, options: PUBLIC, PROTECTED, SECRET
}
```

### Get Pins from a Board

```javascript
{
  "action": "get_board_pins",
  "token": "your-pinterest-api-token",
  "boardId": "12345678",
  "maxResults": 25 // Optional, default: 25
}
```

### Get User's Boards

```javascript
{
  "action": "get_user_boards",
  "token": "your-pinterest-api-token",
  "maxResults": 25 // Optional, default: 25
}
```

### Get User Profile

```javascript
{
  "action": "get_user_profile",
  "token": "your-pinterest-api-token"
}
```

### Search for Pins

```javascript
{
  "action": "search_pins",
  "token": "your-pinterest-api-token",
  "query": "home decor ideas",
  "maxResults": 25 // Optional, default: 25
}
```

## Response Examples

### Create Pin Response

```json
{
  "id": "pin-id-12345",
  "title": "My Pinterest Pin",
  "description": "This is a great pin!",
  "link": "https://example.com",
  "url": "https://www.pinterest.com/pin/pin-id-12345/",
  "media": {
    "images": {
      "original": {
        "url": "https://i.pinimg.com/originals/12/34/56/image.jpg",
        "width": 1000,
        "height": 1500
      }
    }
  },
  "created_at": "2023-01-01T00:00:00Z",
  "board": {
    "id": "12345678",
    "name": "My Board",
    "url": "https://www.pinterest.com/username/my-board/"
  }
}
```

### Create Board Response

```json
{
  "id": "12345678",
  "name": "My New Board",
  "description": "A collection of my favorite things",
  "url": "https://www.pinterest.com/username/my-new-board/",
  "privacy": "PUBLIC",
  "pin_count": 0,
  "follower_count": 0,
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Get Board Pins Response

```json
[
  {
    "id": "pin-id-12345",
    "title": "My Pinterest Pin",
    "description": "This is a great pin!",
    "link": "https://example.com",
    "url": "https://www.pinterest.com/pin/pin-id-12345/",
    "media": {
      "images": {
        "original": {
          "url": "https://i.pinimg.com/originals/12/34/56/image.jpg",
          "width": 1000,
          "height": 1500
        }
      }
    },
    "created_at": "2023-01-01T00:00:00Z",
    "board": {
      "id": "12345678",
      "name": "My Board",
      "url": "https://www.pinterest.com/username/my-board/"
    }
  }
]
```

### Get User Boards Response

```json
[
  {
    "id": "12345678",
    "name": "My Board",
    "description": "A collection of my favorite things",
    "url": "https://www.pinterest.com/username/my-board/",
    "privacy": "PUBLIC",
    "pin_count": 42,
    "follower_count": 10,
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

### Get User Profile Response

```json
{
  "id": "user-id-12345",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Pinterest enthusiast",
  "website_url": "https://example.com",
  "profile_image": "https://i.pinimg.com/avatars/username_1234.jpg",
  "pin_count": 150,
  "follower_count": 75,
  "following_count": 42
}
```

### Search Pins Response

```json
[
  {
    "id": "pin-id-12345",
    "title": "Home Decor Ideas",
    "description": "Beautiful living room design",
    "link": "https://example.com/home-decor",
    "url": "https://www.pinterest.com/pin/pin-id-12345/",
    "media": {
      "images": {
        "original": {
          "url": "https://i.pinimg.com/originals/12/34/56/image.jpg",
          "width": 1000,
          "height": 1500
        }
      }
    },
    "created_at": "2023-01-01T00:00:00Z",
    "board": {
      "id": "12345678",
      "name": "Home Decor",
      "url": "https://www.pinterest.com/username/home-decor/"
    }
  }
]
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid access token
- Insufficient permissions
- API rate limits exceeded
- Invalid board or pin IDs
- Board or pin not found

## Limitations

- Image URLs must be publicly accessible
- API rate limits apply as per Pinterest's policies
- Some actions require specific OAuth scopes
- Pinterest API may have restrictions on commercial usage

## Documentation

For more information about the Pinterest API, refer to the [official documentation](https://developers.pinterest.com/docs/).
