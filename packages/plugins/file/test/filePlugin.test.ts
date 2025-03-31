import filePlugin from '../src/index.js';

describe('filePlugin', () => {
    describe('read_file action', () => {
        it('should read a file as text', async () => {
            const input = {
                data: {
                    file: {
                        name: 'example.txt',
                        data: Buffer.from('Hello, world!'),
                        extension: 'txt'
                    }
                }
            };

            const config = {
                data: {
                    outputFormat: 'text'
                }
            };

            const result = await filePlugin.actions[0].execute(input, config, {});

            expect(result).toHaveProperty('text');
            expect(result.text).toBe('Hello, world!');
            expect(result.fileName).toBe('example.txt');
        });

        it('should read a file as base64', async () => {
            const input = {
                data: {
                    file: {
                        name: 'example.txt',
                        data: Buffer.from('Hello, world!'),
                        extension: 'txt'
                    }
                }
            };

            const config = {
                data: {
                    outputFormat: 'base64'
                }
            };

            const result = await filePlugin.actions[0].execute(input, config, {});

            expect(result).toHaveProperty('base64');
            expect(result).toHaveProperty('base64WithMimeType');
            expect(result.base64).toBe('SGVsbG8sIHdvcmxkIQ==');
            expect(result.fileName).toBe('example.txt');
            expect(result.mimeType).toBe('text/plain');
        });

        it('should return error for missing file', async () => {
            const input = {
                data: {}
            };

            const config = {
                data: {
                    outputFormat: 'text'
                }
            };

            const result = await filePlugin.actions[0].execute(input, config, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('File is required');
        });

        it('should return error for invalid output format', async () => {
            const input = {
                data: {
                    file: {
                        name: 'example.txt',
                        data: Buffer.from('Hello, world!'),
                        extension: 'txt'
                    }
                }
            };

            const config = {
                data: {
                    outputFormat: 'invalid'
                }
            };

            const result = await filePlugin.actions[0].execute(input, config, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toContain('Invalid output format');
        });
    });

    describe('create_file action', () => {
        it('should create a file', async () => {
            const input = {
                data: {
                    content: 'Hello, world!'
                }
            };

            const config = {
                data: {
                    fileName: 'example.txt',
                    encoding: 'utf8'
                }
            };

            const mockContext = {
                files: {
                    write: jest.fn().mockResolvedValue('https://example.com/files/example.txt')
                }
            };

            const result = await filePlugin.actions[1].execute(input, config, mockContext);

            expect(mockContext.files.write).toHaveBeenCalledWith({
                fileName: 'example.txt',
                data: expect.any(Buffer)
            });
            expect(result).toHaveProperty('fileName');
            expect(result).toHaveProperty('url');
            expect(result.fileName).toBe('example.txt');
            expect(result.url).toBe('https://example.com/files/example.txt');
        });

        it('should return error for missing file name', async () => {
            const input = {
                data: {
                    content: 'Hello, world!'
                }
            };

            const config = {
                data: {
                    encoding: 'utf8'
                }
            };

            const mockContext = {
                files: {
                    write: jest.fn()
                }
            };

            const result = await filePlugin.actions[1].execute(input, config, mockContext);

            expect(mockContext.files.write).not.toHaveBeenCalled();
            expect(result).toHaveProperty('error');
            expect(result.error).toBe('File name is required');
        });
    });

    describe('change_file_encoding action', () => {
        it('should change file encoding', async () => {
            const input = {
                data: {
                    file: {
                        name: 'example.txt',
                        data: Buffer.from('Hello, world!'),
                        extension: 'txt'
                    }
                }
            };

            const config = {
                data: {
                    inputEncoding: 'utf8',
                    outputFileName: 'example-base64.txt',
                    outputEncoding: 'base64'
                }
            };

            const mockContext = {
                files: {
                    write: jest.fn().mockResolvedValue('https://example.com/files/example-base64.txt')
                }
            };

            const result = await filePlugin.actions[2].execute(input, config, mockContext);

            expect(mockContext.files.write).toHaveBeenCalledWith({
                fileName: 'example-base64.txt',
                data: expect.any(Buffer)
            });
            expect(result).toHaveProperty('url');
            expect(result).toHaveProperty('fileName');
            expect(result).toHaveProperty('encoding');
            expect(result.url).toBe('https://example.com/files/example-base64.txt');
            expect(result.fileName).toBe('example-base64.txt');
            expect(result.encoding).toBe('base64');
        });

        it('should return error for missing input file', async () => {
            const input = {
                data: {}
            };

            const config = {
                data: {
                    inputEncoding: 'utf8',
                    outputFileName: 'example-base64.txt',
                    outputEncoding: 'base64'
                }
            };

            const mockContext = {
                files: {
                    write: jest.fn()
                }
            };

            const result = await filePlugin.actions[2].execute(input, config, mockContext);

            expect(mockContext.files.write).not.toHaveBeenCalled();
            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Input file is required');
        });

        it('should return error for missing output file name', async () => {
            const input = {
                data: {
                    file: {
                        name: 'example.txt',
                        data: Buffer.from('Hello, world!'),
                        extension: 'txt'
                    }
                }
            };

            const config = {
                data: {
                    inputEncoding: 'utf8',
                    outputEncoding: 'base64'
                }
            };

            const mockContext = {
                files: {
                    write: jest.fn()
                }
            };

            const result = await filePlugin.actions[2].execute(input, config, mockContext);

            expect(mockContext.files.write).not.toHaveBeenCalled();
            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Output file name is required');
        });
    });

    describe('check_file_type action', () => {
        it('should check file type and return match', async () => {
            const input = {
                data: {
                    file: {
                        name: 'example.txt',
                        data: Buffer.from('Hello, world!'),
                        extension: 'txt'
                    }
                }
            };

            const config = {
                data: {
                    mimeType: 'text/plain'
                }
            };

            const result = await filePlugin.actions[3].execute(input, config, {});

            expect(result).toHaveProperty('mimeType');
            expect(result).toHaveProperty('isMatch');
            expect(result.mimeType).toBe('text/plain');
            expect(result.isMatch).toBe(true);
        });

        it('should check file type and return no match', async () => {
            const input = {
                data: {
                    file: {
                        name: 'example.txt',
                        data: Buffer.from('Hello, world!'),
                        extension: 'txt'
                    }
                }
            };

            const config = {
                data: {
                    mimeType: 'image/jpeg'
                }
            };

            const result = await filePlugin.actions[3].execute(input, config, {});

            expect(result).toHaveProperty('mimeType');
            expect(result).toHaveProperty('isMatch');
            expect(result.mimeType).toBe('text/plain');
            expect(result.isMatch).toBe(false);
        });

        it('should check file type against multiple MIME types', async () => {
            const input = {
                data: {
                    file: {
                        name: 'example.txt',
                        data: Buffer.from('Hello, world!'),
                        extension: 'txt'
                    }
                }
            };

            const config = {
                data: {
                    mimeType: ['image/jpeg', 'text/plain', 'application/json']
                }
            };

            const result = await filePlugin.actions[3].execute(input, config, {});

            expect(result).toHaveProperty('mimeType');
            expect(result).toHaveProperty('isMatch');
            expect(result.mimeType).toBe('text/plain');
            expect(result.isMatch).toBe(true);
        });

        it('should return error for missing file', async () => {
            const input = {
                data: {}
            };

            const config = {
                data: {
                    mimeType: 'text/plain'
                }
            };

            const result = await filePlugin.actions[3].execute(input, config, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('File is required');
        });

        it('should return error for missing MIME type', async () => {
            const input = {
                data: {
                    file: {
                        name: 'example.txt',
                        data: Buffer.from('Hello, world!'),
                        extension: 'txt'
                    }
                }
            };

            const config = {
                data: {}
            };

            const result = await filePlugin.actions[3].execute(input, config, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('MIME type is required');
        });
    });
});
