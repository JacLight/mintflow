# MintFlow Amazon SNS Plugin

A MintFlow plugin for sending messages to Amazon SNS topics and managing SNS resources.

## Features

- **Send Message**: Send messages to Amazon SNS topics
- **List Topics**: List available SNS topics in your AWS account
- **Create Topic**: Create new SNS topics

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Usage

### Send Message to SNS Topic

Sends a message to an Amazon SNS topic.

```json
{
  "action": "send_message",
  "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID",
  "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY",
  "region": "us-east-1",
  "topicArn": "arn:aws:sns:us-east-1:123456789012:MyTopic",
  "message": "Hello from MintFlow!",
  "subject": "Test Message"
}
```

**Parameters:**

- `accessKeyId`: AWS Access Key ID
- `secretAccessKey`: AWS Secret Access Key
- `region`: AWS Region
- `endpoint` (optional): Custom endpoint URL for S3-compatible services
- `topicArn`: The ARN of the SNS topic to send the message to
- `message`: The message to send to the SNS topic
- `subject` (optional): The subject of the message

**Response:**

```json
{
  "messageId": "00000000-0000-0000-0000-000000000000"
}
```

### List SNS Topics

Lists available SNS topics in your AWS account.

```json
{
  "action": "list_topics",
  "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID",
  "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY",
  "region": "us-east-1"
}
```

**Parameters:**

- `accessKeyId`: AWS Access Key ID
- `secretAccessKey`: AWS Secret Access Key
- `region`: AWS Region
- `endpoint` (optional): Custom endpoint URL for S3-compatible services

**Response:**

```json
{
  "topics": [
    {
      "topicArn": "arn:aws:sns:us-east-1:123456789012:MyTopic1",
      "topicName": "MyTopic1"
    },
    {
      "topicArn": "arn:aws:sns:us-east-1:123456789012:MyTopic2",
      "topicName": "MyTopic2"
    }
  ]
}
```

### Create SNS Topic

Creates a new SNS topic in your AWS account.

```json
{
  "action": "create_topic",
  "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID",
  "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY",
  "region": "us-east-1",
  "topicName": "MyNewTopic",
  "displayName": "My New Topic",
  "tags": [
    {
      "key": "Environment",
      "value": "Production"
    }
  ]
}
```

**Parameters:**

- `accessKeyId`: AWS Access Key ID
- `secretAccessKey`: AWS Secret Access Key
- `region`: AWS Region
- `endpoint` (optional): Custom endpoint URL for S3-compatible services
- `topicName`: The name of the SNS topic to create
- `displayName` (optional): The display name to use for SMS messages
- `tags` (optional): Tags to attach to the topic

**Response:**

```json
{
  "topicArn": "arn:aws:sns:us-east-1:123456789012:MyNewTopic"
}
```

## Example Workflow

Here's an example of how to use the SNS plugin in a MintFlow workflow:

```javascript
// List available SNS topics
const listResult = await mintflow.execute('sns', {
  action: 'list_topics',
  accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
  region: 'us-east-1'
});

console.log('Available topics:', listResult.topics);

// Create a new SNS topic
const createResult = await mintflow.execute('sns', {
  action: 'create_topic',
  accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
  region: 'us-east-1',
  topicName: 'MyNewTopic'
});

console.log('New topic ARN:', createResult.topicArn);

// Send a message to the new topic
const sendResult = await mintflow.execute('sns', {
  action: 'send_message',
  accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
  region: 'us-east-1',
  topicArn: createResult.topicArn,
  message: 'Hello from MintFlow!',
  subject: 'Test Message'
});

console.log('Message ID:', sendResult.messageId);
```

## Error Handling

The plugin provides descriptive error messages for common issues:

- Missing required parameters
- Invalid AWS credentials
- Invalid topic ARN
- Permission issues
- Network errors

## AWS Regions

The plugin supports all AWS regions where SNS is available, including:

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

## Dependencies

The SNS plugin uses the AWS SDK for JavaScript v3 to interact with Amazon SNS:

- @aws-sdk/client-sns

## Development

### Building the Plugin

```bash
cd packages/plugins/sns
npm run build
```

### Running Tests

```bash
cd packages/plugins/sns
npm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
