import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@mintflow/common';
import { INamespaceHandler, LogEventTypes } from '../types/socket.types.js';
import { socketAuthMiddleware, socketTenantMiddleware } from '../middleware/auth.js';
import { LogService } from '../../services/LogService.js';
import { FlowNamespace } from './FlowNamespace.js';

/**
 * Socket.IO namespace for logs
 * Handles real-time log events
 */
export class LogNamespace implements INamespaceHandler {
    private static instance: LogNamespace;
    private namespace: string = '/logs';
    private logService: LogService;

    private constructor() {
        this.logService = new LogService();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): LogNamespace {
        if (!LogNamespace.instance) {
            LogNamespace.instance = new LogNamespace();
        }
        return LogNamespace.instance;
    }

    /**
     * Initialize the logs namespace
     * @param io The Socket.IO server instance
     */
    public initialize(io: SocketIOServer): void {
        const nsp = io.of(this.namespace);

        // Apply middleware
        nsp.use(socketAuthMiddleware);
        nsp.use(socketTenantMiddleware);

        // Handle connections
        nsp.on('connection', (socket: Socket) => {
            logger.info(`[Socket:Logs] Client connected: ${socket.id}`);

            // Handle events
            this.registerEventHandlers(socket);

            // Handle disconnection
            socket.on('disconnect', () => {
                logger.info(`[Socket:Logs] Client disconnected: ${socket.id}`);
            });
        });

        logger.info(`[Socket] Logs namespace initialized at ${this.namespace}`);
    }

    /**
     * Register event handlers for the socket
     * @param socket The Socket.IO socket
     */
    private registerEventHandlers(socket: Socket): void {
        // Get log history
        socket.on(LogEventTypes.LOG_HISTORY, async (data) => {
            try {
                let logs;
                if (data?.flowId) {
                    logs = await this.logService.getLogsByFlow(data.flowId);
                } else if (data?.runId) {
                    logs = await this.logService.getLogsByRun(data.runId);
                } else {
                    logs = await this.logService.getAllLogs();
                }
                socket.emit(LogEventTypes.LOG_HISTORY, { logs });
            } catch (error: any) {
                logger.error('[Socket:Logs] Error fetching log history', { error: error.message });
                socket.emit('error', { message: 'Failed to fetch log history' });
            }
        });

        // Filter logs
        socket.on(LogEventTypes.FILTER_LOGS, async (data) => {
            try {
                // This is a simplified implementation
                // In a real implementation, you would apply more sophisticated filtering
                let logs;
                if (data?.flowId) {
                    logs = await this.logService.getLogsByFlow(data.flowId);
                } else if (data?.runId) {
                    logs = await this.logService.getLogsByRun(data.runId);
                } else {
                    logs = await this.logService.getAllLogs();
                }
                socket.emit(LogEventTypes.FILTER_LOGS, { logs });
            } catch (error: any) {
                logger.error('[Socket:Logs] Error filtering logs', { error: error.message });
                socket.emit('error', { message: 'Failed to filter logs' });
            }
        });

        // Clear logs
        socket.on(LogEventTypes.CLEAR_LOGS, async (data) => {
            try {
                if (data?.flowId) {
                    await this.logService.deleteLogsByFlow(data.flowId);
                    socket.emit(LogEventTypes.CLEAR_LOGS, { success: true, flowId: data.flowId });
                } else if (data?.logId) {
                    await this.logService.deleteLog(data.logId);
                    socket.emit(LogEventTypes.CLEAR_LOGS, { success: true, logId: data.logId });
                } else {
                    socket.emit('error', { message: 'Missing flowId or logId parameter' });
                }
            } catch (error: any) {
                logger.error('[Socket:Logs] Error clearing logs', { error: error.message });
                socket.emit('error', { message: 'Failed to clear logs' });
            }
        });
    }

    /**
     * Emit a new log event to all connected clients
     * @param log The log data to emit
     */
    public emitNewLog(log: any): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:Logs] Cannot emit new log: Socket.IO server not initialized');
            return;
        }

        // Emit to all clients in the namespace
        io.emit(LogEventTypes.NEW_LOG, { log });

        // If the log has a flowId, also emit to the flow room
        if (log.flowId) {
            io.to(`flow:${log.flowId}`).emit(LogEventTypes.NEW_LOG, { log });
        }

        // If the log has a runId, also emit to the run room
        if (log.runId) {
            io.to(`run:${log.runId}`).emit(LogEventTypes.NEW_LOG, { log });
        }

        // Also send the log to the console sessions in the FlowNamespace
        this.sendLogToConsole(log);
    }

    /**
     * Send a log to all active console sessions
     * @param log The log data to send
     */
    private sendLogToConsole(log: any): void {
        try {
            // Get the FlowNamespace instance
            const flowNamespace = FlowNamespace.getInstance();

            // Get the Socket.IO server instance for the flows namespace
            const io = global.socketIO?.of('/flows');
            if (!io) {
                return;
            }

            // Format the log for console display
            const logMessage = {
                sessionId: 'system', // Special session ID for system logs
                type: 'output',
                stream: log.level === 'error' ? 'stderr' : 'stdout',
                data: `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level.toUpperCase()}] ${log.message}\n`,
                timestamp: Date.now()
            };

            // Emit the log message to all clients in the flows namespace
            io.emit('console-message', logMessage);

        } catch (error: any) {
            logger.error('[Socket:Logs] Error sending log to console', { error: error.message });
        }
    }
}
