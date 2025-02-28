# MintFlow ActiveCampaign Plugin

The ActiveCampaign plugin for MintFlow provides integration with ActiveCampaign's marketing automation, email marketing, and CRM tools. This plugin allows you to manage contacts, accounts, tags, and deals, as well as respond to various ActiveCampaign events.

## Authentication

To use this plugin, you need to provide:

1. **API URL**: Your ActiveCampaign API URL (e.g., https://your-account.api-us1.com)
2. **API Key**: Your ActiveCampaign API Key

You can find these credentials in your ActiveCampaign account under Settings > Developer.

## Actions

### Contact Management

- **Create Contact**: Creates a new contact in ActiveCampaign
- **Update Contact**: Updates an existing contact in ActiveCampaign
- **Add Tag to Contact**: Adds a tag to a contact
- **Add Contact to Account**: Associates a contact with an account
- **Subscribe or Unsubscribe Contact from List**: Manages contact list subscriptions

### Account Management

- **Create Account**: Creates a new account in ActiveCampaign
- **Update Account**: Updates an existing account in ActiveCampaign

## Triggers

- **New Deal Added or Updated**: Triggers when a new deal is created or an existing deal is updated
- **Updated Contact**: Triggers when a contact is updated
- **Tag Added or Removed from Contact**: Triggers when a tag is added to or removed from a contact

## Example Usage

### Creating a Contact

```javascript
const result = await mintflow.activecampaign.create_contact({
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "123-456-7890",
  customFields: {
    "1": "Value for custom field 1"
  }
});
```

### Adding a Tag to a Contact

```javascript
const result = await mintflow.activecampaign.add_tag_to_contact({
  contactId: "123",
  tagId: "456"
});
```

### Creating an Account

```javascript
const result = await mintflow.activecampaign.create_account({
  name: "Acme Corporation",
  accountUrl: "https://acme.example.com",
  customFields: {
    "1": "Value for custom field 1"
  }
});
```

### Subscribing a Contact to a List

```javascript
const result = await mintflow.activecampaign.subscribe_or_unsubscribe_contact_from_list({
  contactId: "123",
  listId: "456",
  status: "1" // 1 = Subscribed, 2 = Unsubscribed
});
```

## Webhook Triggers

This plugin uses ActiveCampaign webhooks to trigger workflows based on events in your ActiveCampaign account. When you enable a trigger, the plugin automatically creates the necessary webhook in your ActiveCampaign account. When you disable the trigger, the webhook is automatically removed.

### Example: Responding to Updated Contacts

```javascript
mintflow.on("activecampaign.updated_contact", async (event) => {
  const contact = event.contact;
  const updatedFields = event.updated_fields;
  
  console.log(`Contact ${contact.email} was updated. Fields changed: ${updatedFields.join(", ")}`);
  
  // Your workflow logic here
});
```

## Dependencies

This plugin uses the following dependencies:

- axios: For making HTTP requests to the ActiveCampaign API

## License

MIT
