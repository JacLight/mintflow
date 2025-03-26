import * as excelActions from './lib/actions/excel.js';
import * as wordActions from './lib/actions/word.js';
import * as powerPointActions from './lib/actions/powerpoint.js';
import * as sharePointActions from './lib/actions/sharepoint/index.js';
import * as outlookActions from './lib/actions/outlook/index.js';
import * as dynamicsActions from './lib/actions/dynamics/index.js';

const microsoftOfficePlugin = {
    name: "Microsoft Office",
    icon: "",
    description: "Work with Microsoft Office 365 services (Excel, Word, PowerPoint, SharePoint, Outlook, Dynamics)",
    groups: ["productivity"],
    tags: ["productivity","collaboration","organization","workflow","task"],
    version: '1.0.0',
    id: "microsoft-office",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    // Excel actions
                    'excel_list_workbooks',
                    'excel_get_worksheets',
                    'excel_get_worksheet_data',
                    'excel_add_row',
                    // Word actions
                    'word_create_document',
                    'word_read_document',
                    'word_update_document',
                    // PowerPoint actions
                    'powerpoint_create_presentation',
                    'powerpoint_add_slide',
                    'powerpoint_export_presentation',
                    // SharePoint actions
                    'sharepoint_list_sites',
                    'sharepoint_get_site',
                    'sharepoint_list_documents',
                    'sharepoint_upload_document',
                    'sharepoint_download_document',
                    // Outlook Calendar actions
                    'outlook_list_events',
                    'outlook_get_event',
                    'outlook_create_event',
                    'outlook_update_event',
                    'outlook_delete_event',
                    // Dynamics CRM actions
                    'dynamics_list_contacts',
                    'dynamics_get_contact',
                    'dynamics_create_contact',
                    'dynamics_update_contact',
                    'dynamics_delete_contact',
                    'dynamics_list_accounts',
                    'dynamics_get_account',
                    'dynamics_create_account',
                    'dynamics_update_account',
                    'dynamics_delete_account',
                    'dynamics_list_opportunities',
                    'dynamics_get_opportunity',
                    'dynamics_create_opportunity',
                    'dynamics_update_opportunity',
                    'dynamics_delete_opportunity'
                ],
                description: 'Action to perform on Microsoft Office documents',
            },
            token: {
                type: 'string',
                description: 'Microsoft Graph API OAuth token',
            },
            // Excel parameters
            workbookId: {
                type: 'string',
                description: 'Excel workbook ID',
                rules: [
                    { operation: 'notEqual', valueA: 'excel_get_worksheets', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'excel_get_worksheet_data', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'excel_add_row', valueB: '{{action}}', action: 'hide' },
                ],
            },
            worksheetId: {
                type: 'string',
                description: 'Excel worksheet ID',
                rules: [
                    { operation: 'notEqual', valueA: 'excel_get_worksheet_data', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'excel_add_row', valueB: '{{action}}', action: 'hide' },
                ],
            },
            range: {
                type: 'string',
                description: 'Excel range (e.g., A1:D10)',
                rules: [
                    { operation: 'notEqual', valueA: 'excel_get_worksheet_data', valueB: '{{action}}', action: 'hide' },
                ],
            },
            tableId: {
                type: 'string',
                description: 'Excel table ID',
                rules: [
                    { operation: 'notEqual', valueA: 'excel_add_row', valueB: '{{action}}', action: 'hide' },
                ],
            },
            values: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'Values for the new row',
                rules: [
                    { operation: 'notEqual', valueA: 'excel_add_row', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Word parameters
            name: {
                type: 'string',
                description: 'Document name',
                rules: [
                    { operation: 'notEqual', valueA: 'word_create_document', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'powerpoint_create_presentation', valueB: '{{action}}', action: 'hide' },
                ],
            },
            content: {
                type: 'string',
                description: 'Document content',
                rules: [
                    { operation: 'notEqual', valueA: 'word_create_document', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'word_update_document', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'powerpoint_add_slide', valueB: '{{action}}', action: 'hide' },
                ],
            },
            contentType: {
                type: 'string',
                enum: ['html', 'markdown', 'text'],
                description: 'Content type',
                rules: [
                    { operation: 'notEqual', valueA: 'word_create_document', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'word_update_document', valueB: '{{action}}', action: 'hide' },
                ],
            },
            documentId: {
                type: 'string',
                description: 'Document ID',
                rules: [
                    { operation: 'notEqual', valueA: 'word_read_document', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'word_update_document', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'sharepoint_download_document', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // SharePoint parameters
            siteId: {
                type: 'string',
                description: 'SharePoint site ID',
                rules: [
                    { operation: 'notEqual', valueA: 'sharepoint_get_site', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'sharepoint_list_documents', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'sharepoint_upload_document', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'sharepoint_download_document', valueB: '{{action}}', action: 'hide' },
                ],
            },
            libraryName: {
                type: 'string',
                description: 'SharePoint document library name',
                rules: [
                    { operation: 'notEqual', valueA: 'sharepoint_list_documents', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'sharepoint_upload_document', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Outlook Calendar parameters
            startDateTime: {
                type: 'string',
                description: 'Start date and time (ISO format)',
                rules: [
                    { operation: 'notEqual', valueA: 'outlook_list_events', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_create_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_update_event', valueB: '{{action}}', action: 'hide' },
                ],
            },
            endDateTime: {
                type: 'string',
                description: 'End date and time (ISO format)',
                rules: [
                    { operation: 'notEqual', valueA: 'outlook_list_events', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_create_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_update_event', valueB: '{{action}}', action: 'hide' },
                ],
            },
            eventId: {
                type: 'string',
                description: 'Calendar event ID',
                rules: [
                    { operation: 'notEqual', valueA: 'outlook_get_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_update_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_delete_event', valueB: '{{action}}', action: 'hide' },
                ],
            },
            subject: {
                type: 'string',
                description: 'Event subject',
                rules: [
                    { operation: 'notEqual', valueA: 'outlook_create_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_update_event', valueB: '{{action}}', action: 'hide' },
                ],
            },
            body: {
                type: 'string',
                description: 'Event body or document content',
                rules: [
                    { operation: 'notEqual', valueA: 'outlook_create_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_update_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'word_create_document', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'word_update_document', valueB: '{{action}}', action: 'hide' },
                ],
            },
            location: {
                type: 'string',
                description: 'Event location',
                rules: [
                    { operation: 'notEqual', valueA: 'outlook_create_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_update_event', valueB: '{{action}}', action: 'hide' },
                ],
            },
            attendees: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'Event attendees (email addresses)',
                rules: [
                    { operation: 'notEqual', valueA: 'outlook_create_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_update_event', valueB: '{{action}}', action: 'hide' },
                ],
            },
            isAllDay: {
                type: 'boolean',
                description: 'Whether the event is an all-day event',
                rules: [
                    { operation: 'notEqual', valueA: 'outlook_create_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'outlook_update_event', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Dynamics CRM parameters
            filter: {
                type: 'string',
                description: 'Filter expression for listing records',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_list_contacts', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_list_accounts', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_list_opportunities', valueB: '{{action}}', action: 'hide' },
                ],
            },
            top: {
                type: 'number',
                description: 'Maximum number of records to return',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_list_contacts', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_list_accounts', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_list_opportunities', valueB: '{{action}}', action: 'hide' },
                ],
            },
            contactId: {
                type: 'string',
                description: 'Dynamics CRM contact ID',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_get_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_delete_contact', valueB: '{{action}}', action: 'hide' },
                ],
            },
            firstName: {
                type: 'string',
                description: 'Contact first name',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_contact', valueB: '{{action}}', action: 'hide' },
                ],
            },
            lastName: {
                type: 'string',
                description: 'Contact last name',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_contact', valueB: '{{action}}', action: 'hide' },
                ],
            },
            email: {
                type: 'string',
                description: 'Email address',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_create_account', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_account', valueB: '{{action}}', action: 'hide' },
                ],
            },
            phone: {
                type: 'string',
                description: 'Phone number',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_create_account', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_account', valueB: '{{action}}', action: 'hide' },
                ],
            },
            company: {
                type: 'string',
                description: 'Company ID (for contacts)',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_contact', valueB: '{{action}}', action: 'hide' },
                ],
            },
            jobTitle: {
                type: 'string',
                description: 'Job title',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_contact', valueB: '{{action}}', action: 'hide' },
                ],
            },
            address: {
                type: 'object',
                properties: {
                    street: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    postalCode: { type: 'string' },
                    country: { type: 'string' }
                },
                description: 'Address information',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_create_account', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_account', valueB: '{{action}}', action: 'hide' },
                ],
            },
            accountId: {
                type: 'string',
                description: 'Dynamics CRM account ID',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_get_account', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_account', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_delete_account', valueB: '{{action}}', action: 'hide' },
                ],
            },
            website: {
                type: 'string',
                description: 'Website URL',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_account', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_account', valueB: '{{action}}', action: 'hide' },
                ],
            },
            industry: {
                type: 'number',
                description: 'Industry code',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_account', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_account', valueB: '{{action}}', action: 'hide' },
                ],
            },
            revenue: {
                type: 'number',
                description: 'Annual revenue',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_account', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_account', valueB: '{{action}}', action: 'hide' },
                ],
            },
            opportunityId: {
                type: 'string',
                description: 'Dynamics CRM opportunity ID',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_get_opportunity', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_opportunity', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_delete_opportunity', valueB: '{{action}}', action: 'hide' },
                ],
            },
            customerId: {
                type: 'string',
                description: 'Customer ID (account or contact)',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_opportunity', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_opportunity', valueB: '{{action}}', action: 'hide' },
                ],
            },
            estimatedValue: {
                type: 'number',
                description: 'Estimated value of the opportunity',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_opportunity', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_opportunity', valueB: '{{action}}', action: 'hide' },
                ],
            },
            estimatedCloseDate: {
                type: 'string',
                description: 'Estimated close date (ISO format)',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_opportunity', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_opportunity', valueB: '{{action}}', action: 'hide' },
                ],
            },
            description: {
                type: 'string',
                description: 'Description',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_opportunity', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_opportunity', valueB: '{{action}}', action: 'hide' },
                ],
            },
            probability: {
                type: 'number',
                description: 'Probability of closing (0-100)',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_create_opportunity', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'dynamics_update_opportunity', valueB: '{{action}}', action: 'hide' },
                ],
            },
            status: {
                type: 'number',
                description: 'Status code',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_update_opportunity', valueB: '{{action}}', action: 'hide' },
                ],
            },
            statusReason: {
                type: 'number',
                description: 'Status reason code',
                rules: [
                    { operation: 'notEqual', valueA: 'dynamics_update_opportunity', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // PowerPoint parameters
            slides: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Slide title'
                        },
                        content: {
                            type: 'string',
                            description: 'Slide content'
                        }
                    }
                },
                description: 'Slides for the new presentation',
                rules: [
                    { operation: 'notEqual', valueA: 'powerpoint_create_presentation', valueB: '{{action}}', action: 'hide' },
                ],
            },
            presentationId: {
                type: 'string',
                description: 'PowerPoint presentation ID',
                rules: [
                    { operation: 'notEqual', valueA: 'powerpoint_add_slide', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'powerpoint_export_presentation', valueB: '{{action}}', action: 'hide' },
                ],
            },
            title: {
                type: 'string',
                description: 'Slide title',
                rules: [
                    { operation: 'notEqual', valueA: 'powerpoint_add_slide', valueB: '{{action}}', action: 'hide' },
                ],
            },
            format: {
                type: 'string',
                enum: ['pdf', 'png', 'jpg'],
                description: 'Export format',
                rules: [
                    { operation: 'notEqual', valueA: 'powerpoint_export_presentation', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'excel_list_workbooks',
        token: 'your-microsoft-graph-api-token'
    },
    exampleOutput: {
        workbooks: [
            {
                id: "workbook-id-1",
                name: "Workbook 1.xlsx",
                webUrl: "https://onedrive.live.com/edit.aspx?cid=..."
            },
            {
                id: "workbook-id-2",
                name: "Workbook 2.xlsx",
                webUrl: "https://onedrive.live.com/edit.aspx?cid=..."
            }
        ]
    },
    documentation: "https://learn.microsoft.com/en-us/graph/api/overview",
    method: "exec",
    actions: [
        {
            name: 'microsoft-office',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    // Excel actions
                    case 'excel_list_workbooks': {
                        return {
                            workbooks: await excelActions.listWorkbooks({ token })
                        };
                    }

                    case 'excel_get_worksheets': {
                        const { workbookId } = input;

                        if (!workbookId) {
                            throw new Error('Missing required parameter: workbookId');
                        }

                        return {
                            worksheets: await excelActions.getWorksheets({ token, workbookId })
                        };
                    }

                    case 'excel_get_worksheet_data': {
                        const { workbookId, worksheetId, range } = input;

                        if (!workbookId || !worksheetId) {
                            throw new Error('Missing required parameters: workbookId, worksheetId');
                        }

                        return {
                            data: await excelActions.getWorksheetData({ token, workbookId, worksheetId, range })
                        };
                    }

                    case 'excel_add_row': {
                        const { workbookId, worksheetId, tableId, values } = input;

                        if (!workbookId || !worksheetId || !tableId || !values) {
                            throw new Error('Missing required parameters: workbookId, worksheetId, tableId, values');
                        }

                        return await excelActions.addRow({ token, workbookId, worksheetId, tableId, values });
                    }

                    // Word actions
                    case 'word_create_document': {
                        const { name, content, contentType } = input;

                        if (!name || !content || !contentType) {
                            throw new Error('Missing required parameters: name, content, contentType');
                        }

                        return await wordActions.createDocument({ token, name, content, contentType });
                    }

                    case 'word_read_document': {
                        const { documentId } = input;

                        if (!documentId) {
                            throw new Error('Missing required parameter: documentId');
                        }

                        return await wordActions.readDocument({ token, documentId });
                    }

                    case 'word_update_document': {
                        const { documentId, content, contentType } = input;

                        if (!documentId || !content || !contentType) {
                            throw new Error('Missing required parameters: documentId, content, contentType');
                        }

                        return await wordActions.updateDocument({ token, documentId, content, contentType });
                    }

                    // PowerPoint actions
                    case 'powerpoint_create_presentation': {
                        const { name, slides } = input;

                        if (!name || !slides) {
                            throw new Error('Missing required parameters: name, slides');
                        }

                        return await powerPointActions.createPresentation({ token, name, slides });
                    }

                    case 'powerpoint_add_slide': {
                        const { presentationId, title, content } = input;

                        if (!presentationId || !title || !content) {
                            throw new Error('Missing required parameters: presentationId, title, content');
                        }

                        return await powerPointActions.addSlide({ token, presentationId, title, content });
                    }

                    case 'powerpoint_export_presentation': {
                        const { presentationId, format } = input;

                        if (!presentationId || !format) {
                            throw new Error('Missing required parameters: presentationId, format');
                        }

                        return await powerPointActions.exportPresentation({ token, presentationId, format });
                    }

                    // SharePoint actions
                    case 'sharepoint_list_sites': {
                        return {
                            sites: await sharePointActions.listSites({ token })
                        };
                    }

                    case 'sharepoint_get_site': {
                        const { siteId } = input;

                        if (!siteId) {
                            throw new Error('Missing required parameter: siteId');
                        }

                        return await sharePointActions.getSite({ token, siteId });
                    }

                    case 'sharepoint_list_documents': {
                        const { siteId, libraryName } = input;

                        if (!siteId) {
                            throw new Error('Missing required parameter: siteId');
                        }

                        return {
                            documents: await sharePointActions.listDocuments({ token, siteId, libraryName })
                        };
                    }

                    case 'sharepoint_upload_document': {
                        const { siteId, libraryName, name, content } = input;

                        if (!siteId || !name || !content) {
                            throw new Error('Missing required parameters: siteId, name, content');
                        }

                        return await sharePointActions.uploadDocument({ token, siteId, libraryName, name, content });
                    }

                    case 'sharepoint_download_document': {
                        const { siteId, documentId } = input;

                        if (!siteId || !documentId) {
                            throw new Error('Missing required parameters: siteId, documentId');
                        }

                        return {
                            content: await sharePointActions.downloadDocument({ token, siteId, documentId })
                        };
                    }

                    // Outlook Calendar actions
                    case 'outlook_list_events': {
                        const { startDateTime, endDateTime } = input;

                        return {
                            events: await outlookActions.listEvents({ token, startDateTime, endDateTime })
                        };
                    }

                    case 'outlook_get_event': {
                        const { eventId } = input;

                        if (!eventId) {
                            throw new Error('Missing required parameter: eventId');
                        }

                        return await outlookActions.getEvent({ token, eventId });
                    }

                    case 'outlook_create_event': {
                        const { subject, body, start, end, location, attendees, isAllDay } = input;

                        if (!subject || !body || !start || !end) {
                            throw new Error('Missing required parameters: subject, body, start, end');
                        }

                        return await outlookActions.createEvent({ token, subject, body, start, end, location, attendees, isAllDay });
                    }

                    case 'outlook_update_event': {
                        const { eventId, subject, body, start, end, location, attendees, isAllDay } = input;

                        if (!eventId) {
                            throw new Error('Missing required parameter: eventId');
                        }

                        return await outlookActions.updateEvent({ token, eventId, subject, body, start, end, location, attendees, isAllDay });
                    }

                    case 'outlook_delete_event': {
                        const { eventId } = input;

                        if (!eventId) {
                            throw new Error('Missing required parameter: eventId');
                        }

                        await outlookActions.deleteEvent({ token, eventId });
                        return { success: true };
                    }

                    // Dynamics CRM actions
                    case 'dynamics_list_contacts': {
                        const { filter, top } = input;

                        return {
                            contacts: await dynamicsActions.listContacts({ token, filter, top })
                        };
                    }

                    case 'dynamics_get_contact': {
                        const { contactId } = input;

                        if (!contactId) {
                            throw new Error('Missing required parameter: contactId');
                        }

                        return await dynamicsActions.getContact({ token, contactId });
                    }

                    case 'dynamics_create_contact': {
                        const { firstName, lastName, email, phone, company, jobTitle, address } = input;

                        if (!firstName || !lastName) {
                            throw new Error('Missing required parameters: firstName, lastName');
                        }

                        return await dynamicsActions.createContact({ token, firstName, lastName, email, phone, company, jobTitle, address });
                    }

                    case 'dynamics_update_contact': {
                        const { contactId, firstName, lastName, email, phone, company, jobTitle, address } = input;

                        if (!contactId) {
                            throw new Error('Missing required parameter: contactId');
                        }

                        return await dynamicsActions.updateContact({ token, contactId, firstName, lastName, email, phone, company, jobTitle, address });
                    }

                    case 'dynamics_delete_contact': {
                        const { contactId } = input;

                        if (!contactId) {
                            throw new Error('Missing required parameter: contactId');
                        }

                        await dynamicsActions.deleteContact({ token, contactId });
                        return { success: true };
                    }

                    case 'dynamics_list_accounts': {
                        const { filter, top } = input;

                        return {
                            accounts: await dynamicsActions.listAccounts({ token, filter, top })
                        };
                    }

                    case 'dynamics_get_account': {
                        const { accountId } = input;

                        if (!accountId) {
                            throw new Error('Missing required parameter: accountId');
                        }

                        return await dynamicsActions.getAccount({ token, accountId });
                    }

                    case 'dynamics_create_account': {
                        const { name, email, phone, website, industry, revenue, address } = input;

                        if (!name) {
                            throw new Error('Missing required parameter: name');
                        }

                        return await dynamicsActions.createAccount({ token, name, email, phone, website, industry, revenue, address });
                    }

                    case 'dynamics_update_account': {
                        const { accountId, name, email, phone, website, industry, revenue, address } = input;

                        if (!accountId) {
                            throw new Error('Missing required parameter: accountId');
                        }

                        return await dynamicsActions.updateAccount({ token, accountId, name, email, phone, website, industry, revenue, address });
                    }

                    case 'dynamics_delete_account': {
                        const { accountId } = input;

                        if (!accountId) {
                            throw new Error('Missing required parameter: accountId');
                        }

                        await dynamicsActions.deleteAccount({ token, accountId });
                        return { success: true };
                    }

                    case 'dynamics_list_opportunities': {
                        const { filter, top } = input;

                        return {
                            opportunities: await dynamicsActions.listOpportunities({ token, filter, top })
                        };
                    }

                    case 'dynamics_get_opportunity': {
                        const { opportunityId } = input;

                        if (!opportunityId) {
                            throw new Error('Missing required parameter: opportunityId');
                        }

                        return await dynamicsActions.getOpportunity({ token, opportunityId });
                    }

                    case 'dynamics_create_opportunity': {
                        const { name, customerId, estimatedValue, estimatedCloseDate, description, probability } = input;

                        if (!name || !customerId) {
                            throw new Error('Missing required parameters: name, customerId');
                        }

                        return await dynamicsActions.createOpportunity({ token, name, customerId, estimatedValue, estimatedCloseDate, description, probability });
                    }

                    case 'dynamics_update_opportunity': {
                        const { opportunityId, name, customerId, estimatedValue, estimatedCloseDate, description, probability, status, statusReason } = input;

                        if (!opportunityId) {
                            throw new Error('Missing required parameter: opportunityId');
                        }

                        return await dynamicsActions.updateOpportunity({ token, opportunityId, name, customerId, estimatedValue, estimatedCloseDate, description, probability, status, statusReason });
                    }

                    case 'dynamics_delete_opportunity': {
                        const { opportunityId } = input;

                        if (!opportunityId) {
                            throw new Error('Missing required parameter: opportunityId');
                        }

                        await dynamicsActions.deleteOpportunity({ token, opportunityId });
                        return { success: true };
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default microsoftOfficePlugin;
