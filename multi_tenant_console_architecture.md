# Multi-Tenant Console Architecture

This document describes the architecture and implementation of the multi-tenant console system for the MintFlow workflow designer UI.

## Overview

The multi-tenant console system provides a terminal, log viewer, and system information panel that allows users to interact with the server, view logs, and monitor system resources. The system is designed to be secure, scalable, and to maintain complete isolation between different users sharing the same server deployment.

## Architecture

The console system follows a client-server architecture with WebSocket communication for real-time updates and HTTP fallback for environments where WebSockets are not available.

### Server-Side Components

1. **ConsoleService**: A singleton service that manages terminal sessions, executes commands, and handles WebSocket communication.
2. **Console Routes**: HTTP endpoints for fallback communication when WebSockets are not available.
3. **Console Controller**: Handles HTTP requests for the console API.

### Client-Side Components

1. **ConsoleService**: A service that communicates with the server via WebSockets or HTTP fallback.
2. **Terminal Component**: A terminal emulator using xterm.js for command execution.
3. **Log Viewer Component**: A component for viewing and filtering logs.
4. **System Information Component**: A component for monitoring system resources.
5. **Console Panel**: A container component with tabs for the terminal, log viewer, and system information.

## Multi-Tenant Security

The console system is designed to maintain complete isolation between different users:

1. **Session Isolation**: Each user gets their own terminal sessions, and sessions are identified by a unique ID.
2. **User Authentication**: Sessions are associated with a user ID, and only the owner of a session can access it.
3. **Resource Limits**: Sessions have resource limits to prevent abuse, and inactive sessions are automatically cleaned up.
4. **Command Validation**: Commands are validated before execution to prevent unauthorized access.

## WebSocket Communication

The console system uses Socket.IO for WebSocket communication:

1. **Namespace**: The console uses a dedicated Socket.IO namespace (`/console`) to isolate console traffic.
2. **Events**:
   - `create-session`: Create a new terminal session
   - `execute-command`: Execute a command in a session
   - `terminal-input`: Send input to a running process
   - `terminate-session`: Terminate a session
   - `console-message`: Receive console output and events

## HTTP Fallback

For environments where WebSockets are not available, the console system provides HTTP fallback:

1. **Polling**: The client polls the server for new messages.
2. **REST API**: The server provides REST endpoints for session management and command execution.
3. **Automatic Switching**: The client automatically switches to WebSockets when they become available.

## Implementation Details

### Server-Side Implementation

The server-side implementation uses Node.js child processes to execute commands:

1. **Process Spawning**: Commands are executed by spawning a child process.
2. **Output Streaming**: Output from the process is streamed to the client in real-time.
3. **Input Handling**: Input from the client is sent to the process's stdin.
4. **Process Cleanup**: Processes are properly cleaned up when terminated or when the session ends.

### Client-Side Implementation

The client-side implementation uses React and xterm.js:

1. **Terminal Emulation**: xterm.js is used for terminal emulation.
2. **WebSocket Connection**: Socket.IO client is used for WebSocket communication.
3. **UI Components**: React components are used for the UI.
4. **State Management**: React hooks are used for state management.

## Usage

The console panel is integrated into the workflow designer UI and can be accessed by clicking on the console tab at the bottom of the screen. The console panel can be resized or collapsed as needed.

## Future Improvements

1. **Command History**: Add command history for the terminal.
2. **Tab Completion**: Add tab completion for commands.
3. **Log Filtering**: Enhance log filtering capabilities.
4. **Resource Monitoring**: Add more detailed resource monitoring.
5. **User Permissions**: Add more granular user permissions for command execution.
