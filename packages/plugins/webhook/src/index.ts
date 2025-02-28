import { z } from 'zod';
import { returnResponse } from './actions/index.js';
import { catchHook } from './triggers/index.js';
import { AuthType, ResponseType } from './common.js';

// Input schema for the webhook plugin
const webhookInputSchema = z.object({
  action: z.enum(['returnResponse', 'catchHook']),
  params: z.object({
    // Return response params
    responseType: z.nativeEnum(ResponseType).optional(),
    status: z.number().optional(),
    headers: z.record(z.string()).optional(),
    body: z.any().optional(),
    
    // Catch hook params
    authType: z.nativeEnum(AuthType).optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    headerName: z.string().optional(),
    headerValue: z.string().optional(),
  }),
  payload: z.any().optional(),
});

// Output schema for the webhook plugin
const webhookOutputSchema = z.object({
  result: z.any(),
});

// Main plugin definition
const webhookPlugin = {
  name: "webhook",
  icon: "🔗",
  description: "Receive and respond to HTTP webhooks",
  id: "webhook",
  runner: "node",
  inputSchema: webhookInputSchema.shape,
  outputSchema: webhookOutputSchema.shape,
  exampleInput: {
    action: "returnResponse",
    params: {
      responseType: ResponseType.JSON,
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        message: "Success"
      }
    }
  },
  exampleOutput: {
    result: {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        message: "Success"
      }
    }
  },
  documentation: "https://docs.mintflow.com/plugins/webhook",
  method: "exec",
  exec: async (input: any) => {
    const { action, params, payload } = input;

    switch (action) {
      case 'returnResponse':
        const response = await returnResponse(params);
        return { result: response };
      
      case 'catchHook':
        const hookResult = await catchHook(params, payload);
        return { result: hookResult };
      
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }
};

export default webhookPlugin;
