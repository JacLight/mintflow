/**
 * Creates an SNS client with the provided credentials
 */
import { SNSClient } from '@aws-sdk/client-sns';

/**
 * Creates an SNS client with the provided credentials
 * 
 * @param config - The configuration for the SNS client
 * @returns The SNS client
 */
export function createSNSClient(config: {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint?: string;
}): SNSClient {
  const sns = new SNSClient({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    region: config.region,
    endpoint: config.endpoint === '' ? undefined : config.endpoint,
  });
  
  return sns;
}
