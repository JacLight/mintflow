# AI Assistant Integration for MintFlow

This document describes the AI Assistant integration for MintFlow, which provides a personal AI assistant that helps users with workflow automation.

## Architecture

The AI Assistant integration consists of the following components:

1. **AIAssistant Service**: A server-side service that handles communication with the OpenAI API and maintains conversation history.
2. **Socket.IO Namespace**: A dedicated namespace for real-time communication between the client and server.
3. **WorkflowService**: A service that manages workflows and provides methods for adding nodes, creating flows, etc.
4. **Client-Side Components**: React components for the chat interface.

## Server-Side Implementation

### AIAssistant Service

The `AIAssistant` class provides methods for processing user messages and generating responses. It maintains conversation history for each user and handles streaming responses.

Key features:

- Conversation history management
- Streaming responses
- Error handling
- Command detection and execution

### Socket.IO Namespace

The `AINamespace` class handles real-time communication between the client and server. It registers event handlers for:

- AI requests
- Command execution
- Conversation history clearing
- Stream cancellation

### WorkflowService

The `WorkflowService` class provides methods for managing workflows:

- Adding nodes to flows
- Creating new flows
- Listing flows

## Client-Side Implementation

The client-side implementation consists of:

- `AIChat` component: Provides the chat interface
- `WorkflowService`: Client-side service for interacting with the workflow designer

## Command Handling

The AI Assistant can understand and execute the following commands:

1. **Create Flow**: `create flow [name]`
   - Creates a new flow with the specified name

2. **Add Node**: `add [node-type] node`
   - Adds a node of the specified type to the active flow
   - Supported node types: info, dynamic, app-view, form, action, condition, switch, image

3. **List Flows**: `list flows`
   - Lists all available flows

## Configuration

The AI Assistant is configured through environment variables:

```
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_DEFAULT_MODEL=gpt-4o
OPENAI_SYSTEM_PROMPT=custom_system_prompt
```

## Usage

Users can interact with the AI Assistant through the chat interface. They can:

1. Ask questions
2. Request to create flows
3. Request to add nodes to flows
4. Request to list flows

The AI Assistant will understand their intent and execute the appropriate commands.

## Implementation Details

### Command Detection

Commands are detected in two ways:

1. **Server-Side Pattern Matching**: The server checks for command patterns in the AI's responses
2. **AI Intent Recognition**: The AI is prompted to respond with command syntax when it detects user intent

### Workflow Interaction

When a command is detected:

1. The server executes the command using the WorkflowService
2. The result is sent back to the client
3. The client updates the UI to reflect the changes

## Security Considerations

- The AI Assistant uses the user's session ID to maintain conversation history
- API keys are stored securely in environment variables
- Input validation is performed on all commands before execution
