# Google Drive Plugin for MintFlow

This plugin provides integration with Google Drive, allowing you to manage files and folders in your Google Drive account.

## Features

- Upload files to Google Drive
- Create, list, and search for folders and files
- Read, update, and delete files
- Manage file permissions
- Move and copy files
- Save Google Docs files as PDF
- Support for Team Drives

## Installation

```bash
npm install @mintflow/google-drive
```

## Authentication

To use this plugin, you need a Google Drive API token. You can get one by creating a project in the Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials
5. Use the OAuth 2.0 flow to get an access token
6. Use this token in your MintFlow workflows

## Usage

### Upload a File

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "upload_file",
    token: "your-google-drive-api-token",
    fileName: "example.txt",
    file: "SGVsbG8gV29ybGQh", // Base64 encoded "Hello World!"
    fileExtension: "txt",
    parentFolder: "folder-id", // Optional
    includeTeamDrives: false // Optional
  }
});
```

### Create a Folder

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "create_folder",
    token: "your-google-drive-api-token",
    folderName: "New Folder",
    parentFolder: "parent-folder-id", // Optional
    includeTeamDrives: false // Optional
  }
});
```

### List Files in a Folder

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "list_files",
    token: "your-google-drive-api-token",
    folderId: "folder-id",
    includeTrashed: false, // Optional
    includeTeamDrives: false // Optional
  }
});
```

### Search for Files

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "search_files",
    token: "your-google-drive-api-token",
    query: "report",
    includeTeamDrives: false // Optional
  }
});
```

### Get File Information

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "get_file",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    includeTeamDrives: false // Optional
  }
});
```

### Delete a File

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "delete_file",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    includeTeamDrives: false // Optional
  }
});
```

### Move a File to Trash

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "trash_file",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    includeTeamDrives: false // Optional
  }
});
```

### Move a File

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "move_file",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    destinationFolderId: "destination-folder-id",
    includeTeamDrives: false // Optional
  }
});
```

### Copy a File

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "copy_file",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    name: "Copy of File", // Optional
    parentFolder: "destination-folder-id", // Optional
    includeTeamDrives: false // Optional
  }
});
```

### Create a Text File

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "create_text_file",
    token: "your-google-drive-api-token",
    fileName: "note.txt",
    content: "This is a text file created with MintFlow.",
    parentFolder: "folder-id", // Optional
    includeTeamDrives: false // Optional
  }
});
```

### Read a File's Content

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "read_file",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    includeTeamDrives: false // Optional
  }
});
```

### Add a Permission

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "add_permission",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    type: "user", // "user", "group", "domain", or "anyone"
    role: "writer", // "owner", "organizer", "fileOrganizer", "writer", "commenter", or "reader"
    emailAddress: "user@example.com", // Required for "user" or "group" type
    domain: "example.com", // Required for "domain" type
    allowFileDiscovery: false, // Optional, for "domain" or "anyone" type
    sendNotificationEmail: true, // Optional
    emailMessage: "Please review this file", // Optional
    transferOwnership: false, // Optional, for "owner" role
    moveToNewOwnersRoot: false, // Optional, for "owner" role
    includeTeamDrives: false // Optional
  }
});
```

### Delete a Permission

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "delete_permission",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    permissionId: "permission-id",
    includeTeamDrives: false // Optional
  }
});
```

### Set Public Access

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "set_public_access",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    role: "reader", // "writer", "commenter", or "reader"
    includeTeamDrives: false // Optional
  }
});
```

### Save a File as PDF

```javascript
const result = await mintflow.run({
  plugin: "google-drive",
  input: {
    action: "save_file_as_pdf",
    token: "your-google-drive-api-token",
    fileId: "file-id",
    parentFolder: "folder-id", // Optional
    includeTeamDrives: false // Optional
  }
});
```

## API Reference

### Actions

- `upload_file`: Upload a file to Google Drive
- `create_folder`: Create a new folder
- `list_files`: List files in a folder
- `search_files`: Search for files
- `get_file`: Get file information
- `delete_file`: Delete a file permanently
- `trash_file`: Move a file to trash
- `move_file`: Move a file to a different folder
- `copy_file`: Copy a file
- `create_text_file`: Create a new text file
- `read_file`: Read a file's content
- `add_permission`: Add a permission to a file
- `delete_permission`: Delete a permission from a file
- `set_public_access`: Set public access to a file
- `save_file_as_pdf`: Save a Google Docs file as PDF

### Parameters

#### Common Parameters

- `action`: The action to perform (required)
- `token`: Your Google Drive API token (required)
- `includeTeamDrives`: Include team drives in the operation (optional)

#### Action-Specific Parameters

##### upload_file

- `fileName`: Name of the file (required)
- `file`: Base64 encoded file content (required)
- `fileExtension`: File extension (optional)
- `parentFolder`: ID of the parent folder (optional)

##### create_folder

- `folderName`: Name of the folder (required)
- `parentFolder`: ID of the parent folder (optional)

##### list_files

- `folderId`: ID of the folder to list files from (required)
- `includeTrashed`: Include trashed files in the results (optional)

##### search_files

- `query`: Search query (required)

##### get_file, delete_file, trash_file, read_file, save_file_as_pdf

- `fileId`: ID of the file (required)

##### move_file

- `fileId`: ID of the file (required)
- `destinationFolderId`: ID of the destination folder (required)

##### copy_file

- `fileId`: ID of the file (required)
- `name`: New name for the copied file (optional)
- `parentFolder`: ID of the parent folder (optional)

##### create_text_file

- `fileName`: Name of the file (required)
- `content`: Text content (required)
- `parentFolder`: ID of the parent folder (optional)

##### add_permission

- `fileId`: ID of the file (required)
- `type`: Type of permission (required)
- `role`: Role for the permission (required)
- `emailAddress`: Email address for user or group permission (required for "user" or "group" type)
- `domain`: Domain for domain permission (required for "domain" type)
- `allowFileDiscovery`: Allow file discovery for domain or anyone permission (optional)
- `sendNotificationEmail`: Send notification email to the user (optional)
- `emailMessage`: Message to include in the notification email (optional)
- `transferOwnership`: Transfer ownership to the user (optional)
- `moveToNewOwnersRoot`: Move the file to the new owner's root folder (optional)

##### delete_permission

- `fileId`: ID of the file (required)
- `permissionId`: ID of the permission to delete (required)

##### set_public_access

- `fileId`: ID of the file (required)
- `role`: Role for the permission (required)

## Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/reference)
- [Google Cloud Console](https://console.cloud.google.com/)
