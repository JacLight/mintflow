import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating ChatGoogleGenerativeAI models
 */
export class ChatGoogleGenerativeAIFactory implements ComponentFactory<any> {
  /**
   * Creates a new ChatGoogleGenerativeAI model
   * 
   * @param config Configuration for the ChatGoogleGenerativeAI model
   * @returns A new ChatGoogleGenerativeAI model instance
   */
  async create(config: {
    apiKey?: string;
    modelName?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    safetySettings?: Array<{
      category: string;
      threshold: string;
    }>;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    maxRetries?: number;
    cache?: boolean;
  }): Promise<any> {
    try {
      // Set default values
      const modelName = config.modelName || "gemini-pro";
      const temperature = config.temperature ?? 0.7;
      const topP = config.topP ?? 1;
      const topK = config.topK ?? 40;
      const maxOutputTokens = config.maxOutputTokens ?? 1024;
      const safetySettings = config.safetySettings || [];
      const stopSequences = config.stopSequences || [];
      const streaming = config.streaming || false;
      const callbacks = config.callbacks || [];
      const maxRetries = config.maxRetries ?? 3;
      const cache = config.cache ?? true;
      
      // Create a custom ChatGoogleGenerativeAI model
      return {
        apiKey: config.apiKey,
        modelName,
        temperature,
        topP,
        topK,
        maxOutputTokens,
        safetySettings,
        stopSequences,
        streaming,
        callbacks,
        maxRetries,
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
        }>) {
          try {
            // Validate the messages
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
              throw new Error("Messages are required and must be a non-empty array");
            }
            
            // Map roles to Google AI format
            const mappedMessages = messages.map(message => {
              // Google AI uses 'user' and 'model' roles
              let role: string = message.role;
              if (role === "assistant") role = "model";
              
              return {
                role,
                parts: [{ text: message.content }]
              };
            });
            
            // Extract system message if present and prepend to user message
            let systemPrompt = "";
            const nonSystemMessages = [];
            
            for (const message of mappedMessages) {
              if (message.role === "system") {
                systemPrompt = message.parts[0].text;
              } else {
                nonSystemMessages.push(message);
              }
            }
            
            // If there's a system message, prepend it to the first user message
            if (systemPrompt && nonSystemMessages.length > 0) {
              const firstUserMessageIndex = nonSystemMessages.findIndex(m => m.role === "user");
              if (firstUserMessageIndex >= 0) {
                const userMessage = nonSystemMessages[firstUserMessageIndex];
                userMessage.parts[0].text = `${systemPrompt}\n\n${userMessage.parts[0].text}`;
              }
            }
            
            // In a real implementation, this would call the Google AI API
            // For now, we'll simulate a response
            console.log(`[ChatGoogleGenerativeAI] Invoking model ${this.modelName} with ${messages.length} messages`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 700));
            
            // Handle streaming
            if (this.streaming) {
              // Simulate streaming response
              const content = this._generateResponse(nonSystemMessages);
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
              const content = this._generateResponse(nonSystemMessages);
              
              return {
                content,
                role: "assistant",
                _response: {
                  candidates: [
                    {
                      content: {
                        role: "model",
                        parts: [{ text: content }]
                      },
                      finishReason: "STOP",
                      safetyRatings: [
                        {
                          category: "HARM_CATEGORY_HARASSMENT",
                          probability: "NEGLIGIBLE"
                        },
                        {
                          category: "HARM_CATEGORY_HATE_SPEECH",
                          probability: "NEGLIGIBLE"
                        },
                        {
                          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                          probability: "NEGLIGIBLE"
                        },
                        {
                          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                          probability: "NEGLIGIBLE"
                        }
                      ]
                    }
                  ],
                  usageMetadata: {
                    promptTokenCount: this._countTokens(nonSystemMessages),
                    candidatesTokenCount: this._countTokens([{ role: "model", parts: [{ text: content }] }]),
                    totalTokenCount: this._countTokens(nonSystemMessages) + this._countTokens([{ role: "model", parts: [{ text: content }] }])
                  }
                }
              };
            }
          } catch (error) {
            console.error("Error invoking ChatGoogleGenerativeAI:", error);
            throw new Error(`Failed to invoke ChatGoogleGenerativeAI: ${error instanceof Error ? error.message : String(error)}`);
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
          parts: Array<{ text: string }>;
        }>) {
          // Get the last user message
          const lastUserMessage = messages
            .filter(m => m.role === 'user')
            .pop()?.parts[0].text || '';
          
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
          parts: Array<{ text: string }>;
        }>) {
          // Very rough approximation: 1 token ≈ 4 characters
          return messages.reduce((sum, message) => {
            return sum + Math.ceil((message.parts[0].text?.length || 0) / 4);
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
            console.log(`[ChatGoogleGenerativeAI] Generating embeddings for ${Array.isArray(text) ? text.length : 1} texts`);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Generate mock embeddings (768-dimensional vector with random values)
            const generateEmbedding = () => {
              const embedding = [];
              for (let i = 0; i < 768; i++) {
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
      console.error("Error creating ChatGoogleGenerativeAI:", error);
      throw new Error(`Failed to create ChatGoogleGenerativeAI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
