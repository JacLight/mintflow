/**
 * Content validator for LLM outputs
 */

import { z } from 'zod';

/**
 * Validation rule for content
 */
export interface ValidationRule {
  /**
   * The name of the rule
   */
  name: string;
  
  /**
   * The description of the rule
   */
  description: string;
  
  /**
   * The validation function
   * 
   * @param content The content to validate
   * @returns Whether the content is valid
   */
  validate: (content: string) => boolean | Promise<boolean>;
  
  /**
   * The error message to display if the validation fails
   */
  errorMessage: string;
  
  /**
   * The severity of the validation failure
   */
  severity: 'error' | 'warning' | 'info';
}

/**
 * Validation result for a rule
 */
export interface ValidationRuleResult {
  /**
   * The name of the rule
   */
  ruleName: string;
  
  /**
   * Whether the validation passed
   */
  passed: boolean;
  
  /**
   * The error message if the validation failed
   */
  errorMessage?: string;
  
  /**
   * The severity of the validation failure
   */
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Validation result for content
 */
export interface ValidationResult {
  /**
   * Whether the validation passed
   */
  passed: boolean;
  
  /**
   * The results for each rule
   */
  ruleResults: ValidationRuleResult[];
  
  /**
   * The number of errors
   */
  errorCount: number;
  
  /**
   * The number of warnings
   */
  warningCount: number;
  
  /**
   * The number of info messages
   */
  infoCount: number;
}

/**
 * Options for content validation
 */
export interface ContentValidationOptions {
  /**
   * Whether to fail on warnings
   */
  failOnWarnings?: boolean;
  
  /**
   * Whether to fail on info messages
   */
  failOnInfo?: boolean;
  
  /**
   * Whether to validate asynchronously
   */
  validateAsync?: boolean;
}

/**
 * Content validator for LLM outputs
 */
export class ContentValidator {
  private rules: ValidationRule[] = [];
  
  /**
   * Create a new content validator
   * 
   * @param rules The validation rules to use
   */
  constructor(rules: ValidationRule[] = []) {
    this.rules = rules;
  }
  
  /**
   * Add a validation rule
   * 
   * @param rule The rule to add
   */
  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }
  
  /**
   * Add multiple validation rules
   * 
   * @param rules The rules to add
   */
  addRules(rules: ValidationRule[]): void {
    this.rules.push(...rules);
  }
  
  /**
   * Remove a validation rule by name
   * 
   * @param ruleName The name of the rule to remove
   * @returns Whether the rule was removed
   */
  removeRule(ruleName: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
    return this.rules.length !== initialLength;
  }
  
  /**
   * Get all validation rules
   * 
   * @returns The validation rules
   */
  getRules(): ValidationRule[] {
    return [...this.rules];
  }
  
  /**
   * Validate content synchronously
   * 
   * @param content The content to validate
   * @param options Options for validation
   * @returns The validation result
   */
  validate(content: string, options: ContentValidationOptions = {}): ValidationResult {
    const { failOnWarnings = false, failOnInfo = false } = options;
    
    const ruleResults: ValidationRuleResult[] = [];
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    
    for (const rule of this.rules) {
      try {
        const passed = rule.validate(content) as boolean;
        
        if (passed) {
          ruleResults.push({
            ruleName: rule.name,
            passed: true
          });
        } else {
          ruleResults.push({
            ruleName: rule.name,
            passed: false,
            errorMessage: rule.errorMessage,
            severity: rule.severity
          });
          
          if (rule.severity === 'error') {
            errorCount++;
          } else if (rule.severity === 'warning') {
            warningCount++;
          } else if (rule.severity === 'info') {
            infoCount++;
          }
        }
      } catch (error) {
        ruleResults.push({
          ruleName: rule.name,
          passed: false,
          errorMessage: `Error during validation: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error' as const
        });
        errorCount++;
      }
    }
    
    const passed = errorCount === 0 && 
      (!failOnWarnings || warningCount === 0) && 
      (!failOnInfo || infoCount === 0);
    
    return {
      passed,
      ruleResults,
      errorCount,
      warningCount,
      infoCount
    };
  }
  
  /**
   * Validate content asynchronously
   * 
   * @param content The content to validate
   * @param options Options for validation
   * @returns The validation result
   */
  async validateAsync(content: string, options: ContentValidationOptions = {}): Promise<ValidationResult> {
    const { failOnWarnings = false, failOnInfo = false } = options;
    
    const ruleResults: ValidationRuleResult[] = [];
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    
    const validationPromises = this.rules.map(async (rule) => {
      try {
        const passed = await Promise.resolve(rule.validate(content));
        
        if (passed) {
          return {
            ruleName: rule.name,
            passed: true
          };
        } else {
          if (rule.severity === 'error') {
            errorCount++;
          } else if (rule.severity === 'warning') {
            warningCount++;
          } else if (rule.severity === 'info') {
            infoCount++;
          }
          
          return {
            ruleName: rule.name,
            passed: false,
            errorMessage: rule.errorMessage,
            severity: rule.severity
          };
        }
      } catch (error) {
        errorCount++;
        
        return {
          ruleName: rule.name,
          passed: false,
          errorMessage: `Error during validation: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error' as const
        };
      }
    });
    
    const results = await Promise.all(validationPromises);
    ruleResults.push(...results);
    
    // Recount errors, warnings, and info messages
    errorCount = ruleResults.filter(result => !result.passed && result.severity === 'error').length;
    warningCount = ruleResults.filter(result => !result.passed && result.severity === 'warning').length;
    infoCount = ruleResults.filter(result => !result.passed && result.severity === 'info').length;
    
    const passed = errorCount === 0 && 
      (!failOnWarnings || warningCount === 0) && 
      (!failOnInfo || infoCount === 0);
    
    return {
      passed,
      ruleResults,
      errorCount,
      warningCount,
      infoCount
    };
  }
}

/**
 * Common validation rules
 */
export const CommonValidationRules = {
  /**
   * Check if the content is not empty
   */
  notEmpty: (): ValidationRule => ({
    name: 'notEmpty',
    description: 'Check if the content is not empty',
    validate: (content: string) => content.trim().length > 0,
    errorMessage: 'Content cannot be empty',
    severity: 'error'
  }),
  
  /**
   * Check if the content is within a certain length
   * 
   * @param minLength The minimum length
   * @param maxLength The maximum length
   */
  length: (minLength: number, maxLength: number): ValidationRule => ({
    name: 'length',
    description: `Check if the content is between ${minLength} and ${maxLength} characters`,
    validate: (content: string) => {
      const length = content.length;
      return length >= minLength && length <= maxLength;
    },
    errorMessage: `Content must be between ${minLength} and ${maxLength} characters`,
    severity: 'error'
  }),
  
  /**
   * Check if the content contains certain keywords
   * 
   * @param keywords The keywords to check for
   * @param caseSensitive Whether the check is case sensitive
   */
  containsKeywords: (keywords: string[], caseSensitive: boolean = false): ValidationRule => ({
    name: 'containsKeywords',
    description: `Check if the content contains the keywords: ${keywords.join(', ')}`,
    validate: (content: string) => {
      const contentToCheck = caseSensitive ? content : content.toLowerCase();
      const keywordsToCheck = caseSensitive ? keywords : keywords.map(k => k.toLowerCase());
      return keywordsToCheck.every(keyword => contentToCheck.includes(keyword));
    },
    errorMessage: `Content must contain all of the following keywords: ${keywords.join(', ')}`,
    severity: 'error'
  }),
  
  /**
   * Check if the content does not contain certain keywords
   * 
   * @param keywords The keywords to check for
   * @param caseSensitive Whether the check is case sensitive
   */
  doesNotContainKeywords: (keywords: string[], caseSensitive: boolean = false): ValidationRule => ({
    name: 'doesNotContainKeywords',
    description: `Check if the content does not contain the keywords: ${keywords.join(', ')}`,
    validate: (content: string) => {
      const contentToCheck = caseSensitive ? content : content.toLowerCase();
      const keywordsToCheck = caseSensitive ? keywords : keywords.map(k => k.toLowerCase());
      return keywordsToCheck.every(keyword => !contentToCheck.includes(keyword));
    },
    errorMessage: `Content must not contain any of the following keywords: ${keywords.join(', ')}`,
    severity: 'error'
  }),
  
  /**
   * Check if the content matches a regular expression
   * 
   * @param regex The regular expression to match
   */
  matchesRegex: (regex: RegExp): ValidationRule => ({
    name: 'matchesRegex',
    description: `Check if the content matches the regular expression: ${regex}`,
    validate: (content: string) => regex.test(content),
    errorMessage: `Content must match the regular expression: ${regex}`,
    severity: 'error'
  }),
  
  /**
   * Check if the content is valid JSON
   */
  isValidJson: (): ValidationRule => ({
    name: 'isValidJson',
    description: 'Check if the content is valid JSON',
    validate: (content: string) => {
      try {
        JSON.parse(content);
        return true;
      } catch (error) {
        return false;
      }
    },
    errorMessage: 'Content must be valid JSON',
    severity: 'error'
  }),
  
  /**
   * Check if the content is valid XML
   */
  isValidXml: (): ValidationRule => ({
    name: 'isValidXml',
    description: 'Check if the content is valid XML',
    validate: (content: string) => {
      try {
        // This is a placeholder. In a real implementation, you would use an XML parser
        // like fast-xml-parser to validate the content.
        return true;
      } catch (error) {
        return false;
      }
    },
    errorMessage: 'Content must be valid XML',
    severity: 'error'
  }),
  
  /**
   * Check if the content is valid YAML
   */
  isValidYaml: (): ValidationRule => ({
    name: 'isValidYaml',
    description: 'Check if the content is valid YAML',
    validate: (content: string) => {
      try {
        // This is a placeholder. In a real implementation, you would use a YAML parser
        // like js-yaml to validate the content.
        return true;
      } catch (error) {
        return false;
      }
    },
    errorMessage: 'Content must be valid YAML',
    severity: 'error'
  }),
  
  /**
   * Check if the content conforms to a Zod schema
   * 
   * @param schema The Zod schema to validate against
   */
  conformsToSchema: (schema: z.ZodType<any>): ValidationRule => ({
    name: 'conformsToSchema',
    description: 'Check if the content conforms to a schema',
    validate: (content: string) => {
      try {
        const data = JSON.parse(content);
        const result = schema.safeParse(data);
        return result.success;
      } catch (error) {
        return false;
      }
    },
    errorMessage: 'Content must conform to the specified schema',
    severity: 'error'
  }),
  
  /**
   * Check if the content has a reading level below a certain grade level
   * 
   * @param maxGradeLevel The maximum grade level
   */
  hasReadingLevel: (maxGradeLevel: number): ValidationRule => ({
    name: 'hasReadingLevel',
    description: `Check if the content has a reading level below grade ${maxGradeLevel}`,
    validate: (content: string) => {
      // This is a placeholder. In a real implementation, you would use a readability
      // formula like Flesch-Kincaid to calculate the grade level.
      const words = content.split(/\s+/).length;
      const sentences = content.split(/[.!?]+/).length;
      const syllables = content.length / 3; // Very rough approximation
      
      // Flesch-Kincaid Grade Level formula
      const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
      
      return gradeLevel <= maxGradeLevel;
    },
    errorMessage: `Content must have a reading level below grade ${maxGradeLevel}`,
    severity: 'warning'
  }),
  
  /**
   * Check if the content has a sentiment score within a certain range
   * 
   * @param minScore The minimum sentiment score (-1 to 1)
   * @param maxScore The maximum sentiment score (-1 to 1)
   */
  hasSentiment: (minScore: number, maxScore: number): ValidationRule => ({
    name: 'hasSentiment',
    description: `Check if the content has a sentiment score between ${minScore} and ${maxScore}`,
    validate: (content: string) => {
      // This is a placeholder. In a real implementation, you would use a sentiment
      // analysis library to calculate the sentiment score.
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific', 'outstanding', 'superb', 'brilliant'];
      const negativeWords = ['bad', 'terrible', 'horrible', 'awful', 'poor', 'disappointing', 'dreadful', 'abysmal', 'atrocious', 'appalling'];
      
      const words = content.toLowerCase().split(/\s+/);
      const positiveCount = words.filter(word => positiveWords.includes(word)).length;
      const negativeCount = words.filter(word => negativeWords.includes(word)).length;
      
      const totalWords = words.length;
      const sentimentScore = (positiveCount - negativeCount) / totalWords;
      
      return sentimentScore >= minScore && sentimentScore <= maxScore;
    },
    errorMessage: `Content must have a sentiment score between ${minScore} and ${maxScore}`,
    severity: 'warning'
  }),
  
  /**
   * Check if the content is not toxic
   * 
   * @param toxicityThreshold The toxicity threshold (0 to 1)
   */
  isNotToxic: (toxicityThreshold: number = 0.5): ValidationRule => ({
    name: 'isNotToxic',
    description: `Check if the content is not toxic (toxicity score < ${toxicityThreshold})`,
    validate: (content: string) => {
      // This is a placeholder. In a real implementation, you would use a toxicity
      // detection model to calculate the toxicity score.
      const toxicWords = ['hate', 'kill', 'die', 'stupid', 'idiot', 'dumb', 'moron', 'retard', 'crap', 'shit', 'fuck', 'damn', 'ass', 'bitch', 'bastard'];
      
      const words = content.toLowerCase().split(/\s+/);
      const toxicCount = words.filter(word => toxicWords.includes(word)).length;
      
      const totalWords = words.length;
      const toxicityScore = toxicCount / totalWords;
      
      return toxicityScore < toxicityThreshold;
    },
    errorMessage: `Content must not be toxic (toxicity score < ${toxicityThreshold})`,
    severity: 'error'
  }),
  
  /**
   * Check if the content is not biased
   * 
   * @param biasThreshold The bias threshold (0 to 1)
   */
  isNotBiased: (biasThreshold: number = 0.5): ValidationRule => ({
    name: 'isNotBiased',
    description: `Check if the content is not biased (bias score < ${biasThreshold})`,
    validate: (content: string) => {
      // This is a placeholder. In a real implementation, you would use a bias
      // detection model to calculate the bias score.
      const biasedWords = ['always', 'never', 'all', 'none', 'every', 'only', 'best', 'worst', 'perfect', 'terrible'];
      
      const words = content.toLowerCase().split(/\s+/);
      const biasedCount = words.filter(word => biasedWords.includes(word)).length;
      
      const totalWords = words.length;
      const biasScore = biasedCount / totalWords;
      
      return biasScore < biasThreshold;
    },
    errorMessage: `Content must not be biased (bias score < ${biasThreshold})`,
    severity: 'warning'
  })
};
