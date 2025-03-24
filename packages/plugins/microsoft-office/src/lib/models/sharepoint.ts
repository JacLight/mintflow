import { MicrosoftOfficeBaseParams } from './index.js';

// SharePoint parameters
export interface SharePointListSitesParams extends MicrosoftOfficeBaseParams { }

export interface SharePointGetSiteParams extends MicrosoftOfficeBaseParams {
    siteId: string;
}

export interface SharePointListDocumentsParams extends MicrosoftOfficeBaseParams {
    siteId: string;
    libraryName?: string;
}

export interface SharePointUploadDocumentParams extends MicrosoftOfficeBaseParams {
    siteId: string;
    libraryName?: string;
    name: string;
    content: string;
}

export interface SharePointDownloadDocumentParams extends MicrosoftOfficeBaseParams {
    siteId: string;
    documentId: string;
}

// SharePoint response types
export interface SharePointSite {
    id: string;
    name: string;
    displayName: string;
    webUrl: string;
    description?: string;
}

export interface SharePointDocument {
    id: string;
    name: string;
    webUrl: string;
    size?: number;
    lastModified?: string;
    isFolder: boolean;
}
