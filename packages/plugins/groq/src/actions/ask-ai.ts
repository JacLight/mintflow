import axios from 'axios';
import { z } from 'zod';

export const askAi = {
  name: 'ask_ai',
  displayName: 'Ask AI',
  description: 'Ask Groq anything using fast language models.',
  inputSchema: {
    type: 'object',
    properties: {
      model: {
        type: 'string',
        description: 'The model which will generate the completion.',
        enum: [
          'llama-3.1-70b-versatile',
          'llama-3.1-8b-versatile',
          'llama-3.1-70b-instruct',
          'llama-3.1-8b-instruct',
          'mixtral-8x7b-32768',
          'gemma-7b-it',
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
        description: 'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
        default: 0.9,
        required: false,
      },
      maxTokens: {
        type: 'number',
        description: 'The maximum number of tokens to generate. The total length of input tokens and generated tokens is limited by the model\'s context length.',
        default: 2048,
        required: false,
      },
      topP: {
        type: 'number',
        description: 'An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.',
        default: 1,
        required: false,
      },
      frequencyPenalty: {
        type: 'number',
        description: 'Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.',
        default: 0,
        required: false,
      },
      presencePenalty: {
        type: 'number',
        description: 'Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model\'s likelihood to talk about new topics.',
        default: 0.6,
        required: false,
      },
      roles: {
        type: 'array',
        description: 'Array of roles to specify more accurate response',
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
      content: {
        type: 'string',
        description: 'The generated text response',
      },
    },
  },
  exampleInput: {
    model: 'llama-3.1-70b-versatile',
    prompt: 'What is the capital of France?',
    temperature: 0.9,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0.6,
    roles: [
      { role: 'system', content: 'You are a helpful assistant.' },
    ],
  },
  exampleOutput: {
    content: 'The capital of France is Paris. Paris is located in the north-central part of the country on the Seine River. It is one of the world\'s most important and attractive cities, known for its art, culture, fashion, and cuisine. Paris is often referred to as the "City of Light" (La Ville Lumière) and is home to iconic landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.',
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

    // Add user prompt to message history
    const messageHistory = [...roles, {
      role: 'user',
      content: input.prompt,
    }];

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.apiKey}`,
        },
        data: {
          model: input.model,
          messages: messageHistory,
          temperature: input.temperature,
          max_completion_tokens: input.maxTokens,
          top_p: input.topP,
          frequency_penalty: input.frequencyPenalty,
          presence_penalty: input.presencePenalty,
        },
      });

      return {
        content: response.data.choices[0].message.content,
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Groq API error: ${error.response.status} - ${error.response.data.error?.message || error.response.statusText}`);
      }
      throw new Error(`Failed to make request to Groq: ${error.message}`);
    }
  },
};
