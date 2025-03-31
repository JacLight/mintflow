import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating LocalAI models
 */
export class LocalAIFactory implements ComponentFactory<any> {
  /**
   * Creates a new LocalAI model
   * 
   * @param config Configuration for the LocalAI model
   * @returns A new LocalAI model instance
   */
  async create(config: {
    baseUrl: string;
    modelName: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    cache?: boolean;
    timeout?: number;
    headers?: Record<string, string>;
    apiKey?: string;
  }): Promise<any> {
    try {
      // Check required parameters
      if (!config.baseUrl) {
        throw new Error("Base URL is required");
      }
      if (!config.modelName) {
        throw new Error("Model name is required");
      }
      
      // Set default values
      const baseUrl = config.baseUrl;
      const modelName = config.modelName;
      const temperature = config.temperature ?? 0.7;
      const topP = config.topP ?? 1;
      const topK = config.topK ?? 40;
      const maxTokens = config.maxTokens ?? 512;
      const presencePenalty = config.presencePenalty ?? 0;
      const frequencyPenalty = config.frequencyPenalty ?? 0;
      const stopSequences = config.stopSequences || [];
      const streaming = config.streaming || false;
      const callbacks = config.callbacks || [];
      const cache = config.cache ?? true;
      const timeout = config.timeout ?? 60000;
      const headers = config.headers || {};
      const apiKey = config.apiKey;
      
      // Create a custom LocalAI model
      return {
        baseUrl,
        modelName,
        temperature,
        topP,
        topK,
        maxTokens,
        presencePenalty,
        frequencyPenalty,
        stopSequences,
        streaming,
        callbacks,
        cache,
        timeout,
        headers,
        apiKey,
        
        /**
         * Generate a chat completion
         * 
         * @param messages The messages to generate a completion for
         * @returns The generated completion
         */
        async invoke(messages: Array<{
          role: "system" | "user" | "assistant" | "function" | "tool";
          content: string;
          name?: string;
        }>) {
          try {
            // Validate the messages
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
              throw new Error("Messages are required and must be a non-empty array");
            }
            
            // Format messages for LocalAI
            // LocalAI typically follows the OpenAI format
            const formattedMessages = messages.map(message => ({
              role: message.role,
              content: message.content,
              ...(message.name ? { name: message.name } : {})
            }));
            
            // In a real implementation, this would call the LocalAI API
            // For now, we'll simulate a response
            console.log(`[LocalAI] Invoking model ${this.modelName} at ${this.baseUrl} with ${messages.length} messages`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Handle streaming
            if (this.streaming) {
              // Simulate streaming response
              const content = this._generateResponse(formattedMessages);
              const chunks = content.split(' ');
              
              let streamedContent = '';
              for (const chunk of chunks) {
                streamedContent += chunk + ' ';
                
                // Call the callbacks
                for (const callback of this.callbacks) {
                  if (callback.handleLLMNewToken) {
                    await callback.handleLLMNewToken(chunk + ' ');
                  }
                }
                
                // Simulate streaming delay
                await new Promise(resolve => setTimeout(resolve, 50));
              }
              
              return {
                content: streamedContent.trim(),
                role: "assistant"
              };
            } else {
              // Non-streaming request
              const content = this._generateResponse(formattedMessages);
              
              return {
                content,
                role: "assistant",
                _response: {
                  id: `chatcmpl-${Date.now()}`,
                  object: "chat.completion",
                  created: Math.floor(Date.now() / 1000),
                  model: this.modelName,
                  choices: [
                    {
                      index: 0,
                      message: {
                        role: "assistant",
                        content
                      },
                      finish_reason: "stop"
                    }
                  ],
                  usage: {
                    prompt_tokens: this._countTokens(formattedMessages),
                    completion_tokens: this._countTokens([{ role: "assistant", content }]),
                    total_tokens: this._countTokens(formattedMessages) + this._countTokens([{ role: "assistant", content }])
                  }
                }
              };
            }
          } catch (error) {
            console.error("Error invoking LocalAI:", error);
            throw new Error(`Failed to invoke LocalAI: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Generate a response based on the messages
         * 
         * @param messages The messages to generate a response for
         * @returns The generated response
         */
        _generateResponse(messages: Array<{
          role: string;
          content: string;
          name?: string;
        }>) {
          // Get the last user message
          const lastUserMessage = messages
            .filter(m => m.role === 'user')
            .pop()?.content || '';
          
          // Get the system message if present
          const systemMessage = messages
            .filter(m => m.role === 'system')
            .pop()?.content || '';
          
          // Generate a simple response based on the last user message
          let response = `This is a simulated response from ${this.modelName} to: "${lastUserMessage}"`;
          
          // Add system prompt influence if present
          if (systemMessage) {
            response += `\n\nNote: This response was influenced by the system prompt: "${systemMessage.substring(0, 50)}${systemMessage.length > 50 ? '...' : ''}"`;
          }
          
          return response;
        },
        
        /**
         * Count tokens in messages (very rough approximation)
         * 
         * @param messages The messages to count tokens for
         * @returns The token count
         */
        _countTokens(messages: Array<{
          role: string;
          content: string;
          name?: string;
        }>) {
          // Very rough approximation: 1 token ≈ 4 characters
          return messages.reduce((sum, message) => {
            return sum + Math.ceil((message.content?.length || 0) / 4);
          }, 0);
        },
        
        /**
         * Generate embeddings for a text
         * 
         * @param text The text to generate embeddings for
         * @returns The generated embeddings
         */
        async embeddings(text: string | string[]) {
          try {
            console.log(`[LocalAI] Generating embeddings for ${Array.isArray(text) ? text.length : 1} texts using model ${this.modelName}`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Generate mock embeddings (1536-dimensional vector with random values)
            const generateEmbedding = () => {
              const embedding = [];
              for (let i = 0; i < 1536; i++) {
                embedding.push((Math.random() * 2 - 1) * 0.1); // Random values between -0.1 and 0.1
              }
              
              // Normalize the embedding (unit vector)
              const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
              return embedding.map(val => val / magnitude);
            };
            
            // Return the embeddings
            if (Array.isArray(text)) {
              return text.map(() => generateEmbedding());
            } else {
              return generateEmbedding();
            }
          } catch (error) {
            console.error("Error generating embeddings:", error);
            throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Generate a completion (text generation)
         * 
         * @param prompt The prompt to generate a completion for
         * @returns The generated completion
         */
        async complete(prompt: string) {
          try {
            // Validate the prompt
            if (!prompt) {
              throw new Error("Prompt is required");
            }
            
            // In a real implementation, this would call the LocalAI API
            // For now, we'll simulate a response
            console.log(`[LocalAI] Generating completion for prompt of length ${prompt.length} using model ${this.modelName}`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Handle streaming
            if (this.streaming) {
              // Simulate streaming response
              const content = `This is a simulated completion from ${this.modelName} for the given prompt.`;
              const chunks = content.split(' ');
              
              let streamedContent = '';
              for (const chunk of chunks) {
                streamedContent += chunk + ' ';
                
                // Call the callbacks
                for (const callback of this.callbacks) {
                  if (callback.handleLLMNewToken) {
                    await callback.handleLLMNewToken(chunk + ' ');
                  }
                }
                
                // Simulate streaming delay
                await new Promise(resolve => setTimeout(resolve, 50));
              }
              
              return streamedContent.trim();
            } else {
              // Non-streaming request
              return `This is a simulated completion from ${this.modelName} for the given prompt.`;
            }
          } catch (error) {
            console.error("Error generating completion:", error);
            throw new Error(`Failed to generate completion: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
    } catch (error) {
      console.error("Error creating LocalAI:", error);
      throw new Error(`Failed to create LocalAI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
