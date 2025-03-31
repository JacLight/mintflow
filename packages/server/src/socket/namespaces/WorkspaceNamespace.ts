import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@mintflow/common';
import { INamespaceHandler, WorkspaceEventTypes } from '../types/socket.types.js';
import { socketAuthMiddleware, socketTenantMiddleware } from '../middleware/auth.js';

/**
 * Socket.IO namespace for workspaces
 * Handles real-time workspace collaboration and state sharing
 */
export class WorkspaceNamespace implements INamespaceHandler {
    private static instance: WorkspaceNamespace;
    private namespace: string = '/workspaces';
    private workspaces: Map<string, any> = new Map();

    private constructor() { }

    /**
     * Get singleton instance
     */
    public static getInstance(): WorkspaceNamespace {
        if (!WorkspaceNamespace.instance) {
            WorkspaceNamespace.instance = new WorkspaceNamespace();
        }
        return WorkspaceNamespace.instance;
    }

    /**
     * Initialize the workspaces namespace
     * @param io The Socket.IO server instance
     */
    public initialize(io: SocketIOServer): void {
        const nsp = io.of(this.namespace);

        // Apply middleware
        nsp.use(socketAuthMiddleware);
        nsp.use(socketTenantMiddleware);

        // Handle connections
        nsp.on('connection', (socket: Socket) => {
            logger.info(`[Socket:Workspaces] Client connected: ${socket.id}`);

            // Handle events
            this.registerEventHandlers(socket);

            // Handle disconnection
            socket.on('disconnect', () => {
                logger.info(`[Socket:Workspaces] Client disconnected: ${socket.id}`);
                this.handleDisconnect(socket);
            });
        });

        logger.info(`[Socket] Workspaces namespace initialized at ${this.namespace}`);
    }

    /**
     * Register event handlers for the socket
     * @param socket The Socket.IO socket
     */
    private registerEventHandlers(socket: Socket): void {
        // Join workspace
        socket.on(WorkspaceEventTypes.JOIN_WORKSPACE, (data) => {
            try {
                const { workspaceId, userId, userName } = data;
                if (!workspaceId) {
                    socket.emit('error', { message: 'Missing workspaceId parameter' });
                    return;
                }

                // Join the workspace room
                socket.join(`workspace:${workspaceId}`);

                // Store user info
                const user = {
                    userId: userId || socket.id,
                    userName: userName || 'Anonymous',
                    socketId: socket.id,
                    joinedAt: new Date()
                };

                // Store socket ID to workspace mapping for disconnect handling
                (socket as any).workspaces = (socket as any).workspaces || [];
                (socket as any).workspaces.push(workspaceId);

                // Initialize workspace if it doesn't exist
                if (!this.workspaces.has(workspaceId)) {
                    this.workspaces.set(workspaceId, {
                        id: workspaceId,
                        users: [],
                        state: {},
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }

                // Add user to workspace
                const workspace = this.workspaces.get(workspaceId);
                workspace.users.push(user);
                workspace.updatedAt = new Date();

                // Notify other users in the workspace
                socket.to(`workspace:${workspaceId}`).emit(WorkspaceEventTypes.USER_JOINED, {
                    workspace: workspaceId,
                    user
                });

                // Send current workspace state to the user
                socket.emit(WorkspaceEventTypes.JOIN_WORKSPACE, {
                    workspace: {
                        id: workspace.id,
                        users: workspace.users,
                        state: workspace.state,
                        updatedAt: workspace.updatedAt
                    }
                });

                logger.info(`[Socket:Workspaces] User joined workspace`, {
                    workspaceId,
                    userId: user.userId,
                    socketId: socket.id
                });
            } catch (error: any) {
                logger.error('[Socket:Workspaces] Error joining workspace', { error: error.message });
                socket.emit('error', { message: 'Failed to join workspace' });
            }
        });

        // Leave workspace
        socket.on(WorkspaceEventTypes.LEAVE_WORKSPACE, (data) => {
            try {
                const { workspaceId } = data;
                if (!workspaceId) {
                    socket.emit('error', { message: 'Missing workspaceId parameter' });
                    return;
                }

                this.leaveWorkspace(socket, workspaceId);
            } catch (error: any) {
                logger.error('[Socket:Workspaces] Error leaving workspace', { error: error.message });
                socket.emit('error', { message: 'Failed to leave workspace' });
            }
        });

        // Update workspace state
        socket.on(WorkspaceEventTypes.UPDATE_WORKSPACE, (data) => {
            try {
                const { workspaceId, state, partial = true } = data;
                if (!workspaceId || !state) {
                    socket.emit('error', { message: 'Missing workspaceId or state parameter' });
                    return;
                }

                // Check if workspace exists
                if (!this.workspaces.has(workspaceId)) {
                    socket.emit('error', { message: 'Workspace not found' });
                    return;
                }

                // Update workspace state
                const workspace = this.workspaces.get(workspaceId);

                if (partial) {
                    // Merge with existing state
                    workspace.state = { ...workspace.state, ...state };
                } else {
                    // Replace entire state
                    workspace.state = state;
                }

                workspace.updatedAt = new Date();

                // Notify all users in the workspace
                const io = global.socketIO?.of(this.namespace);
                if (io) {
                    io.to(`workspace:${workspaceId}`).emit(WorkspaceEventTypes.WORKSPACE_UPDATED, {
                        workspace: workspaceId,
                        state: workspace.state,
                        updatedAt: workspace.updatedAt,
                        updatedBy: (socket as any).user?.userId || socket.id
                    });
                }

                logger.info(`[Socket:Workspaces] Workspace state updated`, {
                    workspaceId,
                    updatedBy: (socket as any).user?.userId || socket.id
                });
            } catch (error: any) {
                logger.error('[Socket:Workspaces] Error updating workspace', { error: error.message });
                socket.emit('error', { message: 'Failed to update workspace' });
            }
        });
    }

    /**
     * Handle socket disconnection
     * @param socket The Socket.IO socket
     */
    private handleDisconnect(socket: Socket): void {
        // Remove user from all workspaces they were in
        const workspaces = (socket as any).workspaces || [];
        workspaces.forEach((workspaceId: string) => {
            this.leaveWorkspace(socket, workspaceId);
        });
    }

    /**
     * Leave a workspace
     * @param socket The Socket.IO socket
     * @param workspaceId The workspace ID
     */
    private leaveWorkspace(socket: Socket, workspaceId: string): void {
        // Check if workspace exists
        if (!this.workspaces.has(workspaceId)) {
            return;
        }

        // Leave the workspace room
        socket.leave(`workspace:${workspaceId}`);

        // Remove user from workspace
        const workspace = this.workspaces.get(workspaceId);
        const userIndex = workspace.users.findIndex((u: any) => u.socketId === socket.id);

        if (userIndex !== -1) {
            const user = workspace.users[userIndex];
            workspace.users.splice(userIndex, 1);
            workspace.updatedAt = new Date();

            // Notify other users in the workspace
            socket.to(`workspace:${workspaceId}`).emit(WorkspaceEventTypes.USER_LEFT, {
                workspace: workspaceId,
                user
            });

            logger.info(`[Socket:Workspaces] User left workspace`, {
                workspaceId,
                userId: user.userId,
                socketId: socket.id
            });
        }

        // Remove workspace from socket's list
        if ((socket as any).workspaces) {
            const index = (socket as any).workspaces.indexOf(workspaceId);
            if (index !== -1) {
                (socket as any).workspaces.splice(index, 1);
            }
        }

        // Clean up empty workspaces
        if (workspace.users.length === 0) {
            this.workspaces.delete(workspaceId);
            logger.info(`[Socket:Workspaces] Workspace removed (no users)`, { workspaceId });
        }
    }

    /**
     * Get workspace state
     * @param workspaceId The workspace ID
     * @returns The workspace state or null if not found
     */
    public getWorkspaceState(workspaceId: string): any {
        if (!this.workspaces.has(workspaceId)) {
            return null;
        }

        const workspace = this.workspaces.get(workspaceId);
        return {
            id: workspace.id,
            users: workspace.users,
            state: workspace.state,
            updatedAt: workspace.updatedAt
        };
    }

    /**
     * Update workspace state from external source
     * @param workspaceId The workspace ID
     * @param state The state to update
     * @param partial Whether to merge with existing state (true) or replace it (false)
     */
    public updateWorkspaceState(workspaceId: string, state: any, partial: boolean = true): void {
        // Check if workspace exists
        if (!this.workspaces.has(workspaceId)) {
            // Initialize workspace if it doesn't exist
            this.workspaces.set(workspaceId, {
                id: workspaceId,
                users: [],
                state: {},
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Update workspace state
        const workspace = this.workspaces.get(workspaceId);

        if (partial) {
            // Merge with existing state
            workspace.state = { ...workspace.state, ...state };
        } else {
            // Replace entire state
            workspace.state = state;
        }

        workspace.updatedAt = new Date();

        // Notify all users in the workspace
        const io = global.socketIO?.of(this.namespace);
        if (io) {
            io.to(`workspace:${workspaceId}`).emit(WorkspaceEventTypes.WORKSPACE_UPDATED, {
                workspace: workspaceId,
                state: workspace.state,
                updatedAt: workspace.updatedAt,
                updatedBy: 'system'
            });
        }

        logger.info(`[Socket:Workspaces] Workspace state updated externally`, { workspaceId });
    }
}
