# JotForm Plugin for MintFlow

The JotForm plugin for MintFlow provides integration with JotForm's online form and survey platform, allowing you to automate workflows based on form submissions and interact with the JotForm API.

## Features

- **Webhook-based Triggers**: Receive real-time notifications for new form submissions
- **Custom API Calls**: Make custom API calls to the JotForm API for advanced use cases
- **Multi-region Support**: Compatible with US, EU, and HIPAA-compliant JotForm instances

## Authentication

The JotForm plugin uses API key authentication. You'll need to:

1. Log in to your JotForm account at [https://www.jotform.com/](https://www.jotform.com/)
2. Go to Settings -> API
3. Click on "Create New Key" button
4. Change the permissions to "Full Access"
5. Copy the API Key and use it in your MintFlow workflow

## Triggers

### New Submission

Triggers when a new form submission is received.

#### Configuration

- **Form ID**: The ID of the JotForm form to monitor for submissions

#### Output

```json
{
  "formID": "230583697150159",
  "submissionID": "5308741572752112119",
  "formTitle": "Sample Form",
  "ip": "192.168.1.1",
  "submissionDate": "2023-03-15 10:30:45",
  "answers": {
    "1": {
      "name": "name",
      "type": "control_fullname",
      "answer": {
        "first": "John",
        "last": "Doe"
      }
    },
    "2": {
      "name": "email",
      "type": "control_email",
      "answer": "john.doe@example.com"
    },
    "3": {
      "name": "message",
      "type": "control_textarea",
      "answer": "This is a sample message."
    }
  }
}
```

## Actions

### Custom API Call

Make a custom API call to the JotForm API.

#### Input

```json
{
  "method": "GET",
  "path": "user/forms",
  "queryParams": {
    "limit": 10,
    "offset": 0
  }
}
```

#### Output

```json
{
  "responseCode": 200,
  "message": "success",
  "content": [
    {
      "id": "230583697150159",
      "username": "user_name",
      "title": "Sample Form",
      "height": "539",
      "status": "ENABLED",
      "created_at": "2023-03-15 10:30:45",
      "updated_at": "2023-03-15 10:30:45",
      "last_submission": "2023-03-15 10:30:45",
      "new": "0",
      "count": "1",
      "type": "LEGACY",
      "favorite": "0",
      "archived": "0",
      "url": "https://form.jotform.com/230583697150159"
    }
  ]
}
```

## Common Use Cases

### Form Submission Processing

- Send email notifications when new form submissions are received
- Store form submissions in a database
- Create tasks in project management tools based on form submissions
- Generate PDF documents from form submissions

### Form Management

- Create and update forms programmatically
- Retrieve form submissions for reporting
- Export form data to other systems

## Resources

- [JotForm API Documentation](https://api.jotform.com/docs/)
- [JotForm Developer Guide](https://www.jotform.com/developers/)
- [JotForm API Reference](https://api.jotform.com/docs/api-reference)
