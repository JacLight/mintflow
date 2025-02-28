# Mailchimp Plugin for MintFlow

The Mailchimp plugin provides integration with Mailchimp's marketing platform, allowing you to manage subscribers, lists, tags, and more.

## Features

- **Subscriber Management**: Add members to lists, update subscriber status
- **Tag Management**: Add and remove tags from subscribers
- **Note Management**: Add notes to subscribers
- **Webhook Processing**: Process Mailchimp webhook events

## Authentication

This plugin requires OAuth authentication with Mailchimp. You'll need:

1. A Mailchimp account
2. An OAuth access token from Mailchimp

To set up OAuth with Mailchimp:

1. Log in to your Mailchimp account
2. Go to Account → Extras → API Keys
3. Click "Create A Key" or use an existing key
4. Use this key as your access token

## Usage

### Add Member to List

Add a new subscriber to a Mailchimp audience (list):

```json
{
  "action": "add_member_to_list",
  "access_token": "your-mailchimp-access-token",
  "list_id": "your-audience-id",
  "email": "subscriber@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "status": "subscribed"
}
```

### Update Subscriber Status

Update the status of an existing subscriber:

```json
{
  "action": "update_subscriber_status",
  "access_token": "your-mailchimp-access-token",
  "list_id": "your-audience-id",
  "email": "subscriber@example.com",
  "status": "unsubscribed"
}
```

### Add Note to Subscriber

Add a note to a subscriber:

```json
{
  "action": "add_note_to_subscriber",
  "access_token": "your-mailchimp-access-token",
  "list_id": "your-audience-id",
  "email": "subscriber@example.com",
  "note": "This subscriber signed up through our webinar."
}
```

### Add Tag to Subscriber

Add a tag to a subscriber:

```json
{
  "action": "add_subscriber_to_tag",
  "access_token": "your-mailchimp-access-token",
  "list_id": "your-audience-id",
  "email": "subscriber@example.com",
  "tag_name": "webinar-attendee"
}
```

### Remove Tag from Subscriber

Remove a tag from a subscriber:

```json
{
  "action": "remove_subscriber_from_tag",
  "access_token": "your-mailchimp-access-token",
  "list_id": "your-audience-id",
  "email": "subscriber@example.com",
  "tag_name": "webinar-attendee"
}
```

### Process Webhook

Process a Mailchimp webhook event:

```json
{
  "action": "process_webhook",
  "access_token": "your-mailchimp-access-token",
  "body": {
    "type": "subscribe",
    "fired_at": "2023-01-01T00:00:00Z",
    "data": {
      "id": "subscriber-id",
      "list_id": "list-id",
      "email": "subscriber@example.com",
      "email_type": "html",
      "ip_opt": "127.0.0.1",
      "ip_signup": "127.0.0.1",
      "merges": {
        "EMAIL": "subscriber@example.com",
        "FNAME": "John",
        "LNAME": "Doe"
      }
    }
  }
}
```

## Subscriber Status Options

When adding or updating subscribers, you can use the following status values:

- `subscribed`: The contact is subscribed to the list
- `unsubscribed`: The contact is unsubscribed from the list
- `cleaned`: The contact's email address has been removed from the list due to bounces
- `pending`: The contact has not confirmed their subscription (double opt-in)
- `transactional`: The contact is only eligible for transactional emails

## Error Handling

The plugin provides detailed error messages for common issues:

- Invalid authentication credentials
- Missing required parameters
- Mailchimp API errors

## Limitations

- The plugin requires a valid Mailchimp OAuth access token
- Some operations may require specific Mailchimp permissions
- The plugin uses Mailchimp Marketing API v3

## Resources

- [Mailchimp Marketing API Documentation](https://mailchimp.com/developer/marketing/api/)
- [Mailchimp API Key Management](https://mailchimp.com/help/about-api-keys/)
- [Mailchimp Audience Management](https://mailchimp.com/help/manage-audience/)
