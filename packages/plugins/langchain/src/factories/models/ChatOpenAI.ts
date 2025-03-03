import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating ChatOpenAI models
 */
export class ChatOpenAIFactory implements ComponentFactory<any> {
  /**
   * Creates a new ChatOpenAI model
   * 
   * @param config Configuration for the ChatOpenAI model
   * @returns A new ChatOpenAI model instance
   */
  async create(config: {
    apiKey?: string;
    organization?: string;
    modelName?: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    n?: number;
    logitBias?: Record<string, number>;
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
      const modelName = config.modelName || "gpt-3.5-turbo";
      const temperature = config.temperature ?? 0.7;
      const topP = config.topP ?? 1;
      const maxTokens = config.maxTokens;
      const presencePenalty = config.presencePenalty ?? 0;
      const frequencyPenalty = config.frequencyPenalty ?? 0;
      const n = config.n ?? 1;
      const logitBias = config.logitBias || {};
      const stopSequences = config.stopSequences || [];
      const streaming = config.streaming || false;
      const callbacks = config.callbacks || [];
      const timeout = config.timeout;
      const maxRetries = config.maxRetries ?? 3;
      const baseURL = config.baseURL;
      const defaultHeaders = config.defaultHeaders || {};
      const cache = config.cache ?? true;
      
      // Create a custom ChatOpenAI model
      return {
        apiKey: config.apiKey,
        organization: config.organization,
        modelName,
        temperature,
        topP,
        maxTokens,
        presencePenalty,
        frequencyPenalty,
        n,
        logitBias,
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
          role: "system" | "user" | "assistant" | "function" | "tool";
          content: string;
          name?: string;
          tool_call_id?: string;
        }>) {
          try {
            // Validate the messages
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
              throw new Error("Messages are required and must be a non-empty array");
            }
            
            // Prepare the request parameters
            const params = {
              model: this.modelName,
              messages: messages.map(message => ({
                role: message.role,
                content: message.content,
                ...(message.name ? { name: message.name } : {}),
                ...(message.tool_call_id ? { tool_call_id: message.tool_call_id } : {})
              })),
              temperature: this.temperature,
              top_p: this.topP,
              n: this.n,
              presence_penalty: this.presencePenalty,
              frequency_penalty: this.frequencyPenalty,
              logit_bias: Object.keys(this.logitBias).length > 0 ? this.logitBias : undefined,
              stop: this.stopSequences.length > 0 ? this.stopSequences : undefined
            };
            
            // Add max_tokens if specified
            if (this.maxTokens !== undefined) {
              (params as any).maxTokens = this.maxTokens;
            }
            
            // In a real implementation, this would call the OpenAI API
            // For now, we'll simulate a response
            console.log(`[ChatOpenAI] Invoking model ${this.modelName} with ${messages.length} messages`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Handle streaming
            if (this.streaming) {
              // Simulate streaming response
              const content = this._generateResponse(messages);
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
              const content = this._generateResponse(messages);
              
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
                    prompt_tokens: this._countTokens(messages),
                    completion_tokens: this._countTokens([{ role: "assistant", content }]),
                    total_tokens: this._countTokens(messages) + this._countTokens([{ role: "assistant", content }])
                  }
                }
              };
            }
          } catch (error) {
            console.error("Error invoking ChatOpenAI:", error);
            throw new Error(`Failed to invoke ChatOpenAI: ${error instanceof Error ? error.message : String(error)}`);
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
          tool_call_id?: string;
        }>) {
          // Get the last user message
          const lastUserMessage = messages
            .filter(m => m.role === 'user')
            .pop()?.content || '';
          
          // Generate a simple response based on the last user message
          return `This is a simulated response from ${this.modelName} to: "${lastUserMessage}"`;
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
          tool_call_id?: string;
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
            console.log(`[ChatOpenAI] Generating embeddings for ${Array.isArray(text) ? text.length : 1} texts`);
            
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
        },
        
        /**
         * Generate a moderation result
         * 
         * @param text The text to moderate
         * @returns The moderation result
         */
        async moderation(text: string | string[]) {
          try {
            console.log(`[ChatOpenAI] Moderating ${Array.isArray(text) ? text.length : 1} texts`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Generate a mock moderation result
            const generateResult = (content: string) => {
              // Check for potentially problematic content
              const hasProfanity = /\b(damn|hell|crap|ass)\b/i.test(content);
              const hasHate = /\b(hate|stupid|idiot|dumb)\b/i.test(content);
              const hasViolence = /\b(kill|attack|fight|hurt)\b/i.test(content);
              const hasSelfHarm = /\b(suicide|die|cut|harm)\b/i.test(content);
              const hasSexual = /\b(sex|naked|nude|porn)\b/i.test(content);
              
              return {
                categories: {
                  hate: hasHate,
                  "hate/threatening": false,
                  "self-harm": hasSelfHarm,
                  sexual: hasSexual,
                  "sexual/minors": false,
                  violence: hasViolence,
                  "violence/graphic": false,
                  profanity: hasProfanity
                },
                category_scores: {
                  hate: hasHate ? 0.8 : 0.01,
                  "hate/threatening": 0.01,
                  "self-harm": hasSelfHarm ? 0.8 : 0.01,
                  sexual: hasSexual ? 0.8 : 0.01,
                  "sexual/minors": 0.01,
                  violence: hasViolence ? 0.8 : 0.01,
                  "violence/graphic": 0.01,
                  profanity: hasProfanity ? 0.8 : 0.01
                },
                flagged: hasProfanity || hasHate || hasViolence || hasSelfHarm || hasSexual
              };
            };
            
            // Return the moderation results
            if (Array.isArray(text)) {
              return text.map(t => generateResult(t));
            } else {
              return generateResult(text);
            }
          } catch (error) {
            console.error("Error generating moderation:", error);
            throw new Error(`Failed to generate moderation: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
    } catch (error) {
      console.error("Error creating ChatOpenAI:", error);
      throw new Error(`Failed to create ChatOpenAI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
