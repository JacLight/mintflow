import { initGraphClient, handleGraphError } from '../common/index.js';
import {
    PowerPointCreatePresentationParams,
    PowerPointAddSlideParams,
    PowerPointExportPresentationParams,
    PowerPointPresentation,
    PowerPointExportResult
} from '../models/index.js';

/**
 * Create a PowerPoint presentation
 */
export const createPresentation = async (params: PowerPointCreatePresentationParams): Promise<PowerPointPresentation> => {
    try {
        const { token, name, slides } = params;
        const client = initGraphClient(token);

        // Create a new file in OneDrive
        const fileResponse = await client.api('/me/drive/root/children')
            .post({
                name,
                file: {},
                '@microsoft.graph.conflictBehavior': 'rename'
            });

        // In a real implementation, we would create a PowerPoint file with the specified slides
        // For simplicity, we're just creating an empty file

        return {
            id: fileResponse.id,
            name: fileResponse.name,
            webUrl: fileResponse.webUrl,
            slideCount: slides.length
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Add a slide to a PowerPoint presentation
 */
export const addSlide = async (params: PowerPointAddSlideParams): Promise<PowerPointPresentation> => {
    try {
        const { token, presentationId, title, content } = params;
        const client = initGraphClient(token);

        // Get file metadata
        const fileResponse = await client.api(`/me/drive/items/${presentationId}`)
            .select('id,name,webUrl')
            .get();

        // In a real implementation, we would add a slide to the PowerPoint file
        // For simplicity, we're just returning the file metadata

        return {
            id: fileResponse.id,
            name: fileResponse.name,
            webUrl: fileResponse.webUrl,
            slideCount: 0 // In a real implementation, we would get the actual slide count
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Export a PowerPoint presentation to a different format
 */
export const exportPresentation = async (params: PowerPointExportPresentationParams): Promise<PowerPointExportResult> => {
    try {
        const { token, presentationId, format } = params;
        const client = initGraphClient(token);

        // Get file metadata
        const fileResponse = await client.api(`/me/drive/items/${presentationId}`)
            .select('id,name')
            .get();

        // In a real implementation, we would convert the PowerPoint file to the specified format
        // For simplicity, we're just returning a placeholder

        return {
            id: fileResponse.id,
            name: `${fileResponse.name.replace(/\.pptx?$/, '')}.${format}`,
            contentType: format === 'pdf' ? 'application/pdf' : `image/${format}`,
            content: 'base64-encoded-content' // In a real implementation, this would be the actual content
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};
