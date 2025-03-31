import axios from 'axios';
import { z } from 'zod';

export const askAi = {
  name: 'ask_ai',
  displayName: 'Ask AI',
  description: 'Enables users to generate prompt completion based on a specified model.',
  inputSchema: {
    type: 'object',
    properties: {
      model: {
        type: 'string',
        description: 'The model to use for generating completions',
        enum: [
          'llama-3.1-sonar-small-128k-online',
          'llama-3.1-sonar-large-128k-online',
          'llama-3.1-sonar-huge-128k-online',
          'llama-3.1-sonar-small-128k-chat',
          'llama-3.1-sonar-large-128k-chat',
          'llama-3.1-8b-instruct',
          'llama-3.1-70b-instruct',
        ],
        required: true,
      },
      prompt: {
        type: 'string',
        description: 'The question or prompt to send to the model',
        required: true,
      },
      temperature: {
        type: 'number',
        description: 'The amount of randomness in the response. Higher values are more random, and lower values are more deterministic.',
        default: 0.2,
        required: false,
      },
      max_tokens: {
        type: 'number',
        description: 'The maximum number of tokens to generate. Please refer to the model documentation for token limits.',
        required: false,
      },
      top_p: {
        type: 'number',
        description: 'The nucleus sampling threshold, valued between 0 and 1 inclusive. For each subsequent token, the model considers the results of the tokens with top_p probability mass.',
        default: 0.9,
        required: false,
      },
      presence_penalty: {
        type: 'number',
        description: 'Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the mode\'s likelihood to talk about new topics.',
        default: 0,
        required: false,
      },
      frequency_penalty: {
        type: 'number',
        description: 'A multiplicative penalty greater than 0. Values greater than 1.0 penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.',
        default: 1.0,
        required: false,
      },
      roles: {
        type: 'array',
        description: 'Array of roles to specify more accurate response. After the (optional) system message, user and assistant roles should alternate with user then assistant, ending in user.',
        items: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['system', 'user', 'assistant'],
            },
            content: {
              type: 'string',
            },
          },
          required: ['role', 'content'],
        },
        default: [
          { role: 'system', content: 'You are a helpful assistant.' },
        ],
        required: false,
      },
    },
    required: ['model', 'prompt'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: {
        type: 'string',
        description: 'The generated text response',
      },
      citations: {
        type: 'array',
        description: 'Citations for the information provided in the response',
        items: {
          type: 'object',
        },
      },
    },
  },
  exampleInput: {
    model: 'llama-3.1-sonar-small-128k-online',
    prompt: 'What is the capital of France?',
    temperature: 0.2,
    top_p: 0.9,
    presence_penalty: 0,
    frequency_penalty: 1.0,
    roles: [
      { role: 'system', content: 'You are a helpful assistant.' },
    ],
  },
  exampleOutput: {
    result: 'The capital of France is Paris. Paris is located in the north-central part of the country on the Seine River. It is one of the world\'s most important and attractive cities, known for its art, culture, fashion, and cuisine. Paris is often referred to as the "City of Light" (La Ville Lumière) and is home to iconic landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.',
    citations: [
      {
        start: 0,
        end: 30,
        text: 'The capital of France is Paris.',
        url: 'https://en.wikipedia.org/wiki/Paris',
      },
    ],
  },
  async execute(input: any, auth: { apiKey: string }): Promise<any> {
    // Validate temperature
    const temperatureSchema = z.number().min(0).max(2).optional();
    try {
      temperatureSchema.parse(input.temperature);
    } catch (error) {
      throw new Error('Temperature must be between 0 and 2');
    }

    // Process roles
    const rolesArray = input.roles || [{ role: 'system', content: 'You are a helpful assistant.' }];
    const roles = rolesArray.map((item: any) => {
      const rolesEnum = ['system', 'user', 'assistant'];
      if (!rolesEnum.includes(item.role)) {
        throw new Error('The only available roles are: [system, user, assistant]');
      }

      return {
        role: item.role,
        content: item.content,
      };
    });

    // Add the user prompt
    roles.push({ role: 'user', content: input.prompt });

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://api.perplexity.ai/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.apiKey}`,
        },
        data: {
          model: input.model,
          messages: roles,
          temperature: input.temperature,
          max_tokens: input.max_tokens,
          top_p: input.top_p,
          presence_penalty: input.presence_penalty,
          frequency_penalty: input.frequency_penalty,
        },
      });

      if (response.status === 200) {
        return {
          result: response.data.choices[0].message.content,
          citations: response.data.citations,
        };
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Perplexity AI API error: ${error.response.status} - ${error.response.data.error?.message || error.response.statusText}`);
      }
      throw new Error(`Failed to make request to Perplexity AI: ${error.message}`);
    }
  },
};
