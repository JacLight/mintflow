# MintFlow Supabase Plugin

A MintFlow plugin for integrating with Supabase, the open-source Firebase alternative with PostgreSQL at its core.

## Features

- **Storage Management**: Upload, download, list, and delete files in Supabase Storage buckets
- **Database Operations**: Execute queries, insert, update, and delete records in Supabase tables
- **Bucket Management**: Create new storage buckets with customizable access settings

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Configuration

The Supabase plugin requires the following configuration:

```json
{
  "url": "https://your-project.supabase.co",
  "apiKey": "your-service-api-key"
}
```

| Parameter | Description | Required |
|-----------|-------------|----------|
| url | The URL of your Supabase project | Yes |
| apiKey | The service API key for your Supabase project | Yes |

You can find these values in your Supabase project dashboard under Project Settings > API.

## Usage

### Storage Operations

#### Upload File

Upload a file to Supabase Storage.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'uploadFile',
  bucket: 'my-bucket',
  filePath: 'folder/file.jpg',
  fileContent: 'base64-encoded-content',
  contentType: 'image/jpeg' // Optional
});

console.log(result.data.publicUrl); // URL to access the file
```

#### Download File

Download a file from Supabase Storage.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'downloadFile',
  bucket: 'my-bucket',
  filePath: 'folder/file.jpg'
});

console.log(result.data.base64); // Base64-encoded file content
console.log(result.data.size); // File size in bytes
console.log(result.data.type); // File MIME type
```

#### List Files

List files in a Supabase Storage bucket.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'listFiles',
  bucket: 'my-bucket',
  path: 'folder/', // Optional
  limit: 100, // Optional
  offset: 0, // Optional
  sortBy: { // Optional
    column: 'name',
    order: 'asc'
  }
});

console.log(result.data); // Array of file objects
```

#### Delete File

Delete a file from Supabase Storage.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'deleteFile',
  bucket: 'my-bucket',
  filePath: 'folder/file.jpg'
});

console.log(result.data); // Deletion result
```

#### Create Bucket

Create a new storage bucket in Supabase.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'createBucket',
  bucketName: 'my-new-bucket',
  isPublic: true // Optional, defaults to false
});

console.log(result.data); // Bucket creation result
```

### Database Operations

#### Execute Query

Execute a query on your Supabase database.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'executeQuery',
  table: 'users',
  select: 'id, name, email', // Optional, defaults to '*'
  filter: { // Optional
    role: 'admin',
    active: true
  },
  order: { // Optional
    column: 'created_at',
    ascending: false
  },
  limit: 10, // Optional
  offset: 0 // Optional
});

console.log(result.data); // Array of matching records
```

#### Insert Record

Insert a new record into a Supabase table.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'insertRecord',
  table: 'users',
  record: {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    created_at: new Date().toISOString()
  }
});

console.log(result.data); // Inserted record
```

#### Update Record

Update records in a Supabase table.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'updateRecord',
  table: 'users',
  filter: {
    id: 123
  },
  updates: {
    role: 'admin',
    updated_at: new Date().toISOString()
  }
});

console.log(result.data); // Updated records
```

#### Delete Record

Delete records from a Supabase table.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'deleteRecord',
  table: 'users',
  filter: {
    id: 123
  }
});

console.log(result.data); // Deleted records
```

## Error Handling

All actions will return an error property if the operation fails. You can check for this property to handle errors gracefully.

```javascript
const result = await mintflow.execute('supabase', {
  action: 'executeQuery',
  table: 'non_existent_table'
});

if (result.error) {
  console.error('Supabase error:', result.error);
  // Handle the error appropriately
} else {
  console.log('Query results:', result.data);
}
```

## Example Workflow

Here's an example of how to use the Supabase plugin in a MintFlow workflow:

```javascript
// Get user data from a form submission
const userData = {
  name: input.data.name,
  email: input.data.email,
  role: 'user',
  created_at: new Date().toISOString()
};

// Insert the user into the database
const insertResult = await mintflow.execute('supabase', {
  action: 'insertRecord',
  table: 'users',
  record: userData
});

if (insertResult.error) {
  return {
    success: false,
    message: `Failed to create user: ${insertResult.error}`
  };
}

// Upload profile picture if provided
if (input.data.profilePicture) {
  const uploadResult = await mintflow.execute('supabase', {
    action: 'uploadFile',
    bucket: 'profile-pictures',
    filePath: `${insertResult.data[0].id}.jpg`,
    fileContent: input.data.profilePicture,
    contentType: 'image/jpeg'
  });
  
  if (!uploadResult.error) {
    // Update user record with profile picture URL
    await mintflow.execute('supabase', {
      action: 'updateRecord',
      table: 'users',
      filter: { id: insertResult.data[0].id },
      updates: { profile_picture_url: uploadResult.data.publicUrl }
    });
  }
}

// Return success message
return {
  success: true,
  message: `User created with ID: ${insertResult.data[0].id}`,
  user: insertResult.data[0]
};
```

## Security Considerations

- The plugin uses the Supabase client library which handles authentication securely
- API keys are stored securely and never exposed in client-side code
- All database operations use parameterized queries to prevent SQL injection

## Limitations

- The plugin requires a valid Supabase URL and API key
- Some operations may be limited by your Supabase plan's quotas and limits
- Real-time subscriptions are not currently supported

## Development

### Building the Plugin

```bash
cd packages/plugins/supabase
pnpm build
```

### Running Tests

```bash
cd packages/plugins/supabase
pnpm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
