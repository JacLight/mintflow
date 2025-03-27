import { evaluation } from '../index.js';

/**
 * Options for evaluation
 */
export interface EvaluationOptions {
  /**
   * The type of evaluation to perform
   */
  type: 'retrieval' | 'generation' | 'agent';
  
  /**
   * Whether to include latency measurements
   */
  includeLatency?: boolean;
  
  /**
   * Additional options specific to the evaluation type
   */
  additionalOptions?: Record<string, any>;
}

/**
 * Options for retrieval evaluation
 */
export interface RetrievalEvaluationPluginOptions extends EvaluationOptions {
  /**
   * The type of evaluation to perform
   */
  type: 'retrieval';
  
  /**
   * The ground truth relevant documents for each query
   */
  groundTruth: Record<string, string[]>;
  
  /**
   * The k value for precision@k, recall@k, etc.
   */
  k?: number;
}

/**
 * Options for generation evaluation
 */
export interface GenerationEvaluationPluginOptions extends EvaluationOptions {
  /**
   * The type of evaluation to perform
   */
  type: 'generation';
  
  /**
   * The reference text to compare against
   */
  reference?: string;
  
  /**
   * The evaluation model to use for subjective metrics
   */
  evaluationModel?: string;
  
  /**
   * The API key for the evaluation model
   */
  evaluationModelApiKey?: string;
  
  /**
   * Whether to use exact match for relevance
   */
  useExactMatch?: boolean;
  
  /**
   * Whether to check for factual accuracy
   */
  checkFactualAccuracy?: boolean;
  
  /**
   * Whether to check for toxicity
   */
  checkToxicity?: boolean;
}

/**
 * Options for agent evaluation
 */
export interface AgentEvaluationPluginOptions extends EvaluationOptions {
  /**
   * The type of evaluation to perform
   */
  type: 'agent';
  
  /**
   * The expected answers for each task
   */
  expectedAnswers?: Record<string, string>;
  
  /**
   * The evaluation model to use for subjective metrics
   */
  evaluationModel?: string;
  
  /**
   * The API key for the evaluation model
   */
  evaluationModelApiKey?: string;
  
  /**
   * Whether to evaluate reasoning
   */
  evaluateReasoning?: boolean;
  
  /**
   * Whether to evaluate tool usage
   */
  evaluateToolUsage?: boolean;
}

/**
 * Evaluation plugin for LangChain
 */
const evaluationPlugin = {
  name: 'Evaluation',
  icon: 'GiMagnifyingGlass',
  description: 'Evaluate the performance of retrieval systems, text generation, and agents',
  id: 'evaluation',
  runner: 'node',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['retrieval', 'generation', 'agent'],
        description: 'The type of evaluation to perform'
      },
      includeLatency: {
        type: 'boolean',
        description: 'Whether to include latency measurements'
      },
      groundTruth: {
        type: 'object',
        description: 'The ground truth relevant documents for each query'
      },
      k: {
        type: 'number',
        description: 'The k value for precision@k, recall@k, etc.'
      },
      reference: {
        type: 'string',
        description: 'The reference text to compare against'
      },
      evaluationModel: {
        type: 'string',
        description: 'The evaluation model to use for subjective metrics'
      },
      evaluationModelApiKey: {
        type: 'string',
        description: 'The API key for the evaluation model'
      },
      useExactMatch: {
        type: 'boolean',
        description: 'Whether to use exact match for relevance'
      },
      checkFactualAccuracy: {
        type: 'boolean',
        description: 'Whether to check for factual accuracy'
      },
      checkToxicity: {
        type: 'boolean',
        description: 'Whether to check for toxicity'
      },
      expectedAnswers: {
        type: 'object',
        description: 'The expected answers for each task'
      },
      evaluateReasoning: {
        type: 'boolean',
        description: 'Whether to evaluate reasoning'
      },
      evaluateToolUsage: {
        type: 'boolean',
        description: 'Whether to evaluate tool usage'
      },
      additionalOptions: {
        type: 'object',
        description: 'Additional options specific to the evaluation type'
      }
    },
    required: ['type']
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: {
        type: 'object',
        description: 'The evaluation results'
      }
    }
  },
  documentation: 'https://js.langchain.com/docs/modules/model_io/models/chat/',
  method: 'exec',
  actions: [
    {
      name: 'Evaluate Retrieval',
      description: 'Evaluate the performance of a retrieval system',
      id: 'evaluateRetrieval',
      inputSchema: {
        type: 'object',
        properties: {
          queries: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The queries used for retrieval'
          },
          retrievedLists: {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            description: 'The lists of retrieved documents for each query'
          },
          groundTruth: {
            type: 'object',
            description: 'The ground truth relevant documents for each query'
          },
          k: {
            type: 'number',
            description: 'The k value for precision@k, recall@k, etc.'
          },
          includeLatency: {
            type: 'boolean',
            description: 'Whether to include latency measurements'
          },
          additionalOptions: {
            type: 'object',
            description: 'Additional options specific to the evaluation type'
          }
        },
        required: ['queries', 'retrievedLists', 'groundTruth']
      },
      outputSchema: {
        type: 'object',
        properties: {
          precision: {
            type: 'number',
            description: 'The precision of the retrieval'
          },
          recall: {
            type: 'number',
            description: 'The recall of the retrieval'
          },
          f1Score: {
            type: 'number',
            description: 'The F1 score of the retrieval'
          },
          mrr: {
            type: 'number',
            description: 'The mean reciprocal rank of the retrieval'
          },
          map: {
            type: 'number',
            description: 'The mean average precision of the retrieval'
          },
          ndcg: {
            type: 'number',
            description: 'The normalized discounted cumulative gain of the retrieval'
          },
          latencyMs: {
            type: 'number',
            description: 'The time taken to retrieve the documents in milliseconds'
          },
          additionalMetrics: {
            type: 'object',
            description: 'Additional metrics specific to the retrieval method'
          }
        }
      },
      async exec(input: {
        queries: string[];
        retrievedLists: string[][];
        groundTruth: Record<string, string[]>;
        k?: number;
        includeLatency?: boolean;
        additionalOptions?: Record<string, any>;
      }) {
        // Convert the ground truth to a Map
        const groundTruthMap = new Map<string, string[]>();
        for (const [query, docs] of Object.entries(input.groundTruth)) {
          groundTruthMap.set(query, docs);
        }
        
        // Create the evaluation options
        const options: evaluation.RetrievalEvaluationOptions = {
          groundTruth: groundTruthMap,
          k: input.k,
          includeLatency: input.includeLatency,
          additionalOptions: input.additionalOptions
        };
        
        // Evaluate the retrieval system
        return evaluation.evaluateRetrieval(input.queries, input.retrievedLists, options);
      }
    },
    {
      name: 'Evaluate Generation',
      description: 'Evaluate the performance of a text generation system',
      id: 'evaluateGeneration',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The prompt used for generation'
          },
          generated: {
            type: 'string',
            description: 'The generated text'
          },
          reference: {
            type: 'string',
            description: 'The reference text to compare against'
          },
          includeLatency: {
            type: 'boolean',
            description: 'Whether to include latency measurements'
          },
          evaluationModel: {
            type: 'string',
            description: 'The evaluation model to use for subjective metrics'
          },
          evaluationModelApiKey: {
            type: 'string',
            description: 'The API key for the evaluation model'
          },
          useExactMatch: {
            type: 'boolean',
            description: 'Whether to use exact match for relevance'
          },
          checkFactualAccuracy: {
            type: 'boolean',
            description: 'Whether to check for factual accuracy'
          },
          checkToxicity: {
            type: 'boolean',
            description: 'Whether to check for toxicity'
          },
          additionalOptions: {
            type: 'object',
            description: 'Additional options specific to the evaluation type'
          }
        },
        required: ['prompt', 'generated']
      },
      outputSchema: {
        type: 'object',
        properties: {
          overallScore: {
            type: 'number',
            description: 'The overall score of the generation'
          },
          relevanceScore: {
            type: 'number',
            description: 'The relevance score of the generation'
          },
          coherenceScore: {
            type: 'number',
            description: 'The coherence score of the generation'
          },
          fluencyScore: {
            type: 'number',
            description: 'The fluency score of the generation'
          },
          groundednessScore: {
            type: 'number',
            description: 'The groundedness score of the generation'
          },
          hallucinationScore: {
            type: 'number',
            description: 'The hallucination score of the generation'
          },
          toxicityScore: {
            type: 'number',
            description: 'The toxicity score of the generation'
          },
          latencyMs: {
            type: 'number',
            description: 'The time taken to generate the text in milliseconds'
          },
          additionalMetrics: {
            type: 'object',
            description: 'Additional metrics specific to the generation method'
          }
        }
      },
      async exec(input: {
        prompt: string;
        generated: string;
        reference?: string;
        includeLatency?: boolean;
        evaluationModel?: string;
        evaluationModelApiKey?: string;
        useExactMatch?: boolean;
        checkFactualAccuracy?: boolean;
        checkToxicity?: boolean;
        additionalOptions?: Record<string, any>;
      }) {
        // Create the evaluation options
        const options: evaluation.GenerationEvaluationOptions = {
          reference: input.reference,
          includeLatency: input.includeLatency,
          evaluationModel: input.evaluationModel,
          evaluationModelApiKey: input.evaluationModelApiKey,
          useExactMatch: input.useExactMatch,
          checkFactualAccuracy: input.checkFactualAccuracy,
          checkToxicity: input.checkToxicity,
          additionalOptions: input.additionalOptions
        };
        
        // Evaluate the generation system
        return evaluation.evaluateGeneration(input.prompt, input.generated, options);
      }
    },
    {
      name: 'Evaluate Agent',
      description: 'Evaluate the performance of an agent',
      id: 'evaluateAgent',
      inputSchema: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                taskId: {
                  type: 'string',
                  description: 'The task ID'
                },
                taskDescription: {
                  type: 'string',
                  description: 'The task description'
                },
                steps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      stepNumber: {
                        type: 'number',
                        description: 'The step number'
                      },
                      action: {
                        type: 'string',
                        description: 'The action taken by the agent'
                      },
                      input: {
                        type: 'object',
                        description: 'The input to the action'
                      },
                      output: {
                        type: 'object',
                        description: 'The output from the action'
                      },
                      reasoning: {
                        type: 'string',
                        description: 'The reasoning behind the action'
                      },
                      latencyMs: {
                        type: 'number',
                        description: 'The time taken for the step in milliseconds'
                      }
                    },
                    required: ['stepNumber', 'action', 'input', 'output']
                  },
                  description: 'The steps taken by the agent'
                },
                finalAnswer: {
                  type: 'string',
                  description: 'The final answer provided by the agent'
                },
                totalLatencyMs: {
                  type: 'number',
                  description: 'The total time taken for the task in milliseconds'
                }
              },
              required: ['taskId', 'taskDescription', 'steps', 'finalAnswer']
            },
            description: 'The agent tasks to evaluate'
          },
          expectedAnswers: {
            type: 'object',
            description: 'The expected answers for each task'
          },
          includeLatency: {
            type: 'boolean',
            description: 'Whether to include latency measurements'
          },
          evaluationModel: {
            type: 'string',
            description: 'The evaluation model to use for subjective metrics'
          },
          evaluationModelApiKey: {
            type: 'string',
            description: 'The API key for the evaluation model'
          },
          evaluateReasoning: {
            type: 'boolean',
            description: 'Whether to evaluate reasoning'
          },
          evaluateToolUsage: {
            type: 'boolean',
            description: 'Whether to evaluate tool usage'
          },
          additionalOptions: {
            type: 'object',
            description: 'Additional options specific to the evaluation type'
          }
        },
        required: ['tasks']
      },
      outputSchema: {
        type: 'object',
        properties: {
          overallScore: {
            type: 'number',
            description: 'The overall score of the agent'
          },
          successRate: {
            type: 'number',
            description: 'The success rate of the agent'
          },
          accuracy: {
            type: 'number',
            description: 'The accuracy of the agent'
          },
          efficiency: {
            type: 'number',
            description: 'The efficiency of the agent'
          },
          reasoningScore: {
            type: 'number',
            description: 'The reasoning score of the agent'
          },
          toolUsageScore: {
            type: 'number',
            description: 'The tool usage score of the agent'
          },
          averageSteps: {
            type: 'number',
            description: 'The average number of steps taken by the agent'
          },
          averageLatencyMs: {
            type: 'number',
            description: 'The average time taken by the agent in milliseconds'
          },
          additionalMetrics: {
            type: 'object',
            description: 'Additional metrics specific to the agent'
          }
        }
      },
      async exec(input: {
        tasks: Array<{
          taskId: string;
          taskDescription: string;
          steps: Array<{
            stepNumber: number;
            action: string;
            input: any;
            output: any;
            reasoning?: string;
            latencyMs?: number;
          }>;
          finalAnswer: string;
          totalLatencyMs?: number;
        }>;
        expectedAnswers?: Record<string, string>;
        includeLatency?: boolean;
        evaluationModel?: string;
        evaluationModelApiKey?: string;
        evaluateReasoning?: boolean;
        evaluateToolUsage?: boolean;
        additionalOptions?: Record<string, any>;
      }) {
        // Convert the expected answers to a Map
        const expectedAnswersMap = input.expectedAnswers
          ? new Map<string, string>(Object.entries(input.expectedAnswers))
          : undefined;
        
        // Create the evaluation options
        const options: evaluation.AgentEvaluationOptions = {
          expectedAnswers: expectedAnswersMap,
          includeLatency: input.includeLatency,
          evaluationModel: input.evaluationModel,
          evaluationModelApiKey: input.evaluationModelApiKey,
          evaluateReasoning: input.evaluateReasoning,
          evaluateToolUsage: input.evaluateToolUsage,
          additionalOptions: input.additionalOptions
        };
        
        // Evaluate the agent system
        return evaluation.evaluateAgent(input.tasks, options);
      }
    }
  ]
};

export default evaluationPlugin;
