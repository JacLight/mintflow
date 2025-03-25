/**
 * LangGraph Plugin for Langflow integration
 * 
 * This plugin provides actions for working with LangGraph in Langflow.
 */

import { defaultRunnerClient } from '../utils/runner.js';
import { mintflowToLangflowConfig, langflowToMintflowResult } from '../utils/conversion.js';

// Type definitions
export interface GraphConfig {
  name: string;
  description?: string;
  entry_point?: string;
}

export interface GraphNode {
  id: string;
  type: 'llm' | 'tool' | 'custom';
  config: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  condition?: string;
}

export interface GraphResult {
  graphId: string;
  name: string;
  description?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}

/**
 * LangGraph Plugin
 */
const langGraphPlugin = {
  name: 'LangGraph',
  icon: 'GiFlowChart',
  description: 'LangGraph operations for Langflow',
  id: 'langGraph',
  runner: 'python',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      nodes: { type: 'array' },
      edges: { type: 'array' }
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
      name: 'Create Graph',
      description: 'Create a new LangGraph workflow',
      id: 'createGraph',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The name of the graph' },
          description: { type: 'string', description: 'The description of the graph' },
          entry_point: { type: 'string', description: 'The entry point node ID' },
          nodes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'The ID of the node' },
                type: {
                  type: 'string',
                  enum: ['llm', 'tool', 'custom'],
                  description: 'The type of node'
                },
                config: { type: 'object', description: 'The configuration for the node' }
              },
              required: ['id', 'type']
            },
            description: 'The nodes in the graph'
          },
          edges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string', description: 'The source node ID' },
                target: { type: 'string', description: 'The target node ID' },
                condition: { type: 'string', description: 'The condition for the edge' }
              },
              required: ['source', 'target']
            },
            description: 'The edges in the graph'
          }
        },
        required: ['name', 'nodes', 'edges']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              graphId: { type: 'string', description: 'The ID of the created graph' },
              name: { type: 'string', description: 'The name of the graph' },
              description: { type: 'string', description: 'The description of the graph' }
            }
          }
        }
      },
      async exec(input: {
        name: string;
        description?: string;
        entry_point?: string;
        nodes: GraphNode[];
        edges: GraphEdge[];
      }): Promise<{ result: GraphResult }> {
        try {
          // Execute the task
          const result = await defaultRunnerClient.executeLangGraphTask<GraphResult>(
            'create_graph',
            {
              name: input.name,
              description: input.description,
              entry_point: input.entry_point
            },
            {
              nodes: input.nodes,
              edges: input.edges
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to create graph: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Run Graph',
      description: 'Run a LangGraph workflow',
      id: 'runGraph',
      inputSchema: {
        type: 'object',
        properties: {
          graphId: { type: 'string', description: 'The ID of the graph' },
          input: { type: 'object', description: 'The input data for the graph' },
          max_iterations: { type: 'number', description: 'The maximum number of iterations' },
          stream_output: { type: 'boolean', description: 'Whether to stream the output' }
        },
        required: ['graphId', 'input']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              output: { type: 'object', description: 'The output of the graph' },
              steps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    node: { type: 'string', description: 'The node ID' },
                    input: { type: 'object', description: 'The input to the node' },
                    output: { type: 'object', description: 'The output from the node' }
                  }
                },
                description: 'The steps executed in the graph'
              }
            }
          }
        }
      },
      async exec(input: {
        graphId: string;
        input: Record<string, any>;
        max_iterations?: number;
        stream_output?: boolean;
      }): Promise<{ result: any }> {
        try {
          // Execute the task
          const result = await defaultRunnerClient.executeLangGraphTask<any>(
            'run_graph',
            {
              graphId: input.graphId,
              max_iterations: input.max_iterations,
              stream_output: input.stream_output
            },
            input.input
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to run graph: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Update Graph',
      description: 'Update a LangGraph workflow',
      id: 'updateGraph',
      inputSchema: {
        type: 'object',
        properties: {
          graphId: { type: 'string', description: 'The ID of the graph' },
          name: { type: 'string', description: 'The new name of the graph' },
          description: { type: 'string', description: 'The new description of the graph' },
          nodes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'The ID of the node' },
                type: {
                  type: 'string',
                  enum: ['llm', 'tool', 'custom'],
                  description: 'The type of node'
                },
                config: { type: 'object', description: 'The configuration for the node' }
              },
              required: ['id', 'type']
            },
            description: 'The new nodes in the graph'
          },
          edges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string', description: 'The source node ID' },
                target: { type: 'string', description: 'The target node ID' },
                condition: { type: 'string', description: 'The condition for the edge' }
              },
              required: ['source', 'target']
            },
            description: 'The new edges in the graph'
          }
        },
        required: ['graphId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              graphId: { type: 'string', description: 'The ID of the updated graph' },
              name: { type: 'string', description: 'The name of the graph' },
              description: { type: 'string', description: 'The description of the graph' }
            }
          }
        }
      },
      async exec(input: {
        graphId: string;
        name?: string;
        description?: string;
        nodes?: GraphNode[];
        edges?: GraphEdge[];
      }): Promise<{ result: GraphResult }> {
        try {
          // Execute the task
          const result = await defaultRunnerClient.executeLangGraphTask<GraphResult>(
            'update_graph',
            {
              graphId: input.graphId
            },
            {
              name: input.name,
              description: input.description,
              nodes: input.nodes,
              edges: input.edges
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to update graph: ${error?.message || 'Unknown error'}`);
        }
      }
    }
  ]
};

export default langGraphPlugin;
