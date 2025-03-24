import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const appendText = {
    name: 'append_text_to_document',
    displayName: 'Append Text to Document',
    ...commonSchema,
    inputSchema: {
        type: "object",
        required: ["auth", "documentId", "text"],
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
                description: "ID of the document to append text to"
            },
            text: {
                type: "string",
                description: "Text to append to the document"
            },
            insertAtEnd: {
                type: "boolean",
                description: "Whether to insert at the end of the document (true) or at the cursor position (false)",
                default: true
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                description: "Whether the operation was successful"
            },
            documentId: {
                type: "string",
                description: "ID of the document"
            },
            documentUrl: {
                type: "string",
                description: "URL to access the document"
            }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        documentId: '1Ag5LQwER3dFGhIjKlMnOpQrStUvWxYz',
        text: 'This text will be appended to the document.',
        insertAtEnd: true
    },
    exampleOutput: {
        success: true,
        documentId: '1Ag5LQwER3dFGhIjKlMnOpQrStUvWxYz',
        documentUrl: 'https://docs.google.com/document/d/1Ag5LQwER3dFGhIjKlMnOpQrStUvWxYz/edit'
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth, documentId, text, insertAtEnd = true } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // If inserting at the end, we need to get the document first to find the end index
            let endOfDocIndex = 1; // Default to beginning if we can't determine end

            if (insertAtEnd) {
                // Get the document to find its length
                const docResponse = await axios.get(
                    `${googleApiUrls.docs}/documents/${documentId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${auth.access_token}`
                        }
                    }
                );

                // Get the content length to determine where to insert
                if (docResponse.data && docResponse.data.body && docResponse.data.body.content) {
                    const lastContentElement = docResponse.data.body.content[docResponse.data.body.content.length - 1];
                    if (lastContentElement && lastContentElement.endIndex) {
                        endOfDocIndex = lastContentElement.endIndex - 1;
                    }
                }
            }

            // Append text to the document
            await axios.post(
                `${googleApiUrls.docs}/documents/${documentId}:batchUpdate`,
                {
                    requests: [
                        {
                            insertText: {
                                location: {
                                    index: endOfDocIndex
                                },
                                text: text
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

            return {
                success: true,
                documentId: documentId,
                documentUrl: `https://docs.google.com/document/d/${documentId}/edit`
            };
        } catch (error: any) {
            return googleWorkspaceUtils.handleApiError(error);
        }
    }
};
