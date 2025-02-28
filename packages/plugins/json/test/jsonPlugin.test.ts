import jsonPlugin from '../src/index.js';

describe('jsonPlugin', () => {
    describe('convert_text_to_json action', () => {
        it('should convert valid JSON text to a JSON object', async () => {
            const input = {
                data: {
                    text: '{"name": "John", "age": 30, "city": "New York"}'
                }
            };

            const result = await jsonPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('result');
            expect(result.result).toEqual({
                name: 'John',
                age: 30,
                city: 'New York'
            });
        });

        it('should handle arrays in JSON text', async () => {
            const input = {
                data: {
                    text: '[1, 2, 3, 4, 5]'
                }
            };

            const result = await jsonPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('result');
            expect(result.result).toEqual([1, 2, 3, 4, 5]);
        });

        it('should handle nested objects in JSON text', async () => {
            const input = {
                data: {
                    text: '{"person": {"name": "John", "age": 30}, "address": {"city": "New York", "zip": "10001"}}'
                }
            };

            const result = await jsonPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('result');
            expect(result.result).toEqual({
                person: {
                    name: 'John',
                    age: 30
                },
                address: {
                    city: 'New York',
                    zip: '10001'
                }
            });
        });

        it('should return error for missing text', async () => {
            const input = {
                data: {}
            };

            const result = await jsonPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Text is required');
        });

        it('should return error for invalid JSON text', async () => {
            const input = {
                data: {
                    text: '{"name": "John", "age": 30, "city": "New York"'
                }
            };

            const result = await jsonPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toContain('Failed to parse JSON');
        });
    });

    describe('convert_json_to_text action', () => {
        it('should convert a JSON object to text', async () => {
            const input = {
                data: {
                    json: {
                        name: 'John',
                        age: 30,
                        city: 'New York'
                    }
                }
            };

            const result = await jsonPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('text');
            expect(result.text).toBe('{"name":"John","age":30,"city":"New York"}');
        });

        it('should convert a JSON object to pretty-printed text', async () => {
            const input = {
                data: {
                    json: {
                        name: 'John',
                        age: 30,
                        city: 'New York'
                    },
                    pretty: true
                }
            };

            const result = await jsonPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('text');
            expect(result.text).toBe('{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}');
        });

        it('should convert a JSON array to text', async () => {
            const input = {
                data: {
                    json: [1, 2, 3, 4, 5]
                }
            };

            const result = await jsonPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('text');
            expect(result.text).toBe('[1,2,3,4,5]');
        });

        it('should convert a nested JSON object to text', async () => {
            const input = {
                data: {
                    json: {
                        person: {
                            name: 'John',
                            age: 30
                        },
                        address: {
                            city: 'New York',
                            zip: '10001'
                        }
                    }
                }
            };

            const result = await jsonPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('text');
            expect(result.text).toBe('{"person":{"name":"John","age":30},"address":{"city":"New York","zip":"10001"}}');
        });

        it('should return error for missing JSON', async () => {
            const input = {
                data: {}
            };

            const result = await jsonPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('JSON is required');
        });
    });
});
