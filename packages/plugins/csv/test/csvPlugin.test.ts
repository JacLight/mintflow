import csvPlugin from '../src/index';

describe('csvPlugin', () => {
    describe('csv_to_json action', () => {
        it('should convert CSV to JSON with headers', async () => {
            const input = {
                data: {
                    csvText: 'name,age,email\nJohn Doe,30,john@example.com\nJane Smith,25,jane@example.com'
                }
            };

            const config = {
                data: {
                    hasHeaders: true,
                    delimiter: ','
                }
            };

            const result = await csvPlugin.actions[0].execute(input, config);

            expect(result).toHaveProperty('result');
            expect(Array.isArray(result.result)).toBe(true);
            expect(result.result.length).toBe(2);
            expect(result.result[0]).toEqual({
                name: 'John Doe',
                age: '30',
                email: 'john@example.com'
            });
            expect(result.result[1]).toEqual({
                name: 'Jane Smith',
                age: '25',
                email: 'jane@example.com'
            });
        });

        it('should convert CSV to JSON without headers', async () => {
            const input = {
                data: {
                    csvText: 'John Doe,30,john@example.com\nJane Smith,25,jane@example.com'
                }
            };

            const config = {
                data: {
                    hasHeaders: false,
                    delimiter: ','
                }
            };

            const result = await csvPlugin.actions[0].execute(input, config);

            expect(result).toHaveProperty('result');
            expect(Array.isArray(result.result)).toBe(true);
            expect(result.result.length).toBe(2);
            expect(result.result[0]).toEqual(['John Doe', '30', 'john@example.com']);
            expect(result.result[1]).toEqual(['Jane Smith', '25', 'jane@example.com']);
        });

        it('should handle tab-delimited CSV', async () => {
            const input = {
                data: {
                    csvText: 'name\tage\temail\nJohn Doe\t30\tjohn@example.com\nJane Smith\t25\tjane@example.com'
                }
            };

            const config = {
                data: {
                    hasHeaders: true,
                    delimiter: '\t'
                }
            };

            const result = await csvPlugin.actions[0].execute(input, config);

            expect(result).toHaveProperty('result');
            expect(Array.isArray(result.result)).toBe(true);
            expect(result.result.length).toBe(2);
            expect(result.result[0]).toEqual({
                name: 'John Doe',
                age: '30',
                email: 'john@example.com'
            });
        });

        it('should return error for empty CSV', async () => {
            const input = {
                data: {
                    csvText: ''
                }
            };

            const config = {
                data: {
                    hasHeaders: true,
                    delimiter: ','
                }
            };

            const result = await csvPlugin.actions[0].execute(input, config);

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('CSV text is required');
        });
    });

    describe('json_to_csv action', () => {
        it('should convert JSON to CSV', async () => {
            const input = {
                data: {
                    jsonArray: [
                        {
                            name: 'John Doe',
                            age: 30,
                            email: 'john@example.com'
                        },
                        {
                            name: 'Jane Smith',
                            age: 25,
                            email: 'jane@example.com'
                        }
                    ]
                }
            };

            const config = {
                data: {
                    delimiter: ','
                }
            };

            const result = await csvPlugin.actions[1].execute(input, config);

            expect(result).toHaveProperty('result');
            expect(typeof result.result).toBe('string');

            // The CSV should have a header row and two data rows
            const lines = result.result.trim().split('\n');
            expect(lines.length).toBe(3);
            expect(lines[0].split(',').sort()).toEqual(['age', 'email', 'name'].sort());
        });

        it('should flatten nested JSON objects', async () => {
            const input = {
                data: {
                    jsonArray: [
                        {
                            name: 'John Doe',
                            age: 30,
                            contact: {
                                email: 'john@example.com',
                                phone: '555-1234'
                            }
                        },
                        {
                            name: 'Jane Smith',
                            age: 25,
                            contact: {
                                email: 'jane@example.com',
                                phone: '555-5678'
                            }
                        }
                    ]
                }
            };

            const config = {
                data: {
                    delimiter: ','
                }
            };

            const result = await csvPlugin.actions[1].execute(input, config);

            expect(result).toHaveProperty('result');
            expect(typeof result.result).toBe('string');

            // The CSV should have a header row with flattened properties
            const lines = result.result.trim().split('\n');
            expect(lines.length).toBe(3);
            expect(lines[0].split(',').sort()).toEqual(['age', 'contact.email', 'contact.phone', 'name'].sort());
        });

        it('should return error for empty JSON array', async () => {
            const input = {
                data: {
                    jsonArray: []
                }
            };

            const config = {
                data: {
                    delimiter: ','
                }
            };

            const result = await csvPlugin.actions[1].execute(input, config);

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('JSON array is required');
        });

        it('should return error for non-array input', async () => {
            const input = {
                data: {
                    jsonArray: { name: 'John' }
                }
            };

            const config = {
                data: {
                    delimiter: ','
                }
            };

            const result = await csvPlugin.actions[1].execute(input, config);

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('JSON array is required');
        });
    });
});
