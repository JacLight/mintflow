// Using global Jest functions
import googleAiPlugin from '../src/index.js';

// Mock the GoogleGenerativeAI class
jest.mock('@google/generative-ai', () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
            text: jest.fn().mockReturnValue('Generated text response')
        }
    });

    const mockGetGenerativeModel = jest.fn().mockReturnValue({
        generateContent: mockGenerateContent
    });

    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }))
    };
});

describe('googleAiPlugin', () => {
    let executeGenerateText: any;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Get the execute function from the plugin
        executeGenerateText = googleAiPlugin.actions[0].execute;
    });

    it('should have the correct plugin metadata', () => {
        expect(googleAiPlugin.name).toBe('Google AI');
        expect(googleAiPlugin.description).toBe('Integration with Google Generative AI for text and image generation');
        expect(googleAiPlugin.id).toBe('google-ai');
        expect(googleAiPlugin.runner).toBe('node');
        expect(googleAiPlugin.type).toBe('node');
        expect(googleAiPlugin.actions.length).toBe(1);
    });

    it('should have the correct input schema', () => {
        expect(googleAiPlugin.inputSchema).toBeDefined();
        const inputSchema = googleAiPlugin.inputSchema as any;
        expect(inputSchema.type).toBe('object');
        expect(inputSchema.properties.apiKey).toBeDefined();
        expect(inputSchema.properties.model).toBeDefined();
        expect(inputSchema.properties.prompt).toBeDefined();
        expect(inputSchema.properties.temperature).toBeDefined();
        expect(inputSchema.properties.maxOutputTokens).toBeDefined();
        expect(inputSchema.properties.topK).toBeDefined();
        expect(inputSchema.properties.topP).toBeDefined();
        expect(inputSchema.required).toContain('apiKey');
        expect(inputSchema.required).toContain('prompt');
    });

    it('should have the correct output schema', () => {
        expect(googleAiPlugin.outputSchema).toBeDefined();
        const outputSchema = googleAiPlugin.outputSchema as any;
        expect(outputSchema.type).toBe('object');
        expect(outputSchema.properties.text).toBeDefined();
    });

    it('should have the correct example input and output', () => {
        expect(googleAiPlugin.exampleInput).toBeDefined();
        expect(googleAiPlugin.exampleOutput).toBeDefined();
    });

    it('should have the correct documentation URL', () => {
        expect(googleAiPlugin.documentation).toBe('https://ai.google.dev/docs');
    });

    it('should throw an error for missing required parameters', async () => {
        // Missing apiKey
        const result1 = await executeGenerateText({ prompt: 'Test prompt' });
        expect(result1.error).toBe(true);
        expect(result1.message).toContain('API key and prompt are required');

        // Missing prompt
        const result2 = await executeGenerateText({ apiKey: 'test-api-key' });
        expect(result2.error).toBe(true);
        expect(result2.message).toContain('API key and prompt are required');
    });

    it('should generate text successfully with required parameters', async () => {
        const result = await executeGenerateText({
            apiKey: 'test-api-key',
            prompt: 'Test prompt'
        });

        expect(result.text).toBe('Generated text response');
    });

    it('should use default values when optional parameters are not provided', async () => {
        await executeGenerateText({
            apiKey: 'test-api-key',
            prompt: 'Test prompt'
        });

        // Import the mocked module
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const mockInstance = GoogleGenerativeAI.mock.results[0].value;

        // Check that getGenerativeModel was called with default values
        expect(mockInstance.getGenerativeModel).toHaveBeenCalledWith({
            model: 'gemini-pro',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
                topK: 40,
                topP: 0.95,
            },
        });
    });

    it('should use provided values for optional parameters', async () => {
        await executeGenerateText({
            apiKey: 'test-api-key',
            prompt: 'Test prompt',
            model: 'gemini-pro-vision',
            temperature: 0.5,
            maxOutputTokens: 2048,
            topK: 20,
            topP: 0.8
        });

        // Import the mocked module
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const mockInstance = GoogleGenerativeAI.mock.results[0].value;

        // Check that getGenerativeModel was called with provided values
        expect(mockInstance.getGenerativeModel).toHaveBeenCalledWith({
            model: 'gemini-pro-vision',
            generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 2048,
                topK: 20,
                topP: 0.8,
            },
        });
    });

    it('should handle errors from the Google AI API', async () => {
        // Get the mocked module
        const { GoogleGenerativeAI } = require('@google/generative-ai');

        // Reset the mock
        GoogleGenerativeAI.mockClear();

        // Setup the mock to throw an error
        const mockGenerateContent = jest.fn().mockRejectedValueOnce(
            new Error('API error')
        );

        const mockGetGenerativeModel = jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        });

        GoogleGenerativeAI.mockImplementationOnce(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }));

        const result = await executeGenerateText({
            apiKey: 'test-api-key',
            prompt: 'Test prompt'
        });

        expect(result.error).toBe(true);
        expect(result.message).toBe('API error');
    });
});
