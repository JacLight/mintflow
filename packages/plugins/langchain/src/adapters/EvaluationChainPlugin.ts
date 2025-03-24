/**
 * Plugin for evaluating LLM outputs
 */

import { EvaluationChain, EvaluationParams, EvaluationResult } from '../evaluation/EvaluationChain.js';

/**
 * Plugin for evaluating LLM outputs
 */
const evaluationChainPlugin = {
  name: 'Evaluation Chain',
  icon: 'GiScales',
  description: 'Evaluate LLM outputs',
  id: 'evaluation-chain',
  runner: 'node',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['retrieval', 'generation', 'agent'],
        description: 'The type of evaluation'
      },
      model: {
        type: 'string',
        description: 'The model to use for evaluation'
      },
      metrics: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'The metrics to evaluate'
      }
    },
    required: ['type']
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'The type of evaluation'
          },
          metrics: {
            type: 'object',
            description: 'The metrics'
          },
          overallScore: {
            type: 'number',
            description: 'The overall score'
          },
          details: {
            type: 'object',
            description: 'The detailed results'
          },
          feedback: {
            type: 'string',
            description: 'The feedback'
          }
        }
      }
    }
  },
  documentation: 'https://js.langchain.com/docs/',
  method: 'exec',
  actions: [
    {
      name: 'Evaluate Retrieval',
      description: 'Evaluate retrieval results',
      id: 'evaluateRetrieval',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The query'
          },
          retrievedDocuments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'The document content'
                },
                metadata: {
                  type: 'object',
                  description: 'The document metadata'
                }
              },
              required: ['content']
            },
            description: 'The retrieved documents'
          },
          relevantDocuments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'The document content'
                },
                metadata: {
                  type: 'object',
                  description: 'The document metadata'
                }
              },
              required: ['content']
            },
            description: 'The relevant documents (ground truth)'
          },
          metrics: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['precision', 'recall', 'f1', 'mrr', 'relevance', 'diversity']
            },
            description: 'The metrics to evaluate'
          },
          model: {
            type: 'string',
            description: 'The model to use for evaluation'
          }
        },
        required: ['query', 'retrievedDocuments']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'The type of evaluation'
              },
              metrics: {
                type: 'object',
                description: 'The metrics'
              },
              overallScore: {
                type: 'number',
                description: 'The overall score'
              },
              details: {
                type: 'object',
                description: 'The detailed results'
              },
              feedback: {
                type: 'string',
                description: 'The feedback'
              }
            }
          }
        }
      },
      async exec(input: {
        query: string;
        retrievedDocuments: Array<{
          content: string;
          metadata?: Record<string, any>;
        }>;
        relevantDocuments?: Array<{
          content: string;
          metadata?: Record<string, any>;
        }>;
        metrics?: string[];
        model?: string;
      }): Promise<{ result: EvaluationResult }> {
        try {
          const { query, retrievedDocuments, relevantDocuments, metrics, model } = input;
          
          const evaluationChain = new EvaluationChain();
          
          const params: EvaluationParams = {
            type: 'retrieval',
            query,
            retrievedDocuments,
            relevantDocuments,
            metrics,
            model
          };
          
          const result = await evaluationChain.evaluate(params);
          
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to evaluate retrieval: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Evaluate Generation',
      description: 'Evaluate generation results',
      id: 'evaluateGeneration',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The prompt'
          },
          generatedText: {
            type: 'string',
            description: 'The generated text'
          },
          referenceText: {
            type: 'string',
            description: 'The reference text (ground truth)'
          },
          metrics: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['relevance', 'coherence', 'fluency', 'groundedness', 'toxicity', 'bleu', 'rouge']
            },
            description: 'The metrics to evaluate'
          },
          model: {
            type: 'string',
            description: 'The model to use for evaluation'
          }
        },
        required: ['prompt', 'generatedText']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'The type of evaluation'
              },
              metrics: {
                type: 'object',
                description: 'The metrics'
              },
              overallScore: {
                type: 'number',
                description: 'The overall score'
              },
              details: {
                type: 'object',
                description: 'The detailed results'
              },
              feedback: {
                type: 'string',
                description: 'The feedback'
              }
            }
          }
        }
      },
      async exec(input: {
        prompt: string;
        generatedText: string;
        referenceText?: string;
        metrics?: string[];
        model?: string;
      }): Promise<{ result: EvaluationResult }> {
        try {
          const { prompt, generatedText, referenceText, metrics, model } = input;
          
          const evaluationChain = new EvaluationChain();
          
          const params: EvaluationParams = {
            type: 'generation',
            prompt,
            generatedText,
            referenceText,
            metrics,
            model
          };
          
          const result = await evaluationChain.evaluate(params);
          
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to evaluate generation: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Evaluate Agent',
      description: 'Evaluate agent results',
      id: 'evaluateAgent',
      inputSchema: {
        type: 'object',
        properties: {
          task: {
            type: 'string',
            description: 'The task'
          },
          agentResponse: {
            type: 'string',
            description: 'The agent\'s response'
          },
          agentReasoning: {
            type: 'string',
            description: 'The agent\'s reasoning'
          },
          agentActions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  description: 'The action name'
                },
                input: {
                  type: 'object',
                  description: 'The action input'
                },
                output: {
                  type: 'any',
                  description: 'The action output'
                }
              },
              required: ['action', 'input']
            },
            description: 'The agent\'s actions'
          },
          expectedResponse: {
            type: 'string',
            description: 'The expected response (ground truth)'
          },
          metrics: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['taskCompletion', 'reasoningQuality', 'actionEfficiency', 'toolUsage', 'hallucination']
            },
            description: 'The metrics to evaluate'
          },
          model: {
            type: 'string',
            description: 'The model to use for evaluation'
          }
        },
        required: ['task', 'agentResponse']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'The type of evaluation'
              },
              metrics: {
                type: 'object',
                description: 'The metrics'
              },
              overallScore: {
                type: 'number',
                description: 'The overall score'
              },
              details: {
                type: 'object',
                description: 'The detailed results'
              },
              feedback: {
                type: 'string',
                description: 'The feedback'
              }
            }
          }
        }
      },
      async exec(input: {
        task: string;
        agentResponse: string;
        agentReasoning?: string;
        agentActions?: Array<{
          action: string;
          input: Record<string, any>;
          output: any;
        }>;
        expectedResponse?: string;
        metrics?: string[];
        model?: string;
      }): Promise<{ result: EvaluationResult }> {
        try {
          const { task, agentResponse, agentReasoning, agentActions, expectedResponse, metrics, model } = input;
          
          const evaluationChain = new EvaluationChain();
          
          const params: EvaluationParams = {
            type: 'agent',
            task,
            agentResponse,
            agentReasoning,
            agentActions,
            expectedResponse,
            metrics,
            model
          };
          
          const result = await evaluationChain.evaluate(params);
          
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to evaluate agent: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Create Benchmark Dataset',
      description: 'Create a benchmark dataset for evaluation',
      id: 'createBenchmarkDataset',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['retrieval', 'generation', 'agent'],
            description: 'The type of benchmark dataset'
          },
          name: {
            type: 'string',
            description: 'The name of the benchmark dataset'
          },
          description: {
            type: 'string',
            description: 'The description of the benchmark dataset'
          },
          examples: {
            type: 'array',
            items: {
              type: 'object',
              description: 'The examples in the benchmark dataset'
            },
            description: 'The examples in the benchmark dataset'
          }
        },
        required: ['type', 'name', 'examples']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the benchmark dataset'
              },
              type: {
                type: 'string',
                description: 'The type of benchmark dataset'
              },
              name: {
                type: 'string',
                description: 'The name of the benchmark dataset'
              },
              description: {
                type: 'string',
                description: 'The description of the benchmark dataset'
              },
              examples: {
                type: 'array',
                items: {
                  type: 'object',
                  description: 'The examples in the benchmark dataset'
                },
                description: 'The examples in the benchmark dataset'
              }
            }
          }
        }
      },
      async exec(input: {
        type: 'retrieval' | 'generation' | 'agent';
        name: string;
        description?: string;
        examples: any[];
      }): Promise<{
        result: {
          id: string;
          type: string;
          name: string;
          description?: string;
          examples: any[];
        };
      }> {
        try {
          const { type, name, description, examples } = input;
          
          // Generate a unique ID for the benchmark dataset
          const id = `${type}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
          
          // In a real implementation, this would save the benchmark dataset to a database or file
          
          return {
            result: {
              id,
              type,
              name,
              description,
              examples
            }
          };
        } catch (error: any) {
          throw new Error(`Failed to create benchmark dataset: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Run Benchmark',
      description: 'Run a benchmark evaluation',
      id: 'runBenchmark',
      inputSchema: {
        type: 'object',
        properties: {
          datasetId: {
            type: 'string',
            description: 'The ID of the benchmark dataset'
          },
          model: {
            type: 'string',
            description: 'The model to evaluate'
          },
          metrics: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The metrics to evaluate'
          }
        },
        required: ['datasetId', 'model']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              datasetId: {
                type: 'string',
                description: 'The ID of the benchmark dataset'
              },
              model: {
                type: 'string',
                description: 'The model evaluated'
              },
              metrics: {
                type: 'object',
                description: 'The metrics'
              },
              overallScore: {
                type: 'number',
                description: 'The overall score'
              },
              exampleResults: {
                type: 'array',
                items: {
                  type: 'object',
                  description: 'The results for each example'
                },
                description: 'The results for each example'
              }
            }
          }
        }
      },
      async exec(input: {
        datasetId: string;
        model: string;
        metrics?: string[];
      }): Promise<{
        result: {
          datasetId: string;
          model: string;
          metrics: Record<string, number>;
          overallScore: number;
          exampleResults: any[];
        };
      }> {
        try {
          const { datasetId, model, metrics } = input;
          
          // In a real implementation, this would load the benchmark dataset and run the evaluation
          
          // For now, we'll return a placeholder result
          return {
            result: {
              datasetId,
              model,
              metrics: {
                precision: 0.85,
                recall: 0.78,
                f1: 0.81
              },
              overallScore: 0.81,
              exampleResults: []
            }
          };
        } catch (error: any) {
          throw new Error(`Failed to run benchmark: ${error?.message || 'Unknown error'}`);
        }
      }
    }
  ]
};

export default evaluationChainPlugin;
