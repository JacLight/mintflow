import { confluenceApiCall } from '../common/index.js';
import { getSpaces, getTemplates, getFolders, getTemplateVariables } from '../common/props.js';

export const createPageFromTemplate = {
    name: 'create_page_from_template',
    description: 'Creates a new page from a template with the given title and variables',
    inputSchema: {
        type: 'object',
        properties: {
            username: {
                type: 'string',
                description: 'Account email for basic auth',
                displayStyle: 'password',
            },
            password: {
                type: 'string',
                description: 'API token for basic auth',
                displayStyle: 'password',
            },
            confluenceDomain: {
                type: 'string',
                description: 'Example value - https://your-domain.atlassian.net',
            },
            spaceId: {
                type: 'string',
                description: 'The ID of the space where the page will be created',
                'x-dropdown': {
                    fetch: getSpaces,
                },
            },
            templateId: {
                type: 'string',
                description: 'The ID of the template to use',
                'x-dropdown': {
                    fetch: getTemplates,
                    refreshers: ['spaceId'],
                },
            },
            folderId: {
                type: 'string',
                description: 'The ID of the parent folder (optional)',
                'x-dropdown': {
                    fetch: getFolders,
                    refreshers: ['spaceId'],
                },
            },
            title: {
                type: 'string',
                description: 'The title of the new page',
            },
            status: {
                type: 'string',
                enum: ['current', 'draft'],
                description: 'The status of the new page',
                default: 'draft',
            },
            templateVariables: {
                type: 'object',
                description: 'Variables to replace in the template',
                'x-dynamic-schema': {
                    fetch: getTemplateVariables,
                    refreshers: ['templateId'],
                },
            },
        },
        required: ['username', 'password', 'confluenceDomain', 'spaceId', 'templateId', 'title', 'status'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string' },
            _links: { type: 'object' },
        },
    },
    exampleInput: {
        username: 'user@example.com',
        password: 'api-token',
        confluenceDomain: 'https://your-domain.atlassian.net',
        spaceId: '123456789',
        templateId: '987654321',
        folderId: '456789123',
        title: 'New Page from Template',
        status: 'draft',
        templateVariables: {
            variable1: 'value1',
            variable2: 'value2',
        },
    },
    exampleOutput: {
        id: '123456789',
        title: 'New Page from Template',
        status: 'draft',
        _links: {
            webui: '/spaces/SPACE/pages/123456789/New+Page+from+Template',
        },
    },
    async execute(input: any, context: any) {
        try {
            const auth = {
                username: input.username,
                password: input.password,
                confluenceDomain: input.confluenceDomain,
            };

            const { spaceId, templateId, title, status, folderId } = input;
            const variables = input.templateVariables || {};

            // Get the template content
            const template = await confluenceApiCall<{ body: { storage: { value: string } } }>({
                auth,
                method: 'GET',
                version: 'v1',
                resourceUri: `/template/${templateId}`,
            });

            const body = template.body.storage.value;

            // Remove declarations and replace variables
            let content = body.replace(/<at:declarations>[\s\S]*?<\/at:declarations>/, "").trim();
            Object.entries(variables).forEach(([key, value]) => {
                const varRegex = new RegExp(`<at:var at:name=(['"])${key}\\1\\s*\\/?>`, "g");
                content = content.replace(varRegex, value as string);
            });

            // Create the page
            const response = await confluenceApiCall({
                auth,
                method: 'POST',
                version: 'v2',
                resourceUri: '/pages',
                body: {
                    spaceId: spaceId,
                    title,
                    parentId: folderId,
                    status,
                    body: {
                        representation: 'storage',
                        value: content,
                    }
                }
            });

            return response;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create page from template: ${error.message}`);
            } else {
                throw new Error('Failed to create page from template: Unknown error');
            }
        }
    },
};

export default createPageFromTemplate;
