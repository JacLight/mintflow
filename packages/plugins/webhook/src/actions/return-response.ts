import { ResponseType, ensureProtocol, parseToJson } from '../common.js';

export interface ReturnResponseParams {
  responseType: ResponseType;
  status?: number;
  headers?: Record<string, string>;
  body: any;
}

export async function returnResponse(params: ReturnResponseParams): Promise<any> {
  const { responseType, status = 200, headers = {}, body } = params;
  
  const response: any = {
    status,
    headers,
  };

  switch (responseType) {
    case ResponseType.JSON:
      response.body = parseToJson(body);
      break;
    case ResponseType.RAW:
      response.body = body;
      break;
    case ResponseType.REDIRECT:
      response.status = 301;
      response.headers = { ...response.headers, Location: ensureProtocol(body) };
      break;
    default:
      throw new Error(`Unsupported response type: ${responseType}`);
  }

  return response;
}
