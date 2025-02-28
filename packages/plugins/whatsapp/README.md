# WhatsApp Business Plugin for MintFlow

This plugin provides integration with the WhatsApp Business API, allowing you to send messages, media, and templates through WhatsApp.

## Authentication

To use this plugin, you need to set up WhatsApp Business API access:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app, select "Other" for use case
3. Choose "Business" as the type of app
4. Add a new Product -> WhatsApp
5. Navigate to WhatsApp Settings > API Setup
6. Copy the Business Account ID
7. Login to your [Meta Business Manager](https://business.facebook.com/)
8. Click on Settings
9. Create a new System User with access over the app and copy the access token

You'll need the following credentials:

- **Access Token**: The system user access token of your WhatsApp business account
- **Business Account ID**: The business account ID of your WhatsApp business account
- **Phone Number ID**: The phone number ID that will be used to send messages

## Actions

### Send Message

Sends a text message to a WhatsApp user.

**Input:**

- **To**: The recipient phone number in international format (e.g., +1234567890)
- **Message**: The text message to send

**Output:**

- Response from the WhatsApp API including message ID and status

### Send Media

Sends a media message (image, audio, document, sticker, or video) to a WhatsApp user.

**Input:**

- **To**: The recipient phone number in international format
- **Media Type**: The type of media to send (image, audio, document, sticker, or video)
- **Media URL**: The URL of the media to send
- **Caption** (optional): A caption for the media (supported for image, video, and document)
- **Filename** (optional): Filename of the document to send (only applicable for document type)

**Output:**

- Response from the WhatsApp API including message ID and status

### Send Template Message

Sends a template message to a WhatsApp user. Templates must be pre-approved in your WhatsApp Business account.

**Input:**

- **To**: The recipient phone number in international format
- **Template Name**: The name of the template to use
- **Template Language**: The language code of the template (e.g., en_US, es_ES)
- **Header Parameters** (optional): Parameters for the header section of the template
- **Body Parameters** (optional): Parameters for the body section of the template
- **Button Parameters** (optional): Parameters for the button section of the template

**Output:**

- Response from the WhatsApp API including message ID and status

## Example Usage

### Sending a Text Message

```json
{
  "accessToken": {
    "accessToken": "YOUR_ACCESS_TOKEN",
    "businessAccountId": "YOUR_BUSINESS_ACCOUNT_ID",
    "phoneNumberId": "YOUR_PHONE_NUMBER_ID"
  },
  "to": "+1234567890",
  "text": "Hello from MintFlow!"
}
```

### Sending an Image

```json
{
  "accessToken": {
    "accessToken": "YOUR_ACCESS_TOKEN",
    "businessAccountId": "YOUR_BUSINESS_ACCOUNT_ID",
    "phoneNumberId": "YOUR_PHONE_NUMBER_ID"
  },
  "to": "+1234567890",
  "mediaType": "image",
  "mediaUrl": "https://example.com/image.jpg",
  "caption": "Check out this image!"
}
```

### Sending a Template Message

```json
{
  "accessToken": {
    "accessToken": "YOUR_ACCESS_TOKEN",
    "businessAccountId": "YOUR_BUSINESS_ACCOUNT_ID",
    "phoneNumberId": "YOUR_PHONE_NUMBER_ID"
  },
  "to": "+1234567890",
  "templateName": "order_confirmation",
  "templateLanguage": "en_US",
  "headerParameters": {
    "header1": "Order #12345"
  },
  "bodyParameters": {
    "body1": "John Doe",
    "body2": "$50.00"
  },
  "buttonParameters": {
    "button1": "https://example.com/order/12345"
  }
}
```

## Limitations

- The WhatsApp Business API has rate limits that vary based on your account tier
- Templates must be pre-approved by WhatsApp before they can be used
- Media files must be publicly accessible via URL
- The recipient must have opted in to receive messages from your WhatsApp Business account

## Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/overview)
- [WhatsApp Business API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [WhatsApp Business API Templates](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates)
