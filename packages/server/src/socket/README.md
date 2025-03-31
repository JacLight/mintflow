# Socket.IO Implementation for MintFlow Server

This directory contains a modular Socket.IO implementation for the MintFlow server. It provides real-time communication capabilities for various features such as logs, shared workspaces, flow engine events, and AI server communication.

## Architecture

The Socket.IO implementation follows a modular architecture with the following components:

```
packages/server/src/socket/
├── SocketManager.ts         # Main manager class
├── config/                  # Configuration
│   └── socket.config.ts     # Socket.IO and Redis adapter config
├── middleware/              # Shared middleware
│   └── auth.ts              # Authentication middleware
├── namespaces/              # Feature-specific namespaces
│   ├── LogNamespace.ts      # Logs namespace
│   ├── WorkspaceNamespace.ts # Workspace namespace
│   ├── FlowNamespace.ts     # Flow engine namespace
│   └── AINamespace.ts       # AI communication namespace
└── types/                   # Type definitions
    └── socket.types.ts      # Socket.IO related types
```

### SocketManager

The `SocketManager` class is the central component that initializes and manages the Socket.IO server and namespaces. It provides methods for:

- Initializing the Socket.IO server
- Setting up the Redis adapter for multi-node support
- Initializing all namespaces
- Getting namespace instances
- Closing the Socket.IO server

### Namespaces

Each feature has its own namespace with specific event handlers and functionality:

- **Logs Namespace (`/logs`)**: Handles real-time log events, including log history, filtering, and new log notifications.
- **Workspaces Namespace (`/workspaces`)**: Handles real-time workspace collaboration and state sharing.
- **Flows Namespace (`/flows`)**: Handles real-time flow execution events, including flow and node status updates.
- **AI Namespace (`/ai`)**: Handles real-time AI requests and responses, including streaming responses.

### Middleware

The Socket.IO implementation includes middleware for authentication and authorization:

- **Authentication Middleware**: Verifies JWT tokens in the handshake query or headers.
- **Tenant Middleware**: Ensures the user has access to the requested tenant.

### Multi-Node Support

The implementation supports multi-node deployments using the Redis adapter. This ensures that events emitted on one node are properly broadcast to clients connected to other nodes.

## Configuration

The Socket.IO implementation can be configured using environment variables:

```
# Socket.IO Configuration
SOCKET_AUTH_REQUIRED=false
SOCKET_PATH=/socket.io
SOCKET_CORS_ORIGIN=*
SOCKET_CORS_METHODS=GET,POST,PUT,DELETE
SOCKET_CORS_CREDENTIALS=false
```

## Usage

### Server-Side

The Socket.IO server is initialized in the main `index.ts` file:

```typescript
import { SocketManager } from './socket/SocketManager.js';

// Initialize HTTP server
const app = await createApp();
const server = http.createServer(app);

// Initialize Socket.IO
const socketManager = SocketManager.initialize(server);
socketManager.initializeNamespaces();
```

### Client-Side

Clients can connect to the different namespaces and interact with them. See the example client in `packages/server/examples/socket-client.js` for a complete example.

Here's a simple example of connecting to the logs namespace:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/logs', {
  auth: {
    token: 'your_jwt_token' // Optional: JWT token for authentication
  }
});

socket.on('connect', () => {
  console.log('Connected to logs namespace');
  
  // Request log history
  socket.emit('log_history');
});

socket.on('log_history', (data) => {
  console.log('Received log history:', data);
});

socket.on('new_log', (data) => {
  console.log('New log received:', data);
});
```

## Event Types

Each namespace defines its own set of event types:

### Logs Namespace

- `NEW_LOG`: Emitted when a new log is created
- `CLEAR_LOGS`: Emitted when logs are cleared
- `FILTER_LOGS`: Emitted when logs are filtered
- `LOG_HISTORY`: Emitted when log history is requested

### Workspaces Namespace

- `JOIN_WORKSPACE`: Emitted when a user joins a workspace
- `LEAVE_WORKSPACE`: Emitted when a user leaves a workspace
- `UPDATE_WORKSPACE`: Emitted when a workspace is updated
- `WORKSPACE_UPDATED`: Emitted when a workspace has been updated
- `USER_JOINED`: Emitted when a user joins a workspace
- `USER_LEFT`: Emitted when a user leaves a workspace

### Flows Namespace

- `FLOW_STARTED`: Emitted when a flow starts
- `FLOW_COMPLETED`: Emitted when a flow completes
- `FLOW_FAILED`: Emitted when a flow fails
- `NODE_STARTED`: Emitted when a node starts
- `NODE_COMPLETED`: Emitted when a node completes
- `NODE_FAILED`: Emitted when a node fails
- `FLOW_PROGRESS`: Emitted to update flow progress

### AI Namespace

- `AI_REQUEST`: Emitted when an AI request is made
- `AI_RESPONSE`: Emitted when an AI response is received
- `AI_STREAM_START`: Emitted when an AI stream starts
- `AI_STREAM_CHUNK`: Emitted for each chunk in an AI stream
- `AI_STREAM_END`: Emitted when an AI stream ends
- `AI_ERROR`: Emitted when an AI error occurs

## Extending the Implementation

To add a new namespace:

1. Create a new namespace class in the `namespaces` directory
2. Implement the `INamespaceHandler` interface
3. Add the namespace to the `SocketManager.initializeNamespaces()` method

Example:

```typescript
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@mintflow/common';
import { INamespaceHandler } from '../types/socket.types.js';
import { socketAuthMiddleware } from '../middleware/auth.js';

export class MyNamespace implements INamespaceHandler {
  private static instance: MyNamespace;
  private namespace: string = '/my-namespace';

  private constructor() {}

  public static getInstance(): MyNamespace {
    if (!MyNamespace.instance) {
      MyNamespace.instance = new MyNamespace();
    }
    return MyNamespace.instance;
  }

  public initialize(io: SocketIOServer): void {
    const nsp = io.of(this.namespace);
    nsp.use(socketAuthMiddleware);
    
    nsp.on('connection', (socket: Socket) => {
      logger.info(`[Socket:MyNamespace] Client connected: ${socket.id}`);
      
      // Register event handlers
      socket.on('my_event', (data) => {
        // Handle event
      });
      
      socket.on('disconnect', () => {
        logger.info(`[Socket:MyNamespace] Client disconnected: ${socket.id}`);
      });
    });
    
    logger.info(`[Socket] MyNamespace initialized at ${this.namespace}`);
  }
}
```

Then add it to the `SocketManager`:

```typescript
public initializeNamespaces(): void {
  // ...
  MyNamespace.getInstance().initialize(this.io);
  // ...
}
