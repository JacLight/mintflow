# Webhook Plugin for MintFlow

The Webhook plugin allows you to receive and respond to HTTP webhooks in your MintFlow workflows.

## Features

- **Catch Webhook**: Receive incoming HTTP requests with support for various authentication methods
- **Return Response**: Send customized HTTP responses with control over status codes, headers, and body content

## Authentication Methods

The plugin supports three authentication methods for securing your webhooks:

1. **None**: No authentication required
2. **Basic Auth**: Username and password authentication
3. **Header Auth**: Custom header name and value authentication

## Response Types

When returning responses, you can choose from three response types:

1. **JSON**: Return JSON data with automatic parsing
2. **Raw**: Return raw text or other content types
3. **Redirect**: Perform HTTP redirects to other URLs

## Usage Examples

### Catching a Webhook

```javascript
// Example of catching a webhook with basic authentication
{
  "action": "catchHook",
  "params": {
    "authType": "basic",
    "username": "user123",
    "password": "securepass"
  }
}
```

### Returning a Response

```javascript
// Example of returning a JSON response
{
  "action": "returnResponse",
  "params": {
    "responseType": "json",
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "message": "Success",
      "data": {
        "id": 123,
        "name": "Example"
      }
    }
  }
}
```

```javascript
// Example of redirecting to another URL
{
  "action": "returnResponse",
  "params": {
    "responseType": "redirect",
    "body": "https://example.com/success"
  }
}
```

## Integration with Other Services

The Webhook plugin can be used to integrate MintFlow with various external services:

- **GitHub**: Receive repository events
- **Stripe**: Process payment webhooks
- **Slack**: Respond to slash commands
- **Custom APIs**: Connect with any system that supports webhooks

## Security Considerations

- Use authentication for all production webhooks
- Consider using HTTPS for all webhook endpoints
- Validate the payload content before processing
- Implement rate limiting for public-facing webhooks
