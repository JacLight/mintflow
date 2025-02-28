import axios from 'axios';
import { AssemblyAI } from 'assemblyai';

export const BASE_URL = 'https://api.assemblyai.com';

/**
 * Validates an AssemblyAI API key by making a request to the account endpoint
 * 
 * @param apiKey The AssemblyAI API key to validate
 * @returns A boolean indicating whether the API key is valid
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await axios.get(`${BASE_URL}/v2/account`, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Creates an AssemblyAI client instance
 * 
 * @param apiKey The AssemblyAI API key
 * @returns An AssemblyAI client instance
 */
export function createAssemblyAIClient(apiKey: string): AssemblyAI {
  return new AssemblyAI({
    apiKey,
    userAgent: {
      integration: {
        name: 'MintFlow',
        version: '1.0.0',
      },
    },
    baseUrl: BASE_URL,
  });
}
