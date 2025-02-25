// plugins/PromptPlugin.ts

import { RedisService } from '../services/RedisService.js';
import { ConfigService } from '../services/ConfigService.js';
import { logger } from '@mintflow/common';

/**
 * Template interface for prompt management
 */
interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    template: string;
    variables: string[];
    tags: string[];
    version: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Template version interface for tracking changes
 */
interface TemplateVersion {
    version: string;
    template: string;
    variables: string[];
    createdAt: Date;
    createdBy?: string;
    notes?: string;
}

/**
 * Prompt Management Service for templating and versioning
 */
export class PromptService {
    private static instance: PromptService;
    private redis = RedisService.getInstance();
    private config = ConfigService.getInstance().getConfig();

    private constructor() { }

    static getInstance(): PromptService {
        if (!PromptService.instance) {
            PromptService.instance = new PromptService();
        }
        return PromptService.instance;
    }

    /**
     * Creates a new prompt template
     */
    async createTemplate(
        template: Omit<PromptTemplate, 'id' | 'variables' | 'createdAt' | 'updatedAt' | 'version'>
    ): Promise<PromptTemplate> {
        // Generate template ID from name
        const id = template.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') +
            '-' + Date.now().toString(36);

        // Extract variables from the template (format: {{variable}})
        const variableRegex = /{{([^{}]+)}}/g;
        const variables: string[] = [];
        let match;

        while ((match = variableRegex.exec(template.template)) !== null) {
            variables.push(match[1].trim());
        }

        // Remove duplicates
        const uniqueVariables = [...new Set(variables)];

        const newTemplate: PromptTemplate = {
            id,
            name: template.name,
            description: template.description,
            template: template.template,
            variables: uniqueVariables,
            tags: template.tags || [],
            version: '1.0.0',
            metadata: template.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Save to Redis
        await this.saveTemplate(newTemplate);

        // Save as the first version
        await this.saveTemplateVersion(id, {
            version: '1.0.0',
            template: template.template,
            variables: uniqueVariables,
            createdAt: new Date(),
            notes: 'Initial version'
        });

        return newTemplate;
    }

    /**
     * Saves a template to Redis
     */
    private async saveTemplate(template: PromptTemplate): Promise<void> {
        const key = `prompt:template:${template.id}`;
        await this.redis.client.set(key, JSON.stringify(template));
    }

    /**
     * Gets a template by ID
     */
    async getTemplate(id: string): Promise<PromptTemplate | null> {
        const key = `prompt:template:${id}`;
        const data = await this.redis.client.get(key);

        if (!data) return null;

        try {
            return JSON.parse(data) as PromptTemplate;
        } catch (error) {
            logger.error(`Error parsing template ${id}:`, error);
            return null;
        }
    }

    /**
     * Updates an existing template
     */
    async updateTemplate(
        id: string,
        updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>>
    ): Promise<PromptTemplate> {
        const template = await this.getTemplate(id);
        if (!template) {
            throw new Error(`Template not found: ${id}`);
        }

        // Extract new variables if template is being updated
        let variables = template.variables;

        if (updates.template) {
            const variableRegex = /{{([^{}]+)}}/g;
            const extractedVars: string[] = [];
            let match;

            while ((match = variableRegex.exec(updates.template)) !== null) {
                extractedVars.push(match[1].trim());
            }

            // Remove duplicates
            variables = [...new Set(extractedVars)];
        }

        // Create a new version if the template text changes
        let version = template.version;
        if (updates.template && updates.template !== template.template) {
            version = this.incrementVersion(template.version);

            await this.saveTemplateVersion(id, {
                version,
                template: updates.template,
                variables,
                createdAt: new Date(),
                notes: updates.metadata?.versionNotes
            });
        }

        const updatedTemplate: PromptTemplate = {
            ...template,
            ...updates,
            variables,
            version,
            updatedAt: new Date()
        };

        await this.saveTemplate(updatedTemplate);
        return updatedTemplate;
    }

    /**
     * Deletes a template
     */
    async deleteTemplate(id: string): Promise<boolean> {
        const key = `prompt:template:${id}`;
        const result = await this.redis.client.del(key);

        // Also delete all versions
        const versionKeys = await this.redis.client.keys(`prompt:version:${id}:*`);
        if (versionKeys.length > 0) {
            await this.redis.client.del(versionKeys);
        }

        return result > 0;
    }

    /**
     * Lists templates matching filters
     */
    async listTemplates(
        filters: {
            tag?: string;
            query?: string;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<PromptTemplate[]> {
        const { tag, query, limit = 100, offset = 0 } = filters;

        // Get all template keys
        const keys = await this.redis.client.keys('prompt:template:*');

        // Get all templates
        const templates: PromptTemplate[] = [];

        for (const key of keys) {
            const data = await this.redis.client.get(key);
            if (data) {
                try {
                    const template = JSON.parse(data) as PromptTemplate;
                    templates.push(template);
                } catch (error) {
                    logger.error(`Error parsing template ${key}:`, error);
                }
            }
        }

        // Apply filters
        let filtered = templates;

        if (tag) {
            filtered = filtered.filter(t => t.tags.includes(tag));
        }

        if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.template.toLowerCase().includes(q)
            );
        }

        // Apply pagination
        return filtered
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(offset, offset + limit);
    }

    /**
     * Saves a template version
     */
    private async saveTemplateVersion(
        templateId: string,
        version: TemplateVersion
    ): Promise<void> {
        const key = `prompt:version:${templateId}:${version.version}`;
        await this.redis.client.set(key, JSON.stringify(version));
    }

    /**
     * Gets a specific template version
     */
    async getTemplateVersion(
        templateId: string,
        version: string
    ): Promise<TemplateVersion | null> {
        const key = `prompt:version:${templateId}:${version}`;
        const data = await this.redis.client.get(key);

        if (!data) return null;

        try {
            return JSON.parse(data) as TemplateVersion;
        } catch (error) {
            logger.error(`Error parsing template version ${templateId}:${version}:`, error);
            return null;
        }
    }

    /**
     * Lists all versions of a template
     */
    async listTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
        // Get all version keys for this template
        const keys = await this.redis.client.keys(`prompt:version:${templateId}:*`);

        // Get all versions
        const versions: TemplateVersion[] = [];

        for (const key of keys) {
            const data = await this.redis.client.get(key);
            if (data) {
                try {
                    const version = JSON.parse(data) as TemplateVersion;
                    versions.push(version);
                } catch (error) {
                    logger.error(`Error parsing template version ${key}:`, error);
                }
            }
        }

        // Sort by version (descending)
        return versions.sort((a, b) => {
            return this.compareVersions(b.version, a.version);
        });
    }

    /**
     * Increments a version number (semver-like)
     */
    private incrementVersion(version: string): string {
        const parts = version.split('.');
        if (parts.length !== 3) {
            return '1.0.0'; // Default if invalid
        }

        // Increment the patch version
        const patch = parseInt(parts[2], 10) + 1;
        return `${parts[0]}.${parts[1]}.${patch}`;
    }

    /**
     * Compares two version strings
     */
    private compareVersions(v1: string, v2: string): number {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;

            if (p1 !== p2) {
                return p1 - p2;
            }
        }

        return 0;
    }

    /**
     * Formats a template with variables
     */
    async formatTemplate(
        templateIdOrObject: string | PromptTemplate,
        variables: Record<string, any>
    ): Promise<string> {
        let template: PromptTemplate;

        if (typeof templateIdOrObject === 'string') {
            const found = await this.getTemplate(templateIdOrObject);
            if (!found) {
                throw new Error(`Template not found: ${templateIdOrObject}`);
            }
            template = found;
        } else {
            template = templateIdOrObject;
        }

        // Replace variables in the template
        let formattedText = template.template;

        // Check for missing variables
        const missingVars = template.variables.filter(v => !(v in variables));
        if (missingVars.length > 0) {
            logger.warn(`Missing variables: ${missingVars.join(', ')} for template ${template.id}`);
        }

        // Replace each variable
        for (const varName of template.variables) {
            const value = variables[varName] !== undefined ? variables[varName] : `{{${varName}}}`;
            formattedText = formattedText.replace(
                new RegExp(`{{\\s*${varName}\\s*}}`, 'g'),
                String(value)
            );
        }

        return formattedText;
    }
}

// Plugin definition for integration with your workflow engine
const promptPlugin = {
    id: "prompt",
    name: "Prompt Template Plugin",
    icon: "GiNotebook",
    description: "Manages reusable prompt templates with versioning",
    documentation: "https://docs.example.com/prompt",

    inputSchema: {
        template: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                template: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                metadata: { type: 'object' }
            },
            required: ['name', 'template']
        },
        id: { type: 'string' },
        updates: { type: 'object' },
        filters: { type: 'object' },
        version: { type: 'string' },
        variables: { type: 'object' },
        templateIdOrObject: {
            oneOf: [
                { type: 'string' },
                { type: 'object' }
            ]
        }
    },

    actions: [
        {
            name: 'createTemplate',
            execute: async function (input: {
                template: Omit<PromptTemplate, 'id' | 'variables' | 'createdAt' | 'updatedAt' | 'version'>;
            }): Promise<PromptTemplate> {
                return PromptService.getInstance().createTemplate(input.template);
            }
        },
        {
            name: 'getTemplate',
            execute: async function (input: {
                id: string;
            }): Promise<PromptTemplate | null> {
                return PromptService.getInstance().getTemplate(input.id);
            }
        },
        {
            name: 'updateTemplate',
            execute: async function (input: {
                id: string;
                updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>>;
            }): Promise<PromptTemplate> {
                return PromptService.getInstance().updateTemplate(input.id, input.updates);
            }
        },
        {
            name: 'deleteTemplate',
            execute: async function (input: {
                id: string;
            }): Promise<boolean> {
                return PromptService.getInstance().deleteTemplate(input.id);
            }
        },
        {
            name: 'listTemplates',
            execute: async function (input: {
                filters?: {
                    tag?: string;
                    query?: string;
                    limit?: number;
                    offset?: number;
                };
            }): Promise<PromptTemplate[]> {
                return PromptService.getInstance().listTemplates(input.filters);
            }
        },
        {
            name: 'getTemplateVersion',
            execute: async function (input: {
                templateId: string;
                version: string;
            }): Promise<TemplateVersion | null> {
                return PromptService.getInstance().getTemplateVersion(
                    input.templateId,
                    input.version
                );
            }
        },
        {
            name: 'listTemplateVersions',
            execute: async function (input: {
                templateId: string;
            }): Promise<TemplateVersion[]> {
                return PromptService.getInstance().listTemplateVersions(input.templateId);
            }
        },
        {
            name: 'formatTemplate',
            execute: async function (input: {
                templateIdOrObject: string | PromptTemplate;
                variables: Record<string, any>;
            }): Promise<string> {
                return PromptService.getInstance().formatTemplate(
                    input.templateIdOrObject,
                    input.variables
                );
            }
        }
    ]
};

export default promptPlugin;