import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

/**
 * Socket.IO namespace handler interface
 * Each namespace should implement this interface
 */
export interface INamespaceHandler {
    /**
     * Initialize the namespace
     * @param io The Socket.IO server instance
     */
    initialize(io: SocketIOServer): void;
}

/**
 * Socket event handler function type
 */
export type SocketEventHandler = (socket: Socket, data: any) => void;

/**
 * Socket authentication middleware function type
 */
export type SocketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

/**
 * Socket connection options
 */
export interface SocketConnectionOptions {
    /**
     * CORS options for Socket.IO
     */
    cors?: {
        origin: string | string[];
        methods: string[];
        credentials?: boolean;
    };
    /**
     * Path for Socket.IO
     * Default: /socket.io
     */
    path?: string;
    /**
     * Whether to use Redis adapter for multi-node support
     * Default: true if Redis is configured
     */
    useRedisAdapter?: boolean;
}

/**
 * Socket event types for logs
 */
export enum LogEventTypes {
    NEW_LOG = 'new_log',
    CLEAR_LOGS = 'clear_logs',
    FILTER_LOGS = 'filter_logs',
    LOG_HISTORY = 'log_history'
}

/**
 * Socket event types for workspaces
 */
export enum WorkspaceEventTypes {
    JOIN_WORKSPACE = 'join_workspace',
    LEAVE_WORKSPACE = 'leave_workspace',
    UPDATE_WORKSPACE = 'update_workspace',
    WORKSPACE_UPDATED = 'workspace_updated',
    USER_JOINED = 'user_joined',
    USER_LEFT = 'user_left'
}

/**
 * Socket event types for flow engine
 */
export enum FlowEventTypes {
    FLOW_STARTED = 'flow_started',
    FLOW_COMPLETED = 'flow_completed',
    FLOW_FAILED = 'flow_failed',
    NODE_STARTED = 'node_started',
    NODE_COMPLETED = 'node_completed',
    NODE_FAILED = 'node_failed',
    FLOW_PROGRESS = 'flow_progress'
}

/**
 * Socket event types for AI server
 */
export enum AIEventTypes {
    AI_REQUEST = 'ai_request',
    AI_RESPONSE = 'ai_response',
    AI_STREAM_START = 'ai_stream_start',
    AI_STREAM_CHUNK = 'ai_stream_chunk',
    AI_STREAM_END = 'ai_stream_end',
    AI_ERROR = 'ai_error',
    AI_COMMAND = 'ai_command',
    AI_COMMAND_RESULT = 'ai_command_result'
}
