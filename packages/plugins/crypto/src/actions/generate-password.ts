/**
 * Generates a random password with specified length and character set
 */
export const generatePassword = {
    name: 'generate_password',
    displayName: 'Generate Password',
    description: 'Generates a random password with the specified length and character set',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['length'],
        properties: {
            length: {
                type: 'number',
                title: 'Password Length',
                description: 'The length of the password (maximum 256)',
                minimum: 1,
                maximum: 256,
                default: 16,
            },
            characterSet: {
                type: 'string',
                title: 'Character Set',
                description: 'The character set to use when generating the password',
                enum: ['alphanumeric', 'alphanumeric-symbols'],
                enumNames: ['Alphanumeric', 'Alphanumeric + Symbols'],
                default: 'alphanumeric',
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            password: {
                type: 'string',
                title: 'Password',
                description: 'The generated password',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if password generation failed',
            },
        },
    },
    exampleInput: {
        length: 16,
        characterSet: 'alphanumeric',
    },
    exampleOutput: {
        password: 'a1B2c3D4e5F6g7H8',
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { length = 16, characterSet = 'alphanumeric' } = input.data;

            // Validate length
            if (typeof length !== 'number' || length < 1 || length > 256) {
                return {
                    error: 'Password length must be a number between 1 and 256',
                };
            }

            // Validate character set
            const validCharacterSets = ['alphanumeric', 'alphanumeric-symbols'];
            if (!validCharacterSets.includes(characterSet)) {
                return {
                    error: `Invalid character set: ${characterSet}. Valid character sets are: ${validCharacterSets.join(', ')}`,
                };
            }

            // Define character sets
            const charset = characterSet === 'alphanumeric'
                ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';

            // Generate password
            let password = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset[randomIndex];
            }

            return {
                password,
            };
        } catch (error) {
            console.error('Error generating password:', error);
            return {
                error: `Failed to generate password: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
