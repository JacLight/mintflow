import { createClient } from '../common/index.js';
import { KlaviyoProfile } from '../common/types.js';

export const identifyProfileAction = {
    name: 'identify_profile',
    description: 'Identify a profile in Klaviyo',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'Klaviyo API Key',
            },
            email: {
                type: 'string',
                description: 'Email address of the profile',
            },
            firstName: {
                type: 'string',
                description: 'First name of the profile',
            },
            lastName: {
                type: 'string',
                description: 'Last name of the profile',
            },
            phoneNumber: {
                type: 'string',
                description: 'Phone number of the profile',
            },
            externalId: {
                type: 'string',
                description: 'External ID of the profile',
            },
            organization: {
                type: 'string',
                description: 'Organization of the profile',
            },
            title: {
                type: 'string',
                description: 'Title of the profile',
            },
            properties: {
                type: 'object',
                description: 'Additional properties for the profile',
            },
        },
        required: ['apiKey', 'email'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                description: 'Whether the profile was identified successfully',
            },
            message: {
                type: 'string',
                description: 'Error message if the profile failed to identify',
            },
            errors: {
                type: 'array',
                description: 'List of errors if the profile failed to identify',
                items: {
                    type: 'object',
                },
            },
        },
    },
    exampleInput: {
        apiKey: 'pk_1234567890',
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        organization: 'Example Company',
        title: 'CEO',
        properties: {
            source: 'Website',
            signupDate: '2023-01-01',
        },
    },
    exampleOutput: {
        success: true,
    },
    execute: async (input: any) => {
        const {
            apiKey,
            email,
            firstName,
            lastName,
            phoneNumber,
            externalId,
            organization,
            title,
            properties,
        } = input;

        const client = createClient(apiKey);

        // Prepare profile data
        const profileData: KlaviyoProfile = {
            email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            external_id: externalId,
            organization,
            title,
            properties: properties || {},
        };

        try {
            const result = await client.identifyProfile(profileData);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: `Failed to identify profile: ${error.message}`,
                };
            }
            return {
                success: false,
                message: 'Failed to identify profile: Unknown error',
            };
        }
    },
};
