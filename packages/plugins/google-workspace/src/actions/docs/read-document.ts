import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const readDocument = {
    name: 'read_document',
    displayName: 'Read Google Document',
    ...commonSchema,
    inputSchema: {
        type: "object",
        required: ["auth", "documentId"],
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
            documentId: {
                type: "string",
                description: "ID of the document to read"
            },
            includeContent: {
                type: "boolean",
                description: "Whether to include the document content in the response",
                default: true
            },
            suggestionsViewMode: {
                type: "string",
                enum: ["DEFAULT_FOR_CURRENT_ACCESS", "SUGGESTIONS_INLINE", "PREVIEW_SUGGESTIONS_ACCEPTED", "PREVIEW_WITHOUT_SUGGESTIONS"],
                description: "The suggestions view mode for the document",
                default: "DEFAULT_FOR_CURRENT_ACCESS"
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            documentId: {
                type: "string",
                description: "ID of the document"
            },
            title: {
                type: "string",
                description: "Title of the document"
            },
            documentUrl: {
                type: "string",
                description: "URL to access the document"
            },
            content: {
                type: "string",
                description: "Plain text content of the document (if includeContent is true)"
            },
            documentInfo: {
                type: "object",
                description: "Additional document information"
            }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        documentId: '1Ag5LQwER3dFGhIjKlMnOpQrStUvWxYz',
        includeContent: true
    },
    exampleOutput: {
        documentId: '1Ag5LQwER3dFGhIjKlMnOpQrStUvWxYz',
        title: 'Sample Document',
        documentUrl: 'https://docs.google.com/document/d/1Ag5LQwER3dFGhIjKlMnOpQrStUvWxYz/edit',
        content: 'This is the content of the document...',
        documentInfo: {
            createdTime: '2023-01-15T10:00:00.000Z',
            modifiedTime: '2023-01-16T15:30:00.000Z'
        }
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth, documentId, includeContent = true, suggestionsViewMode = 'DEFAULT_FOR_CURRENT_ACCESS' } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Get document metadata and content
            const response = await axios.get(
                `${googleApiUrls.docs}/documents/${documentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.access_token}`
                    },
                    params: {
                        suggestionsViewMode
                    }
                }
            );

            const document = response.data;

            // Get document metadata from Drive API for additional info
            const driveResponse = await axios.get(
                `${googleApiUrls.drive}/files/${documentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.access_token}`
                    },
                    params: {
                        fields: 'id,name,createdTime,modifiedTime,webViewLink'
                    }
                }
            );

            const driveData = driveResponse.data;

            // Extract plain text content if requested
            let plainTextContent = '';
            if (includeContent && document.body && document.body.content) {
                plainTextContent = document.body.content
                    .filter((item: any) => item.paragraph)
                    .map((item: any) => {
                        if (item.paragraph && item.paragraph.elements) {
                            return item.paragraph.elements
                                .map((element: any) => element.textRun ? element.textRun.content : '')
                                .join('');
                        }
                        return '';
                    })
                    .join('');
            }

            return {
                documentId: document.documentId,
                title: document.title,
                documentUrl: driveData.webViewLink || `https://docs.google.com/document/d/${documentId}/edit`,
                content: includeContent ? plainTextContent : undefined,
                documentInfo: {
                    createdTime: driveData.createdTime,
                    modifiedTime: driveData.modifiedTime,
                    revisionId: document.revisionId
                }
            };
        } catch (error: any) {
            return googleWorkspaceUtils.handleApiError(error);
        }
    }
};
