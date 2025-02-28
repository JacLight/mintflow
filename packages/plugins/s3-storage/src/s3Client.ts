import { S3, S3ClientConfig } from '@aws-sdk/client-s3';

// S3 client configuration
export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  endpoint?: string;
}

// Create an S3 client instance
export function createS3Client(config: S3Config): S3 {
  const s3Config: S3ClientConfig = {
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    region: config.region,
  };

  // Add endpoint if provided (for S3-compatible services)
  if (config.endpoint && config.endpoint.trim() !== '') {
    s3Config.endpoint = config.endpoint;
    s3Config.forcePathStyle = true;
  }

  return new S3(s3Config);
}
