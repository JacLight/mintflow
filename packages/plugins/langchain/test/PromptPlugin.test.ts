/// <reference types="jest" />

import promptPlugin, { PromptService, PromptTemplate, TemplateVersion } from '../src/adapters/PromptPlugin.js';
import { RedisService } from '../src/services/RedisService.js';

// Mock the RedisService
jest.mock('../src/services/RedisService.js', () => {
    const mockRedisClient = {
        set: jest.fn().mockResolvedValue('OK'),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
    };

    return {
        RedisService: {
            getInstance: jest.fn().mockReturnValue({
                client: mockRedisClient
            })
        }
    };
});

// Mock the ConfigService
jest.mock('../src/services/ConfigService.js', () => {
    return {
        ConfigService: {
            getInstance: jest.fn().mockReturnValue({
                getConfig: jest.fn().mockReturnValue({
                    ai: {
                        provider: 'openai',
                        model: 'gpt-3.5-turbo'
                    }
                })
            })
        }
    };
});

describe('PromptPlugin', () => {
    let redisClient: any;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        redisClient = RedisService.getInstance().client;
    });

    describe('createTemplate action', () => {
        it('should create a new prompt template with default values', async () => {
            const createTemplateAction = promptPlugin.actions.find(a => a.name === 'createTemplate');
            expect(createTemplateAction).toBeDefined();

            const template = {
                name: 'Test Template',
                description: 'A test template',
                template: 'Hello {{name}}, welcome to {{service}}!',
                tags: ['test', 'greeting'],
                metadata: { author: 'Test User' }
            };

            // Mock Date.now() to return a consistent value for ID generation
            const originalDateNow = Date.now;
            Date.now = jest.fn().mockReturnValue(123456789);

            const result = await createTemplateAction!.execute({
                template
            } as any);

            // Restore original Date.now
            Date.now = originalDateNow;

            expect(result.id).toBe('test-template-6umssh');
            expect(result.name).toBe('Test Template');
            expect(result.description).toBe('A test template');
            expect(result.template).toBe('Hello {{name}}, welcome to {{service}}!');
            expect(result.variables).toEqual(['name', 'service']);
            expect(result.tags).toEqual(['test', 'greeting']);
            expect(result.version).toBe('1.0.0');
            expect(result.metadata).toEqual({ author: 'Test User' });
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);

            // Check that the template was saved to Redis
            expect(redisClient.set).toHaveBeenCalledTimes(2); // Once for template, once for version

            const setCall = redisClient.set.mock.calls[0];
            expect(setCall[0]).toBe('prompt:template:test-template-6umssh');

            const savedTemplate = JSON.parse(setCall[1]);
            expect(savedTemplate.id).toBe('test-template-6umssh');
            expect(savedTemplate.variables).toEqual(['name', 'service']);

            // Check that the version was saved
            const versionSetCall = redisClient.set.mock.calls[1];
            expect(versionSetCall[0]).toBe('prompt:version:test-template-6umssh:1.0.0');

            const savedVersion = JSON.parse(versionSetCall[1]);
            expect(savedVersion.version).toBe('1.0.0');
            expect(savedVersion.template).toBe('Hello {{name}}, welcome to {{service}}!');
            expect(savedVersion.variables).toEqual(['name', 'service']);
        });

        it('should extract variables from the template', async () => {
            const createTemplateAction = promptPlugin.actions.find(a => a.name === 'createTemplate');

            const template = {
                name: 'Complex Template',
                description: 'A template with multiple variables',
                template: 'Hello {{name}}, your order #{{orderId}} for {{product}} costs ${{price}}.',
                tags: ['order'],
                metadata: {}
            };

            // Mock Date.now() for consistent ID
            const originalDateNow = Date.now;
            Date.now = jest.fn().mockReturnValue(987654321);

            const result = await createTemplateAction!.execute({
                template
            } as any);

            // Restore original Date.now
            Date.now = originalDateNow;

            expect(result.variables).toEqual(['name', 'orderId', 'product', 'price']);

            // Check that the template was saved with the correct variables
            const setCall = redisClient.set.mock.calls[0];
            const savedTemplate = JSON.parse(setCall[1]);
            expect(savedTemplate.variables).toEqual(['name', 'orderId', 'product', 'price']);
        });
    });

    describe('getTemplate action', () => {
        it('should retrieve a template by ID', async () => {
            const mockTemplate: PromptTemplate = {
                id: 'test-template',
                name: 'Test Template',
                description: 'A test template',
                template: 'Hello {{name}}!',
                variables: ['name'],
                tags: ['test'],
                version: '1.0.0',
                metadata: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTemplate));

            const getTemplateAction = promptPlugin.actions.find(a => a.name === 'getTemplate');
            expect(getTemplateAction).toBeDefined();

            const result = await getTemplateAction!.execute({
                id: 'test-template'
            } as any);

            expect(result).toEqual(mockTemplate);
            expect(redisClient.get).toHaveBeenCalledWith('prompt:template:test-template');
        });

        it('should return null if template does not exist', async () => {
            redisClient.get.mockResolvedValueOnce(null);

            const getTemplateAction = promptPlugin.actions.find(a => a.name === 'getTemplate');

            const result = await getTemplateAction!.execute({
                id: 'non-existent-template'
            } as any);

            expect(result).toBeNull();
        });
    });

    describe('updateTemplate action', () => {
        it('should update an existing template', async () => {
            // Mock the existing template
            const existingTemplate: PromptTemplate = {
                id: 'test-template',
                name: 'Test Template',
                description: 'Original description',
                template: 'Hello {{name}}!',
                variables: ['name'],
                tags: ['test'],
                version: '1.0.0',
                metadata: { author: 'Original Author' },
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-01')
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(existingTemplate));

            const updateTemplateAction = promptPlugin.actions.find(a => a.name === 'updateTemplate');
            expect(updateTemplateAction).toBeDefined();

            // Set a fixed date for testing
            const updatedDate = new Date('2023-01-02');
            const originalDateConstructor = global.Date;
            global.Date = jest.fn(() => updatedDate) as any;
            global.Date.now = originalDateConstructor.now;

            const updates = {
                description: 'Updated description',
                tags: ['test', 'updated'],
                metadata: { author: 'New Author' }
            };

            const result = await updateTemplateAction!.execute({
                id: 'test-template',
                updates
            } as any);

            // Restore original Date
            global.Date = originalDateConstructor;

            expect(result.id).toBe('test-template');
            expect(result.description).toBe('Updated description');
            expect(result.template).toBe('Hello {{name}}!'); // Unchanged
            expect(result.variables).toEqual(['name']); // Unchanged
            expect(result.tags).toEqual(['test', 'updated']);
            expect(result.version).toBe('1.0.0'); // Unchanged since template text didn't change
            expect(result.metadata).toEqual({ author: 'New Author' });
            expect(result.createdAt).toEqual(new Date('2023-01-01')); // Unchanged
            expect(result.updatedAt).toEqual(updatedDate);

            // Check that the updated template was saved
            expect(redisClient.set).toHaveBeenCalledTimes(1);

            const setCall = redisClient.set.mock.calls[0];
            expect(setCall[0]).toBe('prompt:template:test-template');

            const savedTemplate = JSON.parse(setCall[1]);
            expect(savedTemplate.description).toBe('Updated description');
            expect(savedTemplate.tags).toEqual(['test', 'updated']);
            expect(savedTemplate.metadata).toEqual({ author: 'New Author' });
        });

        it('should create a new version when template text changes', async () => {
            // Mock the existing template
            const existingTemplate: PromptTemplate = {
                id: 'test-template',
                name: 'Test Template',
                description: 'Original description',
                template: 'Hello {{name}}!',
                variables: ['name'],
                tags: ['test'],
                version: '1.0.0',
                metadata: {},
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-01')
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(existingTemplate));

            const updateTemplateAction = promptPlugin.actions.find(a => a.name === 'updateTemplate');

            const updates = {
                template: 'Hello {{name}}, welcome to {{service}}!',
                metadata: { versionNotes: 'Added service variable' }
            };

            const result = await updateTemplateAction!.execute({
                id: 'test-template',
                updates
            } as any);

            expect(result.template).toBe('Hello {{name}}, welcome to {{service}}!');
            expect(result.variables).toEqual(['name', 'service']); // Updated with new variable
            expect(result.version).toBe('1.0.1'); // Incremented

            // Check that both template and version were saved
            expect(redisClient.set).toHaveBeenCalledTimes(2);

            // Check version was saved
            const versionSetCall = redisClient.set.mock.calls[1];
            expect(versionSetCall[0]).toBe('prompt:version:test-template:1.0.1');

            const savedVersion = JSON.parse(versionSetCall[1]);
            expect(savedVersion.version).toBe('1.0.1');
            expect(savedVersion.template).toBe('Hello {{name}}, welcome to {{service}}!');
            expect(savedVersion.variables).toEqual(['name', 'service']);
            expect(savedVersion.notes).toBe('Added service variable');
        });
    });

    describe('formatTemplate action', () => {
        it('should format a template with provided variables', async () => {
            const mockTemplate: PromptTemplate = {
                id: 'greeting-template',
                name: 'Greeting Template',
                description: 'A simple greeting template',
                template: 'Hello {{name}}, welcome to {{service}}!',
                variables: ['name', 'service'],
                tags: ['greeting'],
                version: '1.0.0',
                metadata: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTemplate));

            const formatTemplateAction = promptPlugin.actions.find(a => a.name === 'formatTemplate');
            expect(formatTemplateAction).toBeDefined();

            const result = await formatTemplateAction!.execute({
                templateIdOrObject: 'greeting-template',
                variables: {
                    name: 'John',
                    service: 'MintFlow'
                }
            } as any);

            expect(result).toBe('Hello John, welcome to MintFlow!');
        });

        it('should format a template object directly', async () => {
            const templateObject: PromptTemplate = {
                id: 'direct-template',
                name: 'Direct Template',
                description: 'A template passed directly',
                template: 'Your order #{{orderId}} for {{product}} costs ${{price}}.',
                variables: ['orderId', 'product', 'price'],
                tags: ['order'],
                version: '1.0.0',
                metadata: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const formatTemplateAction = promptPlugin.actions.find(a => a.name === 'formatTemplate');

            const result = await formatTemplateAction!.execute({
                templateIdOrObject: templateObject,
                variables: {
                    orderId: '12345',
                    product: 'Widget',
                    price: '19.99'
                }
            } as any);

            expect(result).toBe('Your order #12345 for Widget costs $19.99.');
        });

        it('should leave missing variables as placeholders', async () => {
            const mockTemplate: PromptTemplate = {
                id: 'incomplete-template',
                name: 'Incomplete Template',
                description: 'A template with missing variables',
                template: 'Hello {{name}}, your order #{{orderId}} is ready.',
                variables: ['name', 'orderId'],
                tags: ['order'],
                version: '1.0.0',
                metadata: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTemplate));

            const formatTemplateAction = promptPlugin.actions.find(a => a.name === 'formatTemplate');

            const result = await formatTemplateAction!.execute({
                templateIdOrObject: 'incomplete-template',
                variables: {
                    name: 'Jane'
                    // orderId is missing
                }
            } as any);

            expect(result).toBe('Hello Jane, your order #{{orderId}} is ready.');
        });
    });

    describe('listTemplates action', () => {
        it('should list all templates', async () => {
            const mockTemplates: PromptTemplate[] = [
                {
                    id: 'template-1',
                    name: 'Template 1',
                    description: 'First template',
                    template: 'Template 1 content',
                    variables: [],
                    tags: ['tag1'],
                    version: '1.0.0',
                    metadata: {},
                    createdAt: new Date('2023-01-01'),
                    updatedAt: new Date('2023-01-10')
                },
                {
                    id: 'template-2',
                    name: 'Template 2',
                    description: 'Second template',
                    template: 'Template 2 content',
                    variables: [],
                    tags: ['tag2'],
                    version: '1.0.0',
                    metadata: {},
                    createdAt: new Date('2023-01-05'),
                    updatedAt: new Date('2023-01-15')
                }
            ];

            // Mock Redis keys and get
            redisClient.keys.mockResolvedValueOnce(['prompt:template:template-1', 'prompt:template:template-2']);
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTemplates[0]));
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTemplates[1]));

            const listTemplatesAction = promptPlugin.actions.find(a => a.name === 'listTemplates');
            expect(listTemplatesAction).toBeDefined();

            const result = await listTemplatesAction!.execute({} as any);

            expect(result).toHaveLength(2);
            // Should be sorted by updatedAt (descending)
            expect(result[0].id).toBe('template-2');
            expect(result[1].id).toBe('template-1');
        });

        it('should filter templates by tag', async () => {
            const mockTemplates: PromptTemplate[] = [
                {
                    id: 'template-1',
                    name: 'Template 1',
                    description: 'First template',
                    template: 'Template 1 content',
                    variables: [],
                    tags: ['tag1', 'common'],
                    version: '1.0.0',
                    metadata: {},
                    createdAt: new Date(),
                    updatedAt: new Date('2023-01-10')
                },
                {
                    id: 'template-2',
                    name: 'Template 2',
                    description: 'Second template',
                    template: 'Template 2 content',
                    variables: [],
                    tags: ['tag2', 'common'],
                    version: '1.0.0',
                    metadata: {},
                    createdAt: new Date(),
                    updatedAt: new Date('2023-01-15')
                }
            ];

            // Mock Redis keys and get
            redisClient.keys.mockResolvedValueOnce(['prompt:template:template-1', 'prompt:template:template-2']);
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTemplates[0]));
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTemplates[1]));

            const listTemplatesAction = promptPlugin.actions.find(a => a.name === 'listTemplates');

            const result = await listTemplatesAction!.execute({
                filters: { tag: 'tag1' }
            } as any);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('template-1');
        });

        it('should filter templates by search query', async () => {
            const mockTemplates: PromptTemplate[] = [
                {
                    id: 'greeting-template',
                    name: 'Greeting Template',
                    description: 'A template for greetings',
                    template: 'Hello {{name}}!',
                    variables: ['name'],
                    tags: ['greeting'],
                    version: '1.0.0',
                    metadata: {},
                    createdAt: new Date(),
                    updatedAt: new Date('2023-01-10')
                },
                {
                    id: 'order-template',
                    name: 'Order Template',
                    description: 'A template for orders',
                    template: 'Your order #{{orderId}} is ready.',
                    variables: ['orderId'],
                    tags: ['order'],
                    version: '1.0.0',
                    metadata: {},
                    createdAt: new Date(),
                    updatedAt: new Date('2023-01-15')
                }
            ];

            // Mock Redis keys and get
            redisClient.keys.mockResolvedValueOnce(['prompt:template:greeting-template', 'prompt:template:order-template']);
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTemplates[0]));
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTemplates[1]));

            const listTemplatesAction = promptPlugin.actions.find(a => a.name === 'listTemplates');

            const result = await listTemplatesAction!.execute({
                filters: { query: 'order' }
            } as any);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('order-template');
        });
    });

    describe('deleteTemplate action', () => {
        it('should delete a template and its versions', async () => {
            // Mock Redis keys for versions
            redisClient.keys.mockResolvedValueOnce(['prompt:version:test-template:1.0.0', 'prompt:version:test-template:1.0.1']);

            const deleteTemplateAction = promptPlugin.actions.find(a => a.name === 'deleteTemplate');
            expect(deleteTemplateAction).toBeDefined();

            const result = await deleteTemplateAction!.execute({
                id: 'test-template'
            } as any);

            expect(result).toBe(true);

            // Check that template was deleted
            expect(redisClient.del).toHaveBeenCalledWith('prompt:template:test-template');

            // Check that versions were deleted
            expect(redisClient.keys).toHaveBeenCalledWith('prompt:version:test-template:*');
            expect(redisClient.del).toHaveBeenCalledWith(['prompt:version:test-template:1.0.0', 'prompt:version:test-template:1.0.1']);
        });
    });

    describe('getTemplateVersion action', () => {
        it('should retrieve a specific template version', async () => {
            const mockVersion: TemplateVersion = {
                version: '1.0.0',
                template: 'Hello {{name}}!',
                variables: ['name'],
                createdAt: new Date(),
                notes: 'Initial version'
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockVersion));

            const getTemplateVersionAction = promptPlugin.actions.find(a => a.name === 'getTemplateVersion');
            expect(getTemplateVersionAction).toBeDefined();

            const result = await getTemplateVersionAction!.execute({
                templateId: 'test-template',
                version: '1.0.0'
            } as any);

            expect(result).toEqual(mockVersion);
            expect(redisClient.get).toHaveBeenCalledWith('prompt:version:test-template:1.0.0');
        });
    });

    describe('listTemplateVersions action', () => {
        it('should list all versions of a template', async () => {
            const mockVersions: TemplateVersion[] = [
                {
                    version: '1.0.0',
                    template: 'Hello {{name}}!',
                    variables: ['name'],
                    createdAt: new Date('2023-01-01'),
                    notes: 'Initial version'
                },
                {
                    version: '1.0.1',
                    template: 'Hello {{name}}, welcome!',
                    variables: ['name'],
                    createdAt: new Date('2023-01-05'),
                    notes: 'Added welcome message'
                },
                {
                    version: '1.1.0',
                    template: 'Hello {{name}}, welcome to {{service}}!',
                    variables: ['name', 'service'],
                    createdAt: new Date('2023-01-10'),
                    notes: 'Added service variable'
                }
            ];

            // Mock Redis keys and get
            redisClient.keys.mockResolvedValueOnce([
                'prompt:version:test-template:1.0.0',
                'prompt:version:test-template:1.0.1',
                'prompt:version:test-template:1.1.0'
            ]);
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockVersions[0]));
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockVersions[1]));
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockVersions[2]));

            const listTemplateVersionsAction = promptPlugin.actions.find(a => a.name === 'listTemplateVersions');
            expect(listTemplateVersionsAction).toBeDefined();

            const result = await listTemplateVersionsAction!.execute({
                templateId: 'test-template'
            } as any);

            expect(result).toHaveLength(3);
            // Should be sorted by version (descending)
            expect(result[0].version).toBe('1.1.0');
            expect(result[1].version).toBe('1.0.1');
            expect(result[2].version).toBe('1.0.0');
        });
    });
});
