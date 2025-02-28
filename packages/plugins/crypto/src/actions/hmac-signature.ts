import crypto from 'crypto';

/**
 * Generates an HMAC signature for text using a secret key and various hashing algorithms
 */
export const hmacSignature = {
    name: 'hmac_signature',
    displayName: 'Generate HMAC Signature',
    description: 'Converts text to a HMAC signed hash value using various hashing algorithms',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['text', 'method', 'secretKey'],
        properties: {
            text: {
                type: 'string',
                title: 'Text',
                description: 'The text to be signed',
            },
            method: {
                type: 'string',
                title: 'Method',
                description: 'The hashing algorithm to use',
                enum: ['md5', 'sha1', 'sha256', 'sha512'],
                enumNames: ['MD5', 'SHA1', 'SHA256', 'SHA512'],
            },
            secretKey: {
                type: 'string',
                title: 'Secret Key',
                description: 'The secret key to use for signing',
            },
            secretKeyEncoding: {
                type: 'string',
                title: 'Secret Key Encoding',
                description: 'The encoding of the secret key',
                enum: ['utf-8', 'hex', 'base64'],
                enumNames: ['UTF-8', 'Hex', 'Base64'],
                default: 'utf-8',
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            signature: {
                type: 'string',
                title: 'Signature',
                description: 'The HMAC signature',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if signing failed',
            },
        },
    },
    exampleInput: {
        text: 'Hello, world!',
        method: 'sha256',
        secretKey: 'my-secret-key',
        secretKeyEncoding: 'utf-8',
    },
    exampleOutput: {
        signature: '2f7c0a9d3f3bd4c9ba4d9e1c6a1b7a9d3f3bd4c9ba4d9e1c6a1b7a9d3f3bd4c9',
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { text, method, secretKey, secretKeyEncoding = 'utf-8' } = input.data;

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

            if (!secretKey) {
                return {
                    error: 'Secret key is required',
                };
            }

            // Validate method
            const validMethods = ['md5', 'sha1', 'sha256', 'sha512'];
            if (!validMethods.includes(method)) {
                return {
                    error: `Invalid method: ${method}. Valid methods are: ${validMethods.join(', ')}`,
                };
            }

            // Validate encoding
            const validEncodings = ['utf-8', 'hex', 'base64'];
            if (!validEncodings.includes(secretKeyEncoding)) {
                return {
                    error: `Invalid secret key encoding: ${secretKeyEncoding}. Valid encodings are: ${validEncodings.join(', ')}`,
                };
            }

            // Create HMAC
            const hmac = crypto.createHmac(
                method,
                Buffer.from(secretKey, secretKeyEncoding as BufferEncoding)
            );
            hmac.update(text);
            const signature = hmac.digest('hex');

            return {
                signature,
            };
        } catch (error) {
            console.error('Error generating HMAC signature:', error);
            return {
                error: `Failed to generate HMAC signature: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
