import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating LlamaCpp models
 */
export class LlamaCppFactory implements ComponentFactory<any> {
  /**
   * Creates a new LlamaCpp model
   * 
   * @param config Configuration for the LlamaCpp model
   * @returns A new LlamaCpp model instance
   */
  async create(config: {
    modelPath: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    contextSize?: number;
    batchSize?: number;
    repeatPenalty?: number;
    lastNTokensSize?: number;
    seed?: number;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    cache?: boolean;
    threads?: number;
    gpuLayers?: number;
    f16Kv?: boolean;
    logitsAll?: boolean;
    vocabOnly?: boolean;
    useMlock?: boolean;
    nBatch?: number;
    mainGpu?: number;
    tensorSplit?: number[];
    embedding?: boolean;
    verbose?: boolean;
  }): Promise<any> {
    try {
      // Check required parameters
      if (!config.modelPath) {
        throw new Error("Model path is required");
      }
      
      // Set default values
      const modelPath = config.modelPath;
      const temperature = config.temperature ?? 0.8;
      const topP = config.topP ?? 0.9;
      const topK = config.topK ?? 40;
      const maxTokens = config.maxTokens ?? 512;
      const contextSize = config.contextSize ?? 2048;
      const batchSize = config.batchSize ?? 512;
      const repeatPenalty = config.repeatPenalty ?? 1.1;
      const lastNTokensSize = config.lastNTokensSize ?? 64;
      const seed = config.seed;
      const stopSequences = config.stopSequences || [];
      const streaming = config.streaming || false;
      const callbacks = config.callbacks || [];
      const cache = config.cache ?? true;
      const threads = config.threads ?? 4;
      const gpuLayers = config.gpuLayers ?? 0;
      const f16Kv = config.f16Kv ?? true;
      const logitsAll = config.logitsAll ?? false;
      const vocabOnly = config.vocabOnly ?? false;
      const useMlock = config.useMlock ?? false;
      const nBatch = config.nBatch ?? 8;
      const mainGpu = config.mainGpu ?? 0;
      const tensorSplit = config.tensorSplit;
      const embedding = config.embedding ?? false;
      const verbose = config.verbose ?? false;
      
      // Create a custom LlamaCpp model
      return {
        modelPath,
        temperature,
        topP,
        topK,
        maxTokens,
        contextSize,
        batchSize,
        repeatPenalty,
        lastNTokensSize,
        seed,
        stopSequences,
        streaming,
        callbacks,
        cache,
        threads,
        gpuLayers,
        f16Kv,
        logitsAll,
        vocabOnly,
        useMlock,
        nBatch,
        mainGpu,
        tensorSplit,
        embedding,
        verbose,
        
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
            
            // Format messages for LlamaCpp
            // In a real implementation, this would format the messages according to the model's expected format
            // For now, we'll just use a simple format
            let prompt = "";
            for (const message of messages) {
              if (message.role === "system") {
                prompt += `<|system|>\n${message.content}\n`;
              } else if (message.role === "user") {
                prompt += `<|user|>\n${message.content}\n`;
              } else if (message.role === "assistant") {
                prompt += `<|assistant|>\n${message.content}\n`;
              }
            }
            prompt += `<|assistant|>\n`;
            
            // In a real implementation, this would call the LlamaCpp library
            // For now, we'll simulate a response
            console.log(`[LlamaCpp] Invoking model ${this.modelPath} with prompt length ${prompt.length}`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
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
                  id: `gen_${Date.now()}`,
                  model: this.modelPath.split('/').pop() || "llama",
                  choices: [
                    {
                      text: content,
                      index: 0,
                      logprobs: null,
                      finish_reason: "stop"
                    }
                  ],
                  usage: {
                    prompt_tokens: this._countTokens(prompt),
                    completion_tokens: this._countTokens(content),
                    total_tokens: this._countTokens(prompt) + this._countTokens(content)
                  }
                }
              };
            }
          } catch (error) {
            console.error("Error invoking LlamaCpp:", error);
            throw new Error(`Failed to invoke LlamaCpp: ${error instanceof Error ? error.message : String(error)}`);
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
          
          // Extract model name from path
          const modelName = this.modelPath.split('/').pop() || "llama";
          
          // Generate a simple response based on the last user message
          let response = `This is a simulated response from ${modelName} to: "${lastUserMessage}"`;
          
          // Add system prompt influence if present
          if (systemMessage) {
            response += `\n\nNote: This response was influenced by the system prompt: "${systemMessage.substring(0, 50)}${systemMessage.length > 50 ? '...' : ''}"`;
          }
          
          return response;
        },
        
        /**
         * Count tokens in text (very rough approximation)
         * 
         * @param text The text to count tokens for
         * @returns The token count
         */
        _countTokens(text: string) {
          // Very rough approximation: 1 token ≈ 4 characters
          return Math.ceil((text?.length || 0) / 4);
        },
        
        /**
         * Generate embeddings for a text
         * 
         * @param text The text to generate embeddings for
         * @returns The generated embeddings
         */
        async embeddings(text: string | string[]) {
          try {
            // Check if embedding is enabled
            if (!this.embedding) {
              throw new Error("Embedding is not enabled for this model");
            }
            
            console.log(`[LlamaCpp] Generating embeddings for ${Array.isArray(text) ? text.length : 1} texts`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate mock embeddings (4096-dimensional vector with random values)
            const generateEmbedding = () => {
              const embedding = [];
              for (let i = 0; i < 4096; i++) {
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
        }
      };
    } catch (error) {
      console.error("Error creating LlamaCpp:", error);
      throw new Error(`Failed to create LlamaCpp: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
