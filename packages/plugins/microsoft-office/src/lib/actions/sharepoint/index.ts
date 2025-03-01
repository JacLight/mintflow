import { initGraphClient, handleGraphError } from '../../common/index.js';
import {
    SharePointListSitesParams,
    SharePointGetSiteParams,
    SharePointListDocumentsParams,
    SharePointUploadDocumentParams,
    SharePointDownloadDocumentParams,
    SharePointSite,
    SharePointDocument
} from '../../models/sharepoint.js';

/**
 * List SharePoint sites
 */
export const listSites = async (params: SharePointListSitesParams): Promise<SharePointSite[]> => {
    try {
        const { token } = params;
        const client = initGraphClient(token);

        // Get SharePoint sites
        const response = await client.api('/sites')
            .select('id,displayName,name,webUrl,description')
            .get();

        return response.value.map((site: any) => ({
            id: site.id,
            name: site.name,
            displayName: site.displayName,
            webUrl: site.webUrl,
            description: site.description
        }));
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Get a SharePoint site by ID
 */
export const getSite = async (params: SharePointGetSiteParams): Promise<SharePointSite> => {
    try {
        const { token, siteId } = params;
        const client = initGraphClient(token);

        // Get SharePoint site
        const response = await client.api(`/sites/${siteId}`)
            .select('id,displayName,name,webUrl,description')
            .get();

        return {
            id: response.id,
            name: response.name,
            displayName: response.displayName,
            webUrl: response.webUrl,
            description: response.description
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * List documents in a SharePoint site
 */
export const listDocuments = async (params: SharePointListDocumentsParams): Promise<SharePointDocument[]> => {
    try {
        const { token, siteId, libraryName = 'Documents' } = params;
        const client = initGraphClient(token);

        // Get documents from the site
        const response = await client.api(`/sites/${siteId}/drives`)
            .select('id,name,webUrl')
            .get();

        // Find the document library
        const library = response.value.find((drive: any) => drive.name === libraryName);

        if (!library) {
            throw new Error(`Document library '${libraryName}' not found`);
        }

        // Get documents from the library
        const documentsResponse = await client.api(`/drives/${library.id}/root/children`)
            .select('id,name,webUrl,file,folder,size,lastModifiedDateTime')
            .get();

        return documentsResponse.value.map((item: any) => ({
            id: item.id,
            name: item.name,
            webUrl: item.webUrl,
            size: item.size,
            lastModified: item.lastModifiedDateTime,
            isFolder: !!item.folder
        }));
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Upload a document to a SharePoint site
 */
export const uploadDocument = async (params: SharePointUploadDocumentParams): Promise<SharePointDocument> => {
    try {
        const { token, siteId, libraryName = 'Documents', name, content } = params;
        const client = initGraphClient(token);

        // Get document libraries from the site
        const response = await client.api(`/sites/${siteId}/drives`)
            .select('id,name,webUrl')
            .get();

        // Find the document library
        const library = response.value.find((drive: any) => drive.name === libraryName);

        if (!library) {
            throw new Error(`Document library '${libraryName}' not found`);
        }

        // Create a new file in the library
        const fileResponse = await client.api(`/drives/${library.id}/root:/${name}:/content`)
            .put(content);

        return {
            id: fileResponse.id,
            name: fileResponse.name,
            webUrl: fileResponse.webUrl,
            size: fileResponse.size,
            lastModified: fileResponse.lastModifiedDateTime,
            isFolder: false
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Download a document from a SharePoint site
 */
export const downloadDocument = async (params: SharePointDownloadDocumentParams): Promise<string> => {
    try {
        const { token, siteId, documentId } = params;
        const client = initGraphClient(token);

        // Get document content
        const response = await client.api(`/sites/${siteId}/drive/items/${documentId}/content`)
            .get();

        return response;
    } catch (error) {
        throw handleGraphError(error);
    }
};
