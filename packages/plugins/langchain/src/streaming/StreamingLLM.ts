import { EventEmitter } from 'events';
import axios from 'axios';

/**
 * Interface for a token callback
 */
export interface TokenCallback {
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
 * Interface for a streaming LLM response
 */
export interface StreamingResponse {
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
   * The usage information for the response
   */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Options for a streaming LLM
 */
export interface StreamingLLMOptions {
  /**
   * The model to use
   */
  model: string;
  
  /**
   * Optional temperature for the model
   */
  temperature?: number;
  
  /**
   * Optional maximum number of tokens to generate
   */
  maxTokens?: number;
  
  /**
   * Optional top-p value for the model
   */
  topP?: number;
  
  /**
   * Optional frequency penalty for the model
   */
  frequencyPenalty?: number;
  
  /**
   * Optional presence penalty for the model
   */
  presencePenalty?: number;
  
  /**
   * Optional stop sequences for the model
   */
  stop?: string[];
  
  /**
   * Optional callback to call when a token is received
   */
  onToken?: TokenCallback;
  
  /**
   * Optional callback to call when the response is complete
   */
  onComplete?: (response: StreamingResponse) => void;
  
  /**
   * Optional callback to call when an error occurs
   */
  onError?: (error: Error) => void;
}

/**
 * Abstract base class for streaming LLMs
 */
export abstract class StreamingLLM extends EventEmitter {
  protected model: string;
  protected temperature: number;
  protected maxTokens?: number;
  protected topP: number;
  protected frequencyPenalty: number;
  protected presencePenalty: number;
  protected stop: string[];
  protected onToken?: TokenCallback;
  protected onComplete?: (response: StreamingResponse) => void;
  protected onError?: (error: Error) => void;
  
  /**
   * Create a new StreamingLLM
   * 
   * @param options Options for the LLM
   */
  constructor(options: StreamingLLMOptions) {
    super();
    
    this.model = options.model;
    this.temperature = options.temperature ?? 0.7;
    this.maxTokens = options.maxTokens;
    this.topP = options.topP ?? 1.0;
    this.frequencyPenalty = options.frequencyPenalty ?? 0.0;
    this.presencePenalty = options.presencePenalty ?? 0.0;
    this.stop = options.stop ?? [];
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
   * Complete a prompt with streaming
   * 
   * @param prompt The prompt to complete
   * @returns A promise that resolves to the streaming response
   */
  abstract complete(prompt: string): Promise<StreamingResponse>;
  
  /**
   * Complete a chat with streaming
   * 
   * @param messages The messages to complete
   * @returns A promise that resolves to the streaming response
   */
  abstract chat(messages: Array<{ role: string; content: string }>): Promise<StreamingResponse>;
  
  /**
   * Abort the current request
   */
  abstract abort(): void;
  
  /**
   * Get the model name
   * 
   * @returns The model name
   */
  getModel(): string {
    return this.model;
  }
  
  /**
   * Set the model name
   * 
   * @param model The model name
   */
  setModel(model: string): void {
    this.model = model;
  }
  
  /**
   * Get the temperature
   * 
   * @returns The temperature
   */
  getTemperature(): number {
    return this.temperature;
  }
  
  /**
   * Set the temperature
   * 
   * @param temperature The temperature
   */
  setTemperature(temperature: number): void {
    this.temperature = temperature;
  }
  
  /**
   * Get the maximum number of tokens
   * 
   * @returns The maximum number of tokens
   */
  getMaxTokens(): number | undefined {
    return this.maxTokens;
  }
  
  /**
   * Set the maximum number of tokens
   * 
   * @param maxTokens The maximum number of tokens
   */
  setMaxTokens(maxTokens?: number): void {
    this.maxTokens = maxTokens;
  }
  
  /**
   * Get the top-p value
   * 
   * @returns The top-p value
   */
  getTopP(): number {
    return this.topP;
  }
  
  /**
   * Set the top-p value
   * 
   * @param topP The top-p value
   */
  setTopP(topP: number): void {
    this.topP = topP;
  }
  
  /**
   * Get the frequency penalty
   * 
   * @returns The frequency penalty
   */
  getFrequencyPenalty(): number {
    return this.frequencyPenalty;
  }
  
  /**
   * Set the frequency penalty
   * 
   * @param frequencyPenalty The frequency penalty
   */
  setFrequencyPenalty(frequencyPenalty: number): void {
    this.frequencyPenalty = frequencyPenalty;
  }
  
  /**
   * Get the presence penalty
   * 
   * @returns The presence penalty
   */
  getPresencePenalty(): number {
    return this.presencePenalty;
  }
  
  /**
   * Set the presence penalty
   * 
   * @param presencePenalty The presence penalty
   */
  setPresencePenalty(presencePenalty: number): void {
    this.presencePenalty = presencePenalty;
  }
  
  /**
   * Get the stop sequences
   * 
   * @returns The stop sequences
   */
  getStop(): string[] {
    return this.stop;
  }
  
  /**
   * Set the stop sequences
   * 
   * @param stop The stop sequences
   */
  setStop(stop: string[]): void {
    this.stop = stop;
  }
  
  /**
   * Add a token callback
   * 
   * @param callback The callback to add
   */
  addTokenCallback(callback: TokenCallback): void {
    this.on('token', callback);
  }
  
  /**
   * Remove a token callback
   * 
   * @param callback The callback to remove
   */
  removeTokenCallback(callback: TokenCallback): void {
    this.off('token', callback);
  }
  
  /**
   * Add a complete callback
   * 
   * @param callback The callback to add
   */
  addCompleteCallback(callback: (response: StreamingResponse) => void): void {
    this.on('complete', callback);
  }
  
  /**
   * Remove a complete callback
   * 
   * @param callback The callback to remove
   */
  removeCompleteCallback(callback: (response: StreamingResponse) => void): void {
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
 * Implementation of StreamingLLM for OpenAI
 */
export class OpenAIStreamingLLM extends StreamingLLM {
  private apiKey: string;
  private baseURL?: string;
  private organization?: string;
  private abortController: AbortController | null = null;
  
  /**
   * Create a new OpenAIStreamingLLM
   * 
   * @param options Options for the LLM
   */
  constructor(options: StreamingLLMOptions & {
    apiKey: string;
    baseURL?: string;
    organization?: string;
  }) {
    super(options);
    
    this.apiKey = options.apiKey;
    this.baseURL = options.baseURL;
    this.organization = options.organization;
  }
  
  /**
   * Complete a prompt with streaming
   * 
   * @param prompt The prompt to complete
   * @returns A promise that resolves to the streaming response
   */
  async complete(prompt: string): Promise<StreamingResponse> {
    return this.chat([{ role: 'user', content: prompt }]);
  }
  
  /**
   * Complete a chat with streaming
   * 
   * @param messages The messages to complete
   * @returns A promise that resolves to the streaming response
   */
  async chat(messages: Array<{ role: string; content: string }>): Promise<StreamingResponse> {
    // Create a new abort controller
    this.abortController = new AbortController();
    
    // Create the request body
    const body = {
      model: this.model,
      messages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      top_p: this.topP,
      frequency_penalty: this.frequencyPenalty,
      presence_penalty: this.presencePenalty,
      stop: this.stop.length > 0 ? this.stop : undefined,
      stream: true
    };
    
    // Create the request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
    
    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }
    
    try {
      // Make the request
      const response = await axios({
        method: 'post',
        url: this.baseURL ? `${this.baseURL}/v1/chat/completions` : 'https://api.openai.com/v1/chat/completions',
        headers,
        data: body,
        signal: this.abortController.signal,
        responseType: 'stream'
      });
      
      // Initialize the response
      const streamingResponse: StreamingResponse = {
        text: '',
        tokens: [],
        isComplete: false
      };
      
      // Process the stream
      let index = 0;
      const decoder = new TextDecoder('utf-8');
      
      // Set up the data handler
      response.data.on('data', (chunk: Buffer) => {
        // Decode the chunk
        const text = decoder.decode(chunk);
        
        // Split the chunk into lines
        const lines = text
          .split('\n')
          .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
        
        // Process each line
        for (const line of lines) {
          // Extract the data
          const match = line.match(/^data: (.*)$/);
          
          if (!match) {
            continue;
          }
          
          try {
            // Parse the data
            const data = JSON.parse(match[1]);
            
            // Extract the token
            const token = data.choices[0]?.delta?.content || '';
            
            // If the token is empty, continue
            if (token === '') {
              continue;
            }
            
            // Add the token to the response
            streamingResponse.text += token;
            streamingResponse.tokens.push(token);
            
            // Emit the token event
            this.emit('token', token, index, false);
            
            // Increment the index
            index++;
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      });
      
      // Set up the end handler
      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          // Set the response as complete
          streamingResponse.isComplete = true;
          
          // Emit the complete event
          this.emit('complete', streamingResponse);
          
          // Resolve the promise
          resolve(streamingResponse);
        });
        
        response.data.on('error', (error: Error) => {
          reject(error);
        });
      });
      
    } catch (error: any) {
      // If the error is an abort error, don't emit an error event
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return {
          text: '',
          tokens: [],
          isComplete: false
        };
      }
      
      // Emit the error event
      this.emit('error', error);
      
      // Rethrow the error
      throw error;
    } finally {
      // Clear the abort controller
      this.abortController = null;
    }
  }
  
  /**
   * Abort the current request
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

/**
 * Implementation of StreamingLLM for Anthropic
 */
export class AnthropicStreamingLLM extends StreamingLLM {
  private apiKey: string;
  private baseURL?: string;
  private abortController: AbortController | null = null;
  
  /**
   * Create a new AnthropicStreamingLLM
   * 
   * @param options Options for the LLM
   */
  constructor(options: StreamingLLMOptions & {
    apiKey: string;
    baseURL?: string;
  }) {
    super(options);
    
    this.apiKey = options.apiKey;
    this.baseURL = options.baseURL;
  }
  
  /**
   * Complete a prompt with streaming
   * 
   * @param prompt The prompt to complete
   * @returns A promise that resolves to the streaming response
   */
  async complete(prompt: string): Promise<StreamingResponse> {
    return this.chat([{ role: 'user', content: prompt }]);
  }
  
  /**
   * Complete a chat with streaming
   * 
   * @param messages The messages to complete
   * @returns A promise that resolves to the streaming response
   */
  async chat(messages: Array<{ role: string; content: string }>): Promise<StreamingResponse> {
    // Create a new abort controller
    this.abortController = new AbortController();
    
    // Convert the messages to Anthropic format
    const anthropicMessages = messages.map(message => {
      // Map the role
      let role = message.role;
      
      if (role === 'user') {
        role = 'human';
      } else if (role === 'assistant') {
        role = 'assistant';
      } else if (role === 'system') {
        role = 'system';
      }
      
      return {
        role,
        content: message.content
      };
    });
    
    // Create the request body
    const body = {
      model: this.model,
      messages: anthropicMessages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      top_p: this.topP,
      stop_sequences: this.stop,
      stream: true
    };
    
    // Create the request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };
    
    try {
      // Make the request
      const response = await axios({
        method: 'post',
        url: this.baseURL ? `${this.baseURL}/v1/messages` : 'https://api.anthropic.com/v1/messages',
        headers,
        data: body,
        signal: this.abortController.signal,
        responseType: 'stream'
      });
      
      // Initialize the response
      const streamingResponse: StreamingResponse = {
        text: '',
        tokens: [],
        isComplete: false
      };
      
      // Process the stream
      let index = 0;
      const decoder = new TextDecoder('utf-8');
      
      // Set up the data handler
      response.data.on('data', (chunk: Buffer) => {
        // Decode the chunk
        const text = decoder.decode(chunk);
        
        // Split the chunk into lines
        const lines = text
          .split('\n')
          .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
        
        // Process each line
        for (const line of lines) {
          // Extract the data
          const match = line.match(/^data: (.*)$/);
          
          if (!match) {
            continue;
          }
          
          try {
            // Parse the data
            const data = JSON.parse(match[1]);
            
            // Check if this is a content block
            if (data.type === 'content_block_delta' && data.delta?.text) {
              const token = data.delta.text;
              
              // Add the token to the response
              streamingResponse.text += token;
              streamingResponse.tokens.push(token);
              
              // Emit the token event
              this.emit('token', token, index, false);
              
              // Increment the index
              index++;
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      });
      
      // Set up the end handler
      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          // Set the response as complete
          streamingResponse.isComplete = true;
          
          // Emit the complete event
          this.emit('complete', streamingResponse);
          
          // Resolve the promise
          resolve(streamingResponse);
        });
        
        response.data.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error: any) {
      // If the error is an abort error, don't emit an error event
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return {
          text: '',
          tokens: [],
          isComplete: false
        };
      }
      
      // Emit the error event
      this.emit('error', error);
      
      // Rethrow the error
      throw error;
    } finally {
      // Clear the abort controller
      this.abortController = null;
    }
  }
  
  /**
   * Abort the current request
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

/**
 * Factory for creating StreamingLLM instances
 */
export class StreamingLLMFactory {
  /**
   * Create a new OpenAI streaming LLM
   * 
   * @param apiKey The OpenAI API key
   * @param model The model to use
   * @param options Additional options for the LLM
   * @returns A new OpenAI streaming LLM
   */
  static fromOpenAI(
    apiKey: string,
    model: string = 'gpt-3.5-turbo',
    options: Partial<StreamingLLMOptions> & {
      baseURL?: string;
      organization?: string;
    } = {}
  ): OpenAIStreamingLLM {
    return new OpenAIStreamingLLM({
      apiKey,
      model,
      ...options
    });
  }
  
  /**
   * Create a new Anthropic streaming LLM
   * 
   * @param apiKey The Anthropic API key
   * @param model The model to use
   * @param options Additional options for the LLM
   * @returns A new Anthropic streaming LLM
   */
  static fromAnthropic(
    apiKey: string,
    model: string = 'claude-2',
    options: Partial<StreamingLLMOptions> & {
      baseURL?: string;
    } = {}
  ): AnthropicStreamingLLM {
    return new AnthropicStreamingLLM({
      apiKey,
      model,
      ...options
    });
  }
}
