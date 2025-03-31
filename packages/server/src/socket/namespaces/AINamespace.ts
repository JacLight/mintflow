import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@mintflow/common';
import { INamespaceHandler, AIEventTypes } from '../types/socket.types.js';
import { socketAuthMiddleware, socketTenantMiddleware } from '../middleware/auth.js';
import { aiAssistant } from '../../services/AIAssistant.js';

/**
 * Socket.IO namespace for AI server communication
 * Handles real-time AI requests and responses
 */
export class AINamespace implements INamespaceHandler {
    private static instance: AINamespace;
    private namespace: string = '/ai';
    private activeStreams: Map<string, any> = new Map();

    private constructor() { }

    /**
     * Get singleton instance
     */
    public static getInstance(): AINamespace {
        if (!AINamespace.instance) {
            AINamespace.instance = new AINamespace();
        }
        return AINamespace.instance;
    }

    /**
     * Initialize the AI namespace
     * @param io The Socket.IO server instance
     */
    public initialize(io: SocketIOServer): void {
        const nsp = io.of(this.namespace);

        // Apply middleware
        nsp.use(socketAuthMiddleware);
        nsp.use(socketTenantMiddleware);

        // Handle connections
        nsp.on('connection', (socket: Socket) => {
            logger.info(`[Socket:AI] Client connected: ${socket.id}`);

            // Handle events
            this.registerEventHandlers(socket);

            // Handle disconnection
            socket.on('disconnect', () => {
                logger.info(`[Socket:AI] Client disconnected: ${socket.id}`);
                this.cleanupStreams(socket.id);
            });
        });

        logger.info(`[Socket] AI namespace initialized at ${this.namespace}`);
    }

    /**
     * Register event handlers for the socket
     * @param socket The Socket.IO socket
     */
    private registerEventHandlers(socket: Socket): void {
        // Handle AI request
        socket.on(AIEventTypes.AI_REQUEST, async (data) => {
            // Store request info outside try/catch to access it in catch block
            let requestId = data?.requestId;
            let userId = '';
            let streamMode = false;

            try {
                const { model, prompt, stream = false, options = {} } = data;
                requestId = data.requestId; // Ensure requestId is available in catch block

                if (!requestId || !prompt) {
                    socket.emit('error', { message: 'Missing required parameters' });
                    return;
                }

                // Get user ID from socket (or use socket ID if not available)
                userId = (socket as any).user?.id || socket.id;
                streamMode = stream;

                logger.info(`[Socket:AI] Received AI request`, {
                    requestId,
                    userId,
                    model: model || 'default',
                    streamMode
                });

                // If streaming is requested, start a streaming response
                if (stream) {
                    // Store stream info
                    this.activeStreams.set(requestId, {
                        socketId: socket.id,
                        userId,
                        startTime: new Date(),
                        model: model || 'default',
                        status: 'active'
                    });

                    // Emit stream start event
                    socket.emit(AIEventTypes.AI_STREAM_START, {
                        requestId,
                        timestamp: new Date()
                    });

                    try {
                        // Process the message with streaming
                        await aiAssistant.processMessageStream(
                            userId,
                            prompt,
                            (chunk) => {
                                if (chunk.isComplete) {
                                    // End of stream
                                    socket.emit(AIEventTypes.AI_STREAM_END, {
                                        requestId,
                                        status: 'completed',
                                        timestamp: new Date()
                                    });

                                    this.activeStreams.delete(requestId);
                                    logger.info(`[Socket:AI] Stream completed`, { requestId });
                                } else {
                                    // Send chunk
                                    socket.emit(AIEventTypes.AI_STREAM_CHUNK, {
                                        requestId,
                                        chunk: chunk.text,
                                        timestamp: new Date()
                                    });
                                }
                            },
                            model
                        );
                    } catch (error: unknown) {
                        const streamError = error as Error;

                        // Detailed logging for debugging
                        logger.error('[Socket:AI] Stream processing error:', {
                            errorType: streamError.constructor?.name || 'Unknown',
                            requestId,
                            userId
                        });

                        // Log only safe properties to avoid circular references
                        try {
                            if (streamError instanceof Error) {
                                logger.error('[Socket:AI] Stream error details:', {
                                    name: streamError.name,
                                    message: streamError.message,
                                    // Only log the first part of the stack trace
                                    stack: streamError.stack?.split('\n').slice(0, 3).join('\n')
                                });
                            } else {
                                logger.error('[Socket:AI] Non-Error object thrown:', {
                                    value: String(streamError)
                                });
                            }
                        } catch (logError) {
                            logger.error('[Socket:AI] Error while logging stream error details:', {
                                errorMessage: logError instanceof Error ? logError.message : String(logError)
                            });
                        }

                        // Handle streaming errors
                        let errorMessage = '';

                        // Handle circular JSON structure errors
                        if (streamError instanceof Error && streamError.message.includes('circular structure')) {
                            errorMessage = 'Error processing response: Circular reference detected';
                            logger.error('[Socket:AI] Circular reference error in streaming response', {
                                requestId,
                                originalError: streamError.message
                            });
                        } else {
                            errorMessage = streamError instanceof Error ? streamError.message : String(streamError);
                            logger.error('[Socket:AI] Error in streaming response', {
                                error: errorMessage,
                                requestId
                            });
                        }

                        socket.emit(AIEventTypes.AI_ERROR, {
                            requestId,
                            error: errorMessage,
                            timestamp: new Date()
                        });

                        // Clean up the stream
                        this.activeStreams.delete(requestId);
                    }
                } else {
                    // For non-streaming responses
                    const response = await aiAssistant.processMessage(userId, prompt, model);

                    socket.emit(AIEventTypes.AI_RESPONSE, {
                        requestId,
                        response,
                        model: model || 'default',
                        timestamp: new Date()
                    });

                    logger.info(`[Socket:AI] Sent response`, { requestId });
                }
            } catch (error: unknown) {
                // Safely extract error message to avoid circular reference issues
                const err = error as Error;
                const errorMessage = err instanceof Error ? err.message : String(err);

                // Detailed logging for debugging
                logger.error('[Socket:AI] Error processing AI request', {
                    error: errorMessage,
                    errorType: err.constructor?.name || 'Unknown',
                    requestId: requestId || data?.requestId,
                    userId
                });

                // Log only safe properties to avoid circular references
                try {
                    if (err instanceof Error) {
                        logger.error('[Socket:AI] Main catch block error details:', {
                            name: err.name,
                            message: err.message,
                            // Only log the first part of the stack trace
                            stack: err.stack?.split('\n').slice(0, 3).join('\n')
                        });
                    } else {
                        logger.error('[Socket:AI] Non-Error object thrown in main catch:', {
                            value: String(err)
                        });
                    }
                } catch (logError) {
                    logger.error('[Socket:AI] Error while logging main error details:', {
                        errorMessage: logError instanceof Error ? logError.message : String(logError)
                    });
                }

                socket.emit(AIEventTypes.AI_ERROR, {
                    requestId: requestId || data?.requestId,
                    error: errorMessage,
                    timestamp: new Date()
                });
            }
        });

        // Handle conversation history clear request
        socket.on('clear_history', () => {
            try {
                const userId = (socket as any).user?.id || socket.id;
                aiAssistant.clearConversationHistory(userId);
                socket.emit('history_cleared', { success: true, timestamp: new Date() });
                logger.info(`[Socket:AI] Cleared conversation history`, { userId });
            } catch (error: any) {
                logger.error('[Socket:AI] Error clearing history', { error: error.message });
                socket.emit('error', { message: 'Failed to clear conversation history' });
            }
        });

        // Handle stream cancellation
        socket.on('cancel_stream', (data) => {
            try {
                const { requestId } = data;

                if (!requestId) {
                    socket.emit('error', { message: 'Missing requestId parameter' });
                    return;
                }

                // Check if stream exists
                if (this.activeStreams.has(requestId)) {
                    const streamInfo = this.activeStreams.get(requestId);

                    // Only allow cancellation from the socket that started the stream
                    if (streamInfo.socketId === socket.id) {
                        this.activeStreams.delete(requestId);

                        socket.emit(AIEventTypes.AI_STREAM_END, {
                            requestId,
                            status: 'cancelled',
                            timestamp: new Date()
                        });

                        logger.info(`[Socket:AI] Stream cancelled`, { requestId });
                    } else {
                        socket.emit('error', { message: 'Unauthorized to cancel this stream' });
                    }
                } else {
                    socket.emit('error', { message: 'Stream not found' });
                }
            } catch (error: any) {
                logger.error('[Socket:AI] Error cancelling stream', { error: error.message });
                socket.emit('error', { message: 'Failed to cancel stream' });
            }
        });
    }

    /**
     * Clean up streams for a disconnected socket
     * @param socketId The socket ID
     */
    private cleanupStreams(socketId: string): void {
        for (const [requestId, streamInfo] of this.activeStreams.entries()) {
            if (streamInfo.socketId === socketId) {
                this.activeStreams.delete(requestId);
                logger.info(`[Socket:AI] Stream cleaned up after disconnect`, { requestId });
            }
        }
    }

    /**
     * Send an AI response to a client
     * @param socketId The socket ID to send to
     * @param requestId The request ID
     * @param response The response data
     */
    public sendAIResponse(socketId: string, requestId: string, response: any): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:AI] Cannot send AI response: Socket.IO server not initialized');
            return;
        }

        io.to(socketId).emit(AIEventTypes.AI_RESPONSE, {
            requestId,
            response,
            timestamp: new Date()
        });

        logger.debug(`[Socket:AI] Sent AI response`, { requestId, socketId });
    }

    /**
     * Send a streaming chunk to a client
     * @param socketId The socket ID to send to
     * @param requestId The request ID
     * @param chunk The chunk data
     * @param index The chunk index
     */
    public sendStreamChunk(socketId: string, requestId: string, chunk: string, index: number): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:AI] Cannot send stream chunk: Socket.IO server not initialized');
            return;
        }

        // Check if stream is still active
        if (!this.activeStreams.has(requestId) || this.activeStreams.get(requestId).status !== 'active') {
            return;
        }

        io.to(socketId).emit(AIEventTypes.AI_STREAM_CHUNK, {
            requestId,
            chunk,
            index,
            timestamp: new Date()
        });
    }

    /**
     * End a streaming response
     * @param socketId The socket ID to send to
     * @param requestId The request ID
     * @param status The status (completed, error, cancelled)
     * @param error Optional error message
     */
    public endStream(socketId: string, requestId: string, status: 'completed' | 'error' | 'cancelled', error?: string): void {
        const io = global.socketIO?.of(this.namespace);
        if (!io) {
            logger.warn('[Socket:AI] Cannot end stream: Socket.IO server not initialized');
            return;
        }

        // Check if stream exists
        if (this.activeStreams.has(requestId)) {
            this.activeStreams.delete(requestId);

            io.to(socketId).emit(AIEventTypes.AI_STREAM_END, {
                requestId,
                status,
                error,
                timestamp: new Date()
            });

            logger.info(`[Socket:AI] Stream ended`, { requestId, status });
        }
    }
}
