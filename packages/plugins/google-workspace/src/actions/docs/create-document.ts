import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const createDocument = {
    name: 'create_document',
    displayName: 'Create Google Document',
    ...commonSchema,
    inputSchema: {
        type: "object",
        required: ["auth", "title"],
        properties: {
            auth: {
                type: "object",
                required: ["access_token"],
                properties: {
                    access_token: {
                        type: "string",
                        description: "OAuth2 access token with Google Docs permissions"
                    }
                }
            },
            title: {
                type: "string",
                description: "Title of the document"
            },
            content: {
                type: "string",
                description: "Initial content of the document (optional)"
            },
            folderId: {
                type: "string",
                description: "Google Drive folder ID to create the document in (optional)"
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            documentId: {
                type: "string",
                description: "ID of the created document"
            },
            documentUrl: {
                type: "string",
                description: "URL to access the document"
            },
            title: {
                type: "string",
                description: "Title of the document"
            }
        }
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth, title, content, folderId } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Create an empty document
            const createResponse = await axios.post(
                `${googleApiUrls.docs}/documents`,
                { title },
                {
                    headers: {
                        'Authorization': `Bearer ${auth.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const documentId = createResponse.data.documentId;

            // If content is provided, insert it into the document
            if (content && documentId) {
                await axios.post(
                    `${googleApiUrls.docs}/documents/${documentId}:batchUpdate`,
                    {
                        requests: [
                            {
                                insertText: {
                                    location: {
                                        index: 1
                                    },
                                    text: content
                                }
                            }
                        ]
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${auth.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            // If folder ID is provided, move the document to that folder
            if (folderId && documentId) {
                await axios.patch(
                    `${googleApiUrls.drive}/files/${documentId}`,
                    {
                        addParents: folderId,
                        removeParents: 'root'
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${auth.access_token}`,
                            'Content-Type': 'application/json'
                        },
                        params: {
                            fields: 'id, parents'
                        }
                    }
                );
            }

            return {
                documentId: documentId,
                documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
                title: title
            };
        } catch (error: any) {
            return googleWorkspaceUtils.handleApiError(error);
        }
    }
};
