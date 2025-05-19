import { io, Socket } from 'socket.io-client';
import { getProxiedUrl } from './proxy-utils';

/**
 * Types for log events
 */
export enum LogEventTypes {
    LOG_HISTORY = 'log-history',
    NEW_LOG = 'new-log',
    FILTER_LOGS = 'filter-logs',
    CLEAR_LOGS = 'clear-logs'
}

/**
 * Types for log levels
 */
export type LogLevel = 'info' | 'error' | 'warning' | 'debug';

/**
 * Interface for log entries
 */
export interface LogEntry {
    id: string;
    timestamp: Date | string;
    level: LogLevel;
    message: string;
    source?: string;
    flowId?: string;
    runId?: string;
}

/**
 * Type for log handler
 */
export type LogHandler = (log: LogEntry) => void;

/**
 * Type for connection status
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'fallback';

/**
 * Service for interacting with the logs API
 */
export class LogService {
    private static instance: LogService;
    private socket: Socket | null = null;
    private logHandlers: Set<LogHandler> = new Set();
    private connectionStatus: ConnectionStatus = 'disconnected';
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    private constructor() { }

    /**
     * Get the singleton instance
     */
    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }
        return LogService.instance;
    }

    /**
     * Get the connection status
     */
    public getConnectionStatus(): ConnectionStatus {
        return this.connectionStatus;
    }

    /**
     * Connect to the logs server
     */
    public connect(): void {
        if (this.socket) {
            return; // Already connected or connecting
        }

        this.connectionStatus = 'connecting';

        try {
            // Get the URL for the logs namespace
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IP || 'http://localhost:7001';
            console.log('[LogService] Connecting to WebSocket URL:', socketUrl);

            // Connect to the logs namespace
            this.socket = io(`${socketUrl}/logs`, {
                path: '/socket.io',
                transports: ['websocket', 'polling'],
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                timeout: 20000
            });

            // Set up event handlers
            this.socket.on('connect', this.handleConnect.bind(this));
            this.socket.on('disconnect', this.handleDisconnect.bind(this));
            this.socket.on(LogEventTypes.NEW_LOG, this.handleNewLog.bind(this));
            this.socket.on('error', this.handleError.bind(this));
            this.socket.on('connect_error', this.handleConnectError.bind(this));
        } catch (error) {
            console.error('[LogService] Error connecting to logs server:', error);
            this.connectionStatus = 'disconnected';
        }
    }

    /**
     * Disconnect from the logs server
     */
    public disconnect(): void {
        this.cleanupSocket();
        this.connectionStatus = 'disconnected';
        this.reconnectAttempts = 0;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    /**
     * Subscribe to log events
     */
    public subscribeToLogs(handler: LogHandler): () => void {
        this.logHandlers.add(handler);

        // Return unsubscribe function
        return () => {
            this.logHandlers.delete(handler);
        };
    }

    /**
     * Request log history
     */
    public requestLogHistory(flowId?: string, runId?: string): void {
        if (this.connectionStatus !== 'connected' || !this.socket) {
            console.error('[LogService] Cannot request log history: Not connected');
            return;
        }

        this.socket.emit(LogEventTypes.LOG_HISTORY, { flowId, runId });
    }

    /**
     * Filter logs
     */
    public filterLogs(flowId?: string, runId?: string): void {
        if (this.connectionStatus !== 'connected' || !this.socket) {
            console.error('[LogService] Cannot filter logs: Not connected');
            return;
        }

        this.socket.emit(LogEventTypes.FILTER_LOGS, { flowId, runId });
    }

    /**
     * Clear logs
     */
    public clearLogs(flowId?: string, logId?: string): void {
        if (this.connectionStatus !== 'connected' || !this.socket) {
            console.error('[LogService] Cannot clear logs: Not connected');
            return;
        }

        this.socket.emit(LogEventTypes.CLEAR_LOGS, { flowId, logId });
    }

    /**
     * Handle WebSocket connection
     */
    private handleConnect(): void {
        console.log('[LogService] Connected to logs server');
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
    }

    /**
     * Handle WebSocket disconnection
     */
    private handleDisconnect(): void {
        console.log('[LogService] Disconnected from logs server');
        this.connectionStatus = 'disconnected';
        this.cleanupSocket();
        this.attemptReconnect();
    }

    /**
     * Handle WebSocket error
     */
    private handleError(error: any): void {
        console.error('[LogService] Socket error:', error);
    }

    /**
     * Handle WebSocket connection error
     */
    private handleConnectError(error: any): void {
        console.error('[LogService] Connection error:', error);
        this.attemptReconnect();
    }

    /**
     * Handle new log event
     */
    private handleNewLog(data: { log: any }): void {
        if (!data || !data.log) {
            return;
        }

        const rawLog = data.log;

        // Convert the raw log to a LogEntry
        const logEntry: LogEntry = {
            id: rawLog.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: rawLog.timestamp ? new Date(rawLog.timestamp) : new Date(),
            level: (rawLog.level || 'info') as LogLevel,
            message: rawLog.message || '',
            source: rawLog.source,
            flowId: rawLog.flowId,
            runId: rawLog.runId
        };

        // Notify all handlers
        this.logHandlers.forEach(handler => {
            try {
                handler(logEntry);
            } catch (error) {
                console.error('[LogService] Error in log handler:', error);
            }
        });
    }

    /**
     * Attempt to reconnect to the logs server
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('[LogService] Max reconnection attempts reached');
            this.connectionStatus = 'disconnected';
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);

        console.log(`[LogService] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        this.connectionStatus = 'disconnected';
        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Clean up WebSocket resources
     */
    private cleanupSocket(): void {
        if (this.socket) {
            this.socket.off('connect');
            this.socket.off('disconnect');
            this.socket.off(LogEventTypes.NEW_LOG);
            this.socket.off('error');
            this.socket.off('connect_error');
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

// Export singleton instance getter
export const getLogService = (): LogService => {
    return LogService.getInstance();
};
