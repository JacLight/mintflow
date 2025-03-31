import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@mintflow/common';
import { INamespaceHandler, FlowEventTypes, LogEventTypes } from '../types/socket.types.js';
import { socketAuthMiddleware, socketTenantMiddleware } from '../middleware/auth.js';
import { FlowEngine } from '../../engine/FlowEngine.js';
import { v4 as uuidv4 } from 'uuid';
import { exec, spawn, ChildProcess } from 'child_process';

/**
 * Socket.IO namespace for flow engine
 * Handles real-time flow execution events
 */
export class FlowNamespace implements INamespaceHandler {
    private static instance: FlowNamespace;
    private namespace: string = '/flows';
    private flowEngine: FlowEngine;

    // Console session management
    private consoleSessions: Map<string, {
        id: string;
        process: ChildProcess | null;
        active: boolean;
        createdAt: Date;
    }> = new Map();

    private constructor() {
        this.flowEngine = FlowEngine.getInstance();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): FlowNamespace {
        if (!FlowNamespace.instance) {
            FlowNamespace.instance = new FlowNamespace();
        }
        return FlowNamespace.instance;
    }

    /**
     * Initialize the flows namespace
     * @param io The Socket.IO server instance
     */
    public initialize(io: SocketIOServer): void {
        const nsp = io.of(this.namespace);

        // Apply middleware
        nsp.use(socketAuthMiddleware);
        nsp.use(socketTenantMiddleware);

        // Handle connections
        nsp.on('connection', (socket: Socket) => {
            logger.info(`[Socket:Flows] Client connected: ${socket.id}`);

            // Join tenant room if tenant ID is provided
            const tenantId = socket.handshake.query.tenantId as string;
            if (tenantId) {
                socket.join(`tenant:${tenantId}`);
            }

            // Handle events
            this.registerEventHandlers(socket);

            // Handle disconnection
            socket.on('disconnect', () => {
                logger.info(`[Socket:Flows] Client disconnected: ${socket.id}`);
            });
        });

        logger.info(`[Socket] Flows namespace initialized at ${this.namespace}`);
    }

    /**
     * Register event handlers for the socket
     * @param socket The Socket.IO socket
     */
    private registerEventHandlers(socket: Socket): void {
        // Subscribe to flow events
        socket.on('subscribe_flow', (data) => {
            try {
                const { flowId, runId } = data;

                if (flowId) {
                    socket.join(`flow:${flowId}`);
                    logger.debug(`[Socket:Flows] Client subscribed to flow: ${flowId}`);
                }

                if (runId) {
                    socket.join(`run:${runId}`);
                    logger.debug(`[Socket:Flows] Client subscribed to run: ${runId}`);
                }

                socket.emit('subscribe_flow', { success: true, flowId, runId });
            } catch (error: any) {
                logger.error('[Socket:Flows] Error subscribing to flow', { error: error.message });
                socket.emit('error', { message: 'Failed to subscribe to flow' });
            }
        });

        // Unsubscribe from flow events
        socket.on('unsubscribe_flow', (data) => {
            try {
                const { flowId, runId } = data;

                if (flowId) {
                    socket.leave(`flow:${flowId}`);
                    logger.debug(`[Socket:Flows] Client unsubscribed from flow: ${flowId}`);
                }

                if (runId) {
                    socket.leave(`run:${runId}`);
                    logger.debug(`[Socket:Flows] Client unsubscribed from run: ${runId}`);
                }

                socket.emit('unsubscribe_flow', { success: true, flowId, runId });
            } catch (error: any) {
                logger.error('[Socket:Flows] Error unsubscribing from flow', { error: error.message });
                socket.emit('error', { message: 'Failed to unsubscribe from flow' });
            }
        });

        // Console functionality - Create session
        socket.on('create-session', () => {
            try {
                // Create a new session ID
                const sessionId = uuidv4();

                // Store session info
                this.consoleSessions.set(sessionId, {
                    id: sessionId,
                    process: null,
                    active: true,
                    createdAt: new Date()
                });

                // Send session created event
                socket.emit('session-created', { sessionId });

                logger.info(`[Socket:Flows] Console session created: ${sessionId}`);
            } catch (error: any) {
                logger.error('[Socket:Flows] Error creating console session', { error: error.message });
                socket.emit('error', { message: 'Failed to create console session' });
            }
        });

        // Console functionality - Execute command
        socket.on('execute-command', (data) => {
            try {
                const { sessionId, command } = data;

                if (!sessionId || !command) {
                    socket.emit('error', { message: 'Missing sessionId or command parameter' });
                    return;
                }

                // Check if session exists
                if (!this.consoleSessions.has(sessionId)) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                const session = this.consoleSessions.get(sessionId)!;

                // Execute the command
                const childProcess = exec(command, (error, stdout, stderr) => {
                    if (error) {
                        // Send error message
                        socket.emit('console-message', {
                            sessionId,
                            type: 'error',
                            error: error.message,
                            timestamp: Date.now()
                        });

                        // Send system message for process exit
                        socket.emit('console-message', {
                            sessionId,
                            type: 'system',
                            event: 'close',
                            code: error.code || 1,
                            timestamp: Date.now()
                        });

                        return;
                    }

                    // Send stdout if available
                    if (stdout) {
                        socket.emit('console-message', {
                            sessionId,
                            type: 'output',
                            stream: 'stdout',
                            data: stdout,
                            timestamp: Date.now()
                        });
                    }

                    // Send stderr if available
                    if (stderr) {
                        socket.emit('console-message', {
                            sessionId,
                            type: 'output',
                            stream: 'stderr',
                            data: stderr,
                            timestamp: Date.now()
                        });
                    }

                    // Send system message for process exit
                    socket.emit('console-message', {
                        sessionId,
                        type: 'system',
                        event: 'close',
                        code: 0,
                        timestamp: Date.now()
                    });
                });

                // Store the process
                session.process = childProcess;

                logger.info(`[Socket:Flows] Command executed in session: ${sessionId}`, { command });
            } catch (error: any) {
                logger.error('[Socket:Flows] Error executing command', { error: error.message });
                socket.emit('error', { message: 'Failed to execute command' });
            }
        });

        // Console functionality - Terminal input
        socket.on('terminal-input', (data) => {
            try {
                const { sessionId, input } = data;

                if (!sessionId || !input) {
                    socket.emit('error', { message: 'Missing sessionId or input parameter' });
                    return;
                }

                // Check if session exists
                if (!this.consoleSessions.has(sessionId)) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                const session = this.consoleSessions.get(sessionId)!;

                // Check if process exists
                if (!session.process) {
                    socket.emit('error', { message: 'No active process in session' });
                    return;
                }

                // Send input to process
                if (session.process.stdin) {
                    session.process.stdin.write(input);
                }

                logger.debug(`[Socket:Flows] Input sent to process in session: ${sessionId}`);
            } catch (error: any) {
                logger.error('[Socket:Flows] Error sending input to process', { error: error.message });
                socket.emit('error', { message: 'Failed to send input to process' });
            }
        });

        // Console functionality - Terminate session
        socket.on('terminate-session', (data) => {
            try {
                const { sessionId } = data;

                if (!sessionId) {
                    socket.emit('error', { message: 'Missing sessionId parameter' });
                    return;
                }

                // Check if session exists
                if (!this.consoleSessions.has(sessionId)) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                const session = this.consoleSessions.get(sessionId)!;

                // Kill the process if it exists
                if (session.process) {
                    session.process.kill();
                }

                // Remove the session
                this.consoleSessions.delete(sessionId);

                logger.info(`[Socket:Flows] Session terminated: ${sessionId}`);
            } catch (error: any) {
                logger.error('[Socket:Flows] Error terminating session', { error: error.message });
                socket.emit('error', { message: 'Failed to terminate session' });
            }
        });
    }

    /**
     * Emit a flow started event
     * @param tenantId The tenant ID
     * @param flowId The flow ID
     * @param runId The flow run ID
     * @param data Additional data
     */
    public emitFlowStarted(tenantId: string, flowId: string, runId: string, data: any = {}): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:Flows] Cannot emit flow started: Socket.IO server not initialized');
            return;
        }

        const eventData = {
            tenantId,
            flowId,
            runId,
            status: 'started',
            timestamp: new Date(),
            ...data
        };

        // Emit to tenant room
        io.to(`tenant:${tenantId}`).emit(FlowEventTypes.FLOW_STARTED, eventData);

        // Emit to flow room
        io.to(`flow:${flowId}`).emit(FlowEventTypes.FLOW_STARTED, eventData);

        // Emit to run room
        io.to(`run:${runId}`).emit(FlowEventTypes.FLOW_STARTED, eventData);

        logger.debug(`[Socket:Flows] Emitted flow started event`, { flowId, runId });
    }

    /**
     * Emit a flow completed event
     * @param tenantId The tenant ID
     * @param flowId The flow ID
     * @param runId The flow run ID
     * @param data Additional data
     */
    public emitFlowCompleted(tenantId: string, flowId: string, runId: string, data: any = {}): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:Flows] Cannot emit flow completed: Socket.IO server not initialized');
            return;
        }

        const eventData = {
            tenantId,
            flowId,
            runId,
            status: 'completed',
            timestamp: new Date(),
            ...data
        };

        // Emit to tenant room
        io.to(`tenant:${tenantId}`).emit(FlowEventTypes.FLOW_COMPLETED, eventData);

        // Emit to flow room
        io.to(`flow:${flowId}`).emit(FlowEventTypes.FLOW_COMPLETED, eventData);

        // Emit to run room
        io.to(`run:${runId}`).emit(FlowEventTypes.FLOW_COMPLETED, eventData);

        logger.debug(`[Socket:Flows] Emitted flow completed event`, { flowId, runId });
    }

    /**
     * Emit a flow failed event
     * @param tenantId The tenant ID
     * @param flowId The flow ID
     * @param runId The flow run ID
     * @param error The error message
     * @param data Additional data
     */
    public emitFlowFailed(tenantId: string, flowId: string, runId: string, error: string, data: any = {}): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:Flows] Cannot emit flow failed: Socket.IO server not initialized');
            return;
        }

        const eventData = {
            tenantId,
            flowId,
            runId,
            status: 'failed',
            error,
            timestamp: new Date(),
            ...data
        };

        // Emit to tenant room
        io.to(`tenant:${tenantId}`).emit(FlowEventTypes.FLOW_FAILED, eventData);

        // Emit to flow room
        io.to(`flow:${flowId}`).emit(FlowEventTypes.FLOW_FAILED, eventData);

        // Emit to run room
        io.to(`run:${runId}`).emit(FlowEventTypes.FLOW_FAILED, eventData);

        logger.debug(`[Socket:Flows] Emitted flow failed event`, { flowId, runId, error });
    }

    /**
     * Emit a node started event
     * @param tenantId The tenant ID
     * @param flowId The flow ID
     * @param runId The flow run ID
     * @param nodeId The node ID
     * @param data Additional data
     */
    public emitNodeStarted(tenantId: string, flowId: string, runId: string, nodeId: string, data: any = {}): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:Flows] Cannot emit node started: Socket.IO server not initialized');
            return;
        }

        const eventData = {
            tenantId,
            flowId,
            runId,
            nodeId,
            status: 'started',
            timestamp: new Date(),
            ...data
        };

        // Emit to flow room
        io.to(`flow:${flowId}`).emit(FlowEventTypes.NODE_STARTED, eventData);

        // Emit to run room
        io.to(`run:${runId}`).emit(FlowEventTypes.NODE_STARTED, eventData);

        logger.debug(`[Socket:Flows] Emitted node started event`, { flowId, runId, nodeId });
    }

    /**
     * Emit a node completed event
     * @param tenantId The tenant ID
     * @param flowId The flow ID
     * @param runId The flow run ID
     * @param nodeId The node ID
     * @param data Additional data
     */
    public emitNodeCompleted(tenantId: string, flowId: string, runId: string, nodeId: string, data: any = {}): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:Flows] Cannot emit node completed: Socket.IO server not initialized');
            return;
        }

        const eventData = {
            tenantId,
            flowId,
            runId,
            nodeId,
            status: 'completed',
            timestamp: new Date(),
            ...data
        };

        // Emit to flow room
        io.to(`flow:${flowId}`).emit(FlowEventTypes.NODE_COMPLETED, eventData);

        // Emit to run room
        io.to(`run:${runId}`).emit(FlowEventTypes.NODE_COMPLETED, eventData);

        logger.debug(`[Socket:Flows] Emitted node completed event`, { flowId, runId, nodeId });
    }

    /**
     * Emit a node failed event
     * @param tenantId The tenant ID
     * @param flowId The flow ID
     * @param runId The flow run ID
     * @param nodeId The node ID
     * @param error The error message
     * @param data Additional data
     */
    public emitNodeFailed(tenantId: string, flowId: string, runId: string, nodeId: string, error: string, data: any = {}): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:Flows] Cannot emit node failed: Socket.IO server not initialized');
            return;
        }

        const eventData = {
            tenantId,
            flowId,
            runId,
            nodeId,
            status: 'failed',
            error,
            timestamp: new Date(),
            ...data
        };

        // Emit to flow room
        io.to(`flow:${flowId}`).emit(FlowEventTypes.NODE_FAILED, eventData);

        // Emit to run room
        io.to(`run:${runId}`).emit(FlowEventTypes.NODE_FAILED, eventData);

        logger.debug(`[Socket:Flows] Emitted node failed event`, { flowId, runId, nodeId, error });
    }

    /**
     * Emit a flow progress event
     * @param tenantId The tenant ID
     * @param flowId The flow ID
     * @param runId The flow run ID
     * @param progress The progress percentage (0-100)
     * @param data Additional data
     */
    public emitFlowProgress(tenantId: string, flowId: string, runId: string, progress: number, data: any = {}): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:Flows] Cannot emit flow progress: Socket.IO server not initialized');
            return;
        }

        const eventData = {
            tenantId,
            flowId,
            runId,
            progress: Math.min(Math.max(progress, 0), 100), // Ensure progress is between 0 and 100
            timestamp: new Date(),
            ...data
        };

        // Emit to flow room
        io.to(`flow:${flowId}`).emit(FlowEventTypes.FLOW_PROGRESS, eventData);

        // Emit to run room
        io.to(`run:${runId}`).emit(FlowEventTypes.FLOW_PROGRESS, eventData);

        logger.debug(`[Socket:Flows] Emitted flow progress event`, { flowId, runId, progress });
    }
}
