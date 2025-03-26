import { S3, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, ObjectCannedACL } from '@aws-sdk/client-s3';
import { createS3Client, S3Config } from './s3Client.js';

// Default S3 client instance
let defaultS3Client: S3 | null = null;

// S3 Storage Plugin
const s3StoragePlugin = {
    name: "S3 Storage",
    icon: "",
    description: "Interact with Amazon S3 and S3-compatible storage services",
    groups: ["file"],
    tags: ["file","document","storage","media","content"],
    version: '1.0.0',
    id: "s3-storage",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: ['upload_file', 'read_file', 'list_files'],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform',
            },
            // Authentication
            accessKeyId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'AWS Access Key ID or compatible S3 service access key',
            },
            secretAccessKey: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'AWS Secret Access Key or compatible S3 service secret key',
            },
            region: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'AWS Region or compatible S3 service region',
            },
            bucket: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'S3 Bucket name',
            },
            endpoint: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Custom endpoint URL (for S3-compatible services)',
                rules: [{ operation: 'equal', valueA: true, valueB: '{{useCustomEndpoint}}', action: 'show' }],
            },
            // Upload File properties
            fileData: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Base64-encoded file data to upload',
                rules: [{ operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' }],
            },
            fileName: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Name to use for the uploaded file (including extension)',
                rules: [{ operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' }],
            },
            contentType: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'MIME type of the file (e.g., image/png, application/pdf)',
                rules: [{ operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' }],
            },
            acl: {
                type: 'string',
                enum: [
                    'private',
                    'public-read',
                    'public-read-write',
                    'authenticated-read',
                    'aws-exec-read',
                    'bucket-owner-read',
                    'bucket-owner-full-control'
                ],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Access Control List for the uploaded file',
                rules: [{ operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' }],
            },
            // Read File properties
            key: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Key (path) of the file to read',
                rules: [
                    { operation: 'notEqual', valueA: 'read_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // List Files properties
            prefix: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Prefix (folder path) to list files from',
                rules: [{ operation: 'notEqual', valueA: 'list_files', valueB: '{{action}}', action: 'hide' }],
            },
            maxKeys: {
                type: 'number',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Maximum number of keys to return',
                rules: [{ operation: 'notEqual', valueA: 'list_files', valueB: '{{action}}', action: 'hide' }],
            },
        },
        required: ['action', 'accessKeyId', 'secretAccessKey', 'region', 'bucket'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'upload_file',
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        region: 'us-east-1',
        bucket: 'my-bucket',
        fileData: 'SGVsbG8gV29ybGQ=', // Base64 encoded "Hello World"
        fileName: 'hello.txt',
        contentType: 'text/plain',
        acl: 'private'
    },
    exampleOutput: {
        key: 'hello.txt',
        etag: '"d41d8cd98f00b204e9800998ecf8427e"',
        url: 'https://my-bucket.s3.amazonaws.com/hello.txt'
    },
    documentation: "https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html",
    method: "exec",
    actions: [
        {
            name: 's3Storage',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, accessKeyId, secretAccessKey, region, bucket, endpoint } = input;

                if (!action) {
                    throw new Error('Missing required parameter: action');
                }

                // Create S3 client configuration
                const s3Config: S3Config = {
                    accessKeyId,
                    secretAccessKey,
                    region,
                    bucket,
                    endpoint
                };

                // Create or reuse S3 client
                const s3Client = context?.s3Client || defaultS3Client || createS3Client(s3Config);
                
                // Store client for reuse if not provided in context
                if (!context?.s3Client && !defaultS3Client) {
                    defaultS3Client = s3Client;
                }

                try {
                    switch (action) {
                        case 'upload_file': {
                            const { fileData, fileName, contentType, acl } = input;

                            if (!fileData) {
                                throw new Error('Missing required parameter: fileData');
                            }
                            if (!fileName) {
                                throw new Error('Missing required parameter: fileName');
                            }

                            // Decode base64 file data
                            const buffer = Buffer.from(fileData, 'base64');

                            // Upload file to S3
                            const uploadParams = {
                                Bucket: bucket,
                                Key: fileName,
                                Body: buffer,
                                ContentType: contentType,
                                ACL: acl as ObjectCannedACL | undefined
                            };

                            const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));

                            // Construct the URL to the uploaded file
                            let fileUrl = '';
                            if (endpoint) {
                                // For custom endpoints
                                fileUrl = `${endpoint}/${bucket}/${fileName}`;
                            } else {
                                // For AWS S3
                                fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
                            }

                            return {
                                key: fileName,
                                etag: uploadResult.ETag,
                                url: fileUrl
                            };
                        }

                        case 'read_file': {
                            const { key } = input;

                            if (!key) {
                                throw new Error('Missing required parameter: key');
                            }

                            // Get file from S3
                            const getParams = {
                                Bucket: bucket,
                                Key: key
                            };

                            const getResult = await s3Client.send(new GetObjectCommand(getParams));
                            
                            // Convert stream to buffer
                            const streamToBuffer = async (stream: any): Promise<Buffer> => {
                                return new Promise((resolve, reject) => {
                                    const chunks: Buffer[] = [];
                                    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
                                    stream.on('error', reject);
                                    stream.on('end', () => resolve(Buffer.concat(chunks)));
                                });
                            };

                            // Get file content as buffer
                            const fileBuffer = await streamToBuffer(getResult.Body);
                            
                            // Convert buffer to base64
                            const fileData = fileBuffer.toString('base64');

                            return {
                                key,
                                contentType: getResult.ContentType,
                                contentLength: getResult.ContentLength,
                                lastModified: getResult.LastModified,
                                etag: getResult.ETag,
                                fileData
                            };
                        }

                        case 'list_files': {
                            const { prefix, maxKeys } = input;

                            // List files in S3 bucket
                            const listParams: any = {
                                Bucket: bucket,
                                MaxKeys: maxKeys || 1000
                            };

                            if (prefix) {
                                listParams.Prefix = prefix;
                            }

                            const listResult = await s3Client.send(new ListObjectsV2Command(listParams));

                            return {
                                files: listResult.Contents || [],
                                isTruncated: listResult.IsTruncated,
                                nextContinuationToken: listResult.NextContinuationToken
                            };
                        }

                        default:
                            throw new Error(`Unsupported action: ${action}`);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        throw new Error(`S3 Storage error: ${error.message}`);
                    }
                    throw error;
                }
            }
        }
    ]
};

export { createS3Client };
export type { S3Config };
export default s3StoragePlugin;
