import { io, Socket } from 'socket.io-client';
import { getProxiedUrl } from './proxy-utils';

/**
 * Types for console messages
 */
export interface ConsoleMessage {
    type: 'output' | 'error' | 'system';
    stream?: 'stdout' | 'stderr';
    data?: string;
    error?: string;
    event?: string;
    command?: string;
    code?: number;
    timestamp: number;
}

/**
 * Types for console session
 */
export interface ConsoleSession {
    id: string;
    active: boolean;
    messages: ConsoleMessage[];
}

/**
 * Type for message handler
 */
export type MessageHandler = (message: ConsoleMessage) => void;

/**
 * Type for connection status
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'fallback';

/**
 * Service for interacting with the console API
 */
export class ConsoleService {
    private static instance: ConsoleService;
    private socket: Socket | null = null;
    private sessions: Map<string, ConsoleSession> = new Map();
    private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
    private connectionStatus: ConnectionStatus = 'disconnected';
    private fallbackPollInterval: NodeJS.Timeout | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    private constructor() { }

    /**
     * Get the singleton instance
     */
    public static getInstance(): ConsoleService {
        if (!ConsoleService.instance) {
            ConsoleService.instance = new ConsoleService();
        }
        return ConsoleService.instance;
    }

    /**
     * Get the connection status
     */
    public getConnectionStatus(): ConnectionStatus {
        return this.connectionStatus;
    }

    /**
     * Connect to the console server
     */
    public connect(): void {
        if (this.socket) {
            return; // Already connected or connecting
        }

        this.connectionStatus = 'connecting';

        try {
            // Get the URL for the flows namespace
            // Use the server URL from environment or default to localhost:7001
            // const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IP || 'http://localhost:7001';
            // console.log('[ConsoleService] Connecting to WebSocket URL:', socketUrl);

            // // Connect to the flows namespace instead of console
            // this.socket = io(`${socketUrl}/flows`, {
            //     path: '/socket.io', // This should match SOCKET_PATH in server's .env
            //     transports: ['websocket', 'polling'],
            //     reconnectionAttempts: this.maxReconnectAttempts,
            //     reconnectionDelay: 1000,
            //     timeout: 20000
            // });

            // // Set up event handlers
            // this.socket.on('connect', this.handleConnect.bind(this));
            // this.socket.on('disconnect', this.handleDisconnect.bind(this));
            // this.socket.on('console-message', this.handleConsoleMessage.bind(this));
            // this.socket.on('error', this.handleError.bind(this));
            // this.socket.on('connect_error', this.handleConnectError.bind(this));
        } catch (error) {
            console.error('[ConsoleService] Error connecting to console server:', error);
            this.activateFallback();
        }
    }

    /**
     * Disconnect from the console server
     */
    public disconnect(): void {
        this.cleanupSocket();
        this.cleanupFallback();
        this.connectionStatus = 'disconnected';
        this.reconnectAttempts = 0;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    /**
     * Create a new console session
     */
    public async createSession(): Promise<string> {
        if (this.connectionStatus === 'connected' && this.socket) {
            return new Promise((resolve, reject) => {
                if (!this.socket) {
                    reject(new Error('Not connected to console server'));
                    return;
                }

                // Set up a one-time event handler for the session creation response
                this.socket.once('session-created', (data: { sessionId: string }) => {
                    const sessionId = data.sessionId;

                    // Create a new session
                    this.sessions.set(sessionId, {
                        id: sessionId,
                        active: true,
                        messages: []
                    });

                    // Create a new set for message handlers
                    this.messageHandlers.set(sessionId, new Set());

                    resolve(sessionId);
                });

                // Request a new session
                this.socket.emit('create-session');
            });
        } else if (this.connectionStatus === 'fallback') {
            // Use HTTP fallback
            try {
                const response = await fetch(getProxiedUrl('/api/console/session', '', 'mintflow'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const data = await response.json();

                // For now, we'll just return a mock session ID
                const sessionId = `fallback-${Date.now()}`;

                // Create a new session
                this.sessions.set(sessionId, {
                    id: sessionId,
                    active: true,
                    messages: []
                });

                // Create a new set for message handlers
                this.messageHandlers.set(sessionId, new Set());

                return sessionId;
            } catch (error) {
                console.error('[ConsoleService] Error creating session via HTTP:', error);
                throw error;
            }
        } else {
            throw new Error('Not connected to console server');
        }
    }

    /**
     * Execute a command in a session
     */
    public executeCommand(sessionId: string, command: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.error(`[ConsoleService] Session not found: ${sessionId}`);
            return;
        }

        if (this.connectionStatus === 'connected' && this.socket) {
            // Send the command via WebSocket
            this.socket.emit('execute-command', { sessionId, command });
        } else if (this.connectionStatus === 'fallback') {
            // Send the command via HTTP
            fetch(getProxiedUrl('/api/console/execute', '', 'mintflow'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId, command })
            }).catch(error => {
                console.error('[ConsoleService] Error executing command via HTTP:', error);
            });
        } else {
            console.error('[ConsoleService] Cannot execute command: Not connected');
        }
    }

    /**
     * Send input to a running process
     */
    public sendInput(sessionId: string, input: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.error(`[ConsoleService] Session not found: ${sessionId}`);
            return;
        }

        if (this.connectionStatus === 'connected' && this.socket) {
            // Send the input via WebSocket
            this.socket.emit('terminal-input', { sessionId, input });
        } else if (this.connectionStatus === 'fallback') {
            // Send the input via HTTP
            fetch(getProxiedUrl('/api/console/input', '', 'mintflow'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId, input })
            }).catch(error => {
                console.error('[ConsoleService] Error sending input via HTTP:', error);
            });
        } else {
            console.error('[ConsoleService] Cannot send input: Not connected');
        }
    }

    /**
     * Terminate a session
     */
    public terminateSession(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.error(`[ConsoleService] Session not found: ${sessionId}`);
            return;
        }

        if (this.connectionStatus === 'connected' && this.socket) {
            // Terminate the session via WebSocket
            this.socket.emit('terminate-session', { sessionId });
        } else if (this.connectionStatus === 'fallback') {
            // Terminate the session via HTTP
            fetch(getProxiedUrl(`/api/console/session/${sessionId}`, '', 'mintflow'), {
                method: 'DELETE'
            }).catch(error => {
                console.error('[ConsoleService] Error terminating session via HTTP:', error);
            });
        }

        // Clean up local resources
        session.active = false;
        this.messageHandlers.delete(sessionId);
    }

    /**
     * Subscribe to messages for a session
     */
    public subscribeToMessages(sessionId: string, handler: MessageHandler): () => void {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.error(`[ConsoleService] Session not found: ${sessionId}`);
            return () => { };
        }

        const handlers = this.messageHandlers.get(sessionId);
        if (!handlers) {
            console.error(`[ConsoleService] No handlers for session: ${sessionId}`);
            return () => { };
        }

        handlers.add(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.messageHandlers.get(sessionId);
            if (handlers) {
                handlers.delete(handler);
            }
        };
    }

    /**
     * Get all messages for a session
     */
    public getMessages(sessionId: string): ConsoleMessage[] {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.error(`[ConsoleService] Session not found: ${sessionId}`);
            return [];
        }

        return [...session.messages];
    }

    /**
     * Clear messages for a session
     */
    public clearMessages(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.error(`[ConsoleService] Session not found: ${sessionId}`);
            return;
        }

        session.messages = [];
    }

    /**
     * Handle WebSocket connection
     */
    private handleConnect(): void {
        console.log('[ConsoleService] Connected to console server');
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.cleanupFallback();
    }

    /**
     * Handle WebSocket disconnection
     */
    private handleDisconnect(): void {
        console.log('[ConsoleService] Disconnected from console server');
        this.connectionStatus = 'disconnected';
        this.cleanupSocket();
        this.attemptReconnect();
    }

    /**
     * Handle WebSocket error
     */
    private handleError(error: any): void {
        console.error('[ConsoleService] Socket error:', error);
    }

    /**
     * Handle WebSocket connection error
     */
    private handleConnectError(error: any): void {
        console.error('[ConsoleService] Connection error:', error);
        this.attemptReconnect();
    }

    /**
     * Handle console message
     */
    private handleConsoleMessage(messageWithId: ConsoleMessage & { sessionId: string }): void {
        // Extract session ID from the message
        const { sessionId, ...message } = messageWithId;

        // Special handling for system logs (sessionId === 'system')
        if (sessionId === 'system') {
            // Send the system log to all active sessions
            this.sessions.forEach((session, sessionId) => {
                if (session.active) {
                    // Add the message to the session
                    session.messages.push(message);

                    // Notify handlers
                    const handlers = this.messageHandlers.get(sessionId);
                    if (handlers) {
                        handlers.forEach(handler => handler(message));
                    }
                }
            });
            return;
        }

        // Regular session message handling
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.error(`[ConsoleService] Session not found: ${sessionId}`);
            return;
        }

        // Add the message to the session
        session.messages.push(message);

        // Notify handlers
        const handlers = this.messageHandlers.get(sessionId);
        if (handlers) {
            handlers.forEach(handler => handler(message));
        }
    }

    /**
     * Attempt to reconnect to the console server
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('[ConsoleService] Max reconnection attempts reached, switching to fallback');
            this.activateFallback();
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);

        console.log(`[ConsoleService] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        this.connectionStatus = 'disconnected';
        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Activate HTTP fallback
     */
    private activateFallback(): void {
        console.log('[ConsoleService] Activating HTTP fallback');
        this.cleanupSocket();
        this.connectionStatus = 'fallback';

        // Start polling for messages
        this.fallbackPollInterval = setInterval(() => {
            this.pollForMessages();
        }, 1000); // Poll every second
    }

    /**
     * Poll for messages using HTTP fallback
     */
    private async pollForMessages(): Promise<void> {
        // Poll for each active session
        for (const session of Array.from(this.sessions.values())) {
            if (!session.active) continue;
            const sessionId = session.id;

            try {
                const response = await fetch(
                    getProxiedUrl(`/api/console/poll?sessionId=${sessionId}&timestamp=${Date.now()}`, '', 'mintflow')
                );

                if (response.ok) {
                    const data = await response.json();

                    if (data.messages && Array.isArray(data.messages)) {
                        data.messages.forEach((message: ConsoleMessage) => {
                            // Add the message to the session
                            session.messages.push(message);

                            // Notify handlers
                            const handlers = this.messageHandlers.get(sessionId);
                            if (handlers) {
                                handlers.forEach(handler => handler(message));
                            }
                        });
                    }

                    // Check if WebSockets are now available
                    if (data.webSocketsAvailable && this.connectionStatus === 'fallback') {
                        console.log('[ConsoleService] WebSockets now available, switching back');
                        this.cleanupFallback();
                        this.connect();
                    }
                }
            } catch (error) {
                console.error(`[ConsoleService] Error polling for messages for session ${sessionId}:`, error);
            }
        }
    }

    /**
     * Clean up WebSocket resources
     */
    private cleanupSocket(): void {
        if (this.socket) {
            this.socket.off('connect');
            this.socket.off('disconnect');
            this.socket.off('console-message');
            this.socket.off('error');
            this.socket.off('connect_error');
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Clean up HTTP fallback resources
     */
    private cleanupFallback(): void {
        if (this.fallbackPollInterval) {
            clearInterval(this.fallbackPollInterval);
            this.fallbackPollInterval = null;
        }
    }
}

// Export singleton instance getter
export const getConsoleService = (): ConsoleService => {
    return ConsoleService.getInstance();
};
