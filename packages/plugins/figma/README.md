# Figma Plugin for MintFlow

This plugin provides integration with the Figma API, allowing you to access and manipulate Figma files, comments, components, and more.

## Features

- Get Figma file data and structure
- Get and post comments on Figma files
- Export images from Figma files
- Access file nodes, components, and styles
- Manage team projects and files
- Create and manage webhooks for Figma events

## Authentication

To use this plugin, you need a Figma API OAuth token. You'll need to register an application in the Figma Developer Console and obtain the necessary credentials.

### How to obtain a Figma API token

1. Go to the [Figma Developer Console](https://www.figma.com/developers/apps)
2. Click "Create a new app"
3. Fill in the required information:
   - Name: Your app name
   - Description: Brief description of your app
   - Website URL: Your website URL
   - OAuth Redirect URLs: Your redirect URL(s)
4. Click "Create app"
5. Note the Client ID and Client Secret
6. Use these credentials to obtain an OAuth token via the OAuth 2.0 flow
7. Request the following scopes:
   - `file:read` - To read file data
   - `comment:read` - To read comments
   - `comment:write` - To write comments

## Usage

### Get a Figma File

```javascript
{
  "action": "get_file",
  "token": "your-figma-api-token",
  "fileKey": "file-key-from-url"
}
```

### Get File Comments

```javascript
{
  "action": "get_file_comments",
  "token": "your-figma-api-token",
  "fileKey": "file-key-from-url"
}
```

### Post a Comment

```javascript
{
  "action": "post_file_comment",
  "token": "your-figma-api-token",
  "fileKey": "file-key-from-url",
  "message": "This is a comment from MintFlow!"
}
```

### Get File Images

```javascript
{
  "action": "get_file_images",
  "token": "your-figma-api-token",
  "fileKey": "file-key-from-url",
  "ids": ["node-id-1", "node-id-2"],
  "scale": 2,
  "format": "png"
}
```

### Get File Nodes

```javascript
{
  "action": "get_file_nodes",
  "token": "your-figma-api-token",
  "fileKey": "file-key-from-url",
  "ids": ["node-id-1", "node-id-2"]
}
```

### Get Team Projects

```javascript
{
  "action": "get_team_projects",
  "token": "your-figma-api-token",
  "teamId": "team-id-from-url"
}
```

### Get Project Files

```javascript
{
  "action": "get_project_files",
  "token": "your-figma-api-token",
  "projectId": "project-id"
}
```

### Get Team Components

```javascript
{
  "action": "get_team_components",
  "token": "your-figma-api-token",
  "teamId": "team-id-from-url"
}
```

### Get File Components

```javascript
{
  "action": "get_file_components",
  "token": "your-figma-api-token",
  "fileKey": "file-key-from-url"
}
```

### Get Component Sets

```javascript
{
  "action": "get_component_sets",
  "token": "your-figma-api-token",
  "fileKey": "file-key-from-url"
}
```

### Get Styles

```javascript
{
  "action": "get_styles",
  "token": "your-figma-api-token",
  "fileKey": "file-key-from-url"
}
```

### Create Webhook

```javascript
{
  "action": "create_webhook",
  "token": "your-figma-api-token",
  "teamId": "team-id-from-url",
  "eventType": "FILE_COMMENT",
  "endpoint": "https://your-webhook-endpoint.com/webhook",
  "passcode": "your-webhook-passcode" // Optional
}
```

### Delete Webhook

```javascript
{
  "action": "delete_webhook",
  "token": "your-figma-api-token",
  "webhookId": "webhook-id"
}
```

## Response Examples

### Get File Response

```json
{
  "name": "My Figma Design",
  "lastModified": "2023-01-01T12:00:00Z",
  "thumbnailUrl": "https://s3-alpha.figma.com/thumbnails/...",
  "version": "123456789",
  "document": {
    "id": "0:0",
    "name": "Document",
    "type": "DOCUMENT",
    "children": [
      {
        "id": "0:1",
        "name": "Page 1",
        "type": "CANVAS",
        "children": []
      }
    ]
  },
  "components": {},
  "componentSets": {},
  "styles": {},
  "schemaVersion": 0
}
```

### Get Comments Response

```json
{
  "comments": [
    {
      "id": "12345",
      "client_meta": {
        "node_id": "1:2",
        "node_offset": {
          "x": 100,
          "y": 100
        }
      },
      "message": "This is a comment",
      "file_key": "file-key",
      "parent_id": "",
      "user": {
        "id": "user-id",
        "handle": "username",
        "img_url": "https://url-to-avatar.com"
      },
      "created_at": "2023-01-01T12:00:00Z",
      "resolved_at": null,
      "order_id": "1"
    }
  ]
}
```

### Post Comment Response

```json
{
  "id": "12345"
}
```

### Get Images Response

```json
{
  "err": null,
  "images": {
    "node-id-1": "https://s3-alpha.figma.com/img/...",
    "node-id-2": "https://s3-alpha.figma.com/img/..."
  }
}
```

### Create Webhook Response

```json
{
  "id": "webhook-id",
  "team_id": "team-id",
  "event_type": "FILE_COMMENT",
  "client_id": null,
  "endpoint": "https://your-webhook-endpoint.com/webhook",
  "passcode": "your-webhook-passcode",
  "status": "ACTIVE",
  "description": null,
  "protocol_version": "2"
}
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid API token
- API rate limits exceeded
- Resource not found
- Validation errors from Figma API

## Limitations

- This plugin requires a valid Figma API token
- API rate limits apply as per Figma's policies
- Some operations may require additional permissions or features enabled on your Figma account
- For security reasons, this plugin should only be used in server-side contexts

## Documentation

For more information about the Figma API, refer to the [official documentation](https://www.figma.com/developers/api).
