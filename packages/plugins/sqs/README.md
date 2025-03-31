# MintFlow Amazon SQS Plugin

A MintFlow plugin for sending messages to Amazon SQS queues and managing SQS resources.

## Features

- **Send Message**: Send messages to Amazon SQS queues
- **List Queues**: List available SQS queues in your AWS account
- **Create Queue**: Create new SQS queues with customizable settings

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Usage

### Send Message to SQS Queue

Sends a message to an Amazon SQS queue.

```json
{
  "action": "send_message",
  "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID",
  "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY",
  "region": "us-east-1",
  "queueUrl": "https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue",
  "messageBody": "Hello from MintFlow!",
  "delaySeconds": 0,
  "messageAttributes": {
    "CustomAttribute": {
      "DataType": "String",
      "StringValue": "CustomValue"
    }
  },
  "messageGroupId": "group1",
  "messageDeduplicationId": "unique-id-1"
}
```

**Parameters:**

- `accessKeyId`: AWS Access Key ID
- `secretAccessKey`: AWS Secret Access Key
- `region`: AWS Region
- `endpoint` (optional): Custom endpoint URL for SQS-compatible services
- `queueUrl`: The URL of the SQS queue to send the message to
- `messageBody`: The message to send to the SQS queue
- `delaySeconds` (optional): The length of time to delay the message (0-900 seconds)
- `messageAttributes` (optional): Custom attributes to include with the message
- `messageGroupId` (optional): Required for FIFO queues. Specifies that a message belongs to a specific message group
- `messageDeduplicationId` (optional): Required for FIFO queues. Specifies that a message is unique within a 5-minute deduplication interval

**Response:**

```json
{
  "messageId": "00000000-0000-0000-0000-000000000000",
  "sequenceNumber": "00000000000000000000" // Only for FIFO queues
}
```

### List SQS Queues

Lists available SQS queues in your AWS account.

```json
{
  "action": "list_queues",
  "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID",
  "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY",
  "region": "us-east-1",
  "queueNamePrefix": "MyQueue"
}
```

**Parameters:**

- `accessKeyId`: AWS Access Key ID
- `secretAccessKey`: AWS Secret Access Key
- `region`: AWS Region
- `endpoint` (optional): Custom endpoint URL for SQS-compatible services
- `queueNamePrefix` (optional): Filter queues by name prefix

**Response:**

```json
{
  "queues": [
    {
      "queueUrl": "https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue1",
      "queueName": "MyQueue1"
    },
    {
      "queueUrl": "https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue2",
      "queueName": "MyQueue2"
    }
  ]
}
```

### Create SQS Queue

Creates a new SQS queue in your AWS account.

```json
{
  "action": "create_queue",
  "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID",
  "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY",
  "region": "us-east-1",
  "queueName": "MyNewQueue",
  "isFifo": false,
  "delaySeconds": 0,
  "messageRetentionPeriod": 345600,
  "visibilityTimeout": 30,
  "maxMessageSize": 262144,
  "contentBasedDeduplication": false,
  "tags": {
    "Environment": "Production",
    "Project": "MintFlow"
  }
}
```

**Parameters:**

- `accessKeyId`: AWS Access Key ID
- `secretAccessKey`: AWS Secret Access Key
- `region`: AWS Region
- `endpoint` (optional): Custom endpoint URL for SQS-compatible services
- `queueName`: The name of the SQS queue to create
- `isFifo` (optional): Whether to create a FIFO (First-In-First-Out) queue (default: false)
- `delaySeconds` (optional): The default delay for messages in seconds (0-900)
- `messageRetentionPeriod` (optional): The number of seconds to retain messages (60-1209600)
- `visibilityTimeout` (optional): The visibility timeout for the queue in seconds (0-43200)
- `maxMessageSize` (optional): The maximum message size in bytes (1024-262144)
- `contentBasedDeduplication` (optional): Enable content-based deduplication for FIFO queues (default: false)
- `tags` (optional): Key-value pairs to tag the queue

**Response:**

```json
{
  "queueUrl": "https://sqs.us-east-1.amazonaws.com/123456789012/MyNewQueue"
}
```

## Example Workflow

Here's an example of how to use the SQS plugin in a MintFlow workflow:

```javascript
// List available SQS queues
const listResult = await mintflow.execute('sqs', {
  action: 'list_queues',
  accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
  region: 'us-east-1'
});

console.log('Available queues:', listResult.queues);

// Create a new SQS queue
const createResult = await mintflow.execute('sqs', {
  action: 'create_queue',
  accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
  region: 'us-east-1',
  queueName: 'MyNewQueue'
});

console.log('New queue URL:', createResult.queueUrl);

// Send a message to the new queue
const sendResult = await mintflow.execute('sqs', {
  action: 'send_message',
  accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
  region: 'us-east-1',
  queueUrl: createResult.queueUrl,
  messageBody: 'Hello from MintFlow!'
});

console.log('Message ID:', sendResult.messageId);
```

## Error Handling

The plugin provides descriptive error messages for common issues:

- Missing required parameters
- Invalid AWS credentials
- Invalid queue URL
- Permission issues
- Network errors

## AWS Regions

The plugin supports all AWS regions where SQS is available, including:

- US East (N. Virginia) - us-east-1
- US East (Ohio) - us-east-2
- US West (N. California) - us-west-1
- US West (Oregon) - us-west-2
- Africa (Cape Town) - af-south-1
- Asia Pacific (Hong Kong) - ap-east-1
- Asia Pacific (Mumbai) - ap-south-1
- Asia Pacific (Seoul) - ap-northeast-2
- Asia Pacific (Singapore) - ap-southeast-1
- Asia Pacific (Sydney) - ap-southeast-2
- Asia Pacific (Tokyo) - ap-northeast-1
- Canada (Central) - ca-central-1
- Europe (Frankfurt) - eu-central-1
- Europe (Ireland) - eu-west-1
- Europe (London) - eu-west-2
- Europe (Milan) - eu-south-1
- Europe (Paris) - eu-west-3
- Europe (Stockholm) - eu-north-1
- Middle East (Bahrain) - me-south-1
- South America (São Paulo) - sa-east-1

## FIFO Queues

FIFO (First-In-First-Out) queues have special considerations:

- Queue names must end with `.fifo` (the plugin will add this suffix if needed)
- Messages are processed in the exact order they are sent
- Messages are delivered exactly once
- Message deduplication is required (either through content-based deduplication or by providing a message deduplication ID)
- Message group ID is required to specify that a message belongs to a specific message group

## Dependencies

The SQS plugin uses the AWS SDK for JavaScript v3 to interact with Amazon SQS:

- @aws-sdk/client-sqs

## Development

### Building the Plugin

```bash
cd packages/plugins/sqs
npm run build
```

### Running Tests

```bash
cd packages/plugins/sqs
npm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
