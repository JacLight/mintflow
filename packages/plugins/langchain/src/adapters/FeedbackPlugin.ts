/**
 * Plugin for collecting and using feedback
 */

import {
  FeedbackCollector,
  MemoryFeedbackStorage,
  FeedbackSource,
  FeedbackRating,
  Feedback,
  FeedbackBasedImprovement,
  PromptRefinementStrategy,
  ModelSelectionStrategy,
  ParameterTuningStrategy,
  ImprovementAction,
  ImprovementResult,
  ABTesting,
  MemoryExperimentStorage,
  RatingMetricCalculator,
  CompletionTimeMetricCalculator,
  CorrectionMetricCalculator,
  Variant,
  Experiment,
  ExperimentResult
} from '../feedback/index.js';

/**
 * Plugin for collecting and using feedback
 */
const feedbackPlugin = {
  name: 'Feedback',
  icon: 'GiThumbUp',
  description: 'Collect and use feedback for LLM outputs',
  id: 'feedback',
  runner: 'node',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'The ID of the session'
      },
      messageId: {
        type: 'string',
        description: 'The ID of the message'
      },
      source: {
        type: 'string',
        enum: ['user', 'system', 'model', 'external'],
        description: 'The source of the feedback'
      }
    },
    required: ['sessionId', 'messageId']
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: {
        type: 'object',
        description: 'The result of the feedback operation'
      }
    }
  },
  documentation: 'https://js.langchain.com/docs/',
  method: 'exec',
  actions: [
    {
      name: 'Collect Rating',
      description: 'Collect rating feedback',
      id: 'collectRating',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The ID of the session'
          },
          messageId: {
            type: 'string',
            description: 'The ID of the message'
          },
          rating: {
            type: 'number',
            enum: [1, 2, 3, 4, 5],
            description: 'The rating value'
          },
          aspect: {
            type: 'string',
            description: 'The aspect being rated'
          },
          comment: {
            type: 'string',
            description: 'The comment associated with the rating'
          },
          source: {
            type: 'string',
            enum: ['user', 'system', 'model', 'external'],
            description: 'The source of the feedback'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The tags associated with the feedback'
          },
          metadata: {
            type: 'object',
            description: 'The metadata associated with the feedback'
          }
        },
        required: ['sessionId', 'messageId', 'rating']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the feedback'
              },
              sessionId: {
                type: 'string',
                description: 'The ID of the session'
              },
              messageId: {
                type: 'string',
                description: 'The ID of the message'
              },
              source: {
                type: 'string',
                description: 'The source of the feedback'
              },
              type: {
                type: 'string',
                description: 'The type of feedback'
              },
              timestamp: {
                type: 'string',
                description: 'The timestamp of the feedback'
              },
              rating: {
                type: 'number',
                description: 'The rating value'
              },
              aspect: {
                type: 'string',
                description: 'The aspect being rated'
              },
              comment: {
                type: 'string',
                description: 'The comment associated with the rating'
              }
            }
          }
        }
      },
      async exec(input: {
        sessionId: string;
        messageId: string;
        rating: FeedbackRating;
        aspect?: string;
        comment?: string;
        source?: FeedbackSource;
        tags?: string[];
        metadata?: Record<string, any>;
      }): Promise<{ result: any }> {
        try {
          const { sessionId, messageId, rating, aspect, comment, source, tags, metadata } = input;
          
          const feedbackCollector = new FeedbackCollector();
          
          const feedback = await feedbackCollector.collectRating(
            sessionId,
            messageId,
            rating,
            {
              source,
              aspect,
              comment,
              tags,
              metadata
            }
          );
          
          return { result: feedback };
        } catch (error: any) {
          throw new Error(`Failed to collect rating: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Collect Comment',
      description: 'Collect comment feedback',
      id: 'collectComment',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The ID of the session'
          },
          messageId: {
            type: 'string',
            description: 'The ID of the message'
          },
          comment: {
            type: 'string',
            description: 'The comment text'
          },
          sentiment: {
            type: 'string',
            enum: ['positive', 'negative', 'neutral'],
            description: 'The sentiment of the comment'
          },
          source: {
            type: 'string',
            enum: ['user', 'system', 'model', 'external'],
            description: 'The source of the feedback'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The tags associated with the feedback'
          },
          metadata: {
            type: 'object',
            description: 'The metadata associated with the feedback'
          }
        },
        required: ['sessionId', 'messageId', 'comment']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the feedback'
              },
              sessionId: {
                type: 'string',
                description: 'The ID of the session'
              },
              messageId: {
                type: 'string',
                description: 'The ID of the message'
              },
              source: {
                type: 'string',
                description: 'The source of the feedback'
              },
              type: {
                type: 'string',
                description: 'The type of feedback'
              },
              timestamp: {
                type: 'string',
                description: 'The timestamp of the feedback'
              },
              comment: {
                type: 'string',
                description: 'The comment text'
              },
              sentiment: {
                type: 'string',
                description: 'The sentiment of the comment'
              }
            }
          }
        }
      },
      async exec(input: {
        sessionId: string;
        messageId: string;
        comment: string;
        sentiment?: 'positive' | 'negative' | 'neutral';
        source?: FeedbackSource;
        tags?: string[];
        metadata?: Record<string, any>;
      }): Promise<{ result: any }> {
        try {
          const { sessionId, messageId, comment, sentiment, source, tags, metadata } = input;
          
          const feedbackCollector = new FeedbackCollector();
          
          const feedback = await feedbackCollector.collectComment(
            sessionId,
            messageId,
            comment,
            {
              source,
              sentiment,
              tags,
              metadata
            }
          );
          
          return { result: feedback };
        } catch (error: any) {
          throw new Error(`Failed to collect comment: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Collect Correction',
      description: 'Collect correction feedback',
      id: 'collectCorrection',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The ID of the session'
          },
          messageId: {
            type: 'string',
            description: 'The ID of the message'
          },
          originalText: {
            type: 'string',
            description: 'The original text'
          },
          correctedText: {
            type: 'string',
            description: 'The corrected text'
          },
          reason: {
            type: 'string',
            description: 'The reason for the correction'
          },
          source: {
            type: 'string',
            enum: ['user', 'system', 'model', 'external'],
            description: 'The source of the feedback'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The tags associated with the feedback'
          },
          metadata: {
            type: 'object',
            description: 'The metadata associated with the feedback'
          }
        },
        required: ['sessionId', 'messageId', 'originalText', 'correctedText']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the feedback'
              },
              sessionId: {
                type: 'string',
                description: 'The ID of the session'
              },
              messageId: {
                type: 'string',
                description: 'The ID of the message'
              },
              source: {
                type: 'string',
                description: 'The source of the feedback'
              },
              type: {
                type: 'string',
                description: 'The type of feedback'
              },
              timestamp: {
                type: 'string',
                description: 'The timestamp of the feedback'
              },
              originalText: {
                type: 'string',
                description: 'The original text'
              },
              correctedText: {
                type: 'string',
                description: 'The corrected text'
              },
              reason: {
                type: 'string',
                description: 'The reason for the correction'
              }
            }
          }
        }
      },
      async exec(input: {
        sessionId: string;
        messageId: string;
        originalText: string;
        correctedText: string;
        reason?: string;
        source?: FeedbackSource;
        tags?: string[];
        metadata?: Record<string, any>;
      }): Promise<{ result: any }> {
        try {
          const { sessionId, messageId, originalText, correctedText, reason, source, tags, metadata } = input;
          
          const feedbackCollector = new FeedbackCollector();
          
          const feedback = await feedbackCollector.collectCorrection(
            sessionId,
            messageId,
            originalText,
            correctedText,
            {
              source,
              reason,
              tags,
              metadata
            }
          );
          
          return { result: feedback };
        } catch (error: any) {
          throw new Error(`Failed to collect correction: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Get Feedback',
      description: 'Get feedback by ID',
      id: 'getFeedback',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The ID of the feedback'
          }
        },
        required: ['id']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            description: 'The feedback'
          }
        }
      },
      async exec(input: {
        id: string;
      }): Promise<{ result: Feedback | null }> {
        try {
          const { id } = input;
          
          const feedbackCollector = new FeedbackCollector();
          
          const feedback = await feedbackCollector.getFeedback(id);
          
          return { result: feedback };
        } catch (error: any) {
          throw new Error(`Failed to get feedback: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Get Feedback by Session',
      description: 'Get feedback by session ID',
      id: 'getFeedbackBySession',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The ID of the session'
          }
        },
        required: ['sessionId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'array',
            items: {
              type: 'object',
              description: 'The feedback'
            },
            description: 'The feedback'
          }
        }
      },
      async exec(input: {
        sessionId: string;
      }): Promise<{ result: Feedback[] }> {
        try {
          const { sessionId } = input;
          
          const feedbackCollector = new FeedbackCollector();
          
          const feedback = await feedbackCollector.getFeedbackBySession(sessionId);
          
          return { result: feedback };
        } catch (error: any) {
          throw new Error(`Failed to get feedback by session: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Get Feedback by Message',
      description: 'Get feedback by message ID',
      id: 'getFeedbackByMessage',
      inputSchema: {
        type: 'object',
        properties: {
          messageId: {
            type: 'string',
            description: 'The ID of the message'
          }
        },
        required: ['messageId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'array',
            items: {
              type: 'object',
              description: 'The feedback'
            },
            description: 'The feedback'
          }
        }
      },
      async exec(input: {
        messageId: string;
      }): Promise<{ result: Feedback[] }> {
        try {
          const { messageId } = input;
          
          const feedbackCollector = new FeedbackCollector();
          
          const feedback = await feedbackCollector.getFeedbackByMessage(messageId);
          
          return { result: feedback };
        } catch (error: any) {
          throw new Error(`Failed to get feedback by message: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Generate Improvement Action',
      description: 'Generate an improvement action based on feedback',
      id: 'generateImprovementAction',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The ID of the session'
          },
          strategy: {
            type: 'string',
            enum: ['prompt-refinement', 'model-selection', 'parameter-tuning', 'ensemble', 'custom'],
            description: 'The strategy to use for improvement'
          },
          context: {
            type: 'object',
            description: 'The context for improvement'
          }
        },
        required: ['sessionId', 'strategy', 'context']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the improvement action'
              },
              strategy: {
                type: 'string',
                description: 'The strategy used for improvement'
              },
              description: {
                type: 'string',
                description: 'The description of the improvement action'
              },
              changes: {
                type: 'object',
                description: 'The changes made by the improvement action'
              },
              timestamp: {
                type: 'string',
                description: 'The timestamp of the improvement action'
              },
              triggeringFeedback: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'The feedback that triggered the improvement action'
              }
            }
          }
        }
      },
      async exec(input: {
        sessionId: string;
        strategy: 'prompt-refinement' | 'model-selection' | 'parameter-tuning' | 'ensemble' | 'custom';
        context: Record<string, any>;
      }): Promise<{ result: ImprovementAction }> {
        try {
          const { sessionId, strategy, context } = input;
          
          const feedbackCollector = new FeedbackCollector();
          const improvement = new FeedbackBasedImprovement({ feedbackCollector });
          
          const action = await improvement.generateAction(sessionId, strategy, context);
          
          return { result: action };
        } catch (error: any) {
          throw new Error(`Failed to generate improvement action: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Apply Improvement Action',
      description: 'Apply an improvement action',
      id: 'applyImprovementAction',
      inputSchema: {
        type: 'object',
        properties: {
          actionId: {
            type: 'string',
            description: 'The ID of the improvement action'
          },
          context: {
            type: 'object',
            description: 'The context for improvement'
          }
        },
        required: ['actionId', 'context']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            description: 'The updated context'
          }
        }
      },
      async exec(input: {
        actionId: string;
        context: Record<string, any>;
      }): Promise<{ result: Record<string, any> }> {
        try {
          const { actionId, context } = input;
          
          const feedbackCollector = new FeedbackCollector();
          const improvement = new FeedbackBasedImprovement({ feedbackCollector });
          
          const updatedContext = await improvement.applyAction(actionId, context);
          
          return { result: updatedContext };
        } catch (error: any) {
          throw new Error(`Failed to apply improvement action: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Evaluate Improvement',
      description: 'Evaluate an improvement',
      id: 'evaluateImprovement',
      inputSchema: {
        type: 'object',
        properties: {
          actionId: {
            type: 'string',
            description: 'The ID of the improvement action'
          },
          contextBefore: {
            type: 'object',
            description: 'The context before improvement'
          },
          contextAfter: {
            type: 'object',
            description: 'The context after improvement'
          }
        },
        required: ['actionId', 'contextBefore', 'contextAfter']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the improvement result'
              },
              actionId: {
                type: 'string',
                description: 'The ID of the improvement action'
              },
              success: {
                type: 'boolean',
                description: 'Whether the improvement was successful'
              },
              metricsBefore: {
                type: 'object',
                description: 'The metrics before the improvement'
              },
              metricsAfter: {
                type: 'object',
                description: 'The metrics after the improvement'
              },
              timestamp: {
                type: 'string',
                description: 'The timestamp of the improvement result'
              }
            }
          }
        }
      },
      async exec(input: {
        actionId: string;
        contextBefore: Record<string, any>;
        contextAfter: Record<string, any>;
      }): Promise<{ result: ImprovementResult }> {
        try {
          const { actionId, contextBefore, contextAfter } = input;
          
          const feedbackCollector = new FeedbackCollector();
          const improvement = new FeedbackBasedImprovement({ feedbackCollector });
          
          const result = await improvement.evaluateImprovement(actionId, contextBefore, contextAfter);
          
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to evaluate improvement: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Create Experiment',
      description: 'Create an A/B testing experiment',
      id: 'createExperiment',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the experiment'
          },
          variants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the variant'
                },
                name: {
                  type: 'string',
                  description: 'The name of the variant'
                },
                type: {
                  type: 'string',
                  enum: ['prompt', 'model', 'parameters', 'custom'],
                  description: 'The type of variant'
                },
                description: {
                  type: 'string',
                  description: 'The description of the variant'
                },
                config: {
                  type: 'object',
                  description: 'The configuration of the variant'
                }
              },
              required: ['id', 'name', 'type', 'config']
            },
            description: 'The variants in the experiment'
          },
          metrics: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The metrics to track'
          },
          description: {
            type: 'string',
            description: 'The description of the experiment'
          },
          trafficAllocation: {
            type: 'object',
            description: 'The traffic allocation for each variant'
          },
          status: {
            type: 'string',
            enum: ['draft', 'running', 'paused'],
            description: 'The status of the experiment'
          },
          metadata: {
            type: 'object',
            description: 'The metadata associated with the experiment'
          }
        },
        required: ['name', 'variants', 'metrics']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the experiment'
              },
              name: {
                type: 'string',
                description: 'The name of the experiment'
              },
              description: {
                type: 'string',
                description: 'The description of the experiment'
              },
              variants: {
                type: 'array',
                items: {
                  type: 'object',
                  description: 'The variant'
                },
                description: 'The variants in the experiment'
              },
              trafficAllocation: {
                type: 'object',
                description: 'The traffic allocation for each variant'
              },
              startDate: {
                type: 'string',
                description: 'The start date of the experiment'
              },
              status: {
                type: 'string',
                description: 'The status of the experiment'
              },
              metrics: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'The metrics to track'
              }
            }
          }
        }
      },
      async exec(input: {
        name: string;
        variants: Variant[];
        metrics: string[];
        description?: string;
        trafficAllocation?: Record<string, number>;
        status?: 'draft' | 'running' | 'paused';
        metadata?: Record<string, any>;
      }): Promise<{ result: Experiment }> {
        try {
          const { name, variants, metrics, description, trafficAllocation, status, metadata } = input;
          
          const feedbackCollector = new FeedbackCollector();
          const abTesting = new ABTesting({ feedbackCollector });
          
          const experiment = await abTesting.createExperiment(
            name,
            variants,
            metrics,
            {
              description,
              trafficAllocation,
              status,
              metadata
            }
          );
          
          return { result: experiment };
        } catch (error: any) {
          throw new Error(`Failed to create experiment: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Start Experiment',
      description: 'Start an A/B testing experiment',
      id: 'startExperiment',
      inputSchema: {
        type: 'object',
        properties: {
          experimentId: {
            type: 'string',
            description: 'The ID of the experiment'
          }
        },
        required: ['experimentId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the experiment'
              },
              name: {
                type: 'string',
                description: 'The name of the experiment'
              },
              status: {
                type: 'string',
                description: 'The status of the experiment'
              },
              startDate: {
                type: 'string',
                description: 'The start date of the experiment'
              }
            }
          }
        }
      },
      async exec(input: {
        experimentId: string;
      }): Promise<{ result: Experiment }> {
        try {
          const { experimentId } = input;
          
          const feedbackCollector = new FeedbackCollector();
          const abTesting = new ABTesting({ feedbackCollector });
          
          const experiment = await abTesting.startExperiment(experimentId);
          
          return { result: experiment };
        } catch (error: any) {
          throw new Error(`Failed to start experiment: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Get Variant for Session',
      description: 'Get a variant for a session',
      id: 'getVariantForSession',
      inputSchema: {
        type: 'object',
        properties: {
          experimentId: {
            type: 'string',
            description: 'The ID of the experiment'
          },
          sessionId: {
            type: 'string',
            description: 'The ID of the session'
          }
        },
        required: ['experimentId', 'sessionId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the variant'
              },
              name: {
                type: 'string',
                description: 'The name of the variant'
              },
              type: {
                type: 'string',
                description: 'The type of variant'
              },
              config: {
                type: 'object',
                description: 'The configuration of the variant'
              }
            }
          }
        }
      },
      async exec(input: {
        experimentId: string;
        sessionId: string;
      }): Promise<{ result: Variant }> {
        try {
          const { experimentId, sessionId } = input;
          
          const feedbackCollector = new FeedbackCollector();
          const abTesting = new ABTesting({ feedbackCollector });
          
          const variant = await abTesting.getVariantForSession(experimentId, sessionId);
          
          return { result: variant };
        } catch (error: any) {
          throw new Error(`Failed to get variant for session: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Record Experiment Result',
      description: 'Record an experiment result',
      id: 'recordExperimentResult',
      inputSchema: {
        type: 'object',
        properties: {
          experimentId: {
            type: 'string',
            description: 'The ID of the experiment'
          },
          variantId: {
            type: 'string',
            description: 'The ID of the variant'
          },
          sessionId: {
            type: 'string',
            description: 'The ID of the session'
          },
          messageId: {
            type: 'string',
            description: 'The ID of the message'
          },
          context: {
            type: 'object',
            description: 'The context for calculation'
          }
        },
        required: ['experimentId', 'variantId', 'sessionId', 'messageId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the experiment result'
              },
              experimentId: {
                type: 'string',
                description: 'The ID of the experiment'
              },
              variantId: {
                type: 'string',
                description: 'The ID of the variant'
              },
              sessionId: {
                type: 'string',
                description: 'The ID of the session'
              },
              messageId: {
                type: 'string',
                description: 'The ID of the message'
              },
              metrics: {
                type: 'object',
                description: 'The metrics'
              },
              timestamp: {
                type: 'string',
                description: 'The timestamp of the experiment result'
              }
            }
          }
        }
      },
      async exec(input: {
        experimentId: string;
        variantId: string;
        sessionId: string;
        messageId: string;
        context?: Record<string, any>;
      }): Promise<{ result: ExperimentResult }> {
        try {
          const { experimentId, variantId, sessionId, messageId, context = {} } = input;
          
          const feedbackCollector = new FeedbackCollector();
          const abTesting = new ABTesting({ feedbackCollector });
          
          const result = await abTesting.recordResult(
            experimentId,
            variantId,
            sessionId,
            messageId,
            context
          );
          
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to record experiment result: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Analyze Experiment',
      description: 'Analyze experiment results',
      id: 'analyzeExperiment',
      inputSchema: {
        type: 'object',
        properties: {
          experimentId: {
            type: 'string',
            description: 'The ID of the experiment'
          }
        },
        required: ['experimentId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              experiment: {
                type: 'object',
                description: 'The experiment'
              },
              metrics: {
                type: 'object',
                description: 'The metrics for each variant'
              },
              winner: {
                type: 'object',
                description: 'The winning variant'
              },
              winningMetrics: {
                type: 'object',
                description: 'The metrics for the winning variant'
              }
            }
          }
        }
      },
      async exec(input: {
        experimentId: string;
      }): Promise<{ result: any }> {
        try {
          const { experimentId } = input;
          
          const feedbackCollector = new FeedbackCollector();
          const abTesting = new ABTesting({ feedbackCollector });
          
          const analysis = await abTesting.analyzeExperiment(experimentId);
          
          return { result: analysis };
        } catch (error: any) {
          throw new Error(`Failed to analyze experiment: ${error?.message || 'Unknown error'}`);
        }
      }
    }
  ]
};

export default feedbackPlugin;
