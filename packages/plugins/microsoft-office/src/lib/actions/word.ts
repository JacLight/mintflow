import { initGraphClient, handleGraphError } from '../common/index.js';
import {
    WordCreateDocumentParams,
    WordReadDocumentParams,
    WordUpdateDocumentParams,
    WordDocument
} from '../models/index.js';

/**
 * Create a Word document
 */
export const createDocument = async (params: WordCreateDocumentParams): Promise<WordDocument> => {
    try {
        const { token, name, content, contentType } = params;
        const client = initGraphClient(token);

        // Create a new file in OneDrive
        const fileResponse = await client.api('/me/drive/root/children')
            .post({
                name,
                file: {},
                '@microsoft.graph.conflictBehavior': 'rename'
            });

        // Convert content based on contentType
        let fileContent = content;
        if (contentType === 'html' || contentType === 'markdown') {
            // In a real implementation, we would convert HTML or Markdown to OOXML here
            // For simplicity, we're just using the content as-is
            fileContent = content;
        }

        // Upload content to the file
        await client.api(`/me/drive/items/${fileResponse.id}/content`)
            .put(fileContent);

        return {
            id: fileResponse.id,
            name: fileResponse.name,
            contentType
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Read a Word document
 */
export const readDocument = async (params: WordReadDocumentParams): Promise<WordDocument> => {
    try {
        const { token, documentId } = params;
        const client = initGraphClient(token);

        // Get file metadata
        const fileResponse = await client.api(`/me/drive/items/${documentId}`)
            .select('id,name')
            .get();

        // Get file content
        const contentResponse = await client.api(`/me/drive/items/${documentId}/content`)
            .get();

        return {
            id: fileResponse.id,
            name: fileResponse.name,
            content: contentResponse,
            contentType: 'text' // In a real implementation, we would detect the content type
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Update a Word document
 */
export const updateDocument = async (params: WordUpdateDocumentParams): Promise<WordDocument> => {
    try {
        const { token, documentId, content, contentType } = params;
        const client = initGraphClient(token);

        // Get file metadata
        const fileResponse = await client.api(`/me/drive/items/${documentId}`)
            .select('id,name')
            .get();

        // Convert content based on contentType
        let fileContent = content;
        if (contentType === 'html' || contentType === 'markdown') {
            // In a real implementation, we would convert HTML or Markdown to OOXML here
            // For simplicity, we're just using the content as-is
            fileContent = content;
        }

        // Upload content to the file
        await client.api(`/me/drive/items/${documentId}/content`)
            .put(fileContent);

        return {
            id: fileResponse.id,
            name: fileResponse.name,
            contentType
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};
