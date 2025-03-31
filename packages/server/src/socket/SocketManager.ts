import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '@mintflow/common';
import { ENV } from '../config/env.js';
import { createRedisAdapter } from './config/socket.config.js';
import { SocketConnectionOptions } from './types/socket.types.js';
import { LogNamespace } from './namespaces/LogNamespace.js';
import { WorkspaceNamespace } from './namespaces/WorkspaceNamespace.js';
import { FlowNamespace } from './namespaces/FlowNamespace.js';
import { AINamespace } from './namespaces/AINamespace.js';

/**
 * Socket.IO manager
 * Initializes and manages Socket.IO server and namespaces
 */
export class SocketManager {
    private static instance: SocketManager;
    private io: SocketIOServer;
    private initialized: boolean = false;

    private constructor(server: HttpServer, options?: SocketConnectionOptions) {
        // Initialize Socket.IO server
        this.io = new SocketIOServer(server, {
            path: options?.path || ENV.SOCKET_PATH,
            cors: options?.cors || {
                origin: ENV.SOCKET_CORS_ORIGIN,
                methods: ENV.SOCKET_CORS_METHODS.split(','),
                credentials: ENV.SOCKET_CORS_CREDENTIALS
            }
        });

        // Set up Redis adapter for multi-node support if enabled
        if (options?.useRedisAdapter !== false && ENV.REDIS_HOST) {
            const adapter = createRedisAdapter();
            if (adapter) {
                this.io.adapter(adapter);
                logger.info('[Socket] Redis adapter initialized for multi-node support');
            }
        }

        // Make Socket.IO instance globally available
        (global as any).socketIO = this.io;
    }

    /**
     * Initialize the Socket.IO manager
     * @param server The HTTP server
     * @param options Socket connection options
     * @returns The SocketManager instance
     */
    public static initialize(server: HttpServer, options?: SocketConnectionOptions): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager(server, options);
        }
        return SocketManager.instance;
    }

    /**
     * Get the Socket.IO manager instance
     * @returns The SocketManager instance
     * @throws Error if the manager is not initialized
     */
    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            throw new Error('SocketManager not initialized. Call initialize() first.');
        }
        return SocketManager.instance;
    }

    /**
     * Get the Socket.IO server instance
     * @returns The Socket.IO server instance
     */
    public getIO(): SocketIOServer {
        return this.io;
    }

    /**
     * Initialize all namespaces
     */
    public initializeNamespaces(): void {
        if (this.initialized) {
            logger.warn('[Socket] Namespaces already initialized');
            return;
        }

        try {
            // Initialize namespaces
            LogNamespace.getInstance().initialize(this.io);
            WorkspaceNamespace.getInstance().initialize(this.io);
            FlowNamespace.getInstance().initialize(this.io);
            AINamespace.getInstance().initialize(this.io);

            this.initialized = true;
            logger.info('[Socket] All namespaces initialized');
        } catch (error: any) {
            logger.error('[Socket] Error initializing namespaces', { error: error.message });
            throw error;
        }
    }

    /**
     * Get the logs namespace
     * @returns The logs namespace
     */
    public getLogsNamespace(): LogNamespace {
        return LogNamespace.getInstance();
    }

    /**
     * Get the workspaces namespace
     * @returns The workspaces namespace
     */
    public getWorkspacesNamespace(): WorkspaceNamespace {
        return WorkspaceNamespace.getInstance();
    }

    /**
     * Get the flows namespace
     * @returns The flows namespace
     */
    public getFlowsNamespace(): FlowNamespace {
        return FlowNamespace.getInstance();
    }

    /**
     * Get the AI namespace
     * @returns The AI namespace
     */
    public getAINamespace(): AINamespace {
        return AINamespace.getInstance();
    }

    /**
     * Close the Socket.IO server
     * @returns Promise that resolves when the server is closed
     */
    public async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.io.close((err) => {
                if (err) {
                    logger.error('[Socket] Error closing Socket.IO server', { error: err.message });
                    reject(err);
                } else {
                    logger.info('[Socket] Socket.IO server closed');
                    resolve();
                }
            });
        });
    }
}

// Add global type declaration for socketIO
declare global {
    var socketIO: SocketIOServer | undefined;
}
