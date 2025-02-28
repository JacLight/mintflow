# ConvertKit Plugin for MintFlow

This plugin provides integration with ConvertKit, an email marketing platform designed for creators. It allows you to manage subscribers, tags, forms, sequences, custom fields, and webhooks.

## Features

### Subscriber Management

- Get subscriber by ID or email
- List all subscribers with filtering options
- Update subscriber information
- Unsubscribe subscribers
- View tags associated with a subscriber

### Tag Management

- List all tags
- Create new tags
- Add tags to subscribers
- Remove tags from subscribers
- View subscriptions to a tag

### Form Management

- List all forms
- Add subscribers to forms
- View form subscriptions

### Sequence Management

- List all sequences
- Add subscribers to sequences
- View sequence subscriptions

### Custom Field Management

- List all custom fields
- Create new custom fields
- Update existing custom fields
- Delete custom fields

### Webhook Management

- Create webhooks for various events
- Delete webhooks

## Authentication

This plugin requires a ConvertKit API Secret for authentication. You can find your API Secret in your ConvertKit account settings under "API & Integrations".

## Usage

### Get a Subscriber by Email

```javascript
const result = await mintflow.plugins.convertkit.get_subscriber_by_email({
  apiSecret: "your-api-secret",
  email: "john@example.com"
});
```

### Create a Tag

```javascript
const result = await mintflow.plugins.convertkit.create_tag({
  apiSecret: "your-api-secret",
  name: "New Tag"
});
```

### Add a Subscriber to a Form

```javascript
const result = await mintflow.plugins.convertkit.add_subscriber_to_form({
  apiSecret: "your-api-secret",
  formId: "123456",
  email: "john@example.com",
  firstName: "John",
  fields: {
    custom_field_1: "value1"
  },
  tags: ["789", "101112"]
});
```

### Create a Custom Field

```javascript
const result = await mintflow.plugins.convertkit.create_field({
  apiSecret: "your-api-secret",
  label: "New Custom Field"
});
```

### Create a Webhook

```javascript
const result = await mintflow.plugins.convertkit.create_webhook({
  apiSecret: "your-api-secret",
  targetUrl: "https://example.com/webhook",
  event: "subscriber.tag_add",
  tagId: "123456"
});
```

## API Documentation

For more information about the ConvertKit API, please refer to the [official documentation](https://developers.convertkit.com/).
