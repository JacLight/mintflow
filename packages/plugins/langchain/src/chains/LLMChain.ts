import { z } from 'zod';
import { OutputParser } from '../parsers/index.js';

/**
 * Interface for LLM providers
 */
export interface LLM {
  /**
   * Generate a completion for the given prompt
   * 
   * @param prompt The prompt to generate a completion for
   * @param options Optional parameters for the completion
   * @returns The generated completion
   */
  complete(prompt: string, options?: any): Promise<string>;
}

/**
 * Interface for prompt templates
 */
export interface PromptTemplate {
  /**
   * Format the prompt template with the given values
   * 
   * @param values The values to format the prompt with
   * @returns The formatted prompt
   */
  format(values: Record<string, any>): string;
}

/**
 * Options for LLMChain
 */
export interface LLMChainOptions {
  /**
   * The LLM to use for the chain
   */
  llm: LLM;
  
  /**
   * The prompt template to use for the chain
   */
  promptTemplate: PromptTemplate;
  
  /**
   * Optional output parser to parse the LLM output
   */
  outputParser?: OutputParser;
  
  /**
   * Optional callback to call with the formatted prompt before sending to the LLM
   */
  onPrompt?: (prompt: string) => void;
  
  /**
   * Optional callback to call with the raw LLM output before parsing
   */
  onOutput?: (output: string) => void;
}

/**
 * A chain that takes a prompt template and an LLM, and runs the prompt through the LLM
 */
export class LLMChain {
  private llm: LLM;
  private promptTemplate: PromptTemplate;
  private outputParser?: OutputParser;
  private onPrompt?: (prompt: string) => void;
  private onOutput?: (output: string) => void;
  
  /**
   * Create a new LLMChain
   * 
   * @param options Options for the chain
   */
  constructor(options: LLMChainOptions) {
    this.llm = options.llm;
    this.promptTemplate = options.promptTemplate;
    this.outputParser = options.outputParser;
    this.onPrompt = options.onPrompt;
    this.onOutput = options.onOutput;
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the prompt template
   * @param options Optional parameters for the LLM
   * @returns The output of the chain
   */
  async run(input: Record<string, any>, options?: any): Promise<any> {
    // Format the prompt
    const prompt = this.promptTemplate.format(input);
    
    // Call the onPrompt callback if provided
    if (this.onPrompt) {
      this.onPrompt(prompt);
    }
    
    // Run the LLM
    const output = await this.llm.complete(prompt, options);
    
    // Call the onOutput callback if provided
    if (this.onOutput) {
      this.onOutput(output);
    }
    
    // Parse the output if a parser is provided
    if (this.outputParser) {
      return this.outputParser.parse(output);
    }
    
    // Return the raw output
    return output;
  }
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the prompt template
   * @param options Optional parameters for the LLM
   * @returns The output of the chain with additional metadata
   */
  async call(input: Record<string, any>, options?: any): Promise<{ output: any; prompt: string; rawOutput: string }> {
    // Format the prompt
    const prompt = this.promptTemplate.format(input);
    
    // Call the onPrompt callback if provided
    if (this.onPrompt) {
      this.onPrompt(prompt);
    }
    
    // Run the LLM
    const rawOutput = await this.llm.complete(prompt, options);
    
    // Call the onOutput callback if provided
    if (this.onOutput) {
      this.onOutput(rawOutput);
    }
    
    // Parse the output if a parser is provided
    const output = this.outputParser ? this.outputParser.parse(rawOutput) : rawOutput;
    
    // Return the output with additional metadata
    return {
      output,
      prompt,
      rawOutput
    };
  }
}

/**
 * Factory for creating LLMChain instances
 */
export class LLMChainFactory {
  /**
   * Create a new LLMChain
   * 
   * @param options Options for the chain
   * @returns A new LLMChain instance
   */
  static create(options: LLMChainOptions): LLMChain {
    return new LLMChain(options);
  }
  
  /**
   * Create a new LLMChain with a simple prompt
   * 
   * @param llm The LLM to use
   * @param promptTemplate A simple prompt template string with {variable} placeholders
   * @param outputParser Optional output parser
   * @returns A new LLMChain instance
   */
  static fromPrompt(llm: LLM, promptTemplate: string, outputParser?: OutputParser): LLMChain {
    // Create a simple prompt template
    const template: PromptTemplate = {
      format: (values: Record<string, any>) => {
        return promptTemplate.replace(/\{([^}]+)\}/g, (_, key) => {
          return values[key] !== undefined ? String(values[key]) : `{${key}}`;
        });
      }
    };
    
    return new LLMChain({
      llm,
      promptTemplate: template,
      outputParser
    });
  }
}
