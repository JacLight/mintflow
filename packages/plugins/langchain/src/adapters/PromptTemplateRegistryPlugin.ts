/**
 * Plugin for managing prompt templates
 */

import { PromptTemplateRegistry, RegisterTemplateOptions, AddVersionOptions, GetTemplatesOptions } from '../registry/PromptTemplateRegistry.js';

/**
 * Plugin for managing prompt templates
 */
const promptTemplateRegistryPlugin = {
  name: 'Prompt Template Registry',
  icon: 'GiNotebook',
  description: 'Manage and version prompt templates',
  id: 'prompt-template-registry',
  runner: 'node',
  inputSchema: {
    type: 'object',
    properties: {
      templateId: {
        type: 'string',
        description: 'The ID of the template'
      },
      name: {
        type: 'string',
        description: 'The name of the template'
      },
      description: {
        type: 'string',
        description: 'The description of the template'
      },
      tags: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'The tags associated with the template'
      },
      template: {
        type: 'object',
        description: 'The prompt template'
      },
      version: {
        type: 'string',
        description: 'The version of the template'
      },
      author: {
        type: 'string',
        description: 'The author of the template'
      },
      notes: {
        type: 'string',
        description: 'Notes about the template'
      },
      metrics: {
        type: 'object',
        description: 'Performance metrics for the template'
      },
      setAsCurrent: {
        type: 'boolean',
        description: 'Whether to set this version as the current version'
      },
      nameContains: {
        type: 'string',
        description: 'Filter templates by name (substring match)'
      },
      sortBy: {
        type: 'string',
        enum: ['name', 'createdAt', 'updatedAt'],
        description: 'Sort templates by field'
      },
      sortDirection: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort direction'
      },
      limit: {
        type: 'number',
        description: 'Limit the number of results'
      },
      skip: {
        type: 'number',
        description: 'Skip the first n results'
      }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: {
        type: 'any',
        description: 'The result of the operation'
      }
    }
  },
  documentation: 'https://js.langchain.com/docs/modules/model_io/prompts/',
  method: 'exec',
  actions: [
    {
      name: 'Register Template',
      description: 'Register a new prompt template',
      id: 'registerTemplate',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The ID of the template (optional, will be generated if not provided)'
          },
          name: {
            type: 'string',
            description: 'The name of the template'
          },
          description: {
            type: 'string',
            description: 'The description of the template'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The tags associated with the template'
          },
          template: {
            type: 'object',
            description: 'The prompt template'
          },
          versionInfo: {
            type: 'object',
            properties: {
              author: {
                type: 'string',
                description: 'The author of the template'
              },
              notes: {
                type: 'string',
                description: 'Notes about the template'
              },
              metrics: {
                type: 'object',
                description: 'Performance metrics for the template'
              }
            },
            description: 'Version information'
          }
        },
        required: ['name', 'template']
      },
      outputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the registered template'
          }
        }
      },
      async exec(input: RegisterTemplateOptions) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const templateId = registry.registerTemplate(input);
          return { templateId };
        } catch (error: any) {
          throw new Error(`Failed to register template: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Add Version',
      description: 'Add a new version to an existing template',
      id: 'addVersion',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template'
          },
          version: {
            type: 'string',
            description: 'The version number'
          },
          template: {
            type: 'object',
            description: 'The prompt template'
          },
          versionInfo: {
            type: 'object',
            properties: {
              author: {
                type: 'string',
                description: 'The author of the template'
              },
              notes: {
                type: 'string',
                description: 'Notes about the template'
              },
              metrics: {
                type: 'object',
                description: 'Performance metrics for the template'
              }
            },
            description: 'Version information'
          },
          setAsCurrent: {
            type: 'boolean',
            description: 'Whether to set this version as the current version'
          }
        },
        required: ['templateId', 'version', 'template']
      },
      outputSchema: {
        type: 'object',
        properties: {
          template: {
            type: 'object',
            description: 'The updated template'
          }
        }
      },
      async exec(input: AddVersionOptions) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const template = registry.addVersion(input);
          return { template };
        } catch (error: any) {
          throw new Error(`Failed to add version: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Get Template',
      description: 'Get a prompt template by ID',
      id: 'getTemplate',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template'
          },
          version: {
            type: 'string',
            description: 'The version to get (optional, defaults to current version)'
          }
        },
        required: ['templateId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          template: {
            type: 'object',
            description: 'The prompt template'
          }
        }
      },
      async exec(input: { templateId: string; version?: string }) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const template = registry.getTemplate(input.templateId, input.version);
          return { template };
        } catch (error: any) {
          throw new Error(`Failed to get template: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Get Template Metadata',
      description: 'Get metadata for a prompt template by ID',
      id: 'getTemplateMetadata',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template'
          }
        },
        required: ['templateId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          metadata: {
            type: 'object',
            description: 'The template metadata'
          }
        }
      },
      async exec(input: { templateId: string }) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const metadata = registry.getTemplateMetadata(input.templateId);
          return { metadata };
        } catch (error: any) {
          throw new Error(`Failed to get template metadata: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Get Templates',
      description: 'Get all prompt templates',
      id: 'getTemplates',
      inputSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Filter by tags'
          },
          nameContains: {
            type: 'string',
            description: 'Filter by name (substring match)'
          },
          sortBy: {
            type: 'string',
            enum: ['name', 'createdAt', 'updatedAt'],
            description: 'Sort by field'
          },
          sortDirection: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: 'Sort direction'
          },
          limit: {
            type: 'number',
            description: 'Limit the number of results'
          },
          skip: {
            type: 'number',
            description: 'Skip the first n results'
          }
        }
      },
      outputSchema: {
        type: 'object',
        properties: {
          templates: {
            type: 'array',
            items: {
              type: 'object'
            },
            description: 'The templates'
          }
        }
      },
      async exec(input: GetTemplatesOptions) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const templates = registry.getTemplates(input);
          return { templates };
        } catch (error: any) {
          throw new Error(`Failed to get templates: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Delete Template',
      description: 'Delete a prompt template',
      id: 'deleteTemplate',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template'
          }
        },
        required: ['templateId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the template was deleted'
          }
        }
      },
      async exec(input: { templateId: string }) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const success = registry.deleteTemplate(input.templateId);
          return { success };
        } catch (error: any) {
          throw new Error(`Failed to delete template: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Delete Version',
      description: 'Delete a version of a prompt template',
      id: 'deleteVersion',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template'
          },
          version: {
            type: 'string',
            description: 'The version to delete'
          }
        },
        required: ['templateId', 'version']
      },
      outputSchema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the version was deleted'
          }
        }
      },
      async exec(input: { templateId: string; version: string }) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const success = registry.deleteVersion(input.templateId, input.version);
          return { success };
        } catch (error: any) {
          throw new Error(`Failed to delete version: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Set Current Version',
      description: 'Set the current version of a prompt template',
      id: 'setCurrentVersion',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template'
          },
          version: {
            type: 'string',
            description: 'The version to set as current'
          }
        },
        required: ['templateId', 'version']
      },
      outputSchema: {
        type: 'object',
        properties: {
          template: {
            type: 'object',
            description: 'The updated template'
          }
        }
      },
      async exec(input: { templateId: string; version: string }) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const template = registry.setCurrentVersion(input.templateId, input.version);
          return { template };
        } catch (error: any) {
          throw new Error(`Failed to set current version: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Update Template Metadata',
      description: 'Update metadata for a prompt template',
      id: 'updateTemplateMetadata',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template'
          },
          metadata: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The name of the template'
              },
              description: {
                type: 'string',
                description: 'The description of the template'
              },
              tags: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'The tags associated with the template'
              }
            },
            description: 'The metadata to update'
          }
        },
        required: ['templateId', 'metadata']
      },
      outputSchema: {
        type: 'object',
        properties: {
          template: {
            type: 'object',
            description: 'The updated template'
          }
        }
      },
      async exec(input: { 
        templateId: string; 
        metadata: {
          name?: string;
          description?: string;
          tags?: string[];
        }
      }) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const template = registry.updateTemplateMetadata(input.templateId, input.metadata);
          return { template };
        } catch (error: any) {
          throw new Error(`Failed to update template metadata: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Update Version Metadata',
      description: 'Update metadata for a version of a prompt template',
      id: 'updateVersionMetadata',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template'
          },
          version: {
            type: 'string',
            description: 'The version to update'
          },
          metadata: {
            type: 'object',
            properties: {
              author: {
                type: 'string',
                description: 'The author of the version'
              },
              notes: {
                type: 'string',
                description: 'Notes about the version'
              },
              metrics: {
                type: 'object',
                description: 'Performance metrics for the version'
              }
            },
            description: 'The metadata to update'
          }
        },
        required: ['templateId', 'version', 'metadata']
      },
      outputSchema: {
        type: 'object',
        properties: {
          template: {
            type: 'object',
            description: 'The updated template'
          }
        }
      },
      async exec(input: { 
        templateId: string; 
        version: string;
        metadata: {
          author?: string;
          notes?: string;
          metrics?: Record<string, number>;
        }
      }) {
        try {
          const registry = PromptTemplateRegistry.getInstance();
          const template = registry.updateVersionMetadata(input.templateId, input.version, input.metadata);
          return { template };
        } catch (error: any) {
          throw new Error(`Failed to update version metadata: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'A/B Test Templates',
      description: 'Run an A/B test on multiple prompt templates',
      id: 'abTestTemplates',
      inputSchema: {
        type: 'object',
        properties: {
          templateIds: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The IDs of the templates to test'
          },
          versions: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The versions of the templates to test (optional, defaults to current versions)'
          },
          testCases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                input: {
                  type: 'object',
                  description: 'The input for the test case'
                },
                expectedOutput: {
                  type: 'string',
                  description: 'The expected output for the test case'
                }
              }
            },
            description: 'The test cases to run'
          },
          evaluationMetrics: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['accuracy', 'relevance', 'coherence', 'fluency', 'groundedness', 'toxicity']
            },
            description: 'The metrics to evaluate'
          },
          llm: {
            type: 'string',
            description: 'The language model to use for evaluation'
          },
          numSamples: {
            type: 'number',
            description: 'The number of samples to generate for each test case'
          }
        },
        required: ['templateIds', 'testCases', 'evaluationMetrics', 'llm']
      },
      outputSchema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                templateId: {
                  type: 'string',
                  description: 'The ID of the template'
                },
                version: {
                  type: 'string',
                  description: 'The version of the template'
                },
                metrics: {
                  type: 'object',
                  description: 'The evaluation metrics'
                },
                samples: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      input: {
                        type: 'object',
                        description: 'The input for the sample'
                      },
                      output: {
                        type: 'string',
                        description: 'The output for the sample'
                      },
                      metrics: {
                        type: 'object',
                        description: 'The evaluation metrics for the sample'
                      }
                    }
                  },
                  description: 'The samples generated for the template'
                }
              }
            },
            description: 'The results of the A/B test'
          },
          winner: {
            type: 'object',
            properties: {
              templateId: {
                type: 'string',
                description: 'The ID of the winning template'
              },
              version: {
                type: 'string',
                description: 'The version of the winning template'
              },
              metrics: {
                type: 'object',
                description: 'The evaluation metrics for the winning template'
              }
            },
            description: 'The winning template'
          }
        }
      },
      async exec(input: { 
        templateIds: string[]; 
        versions?: string[];
        testCases: Array<{
          input: Record<string, any>;
          expectedOutput?: string;
        }>;
        evaluationMetrics: string[];
        llm: string;
        numSamples?: number;
      }) {
        try {
          // This is a placeholder for the A/B testing functionality
          // In a real implementation, you would:
          // 1. Get the templates from the registry
          // 2. Run the test cases through each template
          // 3. Evaluate the results using the specified metrics
          // 4. Determine the winner
          
          // For now, we'll just return a mock result
          return {
            results: input.templateIds.map((templateId, index) => ({
              templateId,
              version: input.versions?.[index] || 'current',
              metrics: {
                accuracy: 0.8 + Math.random() * 0.2,
                relevance: 0.7 + Math.random() * 0.3,
                coherence: 0.75 + Math.random() * 0.25,
                fluency: 0.85 + Math.random() * 0.15,
                groundedness: 0.6 + Math.random() * 0.4,
                toxicity: 0.1 + Math.random() * 0.1
              },
              samples: input.testCases.map(testCase => ({
                input: testCase.input,
                output: `Sample output for template ${templateId}`,
                metrics: {
                  accuracy: 0.8 + Math.random() * 0.2,
                  relevance: 0.7 + Math.random() * 0.3,
                  coherence: 0.75 + Math.random() * 0.25,
                  fluency: 0.85 + Math.random() * 0.15,
                  groundedness: 0.6 + Math.random() * 0.4,
                  toxicity: 0.1 + Math.random() * 0.1
                }
              }))
            })),
            winner: {
              templateId: input.templateIds[0],
              version: input.versions?.[0] || 'current',
              metrics: {
                accuracy: 0.9,
                relevance: 0.85,
                coherence: 0.88,
                fluency: 0.92,
                groundedness: 0.8,
                toxicity: 0.05
              }
            }
          };
        } catch (error: any) {
          throw new Error(`Failed to run A/B test: ${error?.message || 'Unknown error'}`);
        }
      }
    }
  ]
};

export default promptTemplateRegistryPlugin;
