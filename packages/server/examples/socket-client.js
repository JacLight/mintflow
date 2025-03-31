/**
 * Socket.IO Client Example
 * 
 * This example demonstrates how to connect to the different Socket.IO namespaces
 * and interact with them. You can use this as a reference for implementing
 * client-side Socket.IO connections in your application.
 * 
 * Usage:
 * 1. Start the server: npm run dev
 * 2. Run this example: node examples/socket-client.js
 */

import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const SERVER_URL = 'http://localhost:7001';
const AUTH_TOKEN = 'your_jwt_token_here'; // Optional: Replace with a valid JWT token if authentication is required

// Connect to the main namespace
const mainSocket = io(SERVER_URL, {
    auth: {
        token: AUTH_TOKEN
    }
});

// Connect to the logs namespace
const logsSocket = io(`${SERVER_URL}/logs`, {
    auth: {
        token: AUTH_TOKEN
    }
});

// Connect to the workspaces namespace
const workspacesSocket = io(`${SERVER_URL}/workspaces`, {
    auth: {
        token: AUTH_TOKEN
    }
});

// Connect to the flows namespace
const flowsSocket = io(`${SERVER_URL}/flows`, {
    auth: {
        token: AUTH_TOKEN
    },
    query: {
        tenantId: 'default' // Optional: Specify tenant ID if needed
    }
});

// Connect to the AI namespace
const aiSocket = io(`${SERVER_URL}/ai`, {
    auth: {
        token: AUTH_TOKEN
    }
});

// Main namespace events
mainSocket.on('connect', () => {
    console.log('Connected to main namespace');
});

mainSocket.on('disconnect', () => {
    console.log('Disconnected from main namespace');
});

mainSocket.on('error', (error) => {
    console.error('Main namespace error:', error);
});

// Logs namespace events
logsSocket.on('connect', () => {
    console.log('Connected to logs namespace');
    
    // Request log history
    logsSocket.emit('log_history');
});

logsSocket.on('log_history', (data) => {
    console.log('Received log history:', data);
});

logsSocket.on('new_log', (data) => {
    console.log('New log received:', data);
});

// Workspaces namespace events
workspacesSocket.on('connect', () => {
    console.log('Connected to workspaces namespace');
    
    // Join a workspace
    const workspaceId = 'example-workspace';
    workspacesSocket.emit('join_workspace', {
        workspaceId,
        userId: 'user-123',
        userName: 'Example User'
    });
});

workspacesSocket.on('join_workspace', (data) => {
    console.log('Joined workspace:', data);
    
    // Update workspace state
    workspacesSocket.emit('update_workspace', {
        workspaceId: data.workspace.id,
        state: {
            exampleKey: 'exampleValue',
            timestamp: new Date()
        }
    });
});

workspacesSocket.on('workspace_updated', (data) => {
    console.log('Workspace updated:', data);
});

workspacesSocket.on('user_joined', (data) => {
    console.log('User joined workspace:', data);
});

workspacesSocket.on('user_left', (data) => {
    console.log('User left workspace:', data);
});

// Flows namespace events
flowsSocket.on('connect', () => {
    console.log('Connected to flows namespace');
    
    // Subscribe to a flow
    flowsSocket.emit('subscribe_flow', {
        flowId: 'example-flow'
    });
});

flowsSocket.on('flow_started', (data) => {
    console.log('Flow started:', data);
});

flowsSocket.on('flow_completed', (data) => {
    console.log('Flow completed:', data);
});

flowsSocket.on('flow_failed', (data) => {
    console.log('Flow failed:', data);
});

flowsSocket.on('node_started', (data) => {
    console.log('Node started:', data);
});

flowsSocket.on('node_completed', (data) => {
    console.log('Node completed:', data);
});

flowsSocket.on('node_failed', (data) => {
    console.log('Node failed:', data);
});

flowsSocket.on('flow_progress', (data) => {
    console.log('Flow progress:', data);
});

// AI namespace events
aiSocket.on('connect', () => {
    console.log('Connected to AI namespace');
    
    // Send an AI request
    const requestId = uuidv4();
    
    // Example of a non-streaming request
    aiSocket.emit('ai_request', {
        requestId,
        model: 'gpt-4o', // Use the configured model or specify one
        prompt: 'Hello, I need help organizing my tasks for today.',
        stream: false
    });
    
    // Example of a streaming request
    const streamRequestId = uuidv4();
    aiSocket.emit('ai_request', {
        requestId: streamRequestId,
        model: 'gpt-4o', // Use the configured model or specify one
        prompt: 'Can you suggest a step-by-step plan for implementing a new feature?',
        stream: true
    });
    
    // Example of clearing conversation history
    // aiSocket.emit('clear_history');
});

// Listen for history cleared event
aiSocket.on('history_cleared', (data) => {
    console.log('Conversation history cleared:', data);
});

aiSocket.on('ai_response', (data) => {
    console.log('AI response received:', data);
});

aiSocket.on('ai_stream_start', (data) => {
    console.log('AI stream started:', data);
});

aiSocket.on('ai_stream_chunk', (data) => {
    process.stdout.write(data.chunk); // Print chunks without newlines
});

aiSocket.on('ai_stream_end', (data) => {
    console.log('\nAI stream ended:', data);
    
    // Disconnect from all namespaces after a delay
    setTimeout(() => {
        console.log('Disconnecting from all namespaces...');
        mainSocket.disconnect();
        logsSocket.disconnect();
        workspacesSocket.disconnect();
        flowsSocket.disconnect();
        aiSocket.disconnect();
    }, 5000);
});

aiSocket.on('ai_error', (data) => {
    console.error('AI error:', data);
});

// Handle errors for all namespaces
[mainSocket, logsSocket, workspacesSocket, flowsSocket, aiSocket].forEach(socket => {
    socket.on('error', (error) => {
        console.error(`Socket error (${socket.nsp})`, error);
    });
    
    socket.on('connect_error', (error) => {
        console.error(`Connection error (${socket.nsp})`, error);
    });
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Disconnecting from all namespaces...');
    mainSocket.disconnect();
    logsSocket.disconnect();
    workspacesSocket.disconnect();
    flowsSocket.disconnect();
    aiSocket.disconnect();
    process.exit(0);
});
