# ActiveCampaign Plugin for MintFlow

This plugin provides integration with ActiveCampaign, a powerful marketing automation and CRM platform. It allows you to manage contacts, accounts, tags, and lists within your MintFlow workflows.

## Features

### Contact Management

- **Create Contact**: Create a new contact in ActiveCampaign with customizable fields
- **Update Contact**: Update an existing contact's information
- **Add Tag to Contact**: Add a tag to a contact for better segmentation
- **Subscribe/Unsubscribe Contact**: Manage contact list subscriptions
- **Add Contact to Account**: Associate a contact with an account

### Account Management

- **Create Account**: Create a new account in ActiveCampaign
- **Update Account**: Update an existing account's information

## Authentication

To use this plugin, you'll need:

1. **API URL**: Your ActiveCampaign API URL (e.g., `https://your-account.api-us1.com`)
2. **API Key**: Your ActiveCampaign API Key

You can find these credentials in your ActiveCampaign account under Settings → Developer → API Access.

## Usage Examples

### Creating a Contact

```json
{
  "apiUrl": "https://your-account.api-us1.com",
  "apiKey": "your-api-key",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "123-456-7890",
  "customFields": {
    "1": "Value for custom field 1"
  }
}
```

### Adding a Tag to a Contact

```json
{
  "apiUrl": "https://your-account.api-us1.com",
  "apiKey": "your-api-key",
  "contactId": "123",
  "tagId": "456"
}
```

### Creating an Account

```json
{
  "apiUrl": "https://your-account.api-us1.com",
  "apiKey": "your-api-key",
  "name": "Acme Corporation",
  "accountUrl": "https://acme.com",
  "customFields": {
    "1": "Value for custom field 1"
  }
}
```

## Common Use Cases

- **Lead Management**: Automatically create contacts and add them to specific lists based on form submissions or other triggers
- **Contact Segmentation**: Add tags to contacts based on their behavior or characteristics
- **Account-Based Marketing**: Associate contacts with accounts to better track and manage B2B relationships
- **Subscription Management**: Subscribe or unsubscribe contacts from lists based on their preferences or actions

## API Documentation

For more information about the ActiveCampaign API, visit the [official API documentation](https://developers.activecampaign.com/reference).
