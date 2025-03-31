import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@mintflow/common';
import { INamespaceHandler, AIEventTypes } from '../types/socket.types.js';
import { socketAuthMiddleware, socketTenantMiddleware } from '../middleware/auth.js';

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
            try {
                const { requestId, model, prompt, stream = false, options = {} } = data;

                if (!requestId || !prompt) {
                    socket.emit('error', { message: 'Missing required parameters' });
                    return;
                }

                logger.info(`[Socket:AI] Received AI request`, {
                    requestId,
                    model: model || 'default',
                    streamMode: stream
                });

                // If streaming is requested, start a streaming response
                if (stream) {
                    // Store stream info
                    this.activeStreams.set(requestId, {
                        socketId: socket.id,
                        startTime: new Date(),
                        model: model || 'default',
                        status: 'active'
                    });

                    // Emit stream start event
                    socket.emit(AIEventTypes.AI_STREAM_START, {
                        requestId,
                        timestamp: new Date()
                    });

                    // In a real implementation, you would connect to an AI service here
                    // For this example, we'll simulate a streaming response
                    this.simulateStreamingResponse(socket, requestId, prompt);
                } else {
                    // For non-streaming responses, simulate a simple response
                    setTimeout(() => {
                        socket.emit(AIEventTypes.AI_RESPONSE, {
                            requestId,
                            response: `Response to: ${prompt}`,
                            model: model || 'default',
                            timestamp: new Date()
                        });
                    }, 1000);
                }
            } catch (error: any) {
                logger.error('[Socket:AI] Error processing AI request', { error: error.message });
                socket.emit(AIEventTypes.AI_ERROR, {
                    requestId: data?.requestId,
                    error: error.message,
                    timestamp: new Date()
                });
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
     * Simulate a streaming response for demonstration purposes
     * In a real implementation, this would connect to an AI service
     * @param socket The Socket.IO socket
     * @param requestId The request ID
     * @param prompt The prompt
     */
    private simulateStreamingResponse(socket: Socket, requestId: string, prompt: string): void {
        const words = `This is a simulated streaming response to your prompt: "${prompt}". In a real implementation, this would connect to an AI service and stream the response as it's generated.`.split(' ');
        let index = 0;

        const interval = setInterval(() => {
            // Check if stream is still active
            if (!this.activeStreams.has(requestId) || this.activeStreams.get(requestId).status !== 'active') {
                clearInterval(interval);
                return;
            }

            // Check if socket is still connected
            if (!socket.connected) {
                clearInterval(interval);
                this.activeStreams.delete(requestId);
                return;
            }

            // Send next chunk
            if (index < words.length) {
                socket.emit(AIEventTypes.AI_STREAM_CHUNK, {
                    requestId,
                    chunk: words[index] + ' ',
                    index,
                    timestamp: new Date()
                });
                index++;
            } else {
                // End of stream
                clearInterval(interval);

                socket.emit(AIEventTypes.AI_STREAM_END, {
                    requestId,
                    status: 'completed',
                    timestamp: new Date()
                });

                this.activeStreams.delete(requestId);
                logger.info(`[Socket:AI] Stream completed`, { requestId });
            }
        }, 200); // Send a word every 200ms
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
