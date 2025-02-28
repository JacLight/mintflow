// Figma data models

// API endpoints
export const FIGMA_API = {
    baseUrl: 'https://api.figma.com',
    files: 'v1/files/:file_key',
    comments: 'v1/files/:file_key/comments',
    webhooks: 'v2/webhooks',
    webhook: 'v2/webhooks/:webhook_id',
    fileImages: 'v1/images/:file_key',
    fileNodes: 'v1/files/:file_key/nodes',
    projects: 'v1/teams/:team_id/projects',
    projectFiles: 'v1/projects/:project_id/files',
    teamComponents: 'v1/teams/:team_id/components',
    fileComponents: 'v1/files/:file_key/components',
    componentSets: 'v1/files/:file_key/component_sets',
    styles: 'v1/files/:file_key/styles',
};

// Input parameters for Figma actions
export interface FigmaGetFileParams {
    token: string;
    fileKey: string;
}

export interface FigmaGetFileCommentsParams {
    token: string;
    fileKey: string;
}

export interface FigmaPostFileCommentParams {
    token: string;
    fileKey: string;
    message: string;
}

export interface FigmaGetFileImagesParams {
    token: string;
    fileKey: string;
    ids: string[];
    scale?: number;
    format?: 'jpg' | 'png' | 'svg' | 'pdf';
}

export interface FigmaGetFileNodesParams {
    token: string;
    fileKey: string;
    ids: string[];
}

export interface FigmaGetTeamProjectsParams {
    token: string;
    teamId: string;
}

export interface FigmaGetProjectFilesParams {
    token: string;
    projectId: string;
}

export interface FigmaGetTeamComponentsParams {
    token: string;
    teamId: string;
}

export interface FigmaGetFileComponentsParams {
    token: string;
    fileKey: string;
}

export interface FigmaGetComponentSetsParams {
    token: string;
    fileKey: string;
}

export interface FigmaGetStylesParams {
    token: string;
    fileKey: string;
}

export interface FigmaCreateWebhookParams {
    token: string;
    teamId: string;
    eventType: string;
    endpoint: string;
    passcode: string;
}

export interface FigmaDeleteWebhookParams {
    token: string;
    webhookId: string;
}

// Webhook event types
export enum FigmaWebhookEventType {
    FILE_UPDATE = 'FILE_UPDATE',
    FILE_VERSION_UPDATE = 'FILE_VERSION_UPDATE',
    FILE_DELETE = 'FILE_DELETE',
    LIBRARY_PUBLISH = 'LIBRARY_PUBLISH',
    FILE_COMMENT = 'FILE_COMMENT',
}

// Response types
export interface FigmaFile {
    name: string;
    lastModified: string;
    thumbnailUrl: string;
    version: string;
    document: FigmaDocument;
    components: Record<string, FigmaComponent>;
    componentSets: Record<string, FigmaComponentSet>;
    styles: Record<string, FigmaStyle>;
    schemaVersion: number;
}

export interface FigmaDocument {
    id: string;
    name: string;
    type: string;
    children: FigmaNode[];
}

export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    [key: string]: any;
}

export interface FigmaComment {
    id: string;
    client_meta: {
        node_id?: string;
        node_offset?: {
            x: number;
            y: number;
        };
    };
    message: string;
    file_key: string;
    parent_id: string;
    user: FigmaUser;
    created_at: string;
    resolved_at: string | null;
    order_id: string;
}

export interface FigmaUser {
    id: string;
    handle: string;
    img_url: string;
}

export interface FigmaComponent {
    key: string;
    name: string;
    description: string;
    user: FigmaUser;
    created_at: string;
    updated_at: string;
    thumbnail_url: string;
    containing_frame: {
        name: string;
        nodeId: string;
        pageId: string;
        pageName: string;
    };
}

export interface FigmaComponentSet {
    key: string;
    name: string;
    description: string;
    user: FigmaUser;
    created_at: string;
    updated_at: string;
    thumbnail_url: string;
    containing_frame: {
        name: string;
        nodeId: string;
        pageId: string;
        pageName: string;
    };
}

export interface FigmaStyle {
    key: string;
    name: string;
    description: string;
    style_type: string;
}

export interface FigmaProject {
    id: string;
    name: string;
}

export interface FigmaWebhook {
    id: string;
    team_id: string;
    event_type: string;
    client_id: string | null;
    endpoint: string;
    passcode: string;
    status: string;
    description: string | null;
    protocol_version: string;
}

export interface FigmaImageResponse {
    err: string | null;
    images: Record<string, string>;
}

export interface FigmaNodesResponse {
    name: string;
    lastModified: string;
    thumbnailUrl: string;
    err: string | null;
    nodes: Record<string, {
        document: FigmaNode;
        components: Record<string, FigmaComponent>;
        schemaVersion: number;
    }>;
}

export interface FigmaCommentsResponse {
    comments: FigmaComment[];
}

export interface FigmaProjectsResponse {
    projects: FigmaProject[];
}

export interface FigmaProjectFilesResponse {
    files: FigmaFile[];
}

export interface FigmaComponentsResponse {
    meta: {
        components: FigmaComponent[];
    };
}

export interface FigmaComponentSetsResponse {
    meta: {
        component_sets: FigmaComponentSet[];
    };
}

export interface FigmaStylesResponse {
    meta: {
        styles: FigmaStyle[];
    };
}

export interface FigmaWebhookResponse {
    id: string;
    team_id: string;
    event_type: string;
    client_id: string | null;
    endpoint: string;
    passcode: string;
    status: string;
    description: string | null;
    protocol_version: string;
}
