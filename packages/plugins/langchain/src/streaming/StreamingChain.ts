import { EventEmitter } from 'events';
import { StreamingLLM, StreamingResponse } from './StreamingLLM.js';

/**
 * Interface for a streaming chain callback
 */
export interface StreamingChainCallback {
  /**
   * Called when a token is received
   * 
   * @param token The token
   * @param index The index of the token
   * @param isComplete Whether the response is complete
   */
  (token: string, index: number, isComplete: boolean): void;
}

/**
 * Interface for a streaming chain response
 */
export interface StreamingChainResponse {
  /**
   * The text of the response
   */
  text: string;
  
  /**
   * The tokens of the response
   */
  tokens: string[];
  
  /**
   * Whether the response is complete
   */
  isComplete: boolean;
  
  /**
   * The input variables
   */
  inputVariables: Record<string, any>;
  
  /**
   * The output variables
   */
  outputVariables: Record<string, any>;
}

/**
 * Options for a streaming chain
 */
export interface StreamingChainOptions {
  /**
   * The LLM to use
   */
  llm: StreamingLLM;
  
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
  
  /**
   * Optional callback to call when a token is received
   */
  onToken?: StreamingChainCallback;
  
  /**
   * Optional callback to call when the response is complete
   */
  onComplete?: (response: StreamingChainResponse) => void;
  
  /**
   * Optional callback to call when an error occurs
   */
  onError?: (error: Error) => void;
}

/**
 * A chain that streams responses from an LLM
 */
export class StreamingChain extends EventEmitter {
  private llm: StreamingLLM;
  private prompt: string;
  private inputVariables: string[];
  private outputVariables: string[];
  private onToken?: StreamingChainCallback;
  private onComplete?: (response: StreamingChainResponse) => void;
  private onError?: (error: Error) => void;
  
  /**
   * Create a new StreamingChain
   * 
   * @param options Options for the chain
   */
  constructor(options: StreamingChainOptions) {
    super();
    
    this.llm = options.llm;
    this.prompt = options.prompt;
    this.inputVariables = options.inputVariables || this.extractInputVariables(options.prompt);
    this.outputVariables = options.outputVariables || ['output'];
    this.onToken = options.onToken;
    this.onComplete = options.onComplete;
    this.onError = options.onError;
    
    // Set up event listeners
    if (this.onToken) {
      this.on('token', this.onToken);
    }
    
    if (this.onComplete) {
      this.on('complete', this.onComplete);
    }
    
    if (this.onError) {
      this.on('error', this.onError);
    }
  }
  
  /**
   * Extract input variables from a prompt template
   * 
   * @param prompt The prompt template
   * @returns The input variables
   */
  private extractInputVariables(prompt: string): string[] {
    const matches = prompt.match(/\{([^{}]+)\}/g) || [];
    return matches.map(match => match.slice(1, -1));
  }
  
  /**
   * Format a prompt template with input variables
   * 
   * @param template The prompt template
   * @param inputs The input variables
   * @returns The formatted prompt
   */
  private formatPrompt(template: string, inputs: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(inputs)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    
    return result;
  }
  
  /**
   * Call the chain with input variables
   * 
   * @param inputs The input variables
   * @returns A promise that resolves to the streaming chain response
   */
  async call(inputs: Record<string, any>): Promise<StreamingChainResponse> {
    // Check that all input variables are provided
    for (const variable of this.inputVariables) {
      if (!(variable in inputs)) {
        throw new Error(`Input variable "${variable}" not provided`);
      }
    }
    
    // Format the prompt
    const formattedPrompt = this.formatPrompt(this.prompt, inputs);
    
    try {
      // Call the LLM
      const llmResponse = await this.llm.complete(formattedPrompt);
      
      // Create the chain response
      const chainResponse: StreamingChainResponse = {
        text: llmResponse.text,
        tokens: llmResponse.tokens,
        isComplete: llmResponse.isComplete,
        inputVariables: { ...inputs },
        outputVariables: {
          [this.outputVariables[0]]: llmResponse.text
        }
      };
      
      // Emit the complete event
      this.emit('complete', chainResponse);
      
      // Return the response
      return chainResponse;
    } catch (error) {
      // Emit the error event
      this.emit('error', error);
      
      // Rethrow the error
      throw error;
    }
  }
  
  /**
   * Run the chain with input variables
   * 
   * @param input The input text or variables
   * @returns A promise that resolves to the output text
   */
  async run(input: string | Record<string, any>): Promise<string> {
    // Convert string input to input variables
    const inputs = typeof input === 'string'
      ? { [this.inputVariables[0] || 'input']: input }
      : input;
    
    // Call the chain
    const response = await this.call(inputs);
    
    // Return the output text
    return response.text;
  }
  
  /**
   * Stream the chain with input variables
   * 
   * @param inputs The input variables
   * @returns A promise that resolves to the streaming chain response
   */
  async stream(inputs: Record<string, any>): Promise<StreamingChainResponse> {
    // Check that all input variables are provided
    for (const variable of this.inputVariables) {
      if (!(variable in inputs)) {
        throw new Error(`Input variable "${variable}" not provided`);
      }
    }
    
    // Format the prompt
    const formattedPrompt = this.formatPrompt(this.prompt, inputs);
    
    // Create the chain response
    const chainResponse: StreamingChainResponse = {
      text: '',
      tokens: [],
      isComplete: false,
      inputVariables: { ...inputs },
      outputVariables: {
        [this.outputVariables[0]]: ''
      }
    };
    
    // Set up token handler
    const tokenHandler = (token: string, index: number, isComplete: boolean) => {
      // Add the token to the response
      chainResponse.text += token;
      chainResponse.tokens.push(token);
      chainResponse.outputVariables[this.outputVariables[0]] = chainResponse.text;
      
      // Emit the token event
      this.emit('token', token, index, isComplete);
    };
    
    // Add the token handler
    this.llm.addTokenCallback(tokenHandler);
    
    try {
      // Call the LLM
      const llmResponse = await this.llm.complete(formattedPrompt);
      
      // Update the chain response
      chainResponse.isComplete = true;
      
      // Emit the complete event
      this.emit('complete', chainResponse);
      
      // Return the response
      return chainResponse;
    } catch (error) {
      // Emit the error event
      this.emit('error', error);
      
      // Rethrow the error
      throw error;
    } finally {
      // Remove the token handler
      this.llm.removeTokenCallback(tokenHandler);
    }
  }
  
  /**
   * Add a token callback
   * 
   * @param callback The callback to add
   */
  addTokenCallback(callback: StreamingChainCallback): void {
    this.on('token', callback);
  }
  
  /**
   * Remove a token callback
   * 
   * @param callback The callback to remove
   */
  removeTokenCallback(callback: StreamingChainCallback): void {
    this.off('token', callback);
  }
  
  /**
   * Add a complete callback
   * 
   * @param callback The callback to add
   */
  addCompleteCallback(callback: (response: StreamingChainResponse) => void): void {
    this.on('complete', callback);
  }
  
  /**
   * Remove a complete callback
   * 
   * @param callback The callback to remove
   */
  removeCompleteCallback(callback: (response: StreamingChainResponse) => void): void {
    this.off('complete', callback);
  }
  
  /**
   * Add an error callback
   * 
   * @param callback The callback to add
   */
  addErrorCallback(callback: (error: Error) => void): void {
    this.on('error', callback);
  }
  
  /**
   * Remove an error callback
   * 
   * @param callback The callback to remove
   */
  removeErrorCallback(callback: (error: Error) => void): void {
    this.off('error', callback);
  }
}

/**
 * Factory for creating StreamingChain instances
 */
export class StreamingChainFactory {
  /**
   * Create a new StreamingChain
   * 
   * @param options Options for the chain
   * @returns A new StreamingChain
   */
  static create(options: StreamingChainOptions): StreamingChain {
    return new StreamingChain(options);
  }
  
  /**
   * Create a new StreamingChain with a simple prompt
   * 
   * @param llm The LLM to use
   * @param prompt The prompt template
   * @returns A new StreamingChain with a simple prompt
   */
  static fromPrompt(llm: StreamingLLM, prompt: string): StreamingChain {
    return new StreamingChain({
      llm,
      prompt
    });
  }
  
  /**
   * Create a new StreamingChain with a chat prompt
   * 
   * @param llm The LLM to use
   * @param systemPrompt The system prompt
   * @param humanPrompt The human prompt template
   * @returns A new StreamingChain with a chat prompt
   */
  static fromChatPrompt(
    llm: StreamingLLM,
    systemPrompt: string,
    humanPrompt: string
  ): StreamingChain {
    return new StreamingChain({
      llm,
      prompt: `${systemPrompt}\n\nHuman: ${humanPrompt}\n\nAI:`,
      inputVariables: StreamingChainFactory.extractInputVariables(humanPrompt)
    });
  }
  
  /**
   * Extract input variables from a prompt template
   * 
   * @param prompt The prompt template
   * @returns The input variables
   */
  private static extractInputVariables(prompt: string): string[] {
    const matches = prompt.match(/\{([^{}]+)\}/g) || [];
    return matches.map(match => match.slice(1, -1));
  }
}
