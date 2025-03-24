import { jest } from '@jest/globals';
import microsoftOfficePlugin from '../src/index.js';
import * as excelActions from '../src/lib/actions/excel.js';
import * as wordActions from '../src/lib/actions/word.js';
import * as powerPointActions from '../src/lib/actions/powerpoint.js';

// Mock the action modules
jest.mock('../src/lib/actions/excel.js');
jest.mock('../src/lib/actions/word.js');
jest.mock('../src/lib/actions/powerpoint.js');

describe('Microsoft Office Plugin', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
    });

    it('should have the correct plugin structure', () => {
        // Verify plugin properties
        expect(microsoftOfficePlugin.name).toBe('Microsoft Office');
        expect(microsoftOfficePlugin.id).toBe('microsoft-office');
        expect(microsoftOfficePlugin.runner).toBe('node');
        expect(microsoftOfficePlugin.method).toBe('exec');
        expect(microsoftOfficePlugin.actions.length).toBe(1);
        expect(microsoftOfficePlugin.actions[0].name).toBe('microsoft-office');
        expect(typeof microsoftOfficePlugin.actions[0].execute).toBe('function');
    });

    describe('execute function', () => {
        const token = 'test-token';
        const execute = microsoftOfficePlugin.actions[0].execute;

        it('should throw an error if action is missing', async () => {
            await expect(execute({ token })).rejects.toThrow('Missing required parameters: action, token');
        });

        it('should throw an error if token is missing', async () => {
            await expect(execute({ action: 'excel_list_workbooks' })).rejects.toThrow('Missing required parameters: action, token');
        });

        it('should throw an error for unsupported action', async () => {
            await expect(execute({ action: 'unsupported_action', token })).rejects.toThrow('Unsupported action: unsupported_action');
        });

        // Excel actions
        describe('Excel actions', () => {
            beforeEach(() => {
                // Mock Excel actions
                (excelActions.listWorkbooks as jest.Mock).mockResolvedValue([
                    { id: 'workbook-1', name: 'Workbook 1.xlsx', webUrl: 'https://example.com/1' }
                ]);
                (excelActions.getWorksheets as jest.Mock).mockResolvedValue([
                    { id: 'sheet-1', name: 'Sheet 1', position: 0, visibility: 'Visible' }
                ]);
                (excelActions.getWorksheetData as jest.Mock).mockResolvedValue([
                    ['Header 1', 'Header 2'],
                    ['Value 1', 'Value 2']
                ]);
                (excelActions.addRow as jest.Mock).mockResolvedValue({ id: 'row-1' });
            });

            it('should handle excel_list_workbooks action', async () => {
                const result = await execute({ action: 'excel_list_workbooks', token });
                expect(excelActions.listWorkbooks).toHaveBeenCalledWith({ token });
                expect(result).toEqual({
                    workbooks: [
                        { id: 'workbook-1', name: 'Workbook 1.xlsx', webUrl: 'https://example.com/1' }
                    ]
                });
            });

            it('should handle excel_get_worksheets action', async () => {
                const workbookId = 'workbook-1';
                const result = await execute({ action: 'excel_get_worksheets', token, workbookId });
                expect(excelActions.getWorksheets).toHaveBeenCalledWith({ token, workbookId });
                expect(result).toEqual({
                    worksheets: [
                        { id: 'sheet-1', name: 'Sheet 1', position: 0, visibility: 'Visible' }
                    ]
                });
            });

            it('should throw an error if workbookId is missing for excel_get_worksheets', async () => {
                await expect(execute({ action: 'excel_get_worksheets', token }))
                    .rejects.toThrow('Missing required parameter: workbookId');
            });

            it('should handle excel_get_worksheet_data action', async () => {
                const workbookId = 'workbook-1';
                const worksheetId = 'sheet-1';
                const range = 'A1:B2';
                const result = await execute({ action: 'excel_get_worksheet_data', token, workbookId, worksheetId, range });
                expect(excelActions.getWorksheetData).toHaveBeenCalledWith({ token, workbookId, worksheetId, range });
                expect(result).toEqual({
                    data: [
                        ['Header 1', 'Header 2'],
                        ['Value 1', 'Value 2']
                    ]
                });
            });

            it('should throw an error if required parameters are missing for excel_get_worksheet_data', async () => {
                await expect(execute({ action: 'excel_get_worksheet_data', token }))
                    .rejects.toThrow('Missing required parameters: workbookId, worksheetId');
            });

            it('should handle excel_add_row action', async () => {
                const workbookId = 'workbook-1';
                const worksheetId = 'sheet-1';
                const tableId = 'table-1';
                const values = ['Value 1', 'Value 2'];
                const result = await execute({ action: 'excel_add_row', token, workbookId, worksheetId, tableId, values });
                expect(excelActions.addRow).toHaveBeenCalledWith({ token, workbookId, worksheetId, tableId, values });
                expect(result).toEqual({ id: 'row-1' });
            });

            it('should throw an error if required parameters are missing for excel_add_row', async () => {
                await expect(execute({ action: 'excel_add_row', token }))
                    .rejects.toThrow('Missing required parameters: workbookId, worksheetId, tableId, values');
            });
        });

        // Word actions
        describe('Word actions', () => {
            beforeEach(() => {
                // Mock Word actions
                (wordActions.createDocument as jest.Mock).mockResolvedValue({
                    id: 'document-1',
                    name: 'Document.docx',
                    contentType: 'text'
                });
                (wordActions.readDocument as jest.Mock).mockResolvedValue({
                    id: 'document-1',
                    name: 'Document.docx',
                    content: 'Document content',
                    contentType: 'text'
                });
                (wordActions.updateDocument as jest.Mock).mockResolvedValue({
                    id: 'document-1',
                    name: 'Document.docx',
                    contentType: 'text'
                });
            });

            it('should handle word_create_document action', async () => {
                const name = 'Document.docx';
                const content = 'Document content';
                const contentType = 'text';
                const result = await execute({ action: 'word_create_document', token, name, content, contentType });
                expect(wordActions.createDocument).toHaveBeenCalledWith({ token, name, content, contentType });
                expect(result).toEqual({
                    id: 'document-1',
                    name: 'Document.docx',
                    contentType: 'text'
                });
            });

            it('should throw an error if required parameters are missing for word_create_document', async () => {
                await expect(execute({ action: 'word_create_document', token }))
                    .rejects.toThrow('Missing required parameters: name, content, contentType');
            });

            it('should handle word_read_document action', async () => {
                const documentId = 'document-1';
                const result = await execute({ action: 'word_read_document', token, documentId });
                expect(wordActions.readDocument).toHaveBeenCalledWith({ token, documentId });
                expect(result).toEqual({
                    id: 'document-1',
                    name: 'Document.docx',
                    content: 'Document content',
                    contentType: 'text'
                });
            });

            it('should throw an error if documentId is missing for word_read_document', async () => {
                await expect(execute({ action: 'word_read_document', token }))
                    .rejects.toThrow('Missing required parameter: documentId');
            });

            it('should handle word_update_document action', async () => {
                const documentId = 'document-1';
                const content = 'Updated content';
                const contentType = 'text';
                const result = await execute({ action: 'word_update_document', token, documentId, content, contentType });
                expect(wordActions.updateDocument).toHaveBeenCalledWith({ token, documentId, content, contentType });
                expect(result).toEqual({
                    id: 'document-1',
                    name: 'Document.docx',
                    contentType: 'text'
                });
            });

            it('should throw an error if required parameters are missing for word_update_document', async () => {
                await expect(execute({ action: 'word_update_document', token }))
                    .rejects.toThrow('Missing required parameters: documentId, content, contentType');
            });
        });

        // PowerPoint actions
        describe('PowerPoint actions', () => {
            beforeEach(() => {
                // Mock PowerPoint actions
                (powerPointActions.createPresentation as jest.Mock).mockResolvedValue({
                    id: 'presentation-1',
                    name: 'Presentation.pptx',
                    webUrl: 'https://example.com/presentation-1',
                    slideCount: 2
                });
                (powerPointActions.addSlide as jest.Mock).mockResolvedValue({
                    id: 'presentation-1',
                    name: 'Presentation.pptx',
                    webUrl: 'https://example.com/presentation-1',
                    slideCount: 3
                });
                (powerPointActions.exportPresentation as jest.Mock).mockResolvedValue({
                    id: 'presentation-1',
                    name: 'Presentation.pdf',
                    contentType: 'application/pdf',
                    content: 'base64-encoded-content'
                });
            });

            it('should handle powerpoint_create_presentation action', async () => {
                const name = 'Presentation.pptx';
                const slides = [
                    { title: 'Slide 1', content: 'Content 1' },
                    { title: 'Slide 2', content: 'Content 2' }
                ];
                const result = await execute({ action: 'powerpoint_create_presentation', token, name, slides });
                expect(powerPointActions.createPresentation).toHaveBeenCalledWith({ token, name, slides });
                expect(result).toEqual({
                    id: 'presentation-1',
                    name: 'Presentation.pptx',
                    webUrl: 'https://example.com/presentation-1',
                    slideCount: 2
                });
            });

            it('should throw an error if required parameters are missing for powerpoint_create_presentation', async () => {
                await expect(execute({ action: 'powerpoint_create_presentation', token }))
                    .rejects.toThrow('Missing required parameters: name, slides');
            });

            it('should handle powerpoint_add_slide action', async () => {
                const presentationId = 'presentation-1';
                const title = 'New Slide';
                const content = 'New Content';
                const result = await execute({ action: 'powerpoint_add_slide', token, presentationId, title, content });
                expect(powerPointActions.addSlide).toHaveBeenCalledWith({ token, presentationId, title, content });
                expect(result).toEqual({
                    id: 'presentation-1',
                    name: 'Presentation.pptx',
                    webUrl: 'https://example.com/presentation-1',
                    slideCount: 3
                });
            });

            it('should throw an error if required parameters are missing for powerpoint_add_slide', async () => {
                await expect(execute({ action: 'powerpoint_add_slide', token }))
                    .rejects.toThrow('Missing required parameters: presentationId, title, content');
            });

            it('should handle powerpoint_export_presentation action', async () => {
                const presentationId = 'presentation-1';
                const format = 'pdf';
                const result = await execute({ action: 'powerpoint_export_presentation', token, presentationId, format });
                expect(powerPointActions.exportPresentation).toHaveBeenCalledWith({ token, presentationId, format });
                expect(result).toEqual({
                    id: 'presentation-1',
                    name: 'Presentation.pdf',
                    contentType: 'application/pdf',
                    content: 'base64-encoded-content'
                });
            });

            it('should throw an error if required parameters are missing for powerpoint_export_presentation', async () => {
                await expect(execute({ action: 'powerpoint_export_presentation', token }))
                    .rejects.toThrow('Missing required parameters: presentationId, format');
            });
        });
    });
});
