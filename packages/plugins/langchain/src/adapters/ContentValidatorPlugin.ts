/**
 * Plugin for validating content
 */

import { ContentValidator, ValidationRule, ValidationResult, ContentValidationOptions, CommonValidationRules } from '../validation/ContentValidator.js';
import { z } from 'zod';

/**
 * Plugin for validating content
 */
const contentValidatorPlugin = {
  name: 'Content Validator',
  icon: 'GiCheckMark',
  description: 'Validate content against rules',
  id: 'content-validator',
  runner: 'node',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The content to validate'
      },
      rules: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The name of the rule'
            },
            description: {
              type: 'string',
              description: 'The description of the rule'
            },
            errorMessage: {
              type: 'string',
              description: 'The error message to display if the validation fails'
            },
            severity: {
              type: 'string',
              enum: ['error', 'warning', 'info'],
              description: 'The severity of the validation failure'
            }
          }
        },
        description: 'The validation rules to use'
      },
      failOnWarnings: {
        type: 'boolean',
        description: 'Whether to fail on warnings'
      },
      failOnInfo: {
        type: 'boolean',
        description: 'Whether to fail on info messages'
      },
      validateAsync: {
        type: 'boolean',
        description: 'Whether to validate asynchronously'
      }
    },
    required: ['content']
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: {
        type: 'object',
        properties: {
          passed: {
            type: 'boolean',
            description: 'Whether the validation passed'
          },
          ruleResults: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ruleName: {
                  type: 'string',
                  description: 'The name of the rule'
                },
                passed: {
                  type: 'boolean',
                  description: 'Whether the validation passed'
                },
                errorMessage: {
                  type: 'string',
                  description: 'The error message if the validation failed'
                },
                severity: {
                  type: 'string',
                  enum: ['error', 'warning', 'info'],
                  description: 'The severity of the validation failure'
                }
              }
            },
            description: 'The results for each rule'
          },
          errorCount: {
            type: 'number',
            description: 'The number of errors'
          },
          warningCount: {
            type: 'number',
            description: 'The number of warnings'
          },
          infoCount: {
            type: 'number',
            description: 'The number of info messages'
          }
        }
      }
    }
  },
  documentation: 'https://js.langchain.com/docs/',
  method: 'exec',
  actions: [
    {
      name: 'Validate Content',
      description: 'Validate content against rules',
      id: 'validateContent',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The content to validate'
          },
          rules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The name of the rule'
                },
                type: {
                  type: 'string',
                  enum: [
                    'notEmpty',
                    'length',
                    'containsKeywords',
                    'doesNotContainKeywords',
                    'matchesRegex',
                    'isValidJson',
                    'isValidXml',
                    'isValidYaml',
                    'conformsToSchema',
                    'hasReadingLevel',
                    'hasSentiment',
                    'isNotToxic',
                    'isNotBiased',
                    'custom'
                  ],
                  description: 'The type of the rule'
                },
                params: {
                  type: 'object',
                  description: 'The parameters for the rule'
                },
                errorMessage: {
                  type: 'string',
                  description: 'The error message to display if the validation fails'
                },
                severity: {
                  type: 'string',
                  enum: ['error', 'warning', 'info'],
                  description: 'The severity of the validation failure'
                }
              },
              required: ['name', 'type']
            },
            description: 'The validation rules to use'
          },
          options: {
            type: 'object',
            properties: {
              failOnWarnings: {
                type: 'boolean',
                description: 'Whether to fail on warnings'
              },
              failOnInfo: {
                type: 'boolean',
                description: 'Whether to fail on info messages'
              },
              validateAsync: {
                type: 'boolean',
                description: 'Whether to validate asynchronously'
              }
            },
            description: 'Options for validation'
          }
        },
        required: ['content']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              passed: {
                type: 'boolean',
                description: 'Whether the validation passed'
              },
              ruleResults: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    ruleName: {
                      type: 'string',
                      description: 'The name of the rule'
                    },
                    passed: {
                      type: 'boolean',
                      description: 'Whether the validation passed'
                    },
                    errorMessage: {
                      type: 'string',
                      description: 'The error message if the validation failed'
                    },
                    severity: {
                      type: 'string',
                      enum: ['error', 'warning', 'info'],
                      description: 'The severity of the validation failure'
                    }
                  }
                },
                description: 'The results for each rule'
              },
              errorCount: {
                type: 'number',
                description: 'The number of errors'
              },
              warningCount: {
                type: 'number',
                description: 'The number of warnings'
              },
              infoCount: {
                type: 'number',
                description: 'The number of info messages'
              }
            }
          }
        }
      },
      async exec(input: {
        content: string;
        rules?: Array<{
          name: string;
          type: string;
          params?: Record<string, any>;
          errorMessage?: string;
          severity?: 'error' | 'warning' | 'info';
        }>;
        options?: ContentValidationOptions;
      }): Promise<{ result: ValidationResult }> {
        try {
          const { content, rules = [], options = {} } = input;
          
          // Create validation rules
          const validationRules: ValidationRule[] = rules.map(rule => {
            const { name, type, params = {}, errorMessage, severity = 'error' } = rule;
            
            // Create the validation function based on the rule type
            let validationRule: ValidationRule;
            
            switch (type) {
              case 'notEmpty':
                validationRule = CommonValidationRules.notEmpty();
                break;
              case 'length':
                validationRule = CommonValidationRules.length(
                  params.minLength || 0,
                  params.maxLength || 1000
                );
                break;
              case 'containsKeywords':
                validationRule = CommonValidationRules.containsKeywords(
                  params.keywords || [],
                  params.caseSensitive || false
                );
                break;
              case 'doesNotContainKeywords':
                validationRule = CommonValidationRules.doesNotContainKeywords(
                  params.keywords || [],
                  params.caseSensitive || false
                );
                break;
              case 'matchesRegex':
                validationRule = CommonValidationRules.matchesRegex(
                  new RegExp(params.regex || '', params.flags || '')
                );
                break;
              case 'isValidJson':
                validationRule = CommonValidationRules.isValidJson();
                break;
              case 'isValidXml':
                validationRule = CommonValidationRules.isValidXml();
                break;
              case 'isValidYaml':
                validationRule = CommonValidationRules.isValidYaml();
                break;
              case 'conformsToSchema':
                // This is a placeholder. In a real implementation, you would parse the schema
                // and create a Zod schema from it.
                validationRule = CommonValidationRules.conformsToSchema(
                  z.any()
                );
                break;
              case 'hasReadingLevel':
                validationRule = CommonValidationRules.hasReadingLevel(
                  params.maxGradeLevel || 12
                );
                break;
              case 'hasSentiment':
                validationRule = CommonValidationRules.hasSentiment(
                  params.minScore || -1,
                  params.maxScore || 1
                );
                break;
              case 'isNotToxic':
                validationRule = CommonValidationRules.isNotToxic(
                  params.toxicityThreshold || 0.5
                );
                break;
              case 'isNotBiased':
                validationRule = CommonValidationRules.isNotBiased(
                  params.biasThreshold || 0.5
                );
                break;
              case 'custom':
                // For custom rules, we need to create a validation function from the provided code
                // This is a placeholder. In a real implementation, you would use a safer way to
                // create a validation function from code.
                validationRule = {
                  name,
                  description: params.description || `Custom rule: ${name}`,
                  validate: (content: string) => {
                    try {
                      // This is a placeholder. In a real implementation, you would use a safer way to
                      // create a validation function from code.
                      return true;
                    } catch (error) {
                      return false;
                    }
                  },
                  errorMessage: errorMessage || `Custom rule ${name} failed`,
                  severity
                };
                break;
              default:
                throw new Error(`Unknown rule type: ${type}`);
            }
            
            // Override the rule properties if provided
            return {
              ...validationRule,
              name,
              errorMessage: errorMessage || validationRule.errorMessage,
              severity: severity || validationRule.severity
            };
          });
          
          // Create the validator
          const validator = new ContentValidator(validationRules);
          
          // Validate the content
          let result: ValidationResult;
          if (options.validateAsync) {
            result = await validator.validateAsync(content, options);
          } else {
            result = validator.validate(content, options);
          }
          
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to validate content: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Validate JSON Schema',
      description: 'Validate JSON content against a schema',
      id: 'validateJsonSchema',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The JSON content to validate'
          },
          schema: {
            type: 'object',
            description: 'The JSON schema to validate against'
          }
        },
        required: ['content', 'schema']
      },
      outputSchema: {
        type: 'object',
        properties: {
          valid: {
            type: 'boolean',
            description: 'Whether the content is valid'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'The path to the error'
                },
                message: {
                  type: 'string',
                  description: 'The error message'
                }
              }
            },
            description: 'The validation errors'
          }
        }
      },
      async exec(input: {
        content: string;
        schema: Record<string, any>;
      }): Promise<{
        valid: boolean;
        errors: Array<{
          path: string;
          message: string;
        }>;
      }> {
        try {
          const { content, schema } = input;
          
          // Parse the content
          let parsedContent: any;
          try {
            parsedContent = JSON.parse(content);
          } catch (error: any) {
            return {
              valid: false,
              errors: [{
                path: '',
                message: `Invalid JSON: ${error?.message || 'Unknown error'}`
              }]
            };
          }
          
          // Create a Zod schema from the JSON schema
          // This is a placeholder. In a real implementation, you would use a library
          // like zod-to-json-schema to convert between Zod and JSON Schema.
          const zodSchema = z.any();
          
          // Validate the content against the schema
          const result = zodSchema.safeParse(parsedContent);
          
          if (result.success) {
            return {
              valid: true,
              errors: []
            };
          } else {
            // Format the errors
            const errors = result.error.errors.map(error => ({
              path: error.path.join('.'),
              message: error.message
            }));
            
            return {
              valid: false,
              errors
            };
          }
        } catch (error: any) {
          throw new Error(`Failed to validate JSON schema: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Check for Hallucinations',
      description: 'Check if content contains hallucinations',
      id: 'checkForHallucinations',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The content to check for hallucinations'
          },
          referenceText: {
            type: 'string',
            description: 'The reference text to check against'
          },
          threshold: {
            type: 'number',
            description: 'The threshold for hallucination detection (0-1)'
          }
        },
        required: ['content', 'referenceText']
      },
      outputSchema: {
        type: 'object',
        properties: {
          hasHallucinations: {
            type: 'boolean',
            description: 'Whether the content contains hallucinations'
          },
          score: {
            type: 'number',
            description: 'The hallucination score (0-1)'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                segment: {
                  type: 'string',
                  description: 'The segment of the content'
                },
                score: {
                  type: 'number',
                  description: 'The hallucination score for the segment (0-1)'
                },
                explanation: {
                  type: 'string',
                  description: 'The explanation for the hallucination score'
                }
              }
            },
            description: 'The details of the hallucination detection'
          }
        }
      },
      async exec(input: {
        content: string;
        referenceText: string;
        threshold?: number;
      }): Promise<{
        hasHallucinations: boolean;
        score: number;
        details: Array<{
          segment: string;
          score: number;
          explanation: string;
        }>;
      }> {
        try {
          const { content, referenceText, threshold = 0.5 } = input;
          
          // This is a placeholder. In a real implementation, you would use a more
          // sophisticated hallucination detection algorithm.
          
          // Split the content into sentences
          const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
          
          // Check each sentence for hallucinations
          const details = sentences.map(sentence => {
            // Calculate a hallucination score based on whether the sentence
            // contains information that is not in the reference text
            const words = sentence.toLowerCase().split(/\s+/);
            const referenceWords = referenceText.toLowerCase().split(/\s+/);
            
            // Count how many words in the sentence are not in the reference text
            const hallucinations = words.filter(word => !referenceWords.includes(word));
            const hallucinationRatio = hallucinations.length / words.length;
            
            return {
              segment: sentence.trim(),
              score: hallucinationRatio,
              explanation: hallucinationRatio > threshold
                ? `Contains ${hallucinations.length} words not found in reference text: ${hallucinations.join(', ')}`
                : 'No significant hallucinations detected'
            };
          });
          
          // Calculate the overall hallucination score
          const overallScore = details.reduce((sum, detail) => sum + detail.score, 0) / details.length;
          
          return {
            hasHallucinations: overallScore > threshold,
            score: overallScore,
            details
          };
        } catch (error: any) {
          throw new Error(`Failed to check for hallucinations: ${error?.message || 'Unknown error'}`);
        }
      }
    }
  ]
};

export default contentValidatorPlugin;
