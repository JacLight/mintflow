import crypto from 'crypto';

/**
 * Converts text to a hash value using various hashing algorithms
 */
export const hashText = {
    name: 'hash_text',
    displayName: 'Text to Hash',
    description: 'Converts text to a hash value using various hashing algorithms',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['text', 'method'],
        properties: {
            text: {
                type: 'string',
                title: 'Text',
                description: 'The text to be hashed',
            },
            method: {
                type: 'string',
                title: 'Method',
                description: 'The hashing algorithm to use',
                enum: ['md5', 'sha1', 'sha256', 'sha512', 'sha3-512'],
                enumNames: ['MD5', 'SHA1', 'SHA256', 'SHA512', 'SHA3-512'],
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            hash: {
                type: 'string',
                title: 'Hash',
                description: 'The hashed value',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if hashing failed',
            },
        },
    },
    exampleInput: {
        text: 'Hello, world!',
        method: 'sha256',
    },
    exampleOutput: {
        hash: '315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3',
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { text, method } = input.data;

            if (!text) {
                return {
                    error: 'Text is required',
                };
            }

            if (!method) {
                return {
                    error: 'Method is required',
                };
            }

            // Validate method
            const validMethods = ['md5', 'sha1', 'sha256', 'sha512', 'sha3-512'];
            if (!validMethods.includes(method)) {
                return {
                    error: `Invalid method: ${method}. Valid methods are: ${validMethods.join(', ')}`,
                };
            }

            // Create hash
            const hashAlgorithm = crypto.createHash(method);
            hashAlgorithm.update(text);
            const hash = hashAlgorithm.digest('hex');

            return {
                hash,
            };
        } catch (error) {
            console.error('Error hashing text:', error);
            return {
                error: `Failed to hash text: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
