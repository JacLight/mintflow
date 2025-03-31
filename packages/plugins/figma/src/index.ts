import {
    getFile,
    getFileComments,
    postFileComment,
    getFileImages,
    getFileNodes,
    getTeamProjects,
    getProjectFiles,
    getTeamComponents,
    getFileComponents,
    getComponentSets,
    getStyles,
    createWebhook,
    deleteWebhook
} from './utils.js';

import { FigmaWebhookEventType } from './models.js';

const figmaPlugin = {
    name: "Figma",
    icon: "",
    description: "Design and prototyping",
    groups: ["productivity"],
    tags: ["productivity","collaboration","organization","workflow","task"],
    version: '1.0.0',
    id: "figma",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'get_file',
                    'get_file_comments',
                    'post_file_comment',
                    'get_file_images',
                    'get_file_nodes',
                    'get_team_projects',
                    'get_project_files',
                    'get_team_components',
                    'get_file_components',
                    'get_component_sets',
                    'get_styles',
                    'create_webhook',
                    'delete_webhook'
                ],
                description: 'Action to perform on Figma',
            },
            token: {
                type: 'string',
                description: 'Figma API OAuth token',
            },
            // File parameters
            fileKey: {
                type: 'string',
                description: 'Figma file key (copy from Figma file URL)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_file_comments', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'post_file_comment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_file_images', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_file_nodes', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_file_components', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_component_sets', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_styles', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Comment parameters
            message: {
                type: 'string',
                description: 'Comment message',
                rules: [
                    { operation: 'notEqual', valueA: 'post_file_comment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Image parameters
            ids: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'Node IDs to export as images',
                rules: [
                    { operation: 'notEqual', valueA: 'get_file_images', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_file_nodes', valueB: '{{action}}', action: 'hide' },
                ],
            },
            scale: {
                type: 'number',
                description: 'Scale factor for images (1-4)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_file_images', valueB: '{{action}}', action: 'hide' },
                ],
            },
            format: {
                type: 'string',
                enum: ['jpg', 'png', 'svg', 'pdf'],
                description: 'Image format',
                rules: [
                    { operation: 'notEqual', valueA: 'get_file_images', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Team parameters
            teamId: {
                type: 'string',
                description: 'Team ID (copy from Figma team URL)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_team_projects', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_team_components', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Project parameters
            projectId: {
                type: 'string',
                description: 'Project ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_project_files', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Webhook parameters
            eventType: {
                type: 'string',
                enum: Object.values(FigmaWebhookEventType),
                description: 'Webhook event type',
                rules: [
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            endpoint: {
                type: 'string',
                description: 'Webhook endpoint URL',
                rules: [
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            passcode: {
                type: 'string',
                description: 'Webhook passcode (optional)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            webhookId: {
                type: 'string',
                description: 'Webhook ID',
                rules: [
                    { operation: 'notEqual', valueA: 'delete_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'get_file',
        token: 'your-figma-api-token',
        fileKey: 'file-key-from-url'
    },
    exampleOutput: {
        name: "My Figma Design",
        lastModified: "2023-01-01T12:00:00Z",
        thumbnailUrl: "https://s3-alpha.figma.com/thumbnails/...",
        version: "123456789",
        document: {
            id: "0:0",
            name: "Document",
            type: "DOCUMENT",
            children: [
                {
                    id: "0:1",
                    name: "Page 1",
                    type: "CANVAS",
                    children: []
                }
            ]
        },
        components: {},
        componentSets: {},
        styles: {},
        schemaVersion: 0
    },
    documentation: "https://www.figma.com/developers/api",
    method: "exec",
    actions: [
        {
            name: 'figma',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'get_file': {
                        const { fileKey } = input;

                        if (!fileKey) {
                            throw new Error('Missing required parameter: fileKey');
                        }

                        return await getFile({
                            token,
                            fileKey
                        });
                    }

                    case 'get_file_comments': {
                        const { fileKey } = input;

                        if (!fileKey) {
                            throw new Error('Missing required parameter: fileKey');
                        }

                        return await getFileComments({
                            token,
                            fileKey
                        });
                    }

                    case 'post_file_comment': {
                        const { fileKey, message } = input;

                        if (!fileKey || !message) {
                            throw new Error('Missing required parameters: fileKey, message');
                        }

                        return await postFileComment({
                            token,
                            fileKey,
                            message
                        });
                    }

                    case 'get_file_images': {
                        const { fileKey, ids, scale, format } = input;

                        if (!fileKey || !ids || !Array.isArray(ids) || ids.length === 0) {
                            throw new Error('Missing required parameters: fileKey, ids');
                        }

                        return await getFileImages({
                            token,
                            fileKey,
                            ids,
                            scale,
                            format
                        });
                    }

                    case 'get_file_nodes': {
                        const { fileKey, ids } = input;

                        if (!fileKey || !ids || !Array.isArray(ids) || ids.length === 0) {
                            throw new Error('Missing required parameters: fileKey, ids');
                        }

                        return await getFileNodes({
                            token,
                            fileKey,
                            ids
                        });
                    }

                    case 'get_team_projects': {
                        const { teamId } = input;

                        if (!teamId) {
                            throw new Error('Missing required parameter: teamId');
                        }

                        return await getTeamProjects({
                            token,
                            teamId
                        });
                    }

                    case 'get_project_files': {
                        const { projectId } = input;

                        if (!projectId) {
                            throw new Error('Missing required parameter: projectId');
                        }

                        return await getProjectFiles({
                            token,
                            projectId
                        });
                    }

                    case 'get_team_components': {
                        const { teamId } = input;

                        if (!teamId) {
                            throw new Error('Missing required parameter: teamId');
                        }

                        return await getTeamComponents({
                            token,
                            teamId
                        });
                    }

                    case 'get_file_components': {
                        const { fileKey } = input;

                        if (!fileKey) {
                            throw new Error('Missing required parameter: fileKey');
                        }

                        return await getFileComponents({
                            token,
                            fileKey
                        });
                    }

                    case 'get_component_sets': {
                        const { fileKey } = input;

                        if (!fileKey) {
                            throw new Error('Missing required parameter: fileKey');
                        }

                        return await getComponentSets({
                            token,
                            fileKey
                        });
                    }

                    case 'get_styles': {
                        const { fileKey } = input;

                        if (!fileKey) {
                            throw new Error('Missing required parameter: fileKey');
                        }

                        return await getStyles({
                            token,
                            fileKey
                        });
                    }

                    case 'create_webhook': {
                        const { teamId, eventType, endpoint, passcode } = input;

                        if (!teamId || !eventType || !endpoint) {
                            throw new Error('Missing required parameters: teamId, eventType, endpoint');
                        }

                        return await createWebhook({
                            token,
                            teamId,
                            eventType,
                            endpoint,
                            passcode
                        });
                    }

                    case 'delete_webhook': {
                        const { webhookId } = input;

                        if (!webhookId) {
                            throw new Error('Missing required parameter: webhookId');
                        }

                        await deleteWebhook({
                            token,
                            webhookId
                        });

                        return { success: true, message: 'Webhook deleted successfully' };
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default figmaPlugin;
