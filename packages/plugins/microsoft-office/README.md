# Microsoft Office Plugin for MintFlow

This plugin provides integration with Microsoft Office 365 services, allowing you to work with Excel, Word, PowerPoint, SharePoint, Outlook Calendar, and Dynamics 365 from your MintFlow workflows.

## Features

### Excel

- **Read Workbooks**: List workbooks and read their contents
- **Manage Worksheets**: Create, read, update, and delete worksheets
- **Work with Tables**: Create, read, update, and delete tables
- **Manipulate Data**: Read and write data to cells, rows, and columns

### Word

- **Create Documents**: Create new Word documents with formatted content
- **Read Documents**: Extract text and content from Word documents
- **Update Documents**: Modify existing Word documents
- **Convert Documents**: Convert between different formats (DOCX, PDF)

### PowerPoint

- **Create Presentations**: Create new PowerPoint presentations
- **Manage Slides**: Add, update, and delete slides
- **Work with Content**: Add text, images, and shapes to slides
- **Export Presentations**: Export presentations to different formats

### SharePoint

- **Manage Sites**: List and retrieve SharePoint sites
- **Document Libraries**: Work with document libraries in SharePoint sites
- **Document Management**: Upload, download, and list documents in SharePoint

### Outlook Calendar

- **Event Management**: Create, read, update, and delete calendar events
- **Schedule Management**: List events within a date range
- **Attendee Management**: Add and manage attendees for events

### Dynamics 365

- **Contact Management**: Create, read, update, and delete contacts
- **Account Management**: Create, read, update, and delete accounts
- **Opportunity Management**: Create, read, update, and delete sales opportunities
- **Data Filtering**: Filter and search for records using query expressions

## Authentication

To use this plugin, you need a Microsoft Graph API OAuth token. You'll need to register an application in the Azure Portal and obtain the necessary credentials.

### How to obtain a Microsoft Graph API token

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Enter a name for your application
5. Select the appropriate account types (single tenant or multi-tenant)
6. Add a redirect URI (e.g., `https://your-app.com/auth/callback`)
7. Click "Register"
8. Note the Application (client) ID and Directory (tenant) ID
9. Under "Certificates & secrets", create a new client secret
10. Under "API permissions", add the following Microsoft Graph permissions:
    - `Files.ReadWrite.All` - For file operations (Excel, Word, PowerPoint)
    - `Sites.ReadWrite.All` - For SharePoint operations
    - `Calendars.ReadWrite` - For Outlook Calendar operations
    - `Dynamics.ReadWrite.All` - For Dynamics 365 operations
11. Request admin consent for these permissions
12. Use these credentials to obtain an OAuth token via the OAuth 2.0 flow

## Usage

### Excel

#### List Workbooks

```javascript
{
  "action": "excel_list_workbooks",
  "token": "your-microsoft-graph-api-token"
}
```

#### Get Worksheets

```javascript
{
  "action": "excel_get_worksheets",
  "token": "your-microsoft-graph-api-token",
  "workbookId": "workbook-id"
}
```

#### Read Worksheet Data

```javascript
{
  "action": "excel_get_worksheet_data",
  "token": "your-microsoft-graph-api-token",
  "workbookId": "workbook-id",
  "worksheetId": "worksheet-id",
  "range": "A1:D10" // Optional
}
```

#### Add Row to Table

```javascript
{
  "action": "excel_add_row",
  "token": "your-microsoft-graph-api-token",
  "workbookId": "workbook-id",
  "worksheetId": "worksheet-id",
  "tableId": "table-id",
  "values": ["Value1", "Value2", "Value3"]
}
```

### Word

#### Create Document

```javascript
{
  "action": "word_create_document",
  "token": "your-microsoft-graph-api-token",
  "name": "New Document.docx",
  "content": "<html><body><h1>Hello World</h1><p>This is a test document.</p></body></html>",
  "contentType": "html" // Options: html, markdown, text
}
```

#### Read Document

```javascript
{
  "action": "word_read_document",
  "token": "your-microsoft-graph-api-token",
  "documentId": "document-id"
}
```

#### Update Document

```javascript
{
  "action": "word_update_document",
  "token": "your-microsoft-graph-api-token",
  "documentId": "document-id",
  "content": "<html><body><h1>Updated Title</h1><p>This document has been updated.</p></body></html>",
  "contentType": "html" // Options: html, markdown, text
}
```

### PowerPoint

#### Create Presentation

```javascript
{
  "action": "powerpoint_create_presentation",
  "token": "your-microsoft-graph-api-token",
  "name": "New Presentation.pptx",
  "slides": [
    {
      "title": "Slide 1",
      "content": "This is the content of slide 1"
    },
    {
      "title": "Slide 2",
      "content": "This is the content of slide 2"
    }
  ]
}
```

#### Add Slide

```javascript
{
  "action": "powerpoint_add_slide",
  "token": "your-microsoft-graph-api-token",
  "presentationId": "presentation-id",
  "title": "New Slide",
  "content": "This is the content of the new slide"
}
```

#### Export Presentation

```javascript
{
  "action": "powerpoint_export_presentation",
  "token": "your-microsoft-graph-api-token",
  "presentationId": "presentation-id",
  "format": "pdf" // Options: pdf, png, jpg
}
```

### SharePoint

#### List Sites

```javascript
{
  "action": "sharepoint_list_sites",
  "token": "your-microsoft-graph-api-token"
}
```

#### Get Site

```javascript
{
  "action": "sharepoint_get_site",
  "token": "your-microsoft-graph-api-token",
  "siteId": "site-id"
}
```

#### List Documents

```javascript
{
  "action": "sharepoint_list_documents",
  "token": "your-microsoft-graph-api-token",
  "siteId": "site-id",
  "libraryName": "Documents" // Optional, defaults to "Documents"
}
```

#### Upload Document

```javascript
{
  "action": "sharepoint_upload_document",
  "token": "your-microsoft-graph-api-token",
  "siteId": "site-id",
  "libraryName": "Documents", // Optional, defaults to "Documents"
  "name": "New Document.docx",
  "content": "Document content"
}
```

#### Download Document

```javascript
{
  "action": "sharepoint_download_document",
  "token": "your-microsoft-graph-api-token",
  "siteId": "site-id",
  "documentId": "document-id"
}
```

### Outlook Calendar

#### List Events

```javascript
{
  "action": "outlook_list_events",
  "token": "your-microsoft-graph-api-token",
  "startDateTime": "2025-01-01T00:00:00Z", // Optional
  "endDateTime": "2025-01-31T23:59:59Z" // Optional
}
```

#### Get Event

```javascript
{
  "action": "outlook_get_event",
  "token": "your-microsoft-graph-api-token",
  "eventId": "event-id"
}
```

#### Create Event

```javascript
{
  "action": "outlook_create_event",
  "token": "your-microsoft-graph-api-token",
  "subject": "Team Meeting",
  "body": "Weekly team meeting to discuss project progress",
  "start": "2025-01-15T10:00:00Z",
  "end": "2025-01-15T11:00:00Z",
  "location": "Conference Room A", // Optional
  "attendees": ["user1@example.com", "user2@example.com"], // Optional
  "isAllDay": false // Optional
}
```

#### Update Event

```javascript
{
  "action": "outlook_update_event",
  "token": "your-microsoft-graph-api-token",
  "eventId": "event-id",
  "subject": "Updated Team Meeting", // Optional
  "body": "Updated meeting description", // Optional
  "start": "2025-01-15T11:00:00Z", // Optional
  "end": "2025-01-15T12:00:00Z", // Optional
  "location": "Conference Room B", // Optional
  "attendees": ["user1@example.com", "user3@example.com"], // Optional
  "isAllDay": false // Optional
}
```

#### Delete Event

```javascript
{
  "action": "outlook_delete_event",
  "token": "your-microsoft-graph-api-token",
  "eventId": "event-id"
}
```

### Dynamics 365

#### List Contacts

```javascript
{
  "action": "dynamics_list_contacts",
  "token": "your-microsoft-graph-api-token",
  "filter": "contains(firstname, 'John')", // Optional
  "top": 10 // Optional
}
```

#### Get Contact

```javascript
{
  "action": "dynamics_get_contact",
  "token": "your-microsoft-graph-api-token",
  "contactId": "contact-id"
}
```

#### Create Contact

```javascript
{
  "action": "dynamics_create_contact",
  "token": "your-microsoft-graph-api-token",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com", // Optional
  "phone": "123-456-7890", // Optional
  "company": "account-id", // Optional
  "jobTitle": "Software Engineer", // Optional
  "address": { // Optional
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "USA"
  }
}
```

#### Update Contact

```javascript
{
  "action": "dynamics_update_contact",
  "token": "your-microsoft-graph-api-token",
  "contactId": "contact-id",
  "firstName": "John", // Optional
  "lastName": "Smith", // Optional
  "email": "john.smith@example.com", // Optional
  "phone": "123-456-7890", // Optional
  "company": "account-id", // Optional
  "jobTitle": "Senior Software Engineer", // Optional
  "address": { // Optional
    "street": "456 Market St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "USA"
  }
}
```

#### Delete Contact

```javascript
{
  "action": "dynamics_delete_contact",
  "token": "your-microsoft-graph-api-token",
  "contactId": "contact-id"
}
```

#### List Accounts

```javascript
{
  "action": "dynamics_list_accounts",
  "token": "your-microsoft-graph-api-token",
  "filter": "contains(name, 'Acme')", // Optional
  "top": 10 // Optional
}
```

#### Get Account

```javascript
{
  "action": "dynamics_get_account",
  "token": "your-microsoft-graph-api-token",
  "accountId": "account-id"
}
```

#### Create Account

```javascript
{
  "action": "dynamics_create_account",
  "token": "your-microsoft-graph-api-token",
  "name": "Acme Corporation",
  "email": "info@acme.com", // Optional
  "phone": "123-456-7890", // Optional
  "website": "https://acme.com", // Optional
  "industry": 1, // Optional
  "revenue": 1000000, // Optional
  "address": { // Optional
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "USA"
  }
}
```

#### Update Account

```javascript
{
  "action": "dynamics_update_account",
  "token": "your-microsoft-graph-api-token",
  "accountId": "account-id",
  "name": "Acme Inc.", // Optional
  "email": "info@acmeinc.com", // Optional
  "phone": "123-456-7890", // Optional
  "website": "https://acmeinc.com", // Optional
  "industry": 2, // Optional
  "revenue": 2000000, // Optional
  "address": { // Optional
    "street": "456 Market St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "USA"
  }
}
```

#### Delete Account

```javascript
{
  "action": "dynamics_delete_account",
  "token": "your-microsoft-graph-api-token",
  "accountId": "account-id"
}
```

#### List Opportunities

```javascript
{
  "action": "dynamics_list_opportunities",
  "token": "your-microsoft-graph-api-token",
  "filter": "contains(name, 'New Deal')", // Optional
  "top": 10 // Optional
}
```

#### Get Opportunity

```javascript
{
  "action": "dynamics_get_opportunity",
  "token": "your-microsoft-graph-api-token",
  "opportunityId": "opportunity-id"
}
```

#### Create Opportunity

```javascript
{
  "action": "dynamics_create_opportunity",
  "token": "your-microsoft-graph-api-token",
  "name": "New Software Deal",
  "customerId": "account-id",
  "estimatedValue": 50000, // Optional
  "estimatedCloseDate": "2025-06-30", // Optional
  "description": "New software licensing deal", // Optional
  "probability": 75 // Optional
}
```

#### Update Opportunity

```javascript
{
  "action": "dynamics_update_opportunity",
  "token": "your-microsoft-graph-api-token",
  "opportunityId": "opportunity-id",
  "name": "Updated Software Deal", // Optional
  "customerId": "account-id", // Optional
  "estimatedValue": 75000, // Optional
  "estimatedCloseDate": "2025-07-31", // Optional
  "description": "Updated software licensing deal", // Optional
  "probability": 90, // Optional
  "status": 1, // Optional
  "statusReason": 2 // Optional
}
```

#### Delete Opportunity

```javascript
{
  "action": "dynamics_delete_opportunity",
  "token": "your-microsoft-graph-api-token",
  "opportunityId": "opportunity-id"
}
```

## Response Examples

### Excel List Workbooks Response

```json
{
  "workbooks": [
    {
      "id": "workbook-id-1",
      "name": "Workbook 1.xlsx",
      "webUrl": "https://onedrive.live.com/edit.aspx?cid=..."
    },
    {
      "id": "workbook-id-2",
      "name": "Workbook 2.xlsx",
      "webUrl": "https://onedrive.live.com/edit.aspx?cid=..."
    }
  ]
}
```

### Word Read Document Response

```json
{
  "id": "document-id",
  "name": "Document.docx",
  "content": "This is the content of the document...",
  "contentType": "text"
}
```

### PowerPoint Create Presentation Response

```json
{
  "id": "presentation-id",
  "name": "New Presentation.pptx",
  "webUrl": "https://onedrive.live.com/edit.aspx?cid=...",
  "slideCount": 2
}
```

### SharePoint List Sites Response

```json
{
  "sites": [
    {
      "id": "site-id-1",
      "name": "Team Site",
      "displayName": "Marketing Team Site",
      "webUrl": "https://contoso.sharepoint.com/sites/marketing",
      "description": "Marketing team collaboration site"
    },
    {
      "id": "site-id-2",
      "name": "Project Site",
      "displayName": "Project Alpha Site",
      "webUrl": "https://contoso.sharepoint.com/sites/projectalpha",
      "description": "Project Alpha collaboration site"
    }
  ]
}
```

### Outlook List Events Response

```json
{
  "events": [
    {
      "id": "event-id-1",
      "subject": "Team Meeting",
      "bodyPreview": "Weekly team meeting to discuss project progress",
      "start": {
        "dateTime": "2025-01-15T10:00:00Z",
        "timeZone": "UTC"
      },
      "end": {
        "dateTime": "2025-01-15T11:00:00Z",
        "timeZone": "UTC"
      },
      "location": "Conference Room A",
      "organizer": {
        "name": "John Doe",
        "address": "john.doe@example.com"
      },
      "attendees": [
        {
          "name": "Jane Smith",
          "address": "jane.smith@example.com"
        }
      ],
      "isAllDay": false
    }
  ]
}
```

### Dynamics List Contacts Response

```json
{
  "contacts": [
    {
      "id": "contact-id-1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "123-456-7890",
      "company": "account-id-1",
      "jobTitle": "Software Engineer",
      "address": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "postalCode": "94105",
        "country": "USA"
      }
    },
    {
      "id": "contact-id-2",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "phone": "987-654-3210",
      "company": "account-id-2",
      "jobTitle": "Product Manager",
      "address": {
        "street": "456 Market St",
        "city": "San Francisco",
        "state": "CA",
        "postalCode": "94105",
        "country": "USA"
      }
    }
  ]
}
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid API token
- API rate limits exceeded
- Resource not found
- Validation errors from Microsoft Graph API

## Limitations

- This plugin requires a valid Microsoft Graph API token
- API rate limits apply as per Microsoft's policies
- Some operations may require additional permissions or features enabled on your Microsoft 365 account
- For security reasons, this plugin should only be used in server-side contexts

## Documentation

For more information about the Microsoft Graph API, refer to the [official documentation](https://learn.microsoft.com/en-us/graph/api/overview).
