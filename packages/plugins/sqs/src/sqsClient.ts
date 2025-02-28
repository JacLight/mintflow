/**
 * Creates an SQS client with the provided credentials
 */
import { SQSClient } from '@aws-sdk/client-sqs';

/**
 * Creates an SQS client with the provided credentials
 * 
 * @param config - The configuration for the SQS client
 * @returns The SQS client
 */
export function createSQSClient(config: {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint?: string;
}): SQSClient {
  const sqs = new SQSClient({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    region: config.region,
    endpoint: config.endpoint === '' ? undefined : config.endpoint,
  });
  
  return sqs;
}
