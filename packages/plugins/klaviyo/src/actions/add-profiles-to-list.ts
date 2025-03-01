import { createClient } from '../common/index.js';
import { KlaviyoProfile } from '../common/types.js';

export const addProfilesToListAction = {
    name: 'add_profiles_to_list',
    description: 'Add profiles to a list in Klaviyo',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'Klaviyo API Key',
            },
            listId: {
                type: 'string',
                description: 'ID of the list to add profiles to',
            },
            profiles: {
                type: 'array',
                description: 'Profiles to add to the list',
                items: {
                    type: 'object',
                    properties: {
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
                        properties: {
                            type: 'object',
                            description: 'Additional properties for the profile',
                        },
                    },
                    required: ['email'],
                },
            },
        },
        required: ['apiKey', 'listId', 'profiles'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                description: 'Whether the profiles were added successfully',
            },
            message: {
                type: 'string',
                description: 'Error message if the profiles failed to add',
            },
            errors: {
                type: 'array',
                description: 'List of errors if the profiles failed to add',
                items: {
                    type: 'object',
                },
            },
        },
    },
    exampleInput: {
        apiKey: 'pk_1234567890',
        listId: 'abc123',
        profiles: [
            {
                email: 'customer1@example.com',
                firstName: 'John',
                lastName: 'Doe',
            },
            {
                email: 'customer2@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
            },
        ],
    },
    exampleOutput: {
        success: true,
    },
    execute: async (input: any) => {
        const { apiKey, listId, profiles } = input;

        const client = createClient(apiKey);

        // Prepare profile data
        const profileData: KlaviyoProfile[] = profiles.map((profile: any) => ({
            email: profile.email,
            first_name: profile.firstName,
            last_name: profile.lastName,
            phone_number: profile.phoneNumber,
            external_id: profile.externalId,
            properties: profile.properties || {},
        }));

        try {
            const result = await client.addProfilesToList(listId, profileData);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: `Failed to add profiles to list: ${error.message}`,
                };
            }
            return {
                success: false,
                message: 'Failed to add profiles to list: Unknown error',
            };
        }
    },
};
