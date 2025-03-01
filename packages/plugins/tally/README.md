# Tally Plugin for MintFlow

The Tally plugin for MintFlow provides integration with Tally's form creation platform, allowing you to automate workflows based on form submissions.

## Features

- **Webhook-based Triggers**: Receive real-time notifications for new form submissions
- **No Authentication Required**: Simple setup with no API keys needed
- **Easy Integration**: Quick webhook setup directly in the Tally dashboard

## Triggers

### New Submission

Triggers when a new form submission is received.

#### Configuration

No additional configuration is required for this trigger. You simply need to set up the webhook in your Tally form settings.

#### Setup Instructions

1. Go to the "Dashboard" section in Tally.
2. Select the form where you want the trigger to occur.
3. Click on the "Integrations" section.
4. Find the "Webhooks" integration and click on "Connect" to activate it.
5. In the webhook settings, paste the webhook URL provided by MintFlow.
6. Click on "Submit".

The webhook will now send all new form submissions to your MintFlow workflow.

#### Output

```json
{
  "formId": "abcdefg",
  "responseId": "123456789",
  "submittedAt": "2023-03-15T10:30:45Z",
  "respondent": {
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "fields": [
    {
      "key": "name",
      "label": "Name",
      "type": "TEXT",
      "value": "John Doe"
    },
    {
      "key": "email",
      "label": "Email",
      "type": "EMAIL",
      "value": "john.doe@example.com"
    },
    {
      "key": "message",
      "label": "Message",
      "type": "TEXTAREA",
      "value": "This is a sample message."
    }
  ]
}
```

## Common Use Cases

### Form Submission Processing

- Send email notifications when new form submissions are received
- Store form submissions in a database
- Create tasks in project management tools based on form submissions
- Generate reports from form data

### Data Collection and Analysis

- Collect customer feedback and generate insights
- Gather survey responses for market research
- Process job applications and candidate information
- Collect event registrations and manage attendee lists

## Resources

- [Tally Documentation](https://tally.so/help)
- [Tally Webhooks Guide](https://tally.so/help/webhooks)
