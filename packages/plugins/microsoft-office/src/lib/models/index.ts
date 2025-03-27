// Microsoft Office data models
import { DriveItem } from '@microsoft/microsoft-graph-types';

// Re-export Microsoft Graph types for convenience
export type { DriveItem };

// Common parameters
export interface MicrosoftOfficeBaseParams {
    token: string;
}

// Excel parameters
export interface ExcelListWorkbooksParams extends MicrosoftOfficeBaseParams { }

export interface ExcelGetWorksheetsParams extends MicrosoftOfficeBaseParams {
    workbookId: string;
}

export interface ExcelGetWorksheetDataParams extends MicrosoftOfficeBaseParams {
    workbookId: string;
    worksheetId: string;
    range?: string;
}

export interface ExcelAddRowParams extends MicrosoftOfficeBaseParams {
    workbookId: string;
    worksheetId: string;
    tableId: string;
    values: any[];
}

// Word parameters
export interface WordCreateDocumentParams extends MicrosoftOfficeBaseParams {
    name: string;
    content: string;
    contentType: 'html' | 'markdown' | 'text';
}

export interface WordReadDocumentParams extends MicrosoftOfficeBaseParams {
    documentId: string;
}

export interface WordUpdateDocumentParams extends MicrosoftOfficeBaseParams {
    documentId: string;
    content: string;
    contentType: 'html' | 'markdown' | 'text';
}

// PowerPoint parameters
export interface PowerPointSlide {
    title: string;
    content: string;
}

export interface PowerPointCreatePresentationParams extends MicrosoftOfficeBaseParams {
    name: string;
    slides: PowerPointSlide[];
}

export interface PowerPointAddSlideParams extends MicrosoftOfficeBaseParams {
    presentationId: string;
    title: string;
    content: string;
}

export interface PowerPointExportPresentationParams extends MicrosoftOfficeBaseParams {
    presentationId: string;
    format: 'pdf' | 'png' | 'jpg';
}

// Response types
export interface ExcelWorkbook {
    id: string;
    name: string;
    webUrl: string;
}

export interface ExcelWorksheet {
    id: string;
    name: string;
    position: number;
    visibility: string;
}

export interface ExcelTable {
    id: string;
    name: string;
    showHeaders: boolean;
    showTotals: boolean;
    style: string;
}

export interface WordDocument {
    id: string;
    name: string;
    content?: string;
    contentType?: string;
}

export interface PowerPointPresentation {
    id: string;
    name: string;
    webUrl: string;
    slideCount: number;
}

export interface PowerPointExportResult {
    id: string;
    name: string;
    contentType: string;
    content: string; // Base64 encoded content
}
