import { z } from 'zod';

// Authentication types
export enum AuthType {
  NONE = 'none',
  BASIC = 'basic',
  HEADER = 'header',
}

// Response types
export enum ResponseType {
  JSON = 'json',
  RAW = 'raw',
  REDIRECT = 'redirect',
}

// Schema for webhook authentication
export const webhookAuthSchema = z.object({
  type: z.nativeEnum(AuthType),
  username: z.string().optional(),
  password: z.string().optional(),
  headerName: z.string().optional(),
  headerValue: z.string().optional(),
});

export type WebhookAuth = z.infer<typeof webhookAuthSchema>;

// Schema for webhook response
export const webhookResponseSchema = z.object({
  type: z.nativeEnum(ResponseType),
  status: z.number().optional().default(200),
  headers: z.record(z.string()).optional().default({}),
  body: z.any().optional(),
});

export type WebhookResponse = z.infer<typeof webhookResponseSchema>;

// Utility functions
export function verifyAuth(
  authenticationType: AuthType,
  authFields: Record<string, any>,
  headers: Record<string, string>
): boolean {
  switch (authenticationType) {
    case AuthType.NONE:
      return true;
    case AuthType.BASIC:
      return verifyBasicAuth(
        headers['authorization'],
        authFields['username'],
        authFields['password']
      );
    case AuthType.HEADER:
      return verifyHeaderAuth(
        headers,
        authFields['headerName'],
        authFields['headerValue']
      );
    default:
      throw new Error('Invalid authentication type');
  }
}

export function verifyHeaderAuth(
  headers: Record<string, string>,
  headerName: string,
  headerSecret: string
): boolean {
  if (!headerName || !headerSecret) {
    return false;
  }
  const headerValue = headers[headerName.toLowerCase()];
  return headerValue === headerSecret;
}

export function verifyBasicAuth(
  headerValue: string,
  username: string,
  password: string
): boolean {
  if (!headerValue || !username || !password) {
    return false;
  }
  if (!headerValue.toLowerCase().startsWith('basic ')) {
    return false;
  }
  const auth = headerValue.substring(6);
  const decodedAuth = Buffer.from(auth, 'base64').toString();
  const [receivedUsername, receivedPassword] = decodedAuth.split(':');
  return receivedUsername === username && receivedPassword === password;
}

export function ensureProtocol(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export function parseToJson(body: unknown): any {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (e: any) {
      throw new Error(`Invalid JSON: ${e.message}`);
    }
  }
  return JSON.parse(JSON.stringify(body));
}
