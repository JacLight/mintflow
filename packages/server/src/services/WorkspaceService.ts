import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js';

// Table name for workspaces
const WORKSPACE_TABLE = 'workspace';

export class WorkspaceService {
    private db = DatabaseService.getInstance();
    private static instance: WorkspaceService;
    private tenantService: TenantService;

    private constructor() {
        this.tenantService = new TenantService();
        this.initializeDefaultData();
    }

    static getInstance(): WorkspaceService {
        if (!WorkspaceService.instance) {
            WorkspaceService.instance = new WorkspaceService();
        }
        return WorkspaceService.instance;
    }

    /**
     * Initialize default workspace data for testing purposes.
     * In a production environment, this would be replaced with actual data.
     */
    private async initializeDefaultData() {
        try {
            // Check if we already have workspace data
            const existingWorkspaces = await this.db.find(WORKSPACE_TABLE);
            if (existingWorkspaces && existingWorkspaces.length > 0) {
                return; // Data already exists
            }

            // Create default workspaces
            const defaultWorkspaces = [
                {
                    name: 'Default',
                    description: 'Default workspace',
                    tenantId: 'default_tenant',
                    createdAt: new Date('2024-12-01T10:00:00Z'),
                    members: [
                        { id: 'user_123', name: 'John Doe', role: 'Admin' },
                        { id: 'user_456', name: 'Jane Smith', role: 'Editor' }
                    ]
                },
                {
                    name: 'Development',
                    description: 'Development workspace',
                    tenantId: 'default_tenant',
                    createdAt: new Date('2025-01-15T14:30:00Z'),
                    members: [
                        { id: 'user_123', name: 'John Doe', role: 'Admin' }
                    ]
                }
            ];

            for (const workspace of defaultWorkspaces) {
                await this.db.create(WORKSPACE_TABLE, workspace);
            }
            logger.info('[WorkspaceService] Default workspaces created');
        } catch (error) {
            logger.error(`[WorkspaceService] Error initializing default data: ${(error as any).message}`);
        }
    }

    /**
     * Get all workspaces for a tenant.
     */
    async getAllWorkspaces(tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            const workspaces = await this.db.find(WORKSPACE_TABLE, { tenantId });

            // If no workspaces found, initialize with default data
            if (!workspaces || workspaces.length === 0) {
                await this.initializeDefaultData();
                return await this.db.find(WORKSPACE_TABLE, { tenantId });
            }

            return workspaces;
        } catch (error) {
            logger.error(`[WorkspaceService] Error fetching workspaces: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Get workspace by ID.
     */
    async getWorkspaceById(workspaceId: string, tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            const workspace = await this.db.findOne(WORKSPACE_TABLE, { workspaceId, tenantId });
            if (!workspace) {
                throw new Error(`Workspace not found: ${workspaceId}`);
            }

            return workspace;
        } catch (error) {
            logger.error(`[WorkspaceService] Error fetching workspace: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Create a new workspace.
     */
    async createWorkspace(data: any) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(data.tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${data.tenantId}`);
            }

            // Create new workspace
            const newWorkspace = await this.db.create(WORKSPACE_TABLE, {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            logger.info(`[WorkspaceService] Workspace created: ${newWorkspace.workspaceId}`);
            return newWorkspace;
        } catch (error) {
            logger.error(`[WorkspaceService] Error creating workspace: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update a workspace.
     */
    async updateWorkspace(workspaceId: string, data: any, tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Check if workspace exists
            const existingWorkspace = await this.db.findOne(WORKSPACE_TABLE, { workspaceId, tenantId });
            if (!existingWorkspace) {
                throw new Error(`Workspace not found: ${workspaceId}`);
            }

            // Update workspace
            const result = await this.db.update(
                WORKSPACE_TABLE,
                { workspaceId, tenantId },
                { ...data, updatedAt: new Date() },
                undefined
            );

            if (!result) {
                throw new Error(`Failed to update workspace: ${workspaceId}`);
            }

            logger.info(`[WorkspaceService] Workspace updated: ${workspaceId}`);
            return await this.db.findOne(WORKSPACE_TABLE, { workspaceId, tenantId });
        } catch (error) {
            logger.error(`[WorkspaceService] Error updating workspace: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Delete a workspace.
     */
    async deleteWorkspace(workspaceId: string, tenantId: string) {
        try {
            // Verify tenant exists
            const tenant = await this.tenantService.getTenantById(tenantId);
            if (!tenant) {
                throw new Error(`Tenant not found: ${tenantId}`);
            }

            // Check if workspace exists
            const existingWorkspace = await this.db.findOne(WORKSPACE_TABLE, { workspaceId, tenantId });
            if (!existingWorkspace) {
                throw new Error(`Workspace not found: ${workspaceId}`);
            }

            // Delete workspace
            const result = await this.db.delete(WORKSPACE_TABLE, { workspaceId, tenantId });
            if (!result) {
                throw new Error(`Failed to delete workspace: ${workspaceId}`);
            }

            logger.info(`[WorkspaceService] Workspace deleted: ${workspaceId}`);
            return result;
        } catch (error) {
            logger.error(`[WorkspaceService] Error deleting workspace: ${(error as any).message}`);
            throw error;
        }
    }
}
