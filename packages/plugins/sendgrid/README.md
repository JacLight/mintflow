# SendGrid Plugin for MintFlow

This plugin provides integration with SendGrid, an email delivery service for sending transactional and marketing emails.

## Features

- Send plain text or HTML emails
- Send emails using dynamic templates
- Support for CC and BCC recipients
- Custom sender names and reply-to addresses

## Authentication

This plugin requires a SendGrid API Key for authentication. You can create an API key in your SendGrid account under Settings > API Keys.

## Usage

### Send Email

Send a plain text or HTML email to one or more recipients.

```javascript
const result = await mintflow.plugins.sendgrid.send_email({
  apiKey: "SG.your-api-key",
  to: ["recipient@example.com", "another@example.com"],
  cc: ["cc-recipient@example.com"],
  bcc: ["bcc-recipient@example.com"],
  from: "sender@example.com",
  fromName: "Sender Name",
  replyTo: "reply@example.com",
  subject: "Hello from SendGrid",
  contentType: "html",
  content: "<p>This is a test email from SendGrid</p>"
});
```

### Send Email with Dynamic Template

Send an email using a SendGrid dynamic template with personalized data.

```javascript
const result = await mintflow.plugins.sendgrid.send_dynamic_template({
  apiKey: "SG.your-api-key",
  to: ["recipient@example.com"],
  from: "sender@example.com",
  fromName: "Sender Name",
  templateId: "d-f3ecfbd9a7dd46a39f70d0a42a9a649a",
  templateData: {
    name: "John Doe",
    company: "Acme Inc.",
    verificationLink: "https://example.com/verify"
  }
});
```

## API Documentation

For more information about the SendGrid API, please refer to the [official documentation](https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api).

## Creating Dynamic Templates

To create and manage dynamic templates in SendGrid:

1. Log in to your SendGrid account
2. Navigate to Email API > Dynamic Templates
3. Click "Create a Dynamic Template"
4. Design your template using the design editor or code editor
5. Use Handlebars syntax for dynamic content (e.g., `{{name}}`)
6. Save your template and note the template ID for use with this plugin
