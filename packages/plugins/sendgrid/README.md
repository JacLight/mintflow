# SendGrid Plugin for MintFlow

This plugin provides integration with SendGrid, a cloud-based email delivery service that enables you to send transactional and marketing emails.

## Authentication

This plugin requires a SendGrid API key for authentication. You can obtain an API key from your SendGrid account settings.

## Actions

### Send Email

Sends a text or HTML email to one or more recipients.

**Input Parameters:**

- `to` (array, required): Array of recipient email addresses
- `from` (string, required): Sender email address (must be verified in your SendGrid account)
- `from_name` (string, optional): Sender name
- `reply_to` (string, optional): Email address for replies (defaults to sender email)
- `subject` (string, required): Email subject
- `content_type` (string, required): Content type, either "text" or "html"
- `content` (string, required): Email content (HTML is only allowed if content_type is "html")

**Example:**

```json
{
  "to": ["recipient@example.com"],
  "from": "sender@yourdomain.com",
  "from_name": "Your Name",
  "subject": "Hello from MintFlow",
  "content_type": "text",
  "content": "This is a test email from MintFlow SendGrid plugin."
}
```

### Send Dynamic Template

Sends an email using a SendGrid dynamic template.

**Input Parameters:**

- `to` (array, required): Array of recipient email addresses
- `from` (string, required): Sender email address (must be verified in your SendGrid account)
- `from_name` (string, optional): Sender name
- `reply_to` (string, optional): Email address for replies (defaults to sender email)
- `template_id` (string, required): SendGrid dynamic template ID
- `template_data` (object, required): Dynamic template data

**Example:**

```json
{
  "to": ["recipient@example.com"],
  "from": "sender@yourdomain.com",
  "from_name": "Your Name",
  "template_id": "d-f3ecde774b7143e6b3f3ec514608253d",
  "template_data": {
    "name": "John Doe",
    "company": "Acme Inc.",
    "verification_link": "https://example.com/verify"
  }
}
```

### Custom API Call

Makes a custom API call to the SendGrid API.

**Input Parameters:**

- `method` (string, required): HTTP method (GET, POST, PUT, DELETE, PATCH)
- `path` (string, required): API path (without the base URL)
- `body` (object, optional): Request body for POST, PUT, and PATCH requests
- `queryParams` (object, optional): Query parameters

**Example:**

```json
{
  "method": "GET",
  "path": "/marketing/contacts",
  "queryParams": {
    "page_size": 100
  }
}
```

## Resources

- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference)
- [SendGrid Developer Documentation](https://docs.sendgrid.com/for-developers)
