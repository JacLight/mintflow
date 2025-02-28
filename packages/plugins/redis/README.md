# MintFlow Redis Plugin

A MintFlow plugin for connecting to Redis databases for caching, pub/sub messaging, and data storage.

## Features

- **Key-Value Operations**: Set, get, delete, and check existence of keys
- **Expiration Management**: Set TTL and check remaining time for keys
- **Counter Operations**: Increment and decrement values
- **Hash Operations**: Store and retrieve field-value pairs within a key
- **List Operations**: Push, pop, and retrieve ranges of elements from lists
- **Pub/Sub Messaging**: Publish messages to channels
- **Custom Commands**: Execute any Redis command with custom arguments

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Configuration

The Redis plugin requires the following configuration:

```json
{
  "url": "redis://localhost:6379",
  "username": "",
  "password": "",
  "database": 0
}
```

| Parameter | Description | Required |
|-----------|-------------|----------|
| url | The Redis connection URL (e.g., redis://localhost:6379) | Yes |
| username | The username for Redis authentication (optional) | No |
| password | The password for Redis authentication (optional) | No |
| database | The Redis database number to use (default: 0) | No |

## Usage

### Key-Value Operations

#### Set Key

Set a key-value pair in Redis with an optional expiration time.

```javascript
const result = await mintflow.execute('redis', {
  action: 'set',
  key: 'user:1',
  value: '{"name":"John","email":"john@example.com"}',
  expiration: 3600 // Optional: expires in 1 hour
});

console.log(result.result); // "OK"
```

#### Get Key

Get the value of a key from Redis.

```javascript
const result = await mintflow.execute('redis', {
  action: 'get',
  key: 'user:1'
});

console.log(result.result); // '{"name":"John","email":"john@example.com"}'
```

#### Delete Key

Delete a key from Redis.

```javascript
const result = await mintflow.execute('redis', {
  action: 'delete',
  key: 'user:1'
});

console.log(result.result); // 1 (number of keys deleted)
```

#### Key Exists

Check if a key exists in Redis.

```javascript
const result = await mintflow.execute('redis', {
  action: 'exists',
  key: 'user:1'
});

console.log(result.result); // true or false
```

### Expiration Management

#### Set Expiration

Set an expiration time for a key.

```javascript
const result = await mintflow.execute('redis', {
  action: 'expire',
  key: 'user:1',
  seconds: 3600
});

console.log(result.result); // true if the timeout was set, false if the key doesn't exist
```

#### Get TTL

Get the remaining time to live of a key.

```javascript
const result = await mintflow.execute('redis', {
  action: 'ttl',
  key: 'user:1'
});

console.log(result.result); // Time to live in seconds, -1 if no expiration, -2 if the key doesn't exist
```

### Counter Operations

#### Increment

Increment the integer value of a key by one.

```javascript
const result = await mintflow.execute('redis', {
  action: 'incr',
  key: 'counter'
});

console.log(result.result); // New value after increment
```

#### Increment By

Increment the integer value of a key by the given amount.

```javascript
const result = await mintflow.execute('redis', {
  action: 'incrBy',
  key: 'counter',
  increment: 5
});

console.log(result.result); // New value after increment
```

#### Decrement

Decrement the integer value of a key by one.

```javascript
const result = await mintflow.execute('redis', {
  action: 'decr',
  key: 'counter'
});

console.log(result.result); // New value after decrement
```

#### Decrement By

Decrement the integer value of a key by the given amount.

```javascript
const result = await mintflow.execute('redis', {
  action: 'decrBy',
  key: 'counter',
  decrement: 5
});

console.log(result.result); // New value after decrement
```

### Hash Operations

#### Hash Set

Set a field in a hash stored at key to value.

```javascript
const result = await mintflow.execute('redis', {
  action: 'hSet',
  key: 'user:1:profile',
  field: 'name',
  value: 'John Doe'
});

console.log(result.result); // 1 if field is a new field in the hash and value was set, 0 if field already exists and the value was updated
```

#### Hash Get

Get the value of a field in a hash.

```javascript
const result = await mintflow.execute('redis', {
  action: 'hGet',
  key: 'user:1:profile',
  field: 'name'
});

console.log(result.result); // "John Doe"
```

#### Hash Get All

Get all fields and values in a hash.

```javascript
const result = await mintflow.execute('redis', {
  action: 'hGetAll',
  key: 'user:1:profile'
});

console.log(result.result); // { name: "John Doe", email: "john@example.com", ... }
```

#### Hash Delete

Delete a field from a hash.

```javascript
const result = await mintflow.execute('redis', {
  action: 'hDel',
  key: 'user:1:profile',
  field: 'name'
});

console.log(result.result); // 1 if field was removed, 0 if field does not exist
```

### List Operations

#### List Push Left

Prepend one or multiple values to a list.

```javascript
const result = await mintflow.execute('redis', {
  action: 'lPush',
  key: 'tasks',
  values: ['task1', 'task2', 'task3']
});

console.log(result.result); // Length of the list after the push operation
```

#### List Push Right

Append one or multiple values to a list.

```javascript
const result = await mintflow.execute('redis', {
  action: 'rPush',
  key: 'tasks',
  values: ['task4', 'task5']
});

console.log(result.result); // Length of the list after the push operation
```

#### List Pop Left

Remove and get the first element in a list.

```javascript
const result = await mintflow.execute('redis', {
  action: 'lPop',
  key: 'tasks'
});

console.log(result.result); // "task1"
```

#### List Pop Right

Remove and get the last element in a list.

```javascript
const result = await mintflow.execute('redis', {
  action: 'rPop',
  key: 'tasks'
});

console.log(result.result); // "task5"
```

#### List Range

Get a range of elements from a list.

```javascript
const result = await mintflow.execute('redis', {
  action: 'lRange',
  key: 'tasks',
  start: 0,
  stop: -1 // Get all elements
});

console.log(result.result); // ["task2", "task3", "task4"]
```

### Pub/Sub Messaging

#### Publish Message

Publish a message to a channel.

```javascript
const result = await mintflow.execute('redis', {
  action: 'publish',
  channel: 'notifications',
  message: '{"type":"alert","message":"System maintenance in 5 minutes"}'
});

console.log(result.result); // Number of clients that received the message
```

### Custom Commands

#### Execute Command

Execute a custom Redis command.

```javascript
const result = await mintflow.execute('redis', {
  action: 'executeCommand',
  command: 'MSET',
  args: ['key1', 'value1', 'key2', 'value2']
});

console.log(result.result); // Result of the command
```

## Error Handling

All actions will return an error property if the operation fails. You can check for this property to handle errors gracefully.

```javascript
const result = await mintflow.execute('redis', {
  action: 'get',
  key: 'non_existent_key'
});

if (result.error) {
  console.error('Redis error:', result.error);
  // Handle the error appropriately
} else {
  console.log('Value:', result.result);
}
```

## Example Workflow

Here's an example of how to use the Redis plugin in a MintFlow workflow for rate limiting:

```javascript
// Check if the user has exceeded the rate limit
const checkResult = await mintflow.execute('redis', {
  action: 'get',
  key: `rate_limit:${input.data.userId}`
});

if (checkResult.result && parseInt(checkResult.result) >= 100) {
  return {
    success: false,
    message: "Rate limit exceeded. Please try again later."
  };
}

// Increment the counter
const incrResult = await mintflow.execute('redis', {
  action: 'incrBy',
  key: `rate_limit:${input.data.userId}`,
  increment: 1
});

// Set expiration if this is the first request
if (incrResult.result === 1) {
  await mintflow.execute('redis', {
    action: 'expire',
    key: `rate_limit:${input.data.userId}`,
    seconds: 3600 // Reset after 1 hour
  });
}

// Process the request
// ...

return {
  success: true,
  message: "Request processed successfully",
  remainingRequests: 100 - incrResult.result
};
```

## Security Considerations

- The plugin uses the official Redis client library which handles authentication securely
- Passwords are stored securely and never exposed in client-side code
- All operations are performed using the Redis client's methods, which handle input sanitization

## Limitations

- The plugin requires a valid Redis connection URL
- Some operations may be limited by your Redis server's configuration
- Redis Cluster is not currently supported

## Development

### Building the Plugin

```bash
cd packages/plugins/redis
pnpm build
```

### Running Tests

```bash
cd packages/plugins/redis
pnpm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
