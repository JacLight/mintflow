import { streaming } from '../index.js';
import { Tool } from '../tools/Tool.js';

/**
 * Options for streaming
 */
export interface StreamingOptions {
  /**
   * The provider to use
   */
  provider: 'openai' | 'anthropic';
  
  /**
   * The model to use
   */
  model: string;
  
  /**
   * The API key to use
   */
  apiKey: string;
  
  /**
   * Optional temperature for the model
   */
  temperature?: number;
  
  /**
   * Optional maximum number of tokens to generate
   */
  maxTokens?: number;
  
  /**
   * Optional top-p value for the model
   */
  topP?: number;
  
  /**
   * Optional frequency penalty for the model
   */
  frequencyPenalty?: number;
  
  /**
   * Optional presence penalty for the model
   */
  presencePenalty?: number;
  
  /**
   * Optional stop sequences for the model
   */
  stop?: string[];
  
  /**
   * Optional base URL for the API
   */
  baseURL?: string;
  
  /**
   * Optional organization ID for OpenAI
   */
  organization?: string;
}

/**
 * Options for streaming chain
 */
export interface StreamingChainOptions extends StreamingOptions {
  /**
   * The prompt template to use
   */
  prompt: string;
  
  /**
   * Optional input variables
   */
  inputVariables?: string[];
  
  /**
   * Optional output variables
   */
  outputVariables?: string[];
}

/**
 * Options for streaming agent
 */
export interface StreamingAgentOptions extends StreamingOptions {
  /**
   * The tools available to the agent
   */
  tools: Tool[];
  
  /**
   * Optional system prompt
   */
  systemPrompt?: string;
  
  /**
   * Optional maximum number of steps
   */
  maxSteps?: number;
}

/**
 * Streaming plugin for LangChain
 */
const streamingPlugin = {
  name: 'Streaming',
  icon: 'GiWaterSplash',
  description: 'Stream responses from LLMs, chains, and agents',
  id: 'streaming',
  runner: 'node',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        enum: ['openai', 'anthropic'],
        description: 'The provider to use'
      },
      model: {
        type: 'string',
        description: 'The model to use'
      },
      apiKey: {
        type: 'string',
        description: 'The API key to use'
      },
      prompt: {
        type: 'string',
        description: 'The prompt template to use'
      },
      input: {
        type: 'string',
        description: 'The input to the prompt'
      },
      temperature: {
        type: 'number',
        description: 'The temperature for the model'
      },
      maxTokens: {
        type: 'number',
        description: 'The maximum number of tokens to generate'
      },
      tools: {
        type: 'array',
        description: 'The tools available to the agent'
      },
      systemPrompt: {
        type: 'string',
        description: 'The system prompt for the agent'
      },
      maxSteps: {
        type: 'number',
        description: 'The maximum number of steps for the agent'
      }
    },
    required: ['provider', 'model', 'apiKey']
  },
  outputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The generated text'
      },
      tokens: {
        type: 'array',
        description: 'The tokens of the response'
      },
      isComplete: {
        type: 'boolean',
        description: 'Whether the response is complete'
      }
    }
  },
  documentation: 'https://js.langchain.com/docs/modules/model_io/models/chat/',
  method: 'exec',
  actions: [
    {
      name: 'Stream LLM',
      description: 'Stream responses from an LLM',
      id: 'streamLLM',
      inputSchema: {
        type: 'object',
        properties: {
          provider: {
            type: 'string',
            enum: ['openai', 'anthropic'],
            description: 'The provider to use'
          },
          model: {
            type: 'string',
            description: 'The model to use'
          },
          apiKey: {
            type: 'string',
            description: 'The API key to use'
          },
          prompt: {
            type: 'string',
            description: 'The prompt to complete'
          },
          temperature: {
            type: 'number',
            description: 'The temperature for the model'
          },
          maxTokens: {
            type: 'number',
            description: 'The maximum number of tokens to generate'
          }
        },
        required: ['provider', 'model', 'apiKey', 'prompt']
      },
      outputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The generated text'
          },
          tokens: {
            type: 'array',
            description: 'The tokens of the response'
          },
          isComplete: {
            type: 'boolean',
            description: 'Whether the response is complete'
          }
        }
      },
      async exec(input: StreamingOptions & { prompt: string }) {
        // Create the streaming LLM
        const llm = streaming.createStreamingLLM(input.provider, {
          apiKey: input.apiKey,
          model: input.model,
          temperature: input.temperature,
          maxTokens: input.maxTokens,
          topP: input.topP,
          frequencyPenalty: input.frequencyPenalty,
          presencePenalty: input.presencePenalty,
          stop: input.stop,
          baseURL: input.baseURL,
          organization: input.organization
        });
        
        // Complete the prompt
        const response = await llm.complete(input.prompt);
        
        // Return the response
        return {
          text: response.text,
          tokens: response.tokens,
          isComplete: response.isComplete
        };
      }
    },
    {
      name: 'Stream Chain',
      description: 'Stream responses from a chain',
      id: 'streamChain',
      inputSchema: {
        type: 'object',
        properties: {
          provider: {
            type: 'string',
            enum: ['openai', 'anthropic'],
            description: 'The provider to use'
          },
          model: {
            type: 'string',
            description: 'The model to use'
          },
          apiKey: {
            type: 'string',
            description: 'The API key to use'
          },
          prompt: {
            type: 'string',
            description: 'The prompt template to use'
          },
          input: {
            type: 'object',
            description: 'The input variables'
          },
          temperature: {
            type: 'number',
            description: 'The temperature for the model'
          },
          maxTokens: {
            type: 'number',
            description: 'The maximum number of tokens to generate'
          }
        },
        required: ['provider', 'model', 'apiKey', 'prompt', 'input']
      },
      outputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The generated text'
          },
          tokens: {
            type: 'array',
            description: 'The tokens of the response'
          },
          isComplete: {
            type: 'boolean',
            description: 'Whether the response is complete'
          },
          inputVariables: {
            type: 'object',
            description: 'The input variables'
          },
          outputVariables: {
            type: 'object',
            description: 'The output variables'
          }
        }
      },
      async exec(input: StreamingChainOptions & { input: Record<string, any> }) {
        // Create the streaming LLM
        const llm = streaming.createStreamingLLM(input.provider, {
          apiKey: input.apiKey,
          model: input.model,
          temperature: input.temperature,
          maxTokens: input.maxTokens,
          topP: input.topP,
          frequencyPenalty: input.frequencyPenalty,
          presencePenalty: input.presencePenalty,
          stop: input.stop,
          baseURL: input.baseURL,
          organization: input.organization
        });
        
        // Create the streaming chain
        const chain = streaming.createStreamingChain(llm, input.prompt, {
          inputVariables: input.inputVariables,
          outputVariables: input.outputVariables
        });
        
        // Stream the chain
        const response = await chain.stream(input.input);
        
        // Return the response
        return {
          text: response.text,
          tokens: response.tokens,
          isComplete: response.isComplete,
          inputVariables: response.inputVariables,
          outputVariables: response.outputVariables
        };
      }
    },
    {
      name: 'Stream Agent',
      description: 'Stream responses from an agent',
      id: 'streamAgent',
      inputSchema: {
        type: 'object',
        properties: {
          provider: {
            type: 'string',
            enum: ['openai', 'anthropic'],
            description: 'The provider to use'
          },
          model: {
            type: 'string',
            description: 'The model to use'
          },
          apiKey: {
            type: 'string',
            description: 'The API key to use'
          },
          query: {
            type: 'string',
            description: 'The query to run the agent with'
          },
          tools: {
            type: 'array',
            description: 'The tools available to the agent'
          },
          systemPrompt: {
            type: 'string',
            description: 'The system prompt for the agent'
          },
          maxSteps: {
            type: 'number',
            description: 'The maximum number of steps for the agent'
          },
          temperature: {
            type: 'number',
            description: 'The temperature for the model'
          },
          maxTokens: {
            type: 'number',
            description: 'The maximum number of tokens to generate'
          }
        },
        required: ['provider', 'model', 'apiKey', 'query', 'tools']
      },
      outputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The generated text'
          },
          tokens: {
            type: 'array',
            description: 'The tokens of the response'
          },
          isComplete: {
            type: 'boolean',
            description: 'Whether the response is complete'
          },
          input: {
            type: 'object',
            description: 'The input variables'
          },
          output: {
            type: 'object',
            description: 'The output variables'
          },
          steps: {
            type: 'array',
            description: 'The steps taken by the agent'
          }
        }
      },
      async exec(input: StreamingAgentOptions & { query: string }) {
        // Create the streaming LLM
        const llm = streaming.createStreamingLLM(input.provider, {
          apiKey: input.apiKey,
          model: input.model,
          temperature: input.temperature,
          maxTokens: input.maxTokens,
          topP: input.topP,
          frequencyPenalty: input.frequencyPenalty,
          presencePenalty: input.presencePenalty,
          stop: input.stop,
          baseURL: input.baseURL,
          organization: input.organization
        });
        
        // Create the streaming agent
        const agent = streaming.createStreamingAgent(llm, input.tools, {
          systemPrompt: input.systemPrompt,
          maxSteps: input.maxSteps
        });
        
        // Stream the agent
        const response = await agent.stream(input.query);
        
        // Return the response
        return {
          text: response.text,
          tokens: response.tokens,
          isComplete: response.isComplete,
          input: response.input,
          output: response.output,
          steps: response.steps
        };
      }
    }
  ]
};

export default streamingPlugin;
