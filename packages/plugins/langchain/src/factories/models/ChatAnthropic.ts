import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating ChatAnthropic models
 */
export class ChatAnthropicFactory implements ComponentFactory<any> {
  /**
   * Creates a new ChatAnthropic model
   * 
   * @param config Configuration for the ChatAnthropic model
   * @returns A new ChatAnthropic model instance
   */
  async create(config: {
    apiKey?: string;
    modelName?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    timeout?: number;
    maxRetries?: number;
    baseURL?: string;
    defaultHeaders?: Record<string, string>;
    cache?: boolean;
  }): Promise<any> {
    try {
      // Set default values
      const modelName = config.modelName || "claude-3-opus-20240229";
      const temperature = config.temperature ?? 0.7;
      const topP = config.topP ?? 1;
      const topK = config.topK ?? undefined;
      const maxTokens = config.maxTokens ?? 1024;
      const stopSequences = config.stopSequences || [];
      const streaming = config.streaming || false;
      const callbacks = config.callbacks || [];
      const timeout = config.timeout;
      const maxRetries = config.maxRetries ?? 3;
      const baseURL = config.baseURL || "https://api.anthropic.com";
      const defaultHeaders = config.defaultHeaders || {};
      const cache = config.cache ?? true;
      
      // Create a custom ChatAnthropic model
      return {
        apiKey: config.apiKey,
        modelName,
        temperature,
        topP,
        topK,
        maxTokens,
        stopSequences,
        streaming,
        callbacks,
        timeout,
        maxRetries,
        baseURL,
        defaultHeaders,
        cache,
        
        /**
         * Generate a chat completion
         * 
         * @param messages The messages to generate a completion for
         * @returns The generated completion
         */
        async invoke(messages: Array<{
          role: "system" | "user" | "assistant" | "human" | "ai";
          content: string;
        }>) {
          try {
            // Validate the messages
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
              throw new Error("Messages are required and must be a non-empty array");
            }
            
            // Map roles to Anthropic format
            const mappedMessages = messages.map(message => {
              let role = message.role;
              // Map standard roles to Anthropic roles
              if (role === "user") role = "human";
              if (role === "assistant") role = "ai";
              
              return {
                role,
                content: message.content
              };
            });
            
            // Extract system message if present
            let systemPrompt = "";
            const nonSystemMessages = [];
            
            for (const message of mappedMessages) {
              if (message.role === "system") {
                systemPrompt = message.content;
              } else {
                nonSystemMessages.push(message);
              }
            }
            
            // In a real implementation, this would call the Anthropic API
            // For now, we'll simulate a response
            console.log(`[ChatAnthropic] Invoking model ${this.modelName} with ${messages.length} messages`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Handle streaming
            if (this.streaming) {
              // Simulate streaming response
              const content = this._generateResponse(nonSystemMessages, systemPrompt);
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
              const content = this._generateResponse(nonSystemMessages, systemPrompt);
              
              return {
                content,
                role: "assistant",
                _response: {
                  id: `msg_${Date.now()}`,
                  type: "message",
                  role: "assistant",
                  content: [
                    {
                      type: "text",
                      text: content
                    }
                  ],
                  model: this.modelName,
                  stop_reason: "end_turn",
                  usage: {
                    input_tokens: this._countTokens([...nonSystemMessages, { role: "system", content: systemPrompt }]),
                    output_tokens: this._countTokens([{ role: "assistant", content }])
                  }
                }
              };
            }
          } catch (error) {
            console.error("Error invoking ChatAnthropic:", error);
            throw new Error(`Failed to invoke ChatAnthropic: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Generate a response based on the messages
         * 
         * @param messages The messages to generate a response for
         * @param systemPrompt Optional system prompt
         * @returns The generated response
         */
        _generateResponse(messages: Array<{
          role: string;
          content: string;
        }>, systemPrompt: string = "") {
          // Get the last user message
          const lastUserMessage = messages
            .filter(m => m.role === 'human' || m.role === 'user')
            .pop()?.content || '';
          
          // Generate a simple response based on the last user message
          let response = `This is a simulated response from ${this.modelName} to: "${lastUserMessage}"`;
          
          // Add system prompt influence if present
          if (systemPrompt) {
            response += `\n\nNote: This response was influenced by the system prompt: "${systemPrompt.substring(0, 50)}${systemPrompt.length > 50 ? '...' : ''}"`;
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
            console.log(`[ChatAnthropic] Generating embeddings for ${Array.isArray(text) ? text.length : 1} texts`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Generate mock embeddings (1536-dimensional vector with random values)
            const generateEmbedding = () => {
              const embedding = [];
              for (let i = 0; i < 1536; i++) {
                embedding.push((Math.random() * 2 - 1) * 0.1); // Random values between -0.1 and 0.1
              }
              return embedding;
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
        }
      };
    } catch (error) {
      console.error("Error creating ChatAnthropic:", error);
      throw new Error(`Failed to create ChatAnthropic: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
