import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating language translation transformers
 */
export class LanguageTranslationTransformerFactory implements ComponentFactory<any> {
  /**
   * Creates a new language translation transformer
   * 
   * @param config Configuration for the language translation transformer
   * @returns A new language translation transformer instance
   */
  async create(config: {
    sourceLanguage: string;
    targetLanguage: string;
    model?: string;
    apiKey?: string;
    batchSize?: number;
    concurrency?: number;
    preserveFormatting?: boolean;
  }): Promise<any> {
    try {
      // Create a custom transformer that uses an LLM to translate text
      return {
        async transformDocuments(documents: Array<{ pageContent: string; metadata: Record<string, any> }>) {
          // Import the OpenAI client for translation
          const { OpenAI } = await import("@langchain/openai");
          
          // Create the OpenAI client
          const llm = new OpenAI({
            modelName: config.model || "gpt-3.5-turbo-instruct",
            openAIApiKey: config.apiKey,
            temperature: 0.1 // Low temperature for more deterministic translations
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
                // Create a prompt for translation
                let prompt = `Translate the following text from ${config.sourceLanguage} to ${config.targetLanguage}`;
                
                if (config.preserveFormatting) {
                  prompt += ". Preserve the original formatting, including paragraphs, bullet points, and other structural elements.";
                }
                
                prompt += ":\n\n" + doc.pageContent;
                
                // Translate the text
                const translatedText = await llm.invoke(prompt);
                
                // Return the translated document
                return {
                  pageContent: translatedText,
                  metadata: {
                    ...doc.metadata,
                    sourceLanguage: config.sourceLanguage,
                    targetLanguage: config.targetLanguage,
                    translated: true
                  }
                };
              } catch (error) {
                console.error("Error translating document:", error);
                // Return the original document if translation fails
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
      console.error("Error creating LanguageTranslationTransformer:", error);
      throw new Error(`Failed to create LanguageTranslationTransformer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
