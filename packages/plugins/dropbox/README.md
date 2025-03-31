# Dropbox Plugin for MintFlow

This plugin provides integration with Dropbox, allowing you to interact with files and folders in your Dropbox account.

## Features

- Upload files to Dropbox
- List folder contents
- Search for files and folders
- Create, delete, move, and copy files and folders
- Get shared links for files
- Create text files

## Installation

```bash
npm install @mintflow/dropbox
```

## Authentication

To use this plugin, you need a Dropbox API token. You can get one by creating an app in the Dropbox developer console:

1. Go to [https://www.dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)
2. Click "Create app"
3. Choose "Scoped access" for API
4. Choose the type of access your app needs
5. Name your app and click "Create app"
6. In the "OAuth 2" section, generate an access token
7. Use this token in your MintFlow workflows

## Usage

### Upload a File

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "upload_file",
    token: "your-dropbox-api-token",
    path: "/example/file.txt",
    file: "SGVsbG8gV29ybGQh", // Base64 encoded "Hello World!"
    autorename: true,
    mute: false
  }
});
```

### List Folder Contents

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "list_folder",
    token: "your-dropbox-api-token",
    path: "/example",
    recursive: false,
    limit: 100
  }
});
```

### Search for Files

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "search",
    token: "your-dropbox-api-token",
    query: "report",
    path: "/documents",
    max_results: 50,
    file_status: "active",
    filename_only: false
  }
});
```

### Create a Folder

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "create_folder",
    token: "your-dropbox-api-token",
    path: "/example/newfolder",
    autorename: true
  }
});
```

### Delete a File

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "delete_file",
    token: "your-dropbox-api-token",
    path: "/example/file.txt"
  }
});
```

### Delete a Folder

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "delete_folder",
    token: "your-dropbox-api-token",
    path: "/example/folder"
  }
});
```

### Move a File

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "move_file",
    token: "your-dropbox-api-token",
    from_path: "/example/file.txt",
    to_path: "/example/subfolder/file.txt",
    autorename: true,
    allow_ownership_transfer: false
  }
});
```

### Move a Folder

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "move_folder",
    token: "your-dropbox-api-token",
    from_path: "/example/folder",
    to_path: "/example/parent/folder",
    autorename: true,
    allow_ownership_transfer: false
  }
});
```

### Copy a File

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "copy_file",
    token: "your-dropbox-api-token",
    from_path: "/example/file.txt",
    to_path: "/example/copy_of_file.txt",
    autorename: true
  }
});
```

### Copy a Folder

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "copy_folder",
    token: "your-dropbox-api-token",
    from_path: "/example/folder",
    to_path: "/example/copy_of_folder",
    autorename: true
  }
});
```

### Get a Shared Link for a File

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "get_file_link",
    token: "your-dropbox-api-token",
    path: "/example/file.txt",
    short_url: true
  }
});
```

### Create a Text File

```javascript
const result = await mintflow.run({
  plugin: "dropbox",
  input: {
    action: "create_text_file",
    token: "your-dropbox-api-token",
    path: "/example/note.txt",
    content: "This is a text file created with MintFlow.",
    autorename: true,
    mute: false
  }
});
```

## API Reference

### Actions

- `upload_file`: Upload a file to Dropbox
- `list_folder`: List contents of a folder
- `search`: Search for files and folders
- `create_folder`: Create a new folder
- `delete_file`: Delete a file
- `delete_folder`: Delete a folder
- `move_file`: Move a file to a new location
- `move_folder`: Move a folder to a new location
- `copy_file`: Copy a file to a new location
- `copy_folder`: Copy a folder to a new location
- `get_file_link`: Get a shared link for a file
- `create_text_file`: Create a new text file

### Parameters

#### Common Parameters

- `action`: The action to perform (required)
- `token`: Your Dropbox API token (required)

#### Action-Specific Parameters

##### upload_file

- `path`: The path where the file should be saved (required)
- `file`: Base64 encoded file content (required)
- `autorename`: Auto rename file if it already exists (optional)
- `mute`: Mute notifications (optional)
- `strict_conflict`: Be more strict about how conflicts are detected (optional)

##### list_folder

- `path`: The path of the folder to list (required)
- `recursive`: List folder contents recursively (optional)
- `limit`: Maximum number of results to return (optional)

##### search

- `query`: Search query (required)
- `path`: The path to search in (optional)
- `max_results`: Maximum number of search results (optional)
- `file_status`: File status to search for (`active` or `deleted`) (optional)
- `filename_only`: Search in filenames only (optional)

##### create_folder

- `path`: The path where the folder should be created (required)
- `autorename`: Auto rename folder if it already exists (optional)

##### delete_file, delete_folder

- `path`: The path of the file or folder to delete (required)

##### move_file, move_folder

- `from_path`: Source path (required)
- `to_path`: Destination path (required)
- `autorename`: Auto rename if destination already exists (optional)
- `allow_ownership_transfer`: Allow ownership transfer (optional)

##### copy_file, copy_folder

- `from_path`: Source path (required)
- `to_path`: Destination path (required)
- `autorename`: Auto rename if destination already exists (optional)

##### get_file_link

- `path`: The path of the file (required)
- `short_url`: Create a short URL (optional)

##### create_text_file

- `path`: The path where the file should be saved (required)
- `content`: Text content (required)
- `autorename`: Auto rename file if it already exists (optional)
- `mute`: Mute notifications (optional)
- `strict_conflict`: Be more strict about how conflicts are detected (optional)

## Resources

- [Dropbox API Documentation](https://www.dropbox.com/developers/documentation/http/documentation)
- [Dropbox Developer Console](https://www.dropbox.com/developers/apps)
