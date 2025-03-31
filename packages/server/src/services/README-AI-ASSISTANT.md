# Personal AI Assistant for MintFlow

This module provides a personal AI assistant service for MintFlow users. It connects directly to OpenAI's API to provide intelligent assistance for getting things done.

## Features

- Real-time AI assistance through Socket.IO
- Conversation history management
- Support for streaming responses
- Configurable system prompt and model

## Architecture

The AI Assistant implementation consists of two main components:

1. **AIAssistant Service**: A dedicated service that handles communication with OpenAI's API and manages conversation history.
2. **AINamespace**: A Socket.IO namespace that provides real-time communication with clients.

## Configuration

The AI Assistant can be configured through environment variables:

```
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_DEFAULT_MODEL=gpt-4o
OPENAI_SYSTEM_PROMPT=You are a helpful personal assistant for MintFlow users. Help them get things done efficiently.
```

## Usage

### Server-Side

The AIAssistant service is implemented as a singleton and can be imported and used in any part of the server:

```typescript
import { aiAssistant } from '../services/AIAssistant.js';

// Process a message
const response = await aiAssistant.processMessage(userId, userMessage, model);

// Process a message with streaming
await aiAssistant.processMessageStream(
  userId,
  userMessage,
  (chunk) => {
    // Handle each chunk
    console.log(chunk.text);
    if (chunk.isComplete) {
      console.log('Stream complete');
    }
  },
  model
);

// Clear conversation history
aiAssistant.clearConversationHistory(userId);
```

### Client-Side

Clients can interact with the AI Assistant through the Socket.IO `/ai` namespace:

```javascript
// Connect to the AI namespace
const aiSocket = io(`${SERVER_URL}/ai`, {
  auth: {
    token: AUTH_TOKEN // Optional: JWT token for authentication
  }
});

// Send a non-streaming request
const requestId = uuidv4();
aiSocket.emit('ai_request', {
  requestId,
  model: 'gpt-4o', // Optional: Use the configured model or specify one
  prompt: 'Hello, I need help organizing my tasks for today.',
  stream: false
});

// Send a streaming request
const streamRequestId = uuidv4();
aiSocket.emit('ai_request', {
  requestId: streamRequestId,
  model: 'gpt-4o', // Optional: Use the configured model or specify one
  prompt: 'Can you suggest a step-by-step plan for implementing a new feature?',
  stream: true
});

// Clear conversation history
aiSocket.emit('clear_history');

// Listen for responses
aiSocket.on('ai_response', (data) => {
  console.log('AI response received:', data.response);
});

// Listen for streaming events
aiSocket.on('ai_stream_start', (data) => {
  console.log('AI stream started:', data);
});

aiSocket.on('ai_stream_chunk', (data) => {
  console.log('Chunk received:', data.chunk);
});

aiSocket.on('ai_stream_end', (data) => {
  console.log('AI stream ended:', data);
});

// Listen for errors
aiSocket.on('ai_error', (data) => {
  console.error('AI error:', data);
});

// Listen for history cleared event
aiSocket.on('history_cleared', (data) => {
  console.log('Conversation history cleared:', data);
});
```

## Implementation Details

### Multi-User Support

The AI Assistant is designed to handle multiple users chatting simultaneously:

- Each user has their own separate conversation history tracked by a unique user ID
- When a user connects to the AI namespace, they are assigned a unique identifier (either their authenticated user ID or their socket ID)
- All messages and responses are associated with the user's unique ID
- Users cannot see or interact with each other's conversations
- The system can handle many concurrent users, with each maintaining their own conversation context

### Conversation History Management

The AIAssistant service maintains conversation history for each user, allowing for contextual responses. The history is stored in memory and includes:

- System prompt (defines the assistant's personality and capabilities)
- User messages
- Assistant responses

To prevent token overflow, the history is limited to a configurable number of messages (default: 100).

### Streaming Responses

The implementation supports streaming responses from OpenAI, which provides a more interactive experience for users. The streaming implementation:

1. Sends an initial `ai_stream_start` event
2. Streams chunks of the response as they are generated with `ai_stream_chunk` events
3. Sends a final `ai_stream_end` event when the response is complete

### Error Handling

The implementation includes comprehensive error handling for:

- API errors (e.g., invalid API key, rate limiting)
- Network errors
- Stream interruptions
- Invalid requests

Errors are logged and communicated to clients through the `ai_error` event.

## Security Considerations

- The AIAssistant service requires a valid OpenAI API key
- Socket.IO connections can be secured with authentication middleware
- Conversation history is stored in memory and not persisted to disk
- System prompts can be configured to limit the assistant's capabilities

## Example

See `packages/server/examples/socket-client.js` for a complete example of how to interact with the AI Assistant from a client application.
