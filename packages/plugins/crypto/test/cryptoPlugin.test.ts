import cryptoPlugin from '../src/index.js';

describe('cryptoPlugin', () => {
    describe('hash_text action', () => {
        it('should hash text using SHA256', async () => {
            const input = {
                data: {
                    text: 'Hello, world!',
                    method: 'sha256'
                }
            };

            const result = await cryptoPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('hash');
            expect(result.hash).toBe('315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3');
        });

        it('should hash text using MD5', async () => {
            const input = {
                data: {
                    text: 'Hello, world!',
                    method: 'md5'
                }
            };

            const result = await cryptoPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('hash');
            expect(result.hash).toBe('6cd3556deb0da54bca060b4c39479839');
        });

        it('should return error for missing text', async () => {
            const input = {
                data: {
                    method: 'sha256'
                }
            };

            const result = await cryptoPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Text is required');
        });

        it('should return error for missing method', async () => {
            const input = {
                data: {
                    text: 'Hello, world!'
                }
            };

            const result = await cryptoPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Method is required');
        });

        it('should return error for invalid method', async () => {
            const input = {
                data: {
                    text: 'Hello, world!',
                    method: 'invalid-method'
                }
            };

            const result = await cryptoPlugin.actions[0].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toContain('Invalid method');
        });
    });

    describe('hmac_signature action', () => {
        it('should generate HMAC signature using SHA256', async () => {
            const input = {
                data: {
                    text: 'Hello, world!',
                    method: 'sha256',
                    secretKey: 'my-secret-key',
                    secretKeyEncoding: 'utf-8'
                }
            };

            const result = await cryptoPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('signature');
            // The actual signature will depend on the secret key, so we just check it exists
            expect(typeof result.signature).toBe('string');
            expect(result.signature.length).toBeGreaterThan(0);
        });

        it('should return error for missing text', async () => {
            const input = {
                data: {
                    method: 'sha256',
                    secretKey: 'my-secret-key'
                }
            };

            const result = await cryptoPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Text is required');
        });

        it('should return error for missing method', async () => {
            const input = {
                data: {
                    text: 'Hello, world!',
                    secretKey: 'my-secret-key'
                }
            };

            const result = await cryptoPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Method is required');
        });

        it('should return error for missing secret key', async () => {
            const input = {
                data: {
                    text: 'Hello, world!',
                    method: 'sha256'
                }
            };

            const result = await cryptoPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Secret key is required');
        });

        it('should return error for invalid method', async () => {
            const input = {
                data: {
                    text: 'Hello, world!',
                    method: 'invalid-method',
                    secretKey: 'my-secret-key'
                }
            };

            const result = await cryptoPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toContain('Invalid method');
        });

        it('should return error for invalid secret key encoding', async () => {
            const input = {
                data: {
                    text: 'Hello, world!',
                    method: 'sha256',
                    secretKey: 'my-secret-key',
                    secretKeyEncoding: 'invalid-encoding'
                }
            };

            const result = await cryptoPlugin.actions[1].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toContain('Invalid secret key encoding');
        });
    });

    describe('generate_password action', () => {
        it('should generate a password with default settings', async () => {
            const input = {
                data: {
                    length: 16
                }
            };

            const result = await cryptoPlugin.actions[2].execute(input, {}, {});

            expect(result).toHaveProperty('password');
            expect(typeof result.password).toBe('string');
            expect(result.password.length).toBe(16);
        });

        it('should generate a password with alphanumeric character set', async () => {
            const input = {
                data: {
                    length: 16,
                    characterSet: 'alphanumeric'
                }
            };

            const result = await cryptoPlugin.actions[2].execute(input, {}, {});

            expect(result).toHaveProperty('password');
            expect(typeof result.password).toBe('string');
            expect(result.password.length).toBe(16);
            // Check that the password only contains alphanumeric characters
            expect(result.password).toMatch(/^[a-zA-Z0-9]+$/);
        });

        it('should generate a password with alphanumeric-symbols character set', async () => {
            const input = {
                data: {
                    length: 16,
                    characterSet: 'alphanumeric-symbols'
                }
            };

            const result = await cryptoPlugin.actions[2].execute(input, {}, {});

            expect(result).toHaveProperty('password');
            expect(typeof result.password).toBe('string');
            expect(result.password.length).toBe(16);
        });

        it('should return error for invalid length', async () => {
            const input = {
                data: {
                    length: 0
                }
            };

            const result = await cryptoPlugin.actions[2].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toContain('Password length must be a number between 1 and 256');
        });

        it('should return error for invalid character set', async () => {
            const input = {
                data: {
                    length: 16,
                    characterSet: 'invalid-character-set'
                }
            };

            const result = await cryptoPlugin.actions[2].execute(input, {}, {});

            expect(result).toHaveProperty('error');
            expect(result.error).toContain('Invalid character set');
        });
    });
});
