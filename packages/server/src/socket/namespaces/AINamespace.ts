import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@mintflow/common';
import { INamespaceHandler, AIEventTypes } from '../types/socket.types.js';
import { socketAuthMiddleware, socketTenantMiddleware } from '../middleware/auth.js';
import { aiAssistant } from '../../services/AIAssistant.js';
import { workflowService } from '../../services/WorkflowService.js';

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

                // Get user ID from socket (or use socket ID if not available)
                const userId = (socket as any).user?.id || socket.id;

                logger.info(`[Socket:AI] Received AI request`, {
                    requestId,
                    userId,
                    model: model || 'default',
                    streamMode: stream
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
                } else {
                    // For non-streaming responses
                    const response = await aiAssistant.processMessage(userId, prompt, model);

                    // Check if the response contains a command
                    const commandPatterns = [
                        // Create flow command
                        {
                            regex: /create\s+flow\s+([a-zA-Z0-9_-]+)/i,
                            command: 'create_flow',
                            paramsExtractor: (matches: RegExpMatchArray) => ({ name: matches[1] })
                        },
                        // Add node command - expanded to include all node types
                        {
                            regex: /add\s+([a-zA-Z0-9_-]+)\s+node/i,
                            command: 'add_node',
                            paramsExtractor: (matches: RegExpMatchArray) => ({
                                nodeType: matches[1],
                                // Default to the active flow if not specified
                                flowId: 'default-flow'
                            })
                        },
                        // List flows command
                        {
                            regex: /list\s+flows/i,
                            command: 'list_flows',
                            paramsExtractor: () => ({})
                        }
                    ];

                    // Check if the response contains a command
                    let isCommand = false;
                    let commandData: { command: string; params: any } | null = null;

                    for (const pattern of commandPatterns) {
                        const matches = response.match(pattern.regex);
                        if (matches) {
                            isCommand = true;
                            commandData = {
                                command: pattern.command,
                                params: pattern.paramsExtractor(matches)
                            };
                            break;
                        }
                    }

                    if (isCommand && commandData !== null) {
                        logger.info(`[Socket:AI] Detected command in response`, {
                            requestId,
                            command: commandData.command
                        });

                        // Execute the command
                        let result;
                        switch (commandData.command) {
                            case 'add_node':
                                // Get parameters
                                const nodeType = commandData.params.nodeType || 'info';
                                const nodeId = `node-${Date.now()}`;
                                const flowId = commandData.params.flowId || 'default-flow';

                                try {
                                    // Use the WorkflowService to add the node
                                    const node = workflowService.addNode(flowId, nodeType, nodeId);

                                    result = {
                                        success: true,
                                        nodeId,
                                        nodeType,
                                        flowId,
                                        node
                                    };

                                    logger.info(`[Socket:AI] Node added to flow`, {
                                        nodeId,
                                        nodeType,
                                        flowId
                                    });
                                } catch (error: any) {
                                    result = {
                                        success: false,
                                        error: error.message,
                                        nodeType,
                                        flowId
                                    };

                                    logger.error(`[Socket:AI] Error adding node to flow`, {
                                        error: error.message,
                                        nodeType,
                                        flowId
                                    });
                                }
                                break;

                            case 'create_flow':
                                // Get parameters
                                const flowName = commandData.params.name || 'New Flow';

                                try {
                                    // Use the WorkflowService to create the flow
                                    const flow = workflowService.createFlow(flowName);

                                    result = {
                                        success: true,
                                        flowId: flow.id,
                                        name: flow.name,
                                        flow
                                    };

                                    logger.info(`[Socket:AI] Flow created`, {
                                        flowId: flow.id,
                                        name: flow.name
                                    });
                                } catch (error: any) {
                                    result = {
                                        success: false,
                                        error: error.message,
                                        name: flowName
                                    };

                                    logger.error(`[Socket:AI] Error creating flow`, {
                                        error: error.message,
                                        name: flowName
                                    });
                                }
                                break;

                            case 'list_flows':
                                try {
                                    // Use the WorkflowService to get all flows
                                    const flows = workflowService.getFlows();

                                    result = {
                                        success: true,
                                        flows
                                    };

                                    logger.info(`[Socket:AI] Listed flows`, {
                                        count: flows.length
                                    });
                                } catch (error: any) {
                                    result = {
                                        success: false,
                                        error: error.message
                                    };

                                    logger.error(`[Socket:AI] Error listing flows`, {
                                        error: error.message
                                    });
                                }
                                break;

                            default:
                                result = {
                                    success: false,
                                    error: `Unknown command: ${commandData.command}`
                                };
                        }

                        // Send the command result
                        socket.emit(AIEventTypes.AI_COMMAND_RESULT, {
                            requestId,
                            command: commandData.command,
                            result,
                            timestamp: new Date()
                        });
                    } else {
                        // Send the regular response
                        socket.emit(AIEventTypes.AI_RESPONSE, {
                            requestId,
                            response,
                            model: model || 'default',
                            timestamp: new Date()
                        });
                    }

                    logger.info(`[Socket:AI] Sent response`, { requestId });
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

        // Handle AI command execution
        socket.on(AIEventTypes.AI_COMMAND, async (data) => {
            try {
                const { command, params, requestId } = data;

                if (!command || !requestId) {
                    socket.emit('error', { message: 'Missing required parameters' });
                    return;
                }

                // Get user ID from socket (or use socket ID if not available)
                const userId = (socket as any).user?.id || socket.id;

                logger.info(`[Socket:AI] Received command execution request`, {
                    requestId,
                    userId,
                    command,
                    params
                });

                // Execute the command
                let result;
                switch (command) {
                    case 'add_node':
                        // Get parameters
                        const nodeType = params.nodeType || 'info';
                        const nodeId = `node-${Date.now()}`;
                        const flowId = params.flowId || 'default-flow';

                        try {
                            // Use the WorkflowService to add the node
                            const node = workflowService.addNode(flowId, nodeType, nodeId);

                            result = {
                                success: true,
                                nodeId,
                                nodeType,
                                flowId,
                                node
                            };

                            logger.info(`[Socket:AI] Node added to flow`, {
                                nodeId,
                                nodeType,
                                flowId
                            });
                        } catch (error: any) {
                            result = {
                                success: false,
                                error: error.message,
                                nodeType,
                                flowId
                            };

                            logger.error(`[Socket:AI] Error adding node to flow`, {
                                error: error.message,
                                nodeType,
                                flowId
                            });
                        }
                        break;

                    case 'create_flow':
                        // Get parameters
                        const flowName = params.name || 'New Flow';

                        try {
                            // Use the WorkflowService to create the flow
                            const flow = workflowService.createFlow(flowName);

                            result = {
                                success: true,
                                flowId: flow.id,
                                name: flow.name,
                                flow
                            };

                            logger.info(`[Socket:AI] Flow created`, {
                                flowId: flow.id,
                                name: flow.name
                            });
                        } catch (error: any) {
                            result = {
                                success: false,
                                error: error.message,
                                name: flowName
                            };

                            logger.error(`[Socket:AI] Error creating flow`, {
                                error: error.message,
                                name: flowName
                            });
                        }
                        break;

                    case 'list_flows':
                        try {
                            // Use the WorkflowService to get all flows
                            const flows = workflowService.getFlows();

                            result = {
                                success: true,
                                flows
                            };

                            logger.info(`[Socket:AI] Listed flows`, {
                                count: flows.length
                            });
                        } catch (error: any) {
                            result = {
                                success: false,
                                error: error.message
                            };

                            logger.error(`[Socket:AI] Error listing flows`, {
                                error: error.message
                            });
                        }
                        break;

                    default:
                        result = {
                            success: false,
                            error: `Unknown command: ${command}`
                        };
                }

                // Send the command result
                socket.emit(AIEventTypes.AI_COMMAND_RESULT, {
                    requestId,
                    command,
                    result,
                    timestamp: new Date()
                });

                logger.info(`[Socket:AI] Command executed`, {
                    requestId,
                    command,
                    success: result.success
                });
            } catch (error: any) {
                logger.error('[Socket:AI] Error executing command', {
                    error: error.message,
                    stack: error.stack?.split('\n').slice(0, 3).join('\n')
                });

                socket.emit(AIEventTypes.AI_ERROR, {
                    requestId: data?.requestId,
                    error: `Error executing command: ${error.message}`,
                    timestamp: new Date()
                });
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
