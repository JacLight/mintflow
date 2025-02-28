# Zoom Plugin for MintFlow

This plugin provides integration with the Zoom API, allowing you to create and manage meetings, handle registrations, and access user information.

## Features

- Create, retrieve, update, and delete Zoom meetings
- List meetings for a user
- Create and list meeting registrants
- Retrieve user information
- List users in an account

## Authentication

To use this plugin, you need a Zoom API OAuth token. There are two environments:

- **Sandbox**: For testing and development
- **Production**: For production use

### How to obtain a Zoom API token

1. Go to the [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Sign in with your Zoom account
3. Click on "Develop" in the top-right corner, then "Build App"
4. Select "OAuth" as the app type
5. Fill in the required information for your app
6. Under "Scopes", add the following scopes:
   - `meeting:read:admin`
   - `meeting:write:admin`
   - `user:read:admin`
7. Add a redirect URL (e.g., `https://your-app.com/auth/callback`)
8. Save your app and note the Client ID and Client Secret
9. Use these credentials to obtain an OAuth token via the OAuth 2.0 flow

## Usage

### Create a Meeting

```javascript
{
  "action": "create_meeting",
  "token": "your-zoom-api-token",
  "topic": "Weekly Team Meeting",
  "type": 2, // 1: Instant, 2: Scheduled, 3: Recurring with no fixed time, 8: Recurring with fixed time
  "start_time": "2023-01-01T10:00:00",
  "duration": 60,
  "timezone": "America/New_York",
  "password": "123456", // Optional
  "agenda": "Discuss project updates", // Optional
  "settings": { // Optional
    "host_video": true,
    "participant_video": true,
    "join_before_host": false,
    "mute_upon_entry": true,
    "auto_recording": "none",
    "waiting_room": true
  }
}
```

### Get Meeting Details

```javascript
{
  "action": "get_meeting",
  "token": "your-zoom-api-token",
  "meetingId": "123456789"
}
```

### Update a Meeting

```javascript
{
  "action": "update_meeting",
  "token": "your-zoom-api-token",
  "meetingId": "123456789",
  "topic": "Updated Team Meeting", // Optional
  "type": 2, // Optional
  "start_time": "2023-01-02T10:00:00", // Optional
  "duration": 90, // Optional
  "timezone": "America/New_York", // Optional
  "password": "654321", // Optional
  "agenda": "Updated agenda", // Optional
  "settings": { // Optional
    "host_video": false,
    "participant_video": false,
    "join_before_host": true,
    "mute_upon_entry": false,
    "auto_recording": "cloud",
    "waiting_room": false
  }
}
```

### Delete a Meeting

```javascript
{
  "action": "delete_meeting",
  "token": "your-zoom-api-token",
  "meetingId": "123456789",
  "occurrenceId": "1234567890", // Optional, for recurring meetings
  "scheduleForReminder": true, // Optional
  "cancelMeetingReminder": true // Optional
}
```

### List Meetings

```javascript
{
  "action": "list_meetings",
  "token": "your-zoom-api-token",
  "userId": "me", // Optional, defaults to "me"
  "meetingType": "scheduled", // Optional, options: scheduled, live, upcoming, upcoming_meetings, previous_meetings, pmi
  "pageSize": 30, // Optional
  "pageNumber": 1, // Optional
  "nextPageToken": "token" // Optional
}
```

### Create Meeting Registrant

```javascript
{
  "action": "create_meeting_registrant",
  "token": "your-zoom-api-token",
  "meetingId": "123456789",
  "email": "attendee@example.com",
  "first_name": "John",
  "last_name": "Doe", // Optional
  "address": "123 Main St", // Optional
  "city": "New York", // Optional
  "state": "NY", // Optional
  "zip": "10001", // Optional
  "country": "US", // Optional
  "phone": "123-456-7890", // Optional
  "industry": "Technology", // Optional
  "org": "Example Inc", // Optional
  "job_title": "Developer", // Optional
  "comments": "Looking forward to the meeting", // Optional
  "custom_questions": { // Optional
    "How did you hear about us?": "From a friend",
    "What topics are you interested in?": "API Integration"
  }
}
```

### List Meeting Registrants

```javascript
{
  "action": "list_meeting_registrants",
  "token": "your-zoom-api-token",
  "meetingId": "123456789",
  "status": "approved", // Optional, options: pending, approved, denied
  "pageSize": 30, // Optional
  "pageNumber": 1, // Optional
  "nextPageToken": "token" // Optional
}
```

### Get User Details

```javascript
{
  "action": "get_user",
  "token": "your-zoom-api-token",
  "userId": "me" // Optional, defaults to "me"
}
```

### List Users

```javascript
{
  "action": "list_users",
  "token": "your-zoom-api-token",
  "status": "active", // Optional
  "pageSize": 30, // Optional
  "pageNumber": 1, // Optional
  "nextPageToken": "token" // Optional
}
```

## Response Examples

### Create Meeting Response

```json
{
  "id": 123456789,
  "topic": "Weekly Team Meeting",
  "type": 2,
  "start_time": "2023-01-01T10:00:00Z",
  "duration": 60,
  "timezone": "America/New_York",
  "created_at": "2023-01-01T00:00:00Z",
  "join_url": "https://zoom.us/j/123456789",
  "password": "123456",
  "settings": {
    "host_video": true,
    "participant_video": true,
    "join_before_host": false,
    "mute_upon_entry": true,
    "auto_recording": "none",
    "waiting_room": true
  }
}
```

### Create Meeting Registrant Response

```json
{
  "id": 987654321,
  "registrant_id": "abcdef123456",
  "topic": "Weekly Team Meeting",
  "start_time": "2023-01-01T10:00:00Z",
  "join_url": "https://zoom.us/j/123456789?pwd=abcdef123456",
  "participant_pin_code": 123456
}
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid API token
- API rate limits exceeded
- Resource not found
- Validation errors from Zoom

## Limitations

- This plugin requires a valid Zoom API token
- API rate limits apply as per Zoom's policies
- Some operations may require additional permissions or features enabled on your Zoom account
- For security reasons, this plugin should only be used in server-side contexts

## Documentation

For more information about the Zoom API, refer to the [official documentation](https://marketplace.zoom.us/docs/api-reference/zoom-api/).
