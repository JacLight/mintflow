# Reddit Plugin for MintFlow

The Reddit plugin for MintFlow provides integration with Reddit, a social news and discussion platform, allowing you to automate interactions with Reddit's API.

## Features

- **Subreddit Management**: Get information about subreddits
- **Content Creation**: Submit posts to subreddits
- **Custom API Access**: Make custom API calls to the Reddit API

## Authentication

The Reddit plugin requires the following credentials:

1. **Client ID**: Your Reddit API client ID
2. **Client Secret**: Your Reddit API client secret
3. **Username**: Your Reddit username
4. **Password**: Your Reddit password
5. **User Agent**: A user agent string for API requests

To obtain API credentials:

1. Go to [Reddit's App Preferences](https://www.reddit.com/prefs/apps)
2. Click on "Create App" or "Create Another App" at the bottom
3. Fill in the required information:
   - Name: Your app name
   - App type: Select "Script"
   - Description: Brief description of your app
   - About URL: Your website URL (optional)
   - Redirect URI: Use `http://localhost:8000` if you don't have a specific redirect URI
4. Click "Create app"
5. Your Client ID is the string under the app name, and your Client Secret is labeled as "secret"

For the User Agent, follow Reddit's API guidelines by using a string in the format: `platform:app ID:version string (by /u/username)`. For example: `MintFlow:v1.0.0 (by /u/your-username)`.

## Actions

### Get Subreddit

Get information about a subreddit.

#### Input

```json
{
  "subreddit": "programming"
}
```

#### Parameters

- **subreddit** (required): The name of the subreddit to get information about

#### Output

```json
{
  "subreddit": {
    "kind": "t5",
    "data": {
      "display_name": "programming",
      "title": "Programming",
      "subscribers": 5000000,
      "description": "Computer Programming",
      "created_utc": 1201233135.0
    }
  }
}
```

### Submit Post

Submit a new post to a subreddit.

#### Input

```json
{
  "subreddit": "test",
  "title": "Test Post",
  "content": "This is a test post",
  "kind": "self"
}
```

#### Parameters

- **subreddit** (required): The name of the subreddit to submit to
- **title** (required): The title of the post
- **content** (required): The content of the post (text or URL)
- **kind** (required): The kind of post to submit. Options: "self" (text post), "link" (URL post). Default: "self"

#### Output

```json
{
  "post": {
    "json": {
      "errors": [],
      "data": {
        "url": "https://www.reddit.com/r/test/comments/abcdef/test_post/",
        "id": "abcdef",
        "name": "t3_abcdef"
      }
    }
  }
}
```

### Custom API Call

Make a custom API call to the Reddit API.

#### Input

```json
{
  "endpoint": "/r/programming/about",
  "method": "GET"
}
```

#### Parameters

- **endpoint** (required): The Reddit API endpoint to call (e.g., "/r/subreddit/about", "/api/v1/me")
- **method** (required): The HTTP method to use. Options: "GET", "POST", "PUT", "DELETE". Default: "GET"
- **data** (optional): The request data (for POST, PUT methods)
- **params** (optional): The query parameters

#### Output

```json
{
  "data": {
    "kind": "t5",
    "data": {
      "display_name": "programming",
      "title": "Programming",
      "subscribers": 5000000,
      "description": "Computer Programming",
      "created_utc": 1201233135.0
    }
  }
}
```

## Resources

- [Reddit API Documentation](https://www.reddit.com/dev/api/)
- [Reddit API Rules](https://github.com/reddit-archive/reddit/wiki/API)
