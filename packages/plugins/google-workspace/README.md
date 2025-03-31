# Google Workspace Plugin for MintFlow

This plugin provides integration with Google Workspace services, allowing you to interact with Google Calendar, Google Contacts, Google Docs, Google Forms, Google Tasks, and more from your MintFlow workflows.

## Features

### Calendar

- **Create Event**: Create a new event in Google Calendar
- **Get Events**: Retrieve events from a Google Calendar with filtering options
- **Update Event**: Update an existing event in Google Calendar
- **Delete Event**: Delete an event from Google Calendar
- **Add Attendees**: Add attendees to an existing Google Calendar event

### Contacts

- **Create Contact**: Create a new contact in Google Contacts with detailed information

### Docs

- **Create Document**: Create a new Google Docs document with optional initial content
- **Append Text**: Append text to an existing Google Docs document
- **Read Document**: Read the content and metadata of a Google Docs document

### Forms

- **Get Form Responses**: Retrieve responses from a Google Form with filtering options

### Tasks

- **Create Task**: Create a new task in Google Tasks with optional due date and notes

## Authentication

This plugin requires OAuth2 authentication with Google. You'll need to:

1. Create a Google Cloud project
2. Enable the necessary APIs (Calendar, Contacts, Docs, Forms, Tasks, etc.)
3. Configure OAuth consent screen
4. Create OAuth client credentials
5. Authorize the application with the required scopes

## Usage Examples

### Creating a Calendar Event

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "calendarId": "primary",
  "summary": "Team Meeting",
  "description": "Weekly team sync-up",
  "location": "Conference Room A",
  "startDateTime": "2023-12-01T10:00:00Z",
  "endDateTime": "2023-12-01T11:00:00Z",
  "attendees": ["colleague1@example.com", "colleague2@example.com"],
  "sendNotifications": "all"
}
```

### Creating a Contact

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "firstName": "John",
  "lastName": "Doe",
  "emailAddresses": [
    { "value": "john.doe@example.com", "type": "work" },
    { "value": "johndoe@personal.com", "type": "home" }
  ],
  "phoneNumbers": [
    { "value": "+1234567890", "type": "mobile" },
    { "value": "+1987654321", "type": "work" }
  ],
  "addresses": [
    {
      "streetAddress": "123 Main St",
      "city": "San Francisco",
      "region": "CA",
      "postalCode": "94105",
      "country": "USA",
      "type": "work"
    }
  ],
  "company": "Acme Inc.",
  "jobTitle": "Software Engineer",
  "notes": "Met at tech conference"
}
```

## Required Scopes

Depending on the actions you use, you'll need to request different OAuth scopes:

- Calendar: `https://www.googleapis.com/auth/calendar` or `https://www.googleapis.com/auth/calendar.events`
- Contacts: `https://www.googleapis.com/auth/contacts`
- Docs: `https://www.googleapis.com/auth/documents` and `https://www.googleapis.com/auth/drive`
- Forms: `https://www.googleapis.com/auth/forms.responses.readonly`
- Tasks: `https://www.googleapis.com/auth/tasks`

## Error Handling

The plugin provides detailed error messages when API calls fail. Common errors include:

- Authentication errors (invalid or expired token)
- Permission errors (insufficient scopes)
- Resource not found errors (invalid calendar or event ID)
- Validation errors (missing required fields)

## Usage Examples

### Creating a Google Document

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "title": "Project Proposal",
  "content": "# Project Proposal\n\nThis document outlines the project scope and timeline.",
  "folderId": "folder_id_in_drive" // Optional
}
```

### Getting Form Responses

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "formId": "your_form_id",
  "includeResponses": true,
  "limit": 10
}
```

### Creating a Task

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "title": "Complete project proposal",
  "notes": "Include budget estimates and timeline",
  "due": "2023-12-31T23:59:59Z",
  "taskListId": "@default"
}
```

## Limitations

- Some advanced features like recurring events with complex patterns may have limited support
- Rate limits apply based on Google's API quotas
- The plugin currently supports a subset of Google Workspace services

## Future Enhancements

- Support for additional Google Workspace services (Sheets, Slides, etc.)
- More actions for existing services (search contacts, import/export, etc.)
- Improved error handling and retry mechanisms
- Support for service account authentication
