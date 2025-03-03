import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating text summarization transformers
 */
export class TextSummarizationTransformerFactory implements ComponentFactory<any> {
  /**
   * Creates a new text summarization transformer
   * 
   * @param config Configuration for the text summarization transformer
   * @returns A new text summarization transformer instance
   */
  async create(config: {
    model?: string;
    apiKey?: string;
    maxLength?: number;
    minLength?: number;
    type?: "extractive" | "abstractive";
    format?: "bullet" | "paragraph" | "concise";
    batchSize?: number;
    concurrency?: number;
  }): Promise<any> {
    try {
      // Create a custom transformer that uses an LLM to summarize text
      return {
        async transformDocuments(documents: Array<{ pageContent: string; metadata: Record<string, any> }>) {
          // Import the OpenAI client for summarization
          const { OpenAI } = await import("@langchain/openai");
          
          // Create the OpenAI client
          const llm = new OpenAI({
            modelName: config.model || "gpt-3.5-turbo-instruct",
            openAIApiKey: config.apiKey,
            temperature: 0.3 // Moderate temperature for balance between creativity and consistency
          });
          
          // Process documents in batches
          const batchSize = config.batchSize || 5;
          const concurrency = config.concurrency || 1;
          const results: Array<{ pageContent: string; metadata: Record<string, any> }> = [];
          
          // Process documents in batches
          for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            const batchPromises = batch.map(async (doc) => {
              try {
                // Create a prompt for summarization
                let prompt = "Summarize the following text";
                
                if (config.type === "extractive") {
                  prompt += " by extracting the most important sentences";
                } else {
                  prompt += " by generating a concise abstract";
                }
                
                if (config.maxLength) {
                  prompt += ` in no more than ${config.maxLength} words`;
                }
                
                if (config.minLength) {
                  prompt += ` and at least ${config.minLength} words`;
                }
                
                if (config.format === "bullet") {
                  prompt += " in bullet point format";
                } else if (config.format === "concise") {
                  prompt += " in a single concise paragraph";
                } else {
                  prompt += " in paragraph format";
                }
                
                prompt += ":\n\n" + doc.pageContent;
                
                // Summarize the text
                const summarizedText = await llm.invoke(prompt);
                
                // Return the summarized document
                return {
                  pageContent: summarizedText,
                  metadata: {
                    ...doc.metadata,
                    summarized: true,
                    summarizationType: config.type || "abstractive",
                    originalLength: doc.pageContent.length,
                    summaryLength: summarizedText.length
                  }
                };
              } catch (error) {
                console.error("Error summarizing document:", error);
                // Return the original document if summarization fails
                return doc;
              }
            });
            
            // Process batch with concurrency limit
            const batchResults = [];
            for (let j = 0; j < batchPromises.length; j += concurrency) {
              const concurrentBatch = batchPromises.slice(j, j + concurrency);
              const concurrentResults = await Promise.all(concurrentBatch);
              batchResults.push(...concurrentResults);
            }
            
            results.push(...batchResults);
          }
          
          return results;
        }
      };
    } catch (error) {
      console.error("Error creating TextSummarizationTransformer:", error);
      throw new Error(`Failed to create TextSummarizationTransformer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
