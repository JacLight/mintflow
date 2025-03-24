# KrispCall Plugin for MintFlow

This plugin provides integration with KrispCall's cloud telephony system, offering advanced features for high-growth startups and modern enterprises.

## Features

- Add and manage contacts in KrispCall
- Send SMS and MMS messages
- Receive webhooks for new voicemails, SMS/MMS messages, contacts, and call logs

## Authentication

To use this plugin, you need a KrispCall API key. You can get one by:

1. Creating an account at [krispcall.com](https://www.krispcall.com/)
2. Navigating to the API section in your account settings
3. Generating an API key

## Actions

### Add Contact

Add a new contact to KrispCall.

**Input Parameters:**

- `name` (optional): The name of the contact
- `number` (required): The contact number
- `address` (optional): The address of the contact
- `company` (optional): The company of the contact
- `email` (optional): The email of the contact

**Output:**

- Contact details including ID and provided information

### Delete Contacts

Delete contacts from KrispCall.

**Input Parameters:**

- `contactIds` (required): Array of contact IDs to delete

**Output:**

- Success status
- Message
- List of deleted contact IDs

### Send SMS

Send an SMS message through KrispCall.

**Input Parameters:**

- `from_number` (required): The phone number to send from
- `to_number` (required): The phone number to send to
- `content` (required): The content of the SMS message

**Output:**

- Message ID
- Status
- Message details

### Send MMS

Send an MMS message with media through KrispCall.

**Input Parameters:**

- `from_number` (required): The phone number to send from
- `to_number` (required): The phone number to send to
- `content` (required): The content of the MMS message
- `media_url` (required): URL of the media to send

**Output:**

- Message ID
- Status
- Message details

## Triggers

### New Voicemail

Triggered when a new voicemail is received.

**Output:**

- `id`: Voicemail ID
- `from`: Caller phone number
- `duration`: Duration of the voicemail
- `call_time`: Time when the call was received
- `voicemail_audio`: URL to the voicemail audio file

### New SMS/MMS

Triggered when a new SMS or MMS is received.

**Output:**

- `id`: Message ID
- `from_number`: Sender phone number
- `to_number`: Recipient phone number
- `content`: Message content
- `media_link`: URL to the media (for MMS)

### New Contact

Triggered when a new contact is added.

**Output:**

- `id`: Contact ID
- `email`: Contact email
- `company`: Contact company
- `address`: Contact address
- `name`: Contact name
- `contactNumber`: Contact phone number

### New Call Log

Triggered when a new call log is recorded.

**Output:**

- `id`: Call log ID
- `callFrom`: Caller phone number
- `callTo`: Recipient phone number
- `direction`: Call direction (Incoming/Outgoing)
- `duration`: Call duration
- `outcome`: Call outcome (Completed, Missed, etc.)
- `callRecording`: URL to the call recording (if available)

### Outbound SMS/MMS

Triggered when a new SMS or MMS is sent.

**Output:**

- `id`: Message ID
- `from_number`: Sender phone number
- `to_number`: Recipient phone number
- `content`: Message content
- `media_link`: URL to the media (for MMS)

## Example Usage

```javascript
// Add a contact to KrispCall
const result = await mintflow.execute('krisp-call', 'add-contact', {
  name: 'John Doe',
  number: 9876543210,
  email: 'john@example.com',
  company: 'Example Inc',
  address: '123 Main St'
}, {
  auth: {
    api_key: 'your-krispcall-api-key'
  }
});

// Send an SMS message
const smsResult = await mintflow.execute('krisp-call', 'send-sms', {
  from_number: '+11234567890',
  to_number: 9876543210,
  content: 'Hello from MintFlow!'
}, {
  auth: {
    api_key: 'your-krispcall-api-key'
  }
});
```

## API Documentation

For more information about the KrispCall API, refer to the [official documentation](https://www.krispcall.com/developers).
