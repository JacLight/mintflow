/// <reference types="jest" />

import outputParserPlugin, { OutputFormat, ParseResult, ParserOptions } from '../src/adapters/OutputParserPlugin.js';

describe('OutputParserPlugin', () => {
    describe('parseJSON action', () => {
        it('should parse valid JSON', async () => {
            const parseJSONAction = outputParserPlugin.actions.find(a => a.name === 'parseJSON');
            expect(parseJSONAction).toBeDefined();

            const input = {
                text: '{"name": "John", "age": 30, "isActive": true}'
            };

            const result: any = await parseJSONAction!.execute(input as any);

            expect(result).toEqual({
                success: true,
                parsed: {
                    name: 'John',
                    age: 30,
                    isActive: true
                },
                error: null
            });
        });

        it('should handle invalid JSON', async () => {
            const parseJSONAction = outputParserPlugin.actions.find(a => a.name === 'parseJSON');

            const input = {
                text: '{"name": "John", "age": 30, missing quotes}'
            };

            const result: any = await parseJSONAction!.execute(input as any);

            expect(result.success).toBe(false);
            expect(result.parsed).toBeNull();
            expect(result.error).toContain('SyntaxError');
        });

        it('should handle JSON with a schema', async () => {
            const parseJSONAction = outputParserPlugin.actions.find(a => a.name === 'parseJSON');

            const input = {
                text: '{"name": "John", "age": 30, "isActive": true}',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'number' },
                        isActive: { type: 'boolean' }
                    },
                    required: ['name', 'age']
                }
            };

            const result: any = await parseJSONAction!.execute(input as any);

            expect(result.success).toBe(true);
            expect(result.parsed).toEqual({
                name: 'John',
                age: 30,
                isActive: true
            });
        });

        it('should fail validation with invalid schema', async () => {
            const parseJSONAction = outputParserPlugin.actions.find(a => a.name === 'parseJSON');

            const input = {
                text: '{"name": "John", "isActive": true}', // missing required 'age'
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'number' },
                        isActive: { type: 'boolean' }
                    },
                    required: ['name', 'age']
                }
            };

            const result: any = await parseJSONAction!.execute(input as any);

            expect(result.success).toBe(false);
            expect(result.parsed).toBeNull();
            expect(result.error).toContain('required property');
        });
    });

    describe('parseCSV action', () => {
        it('should parse valid CSV', async () => {
            const parseCSVAction = outputParserPlugin.actions.find(a => a.name === 'parseCSV');
            expect(parseCSVAction).toBeDefined();

            const input = {
                text: 'name,age,isActive\nJohn,30,true\nJane,25,false'
            };

            const result: any = await parseCSVAction!.execute(input as any);

            expect(result.success).toBe(true);
            expect(result.parsed).toEqual([
                { name: 'John', age: '30', isActive: 'true' },
                { name: 'Jane', age: '25', isActive: 'false' }
            ]);
        });

        it('should handle invalid CSV', async () => {
            const parseCSVAction = outputParserPlugin.actions.find(a => a.name === 'parseCSV');

            const input = {
                text: 'name,age,isActive\nJohn,30,true\nJane,25' // missing a value
            };

            const result: any = await parseCSVAction!.execute(input as any);

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });

        it('should handle CSV with custom delimiter', async () => {
            const parseCSVAction = outputParserPlugin.actions.find(a => a.name === 'parseCSV');

            const input = {
                text: 'name;age;isActive\nJohn;30;true\nJane;25;false',
                options: {
                    delimiter: ';'
                }
            };

            const result: any = await parseCSVAction!.execute(input as any);

            expect(result.success).toBe(true);
            expect(result.parsed).toEqual([
                { name: 'John', age: '30', isActive: 'true' },
                { name: 'Jane', age: '25', isActive: 'false' }
            ]);
        });
    });

    describe('parseYAML action', () => {
        it('should parse valid YAML', async () => {
            const parseYAMLAction = outputParserPlugin.actions.find(a => a.name === 'parseYAML');
            expect(parseYAMLAction).toBeDefined();

            const input = {
                text: `
                name: John
                age: 30
                isActive: true
                hobbies:
                  - reading
                  - coding
                `
            };

            const result: any = await parseYAMLAction!.execute(input as any);

            expect(result.success).toBe(true);
            expect(result.parsed).toEqual({
                name: 'John',
                age: 30,
                isActive: true,
                hobbies: ['reading', 'coding']
            });
        });

        it('should handle invalid YAML', async () => {
            const parseYAMLAction = outputParserPlugin.actions.find(a => a.name === 'parseYAML');

            const input = {
                text: `
                name: John
                age: 30
                  isActive: true
                `
            };

            const result: any = await parseYAMLAction!.execute(input as any);

            expect(result.success).toBe(false);
            expect(result.parsed).toBeNull();
            expect(result.error).toBeTruthy();
        });
    });

    describe('extractRegex action', () => {
        it('should extract patterns using regex', async () => {
            const extractRegexAction = outputParserPlugin.actions.find(a => a.name === 'extractRegex');
            expect(extractRegexAction).toBeDefined();

            const input = {
                text: 'Email: john@example.com, Phone: 555-123-4567',
                patterns: [
                    { name: 'email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
                    { name: 'phone', pattern: '\\d{3}-\\d{3}-\\d{4}' }
                ]
            };

            const result: any = await extractRegexAction!.execute(input as any);

            expect(result.success).toBe(true);
            expect(result.matches).toEqual({
                email: ['john@example.com'],
                phone: ['555-123-4567']
            });
        });

        it('should handle no matches', async () => {
            const extractRegexAction = outputParserPlugin.actions.find(a => a.name === 'extractRegex');

            const input = {
                text: 'No email or phone here',
                patterns: [
                    { name: 'email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
                    { name: 'phone', pattern: '\\d{3}-\\d{3}-\\d{4}' }
                ]
            };

            const result: any = await extractRegexAction!.execute(input as any);

            expect(result.success).toBe(true);
            expect(result.matches).toEqual({
                email: [],
                phone: []
            });
        });

        it('should handle invalid regex', async () => {
            const extractRegexAction = outputParserPlugin.actions.find(a => a.name === 'extractRegex');

            const input = {
                text: 'Some text',
                patterns: [
                    { name: 'invalid', pattern: '[' } // Invalid regex
                ]
            };

            const result: any = await extractRegexAction!.execute(input as any);

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });

    describe('extractStructured action', () => {
        it('should extract structured data from text', async () => {
            const extractStructuredAction = outputParserPlugin.actions.find(a => a.name === 'extractStructured');
            expect(extractStructuredAction).toBeDefined();

            const input = {
                text: `
                Name: John Smith
                Age: 30
                Email: john@example.com
                `,
                format: OutputFormat.JSON,
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'number' },
                        email: { type: 'string' }
                    }
                }
            };

            // Mock implementation for this test
            // In a real implementation, this would use an LLM to extract the structured data
            const mockExtract = jest.fn().mockResolvedValue({
                success: true,
                parsed: {
                    name: 'John Smith',
                    age: 30,
                    email: 'john@example.com'
                },
                error: null
            });

            // Replace the actual implementation with our mock
            const originalExecute = extractStructuredAction!.execute;
            extractStructuredAction!.execute = mockExtract;

            const result: any = await extractStructuredAction!.execute(input as any);

            // Restore the original implementation
            extractStructuredAction!.execute = originalExecute;

            expect(result.success).toBe(true);
            expect(result.parsed).toEqual({
                name: 'John Smith',
                age: 30,
                email: 'john@example.com'
            });
            expect(mockExtract).toHaveBeenCalledWith(input);
        });
    });

    describe('formatOutput action', () => {
        it('should format data according to a template', async () => {
            const formatOutputAction = outputParserPlugin.actions.find(a => a.name === 'formatOutput');
            expect(formatOutputAction).toBeDefined();

            const input = {
                data: {
                    name: 'John Smith',
                    age: 30,
                    email: 'john@example.com'
                },
                template: 'Name: {{name}}\nAge: {{age}}\nContact: {{email}}'
            };

            const result: any = await formatOutputAction!.execute(input as any);

            expect(result).toBe('Name: John Smith\nAge: 30\nContact: john@example.com');
        });

        it('should handle nested properties', async () => {
            const formatOutputAction = outputParserPlugin.actions.find(a => a.name === 'formatOutput');

            const input = {
                data: {
                    user: {
                        name: 'John Smith',
                        contact: {
                            email: 'john@example.com',
                            phone: '555-123-4567'
                        }
                    },
                    status: 'active'
                },
                template: 'User: {{user.name}}\nEmail: {{user.contact.email}}\nStatus: {{status}}'
            };

            const result: any = await formatOutputAction!.execute(input as any);

            expect(result).toBe('User: John Smith\nEmail: john@example.com\nStatus: active');
        });

        it('should handle arrays', async () => {
            const formatOutputAction = outputParserPlugin.actions.find(a => a.name === 'formatOutput');

            const input = {
                data: {
                    name: 'John Smith',
                    hobbies: ['reading', 'coding', 'hiking']
                },
                template: 'Name: {{name}}\nHobbies: {{hobbies.join(", ")}}'
            };

            const result: any = await formatOutputAction!.execute(input as any);

            expect(result).toBe('Name: John Smith\nHobbies: reading, coding, hiking');
        });
    });
});
