import * as actions from './actions/index.js';
import { validateOAuthToken } from './common.js';

const linkedinPlugin = {
    name: "linkedin",
    icon: "https://cdn.activepieces.com/pieces/linkedin.png",
    description: "Connect and network with professionals on LinkedIn",
    groups: ["social"],
    tags: ["social","media","platform","network","sharing"],
    version: '1.0.0',
    id: "linkedin",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            accessToken: {
                type: "string",
                description: "LinkedIn OAuth access token"
            },
            idToken: {
                type: "string",
                description: "LinkedIn OAuth ID token (required for personal updates)"
            }
        },
        required: ["accessToken"]
    },
    outputSchema: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                description: "Whether the operation was successful"
            },
            message: {
                type: "string",
                description: "Status message"
            }
        }
    },
    exampleInput: {
        accessToken: "your-linkedin-access-token",
        idToken: "your-linkedin-id-token"
    },
    exampleOutput: {
        success: true,
        message: "Operation completed successfully"
    },
    documentation: "https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api",
    method: "exec",
    actions: [
        {
            name: "createShareUpdate",
            description: "Create a personal share update on LinkedIn",
            runner: actions.createShareUpdate,
            inputSchema: {
                type: "object",
                properties: {
                    accessToken: {
                        type: "string",
                        description: "LinkedIn OAuth access token"
                    },
                    idToken: {
                        type: "string",
                        description: "LinkedIn OAuth ID token"
                    },
                    text: {
                        type: "string",
                        description: "The text content of the update"
                    },
                    visibility: {
                        type: "string",
                        description: "The visibility of the update",
                        enum: ["PUBLIC", "CONNECTIONS"],
                        default: "PUBLIC"
                    },
                    imageData: {
                        type: "string",
                        description: "Base64-encoded image data"
                    },
                    imageFilename: {
                        type: "string",
                        description: "Filename of the image"
                    },
                    link: {
                        type: "string",
                        description: "URL to share in the update"
                    },
                    linkTitle: {
                        type: "string",
                        description: "Title for the shared URL"
                    },
                    linkDescription: {
                        type: "string",
                        description: "Description for the shared URL"
                    }
                },
                required: ["accessToken", "idToken", "text", "visibility"]
            }
        },
        {
            name: "createCompanyUpdate",
            description: "Create a company update on LinkedIn",
            runner: actions.createCompanyUpdate,
            inputSchema: {
                type: "object",
                properties: {
                    accessToken: {
                        type: "string",
                        description: "LinkedIn OAuth access token"
                    },
                    companyId: {
                        type: "string",
                        description: "LinkedIn company ID"
                    },
                    text: {
                        type: "string",
                        description: "The text content of the update"
                    },
                    imageData: {
                        type: "string",
                        description: "Base64-encoded image data"
                    },
                    imageFilename: {
                        type: "string",
                        description: "Filename of the image"
                    },
                    link: {
                        type: "string",
                        description: "URL to share in the update"
                    },
                    linkTitle: {
                        type: "string",
                        description: "Title for the shared URL"
                    },
                    linkDescription: {
                        type: "string",
                        description: "Description for the shared URL"
                    }
                },
                required: ["accessToken", "companyId", "text"]
            }
        }
    ],
    validateCredentials: async (credentials: { accessToken: string }) => {
        try {
            const isValid = await validateOAuthToken(credentials.accessToken);
            return {
                valid: isValid,
                message: isValid ? "API key is valid" : "Invalid API key"
            };
        } catch (error) {
            return {
                valid: false,
                message: "Error validating API key"
            };
        }
    }
};

export default linkedinPlugin;
