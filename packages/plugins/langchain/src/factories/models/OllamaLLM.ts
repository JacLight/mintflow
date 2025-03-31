import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating OllamaLLM models
 */
export class OllamaLLMFactory implements ComponentFactory<any> {
  /**
   * Creates a new OllamaLLM model
   * 
   * @param config Configuration for the OllamaLLM model
   * @returns A new OllamaLLM model instance
   */
  async create(config: {
    baseUrl?: string;
    modelName?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    numPredict?: number;
    numCtx?: number;
    repeatPenalty?: number;
    repeatLastN?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    cache?: boolean;
    format?: "json" | "none";
    keepAlive?: string;
    mirostat?: number;
    mirostatEta?: number;
    mirostatTau?: number;
    numGpu?: number;
    numThread?: number;
    seed?: number;
    tfsZ?: number;
    timeout?: number;
  }): Promise<any> {
    try {
      // Set default values
      const baseUrl = config.baseUrl || "http://localhost:11434";
      const modelName = config.modelName || "llama2";
      const temperature = config.temperature ?? 0.8;
      const topP = config.topP ?? 0.9;
      const topK = config.topK ?? 40;
      const numPredict = config.numPredict ?? 128;
      const numCtx = config.numCtx ?? 2048;
      const repeatPenalty = config.repeatPenalty ?? 1.1;
      const repeatLastN = config.repeatLastN ?? 64;
      const frequencyPenalty = config.frequencyPenalty ?? 0;
      const presencePenalty = config.presencePenalty ?? 0;
      const stopSequences = config.stopSequences || [];
      const streaming = config.streaming || false;
      const callbacks = config.callbacks || [];
      const cache = config.cache ?? true;
      const format = config.format || "none";
      const keepAlive = config.keepAlive;
      const mirostat = config.mirostat;
      const mirostatEta = config.mirostatEta;
      const mirostatTau = config.mirostatTau;
      const numGpu = config.numGpu;
      const numThread = config.numThread;
      const seed = config.seed;
      const tfsZ = config.tfsZ;
      const timeout = config.timeout;
      
      // Create a custom OllamaLLM model
      return {
        baseUrl,
        modelName,
        temperature,
        topP,
        topK,
        numPredict,
        numCtx,
        repeatPenalty,
        repeatLastN,
        frequencyPenalty,
        presencePenalty,
        stopSequences,
        streaming,
        callbacks,
        cache,
        format,
        keepAlive,
        mirostat,
        mirostatEta,
        mirostatTau,
        numGpu,
        numThread,
        seed,
        tfsZ,
        timeout,
        
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
            
            // Format messages for Ollama
            const formattedMessages = messages.map(message => ({
              role: message.role,
              content: message.content
            }));
            
            // In a real implementation, this would call the Ollama API
            // For now, we'll simulate a response
            console.log(`[OllamaLLM] Invoking model ${this.modelName} with ${messages.length} messages`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
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
                  model: this.modelName,
                  created_at: new Date().toISOString(),
                  message: {
                    role: "assistant",
                    content
                  },
                  done: true,
                  total_duration: 1200000000, // nanoseconds
                  load_duration: 200000000,
                  prompt_eval_count: this._countTokens(formattedMessages),
                  prompt_eval_duration: 500000000,
                  eval_count: this._countTokens([{ role: "assistant", content }]),
                  eval_duration: 500000000
                }
              };
            }
          } catch (error) {
            console.error("Error invoking OllamaLLM:", error);
            throw new Error(`Failed to invoke OllamaLLM: ${error instanceof Error ? error.message : String(error)}`);
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
            console.log(`[OllamaLLM] Generating embeddings for ${Array.isArray(text) ? text.length : 1} texts`);
            
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
      console.error("Error creating OllamaLLM:", error);
      throw new Error(`Failed to create OllamaLLM: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
