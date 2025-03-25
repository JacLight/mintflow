# Medium Plugin for MintFlow

The Medium plugin for MintFlow provides integration with Medium, an online publishing platform, allowing you to automate content publishing and user management.

## Features

- **User Management**: Get information about the authenticated user
- **Content Publishing**: Create posts on Medium with various formatting options
- **Custom API Access**: Make custom API calls to the Medium API

## Authentication

The Medium plugin requires the following credentials:

1. **Integration Token**: Your Medium API integration token

To obtain an integration token:

1. Go to [Medium's Developer Settings](https://medium.com/me/settings)
2. Scroll down to the "Integration tokens" section
3. Enter a description for your token (e.g., "MintFlow Integration")
4. Click "Get integration token"
5. Copy the generated token

## Actions

### Get User

Get information about the authenticated Medium user.

#### Input

No input parameters required.

#### Output

```json
{
  "user": {
    "id": "1234567890abcdef",
    "username": "username",
    "name": "User Name",
    "url": "https://medium.com/@username",
    "imageUrl": "https://cdn-images-1.medium.com/fit/c/200/200/1*abcdefg.jpeg"
  }
}
```

### Create Post

Create a new post on Medium.

#### Input

```json
{
  "title": "My First Post",
  "content": "# Hello World\n\nThis is my first post on Medium!",
  "contentFormat": "markdown",
  "tags": ["test", "first-post"],
  "publishStatus": "draft"
}
```

#### Parameters

- **title** (required): The title of the post
- **content** (required): The content of the post
- **contentFormat** (required): The format of the content. Options: "html", "markdown". Default: "markdown"
- **tags** (optional): Tags for the post
- **canonicalUrl** (optional): The canonical URL of the post, if it was originally published elsewhere
- **publishStatus** (optional): The publish status of the post. Options: "public", "draft", "unlisted". Default: "public"
- **notifyFollowers** (optional): Whether to notify followers that the post was published. Default: true
- **publicationId** (optional): The ID of the publication to publish to. If not provided, the post will be published to the user's profile.

#### Output

```json
{
  "post": {
    "id": "1234567890abcdef",
    "title": "My First Post",
    "authorId": "1234567890abcdef",
    "url": "https://medium.com/@username/my-first-post-1234567890ab",
    "canonicalUrl": "",
    "publishStatus": "draft",
    "publishedAt": "2025-02-28T12:34:56.789Z",
    "license": "all-rights-reserved",
    "licenseUrl": "https://medium.com/policy/9db0094a1e0f"
  }
}
```

### Custom API Call

Make a custom API call to the Medium API.

#### Input

```json
{
  "endpoint": "/me",
  "method": "GET"
}
```

#### Parameters

- **endpoint** (required): The Medium API endpoint to call (e.g., "/me", "/users/{userId}/publications")
- **method** (required): The HTTP method to use. Options: "GET", "POST", "PUT", "DELETE". Default: "GET"
- **data** (optional): The request data (for POST, PUT methods)

#### Output

```json
{
  "data": {
    "data": {
      "id": "1234567890abcdef",
      "username": "username",
      "name": "User Name",
      "url": "https://medium.com/@username",
      "imageUrl": "https://cdn-images-1.medium.com/fit/c/200/200/1*abcdefg.jpeg"
    }
  }
}
```

## Resources

- [Medium API Documentation](https://github.com/Medium/medium-api-docs)
