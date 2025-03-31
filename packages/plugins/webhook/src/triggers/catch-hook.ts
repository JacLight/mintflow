import { AuthType, verifyAuth } from '../common.js';

export interface CatchHookParams {
  authType: AuthType;
  username?: string;
  password?: string;
  headerName?: string;
  headerValue?: string;
}

export async function catchHook(
  params: CatchHookParams,
  payload: any
): Promise<any> {
  const { authType } = params;
  
  if (!authType) {
    throw new Error('Authentication type is required');
  }

  const authFields: Record<string, any> = {};
  
  if (authType === AuthType.BASIC) {
    authFields.username = params.username;
    authFields.password = params.password;
  } else if (authType === AuthType.HEADER) {
    authFields.headerName = params.headerName;
    authFields.headerValue = params.headerValue;
  }

  const headers = payload.headers || {};
  
  const verified = verifyAuth(authType, authFields, headers);
  
  if (!verified) {
    throw new Error('Authentication failed');
  }

  return payload;
}
