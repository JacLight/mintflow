import { makeClient, ApolloAuth } from '../common/index.js';

export const matchPerson = {
    name: "match_person",
    description: "Finds a person's information based on their email address",
    inputSchema: {
        type: "object",
        properties: {
            email: {
                type: "string",
                description: "Email address of the person to find"
            },
            cacheResponse: {
                type: "boolean",
                description: "Whether to cache the response for future use",
                default: true
            }
        },
        required: ["email"]
    },
    outputSchema: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description: "Apollo ID of the person"
            },
            first_name: {
                type: "string",
                description: "First name of the person"
            },
            last_name: {
                type: "string",
                description: "Last name of the person"
            },
            name: {
                type: "string",
                description: "Full name of the person"
            },
            linkedin_url: {
                type: "string",
                description: "LinkedIn URL of the person"
            },
            title: {
                type: "string",
                description: "Job title of the person"
            },
            email: {
                type: "string",
                description: "Email address of the person"
            },
            phone_numbers: {
                type: "array",
                description: "Phone numbers of the person",
                items: {
                    type: "string"
                }
            },
            organization: {
                type: "object",
                description: "Organization information of the person"
            }
        }
    },
    exampleInput: {
        email: "john.doe@example.com",
        cacheResponse: true
    },
    exampleOutput: {
        id: "5f4e3d2c1b0a9876543210",
        first_name: "John",
        last_name: "Doe",
        name: "John Doe",
        linkedin_url: "https://www.linkedin.com/in/johndoe",
        title: "Software Engineer",
        email: "john.doe@example.com",
        phone_numbers: ["+1 (555) 123-4567"],
        organization: {
            name: "Example Inc.",
            website_url: "https://example.com"
        }
    },
    execute: async (input: any, auth: ApolloAuth, store?: any) => {
        try {
            const { email, cacheResponse = true } = input.data || {};

            if (!email) {
                return { error: "Email is required" };
            }

            // Check cache if enabled
            if (cacheResponse && store) {
                const cachedResult = await store.get(`_apollo_person_${email}`);
                if (cachedResult) {
                    return cachedResult;
                }
            }

            const client = makeClient(auth);
            const result = await client.matchPerson(email);

            // Store in cache if enabled
            if (cacheResponse && store && Object.keys(result).length > 0) {
                await store.put(`_apollo_person_${email}`, result);
            }

            return result;
        } catch (error: any) {
            return {
                error: `Error matching person: ${error.message || 'Unknown error'}`
            };
        }
    }
};
