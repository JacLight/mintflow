import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import s3StoragePlugin from '../src/index';
import { S3 } from '@aws-sdk/client-s3';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn();
  
  return {
    S3: jest.fn().mockImplementation(() => ({
      send: mockSend
    })),
    GetObjectCommand: jest.fn(),
    PutObjectCommand: jest.fn(),
    ListObjectsV2Command: jest.fn()
  };
});

describe('s3StoragePlugin', () => {
  let mockS3Client: any;
  let executeS3Storage: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a mock S3 client
    mockS3Client = new S3();
    
    // Get the execute function from the plugin
    executeS3Storage = s3StoragePlugin.actions[0].execute;
  });

  it('should upload a file successfully', async () => {
    // Mock the S3 client send method to return a successful response
    mockS3Client.send.mockResolvedValueOnce({
      ETag: '"d41d8cd98f00b204e9800998ecf8427e"'
    });

    const input = {
      action: 'upload_file',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      region: 'us-east-1',
      bucket: 'test-bucket',
      fileData: 'SGVsbG8gV29ybGQ=', // Base64 encoded "Hello World"
      fileName: 'hello.txt',
      contentType: 'text/plain',
      acl: 'private'
    };

    // Pass the mockS3Client in the context
    const result = await executeS3Storage(input, { s3Client: mockS3Client });
    
    // Verify the result
    expect(result).toEqual({
      key: 'hello.txt',
      etag: '"d41d8cd98f00b204e9800998ecf8427e"',
      url: 'https://test-bucket.s3.us-east-1.amazonaws.com/hello.txt'
    });
    
    // Verify the S3 client was called with the correct parameters
    expect(mockS3Client.send).toHaveBeenCalledTimes(1);
  });

  it('should read a file successfully', async () => {
    // Create a mock readable stream
    const mockStream = {
      on: jest.fn((event: string, callback: any) => {
        if (event === 'data') {
          callback(Buffer.from('Hello World'));
        }
        if (event === 'end') {
          callback();
        }
        return mockStream;
      })
    };

    // Mock the S3 client send method to return a successful response
    mockS3Client.send.mockResolvedValueOnce({
      Body: mockStream,
      ContentType: 'text/plain',
      ContentLength: 11,
      LastModified: new Date('2023-01-01'),
      ETag: '"d41d8cd98f00b204e9800998ecf8427e"'
    });

    const input = {
      action: 'read_file',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      region: 'us-east-1',
      bucket: 'test-bucket',
      key: 'hello.txt'
    };

    // Pass the mockS3Client in the context
    const result = await executeS3Storage(input, { s3Client: mockS3Client });
    
    // Verify the result
    expect(result).toEqual({
      key: 'hello.txt',
      contentType: 'text/plain',
      contentLength: 11,
      lastModified: expect.any(Date),
      etag: '"d41d8cd98f00b204e9800998ecf8427e"',
      fileData: 'SGVsbG8gV29ybGQ=' // Base64 encoded "Hello World"
    });
    
    // Verify the S3 client was called with the correct parameters
    expect(mockS3Client.send).toHaveBeenCalledTimes(1);
  });

  it('should list files successfully', async () => {
    // Mock the S3 client send method to return a successful response
    mockS3Client.send.mockResolvedValueOnce({
      Contents: [
        {
          Key: 'file1.txt',
          LastModified: new Date('2023-01-01'),
          ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
          Size: 11,
          StorageClass: 'STANDARD'
        },
        {
          Key: 'file2.txt',
          LastModified: new Date('2023-01-02'),
          ETag: '"d41d8cd98f00b204e9800998ecf8427f"',
          Size: 22,
          StorageClass: 'STANDARD'
        }
      ],
      IsTruncated: false,
      NextContinuationToken: null
    });

    const input = {
      action: 'list_files',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      region: 'us-east-1',
      bucket: 'test-bucket',
      prefix: 'folder/'
    };

    // Pass the mockS3Client in the context
    const result = await executeS3Storage(input, { s3Client: mockS3Client });
    
    // Verify the result
    expect(result).toEqual({
      files: [
        {
          Key: 'file1.txt',
          LastModified: expect.any(Date),
          ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
          Size: 11,
          StorageClass: 'STANDARD'
        },
        {
          Key: 'file2.txt',
          LastModified: expect.any(Date),
          ETag: '"d41d8cd98f00b204e9800998ecf8427f"',
          Size: 22,
          StorageClass: 'STANDARD'
        }
      ],
      isTruncated: false,
      nextContinuationToken: null
    });
    
    // Verify the S3 client was called with the correct parameters
    expect(mockS3Client.send).toHaveBeenCalledTimes(1);
  });

  it('should throw an error for invalid action', async () => {
    const input = {
      action: 'invalid_action',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      region: 'us-east-1',
      bucket: 'test-bucket'
    };

    // Pass the mockS3Client in the context
    await expect(executeS3Storage(input, { s3Client: mockS3Client })).rejects.toThrow('Unsupported action: invalid_action');
  });

  it('should throw an error for missing required parameters', async () => {
    const input = {
      action: 'upload_file',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      region: 'us-east-1',
      bucket: 'test-bucket'
      // Missing fileData and fileName
    };

    // Pass the mockS3Client in the context
    await expect(executeS3Storage(input, { s3Client: mockS3Client })).rejects.toThrow('Missing required parameter: fileData');
  });

  it('should handle S3 errors', async () => {
    // Mock the S3 client send method to throw an error
    mockS3Client.send.mockRejectedValueOnce(new Error('S3 error'));

    const input = {
      action: 'upload_file',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      region: 'us-east-1',
      bucket: 'test-bucket',
      fileData: 'SGVsbG8gV29ybGQ=', // Base64 encoded "Hello World"
      fileName: 'hello.txt',
      contentType: 'text/plain',
      acl: 'private'
    };

    // Pass the mockS3Client in the context
    await expect(executeS3Storage(input, { s3Client: mockS3Client })).rejects.toThrow('S3 Storage error: S3 error');
  });
});
