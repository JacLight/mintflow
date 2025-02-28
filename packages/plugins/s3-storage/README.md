# MintFlow S3 Storage Plugin

A MintFlow plugin for interacting with Amazon S3 and S3-compatible storage services.

## Features

- **Upload Files**: Upload files to S3 buckets with customizable settings
- **Read Files**: Retrieve files from S3 buckets
- **List Files**: List files in S3 buckets with optional filtering
- **S3-Compatible Services**: Works with any S3-compatible storage service, not just AWS

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Usage

### Authentication

The S3 Storage plugin requires AWS credentials or compatible S3 service credentials:

1. **Access Key ID**: Your AWS Access Key ID or compatible service access key
2. **Secret Access Key**: Your AWS Secret Access Key or compatible service secret key
3. **Region**: The AWS region or compatible service region
4. **Bucket**: The S3 bucket name
5. **Endpoint** (optional): Custom endpoint URL for S3-compatible services

### Actions

#### Upload File

Uploads a file to an S3 bucket.

```json
{
  "action": "upload_file",
  "accessKeyId": "your-access-key",
  "secretAccessKey": "your-secret-key",
  "region": "us-east-1",
  "bucket": "your-bucket",
  "fileData": "base64-encoded-file-data",
  "fileName": "example.txt",
  "contentType": "text/plain",
  "acl": "private"
}
```

**Parameters:**

- `fileData`: Base64-encoded file data
- `fileName`: Name to use for the uploaded file (including extension)
- `contentType`: MIME type of the file (e.g., image/png, application/pdf)
- `acl` (optional): Access Control List for the uploaded file (private, public-read, etc.)

**Response:**

```json
{
  "key": "example.txt",
  "etag": "\"d41d8cd98f00b204e9800998ecf8427e\"",
  "url": "https://your-bucket.s3.us-east-1.amazonaws.com/example.txt"
}
```

#### Read File

Retrieves a file from an S3 bucket.

```json
{
  "action": "read_file",
  "accessKeyId": "your-access-key",
  "secretAccessKey": "your-secret-key",
  "region": "us-east-1",
  "bucket": "your-bucket",
  "key": "example.txt"
}
```

**Parameters:**

- `key`: Key (path) of the file to read

**Response:**

```json
{
  "key": "example.txt",
  "contentType": "text/plain",
  "contentLength": 11,
  "lastModified": "2023-01-01T00:00:00.000Z",
  "etag": "\"d41d8cd98f00b204e9800998ecf8427e\"",
  "fileData": "base64-encoded-file-data"
}
```

#### List Files

Lists files in an S3 bucket.

```json
{
  "action": "list_files",
  "accessKeyId": "your-access-key",
  "secretAccessKey": "your-secret-key",
  "region": "us-east-1",
  "bucket": "your-bucket",
  "prefix": "folder/",
  "maxKeys": 1000
}
```

**Parameters:**

- `prefix` (optional): Prefix (folder path) to list files from
- `maxKeys` (optional): Maximum number of keys to return (default: 1000)

**Response:**

```json
{
  "files": [
    {
      "Key": "folder/file1.txt",
      "LastModified": "2023-01-01T00:00:00.000Z",
      "ETag": "\"d41d8cd98f00b204e9800998ecf8427e\"",
      "Size": 11,
      "StorageClass": "STANDARD"
    },
    {
      "Key": "folder/file2.txt",
      "LastModified": "2023-01-02T00:00:00.000Z",
      "ETag": "\"d41d8cd98f00b204e9800998ecf8427f\"",
      "Size": 22,
      "StorageClass": "STANDARD"
    }
  ],
  "isTruncated": false,
  "nextContinuationToken": null
}
```

## Example Workflow

Here's an example of how to use the S3 Storage plugin in a MintFlow workflow:

```javascript
// Upload a file to S3
const fileData = Buffer.from('Hello World').toString('base64');

const uploadResult = await mintflow.execute('s3-storage', {
  action: 'upload_file',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
  bucket: 'my-bucket',
  fileData: fileData,
  fileName: 'hello.txt',
  contentType: 'text/plain',
  acl: 'private'
});

// Read the file back from S3
const readResult = await mintflow.execute('s3-storage', {
  action: 'read_file',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
  bucket: 'my-bucket',
  key: 'hello.txt'
});

// List files in a folder
const listResult = await mintflow.execute('s3-storage', {
  action: 'list_files',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
  bucket: 'my-bucket',
  prefix: 'folder/'
});
```

## Using with S3-Compatible Services

The plugin works with any S3-compatible storage service, not just AWS S3. To use with a compatible service, provide the custom endpoint URL:

```json
{
  "action": "upload_file",
  "accessKeyId": "your-access-key",
  "secretAccessKey": "your-secret-key",
  "region": "us-east-1",
  "bucket": "your-bucket",
  "endpoint": "https://your-s3-compatible-service.com",
  "fileData": "base64-encoded-file-data",
  "fileName": "example.txt",
  "contentType": "text/plain"
}
```

Compatible services include:

- MinIO
- DigitalOcean Spaces
- Backblaze B2
- Wasabi
- Linode Object Storage
- Scaleway Object Storage
- And many others

## Error Handling

The plugin provides descriptive error messages for common issues:

- Missing required parameters
- Invalid action names
- S3 API errors (with the original error message from S3)

## Security Considerations

- Never hardcode your S3 credentials in your workflows. Use environment variables or a secure secret management system.
- Use the minimum required permissions for your S3 credentials.
- Consider using pre-signed URLs for temporary access to S3 resources.
- Be careful with ACL settings when uploading files. Use 'private' unless you specifically need public access.

## Development

### Building the Plugin

```bash
cd packages/plugins/s3-storage
npm run build
```

### Running Tests

```bash
cd packages/plugins/s3-storage
npm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
