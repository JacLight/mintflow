/**
 * Agent Plugin for Langflow integration
 * 
 * This plugin provides actions for working with agents in Langflow.
 */

import { defaultRunnerClient } from '../utils/runner.js';
import { mintflowToLangflowConfig, langflowToMintflowResult } from '../utils/conversion.js';

// Type definitions
export interface AgentConfig {
  name: string;
  description?: string;
  llm: {
    provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'local';
    model: string;
    temperature?: number;
    max_tokens?: number;
    [key: string]: any;
  };
}

export interface AgentTool {
  name: string;
  description: string;
  type: 'function' | 'retrieval' | 'web' | 'custom';
  config: Record<string, any>;
}

export interface AgentResult {
  agentId: string;
  name: string;
  description?: string;
  tools?: AgentTool[];
}

/**
 * Agent Plugin
 */
const agentPlugin = {
  name: 'Agent',
  icon: 'GiRobot',
  description: 'Agent operations for Langflow',
  id: 'agent',
  runner: 'python',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      llm: { type: 'object' },
      tools: { type: 'array' }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: { type: 'object' }
    }
  },
  documentation: 'https://github.com/mintflow/plugin-langflow',
  method: 'exec',
  actions: [
    {
      name: 'Create Agent',
      description: 'Create a new agent',
      id: 'createAgent',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The name of the agent' },
          description: { type: 'string', description: 'The description of the agent' },
          llm: {
            type: 'object',
            properties: {
              provider: {
                type: 'string',
                enum: ['openai', 'anthropic', 'google', 'ollama', 'local'],
                description: 'The LLM provider'
              },
              model: { type: 'string', description: 'The model name' },
              temperature: { type: 'number', description: 'The temperature for generation' },
              max_tokens: { type: 'number', description: 'The maximum number of tokens to generate' }
            },
            required: ['provider', 'model'],
            description: 'The LLM configuration'
          },
          tools: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'The name of the tool' },
                description: { type: 'string', description: 'The description of the tool' },
                type: {
                  type: 'string',
                  enum: ['function', 'retrieval', 'web', 'custom'],
                  description: 'The type of tool'
                },
                config: { type: 'object', description: 'The configuration for the tool' }
              },
              required: ['name', 'description', 'type'],
              description: 'A tool for the agent'
            },
            description: 'The tools for the agent'
          }
        },
        required: ['name', 'llm']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'The ID of the created agent' },
              name: { type: 'string', description: 'The name of the agent' },
              description: { type: 'string', description: 'The description of the agent' }
            }
          }
        }
      },
      async exec(input: {
        name: string;
        description?: string;
        llm: {
          provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'local';
          model: string;
          temperature?: number;
          max_tokens?: number;
          [key: string]: any;
        };
        tools?: AgentTool[];
      }): Promise<{ result: AgentResult }> {
        try {
          // Convert MintFlow config to Langflow config
          const langflowLlmConfig = mintflowToLangflowConfig(input.llm);
          
          // Execute the task
          const result = await defaultRunnerClient.executeAgentTask<AgentResult>(
            'create_agent',
            {
              name: input.name,
              description: input.description,
              llm: {
                provider: input.llm.provider,
                model: input.llm.model,
                temperature: input.llm.temperature,
                max_tokens: input.llm.max_tokens,
                ...langflowLlmConfig
              }
            },
            {
              tools: input.tools || []
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to create agent: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Run Agent',
      description: 'Run an agent with a query',
      id: 'runAgent',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string', description: 'The ID of the agent' },
          input: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The query to run' },
              history: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    role: {
                      type: 'string',
                      enum: ['user', 'assistant', 'system'],
                      description: 'The role of the message'
                    },
                    content: { type: 'string', description: 'The content of the message' }
                  },
                  required: ['role', 'content']
                },
                description: 'The conversation history'
              }
            },
            required: ['query'],
            description: 'The input for the agent'
          }
        },
        required: ['agentId', 'input']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              response: { type: 'string', description: 'The agent response' },
              steps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    tool: { type: 'string', description: 'The tool used' },
                    input: { type: 'object', description: 'The input to the tool' },
                    output: { type: 'object', description: 'The output from the tool' }
                  }
                },
                description: 'The steps taken by the agent'
              }
            }
          }
        }
      },
      async exec(input: {
        agentId: string;
        input: {
          query: string;
          history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
        };
      }): Promise<{ result: any }> {
        try {
          // Convert MintFlow messages to Langflow messages
          const langflowHistory = input.input.history?.map(message => ({
            type: message.role,
            data: {
              content: message.content,
              additional_kwargs: {}
            }
          }));
          
          // Execute the task
          const result = await defaultRunnerClient.executeAgentTask<any>(
            'run_agent',
            {
              agentId: input.agentId
            },
            {
              query: input.input.query,
              history: langflowHistory
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to run agent: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Add Tools',
      description: 'Add tools to an agent',
      id: 'addTools',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string', description: 'The ID of the agent' },
          tools: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'The name of the tool' },
                description: { type: 'string', description: 'The description of the tool' },
                type: {
                  type: 'string',
                  enum: ['function', 'retrieval', 'web', 'custom'],
                  description: 'The type of tool'
                },
                config: { type: 'object', description: 'The configuration for the tool' }
              },
              required: ['name', 'description', 'type'],
              description: 'A tool for the agent'
            },
            description: 'The tools to add'
          }
        },
        required: ['agentId', 'tools']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'The ID of the agent' },
              toolCount: { type: 'number', description: 'The number of tools added' }
            }
          }
        }
      },
      async exec(input: {
        agentId: string;
        tools: AgentTool[];
      }): Promise<{ result: { agentId: string; toolCount: number } }> {
        try {
          // Execute the task
          const result = await defaultRunnerClient.executeAgentTask<{ agentId: string; toolCount: number }>(
            'add_tools',
            {
              agentId: input.agentId
            },
            {
              tools: input.tools
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to add tools: ${error?.message || 'Unknown error'}`);
        }
      }
    }
  ]
};

export default agentPlugin;
