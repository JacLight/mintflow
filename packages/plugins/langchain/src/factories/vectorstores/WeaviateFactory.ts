import { OpenAIEmbeddings } from "@langchain/openai";
import { ComponentFactory } from "../../registry/ComponentRegistry.js";

// We'll use any type for now to avoid TypeScript errors with the Weaviate client
export class WeaviateFactory implements ComponentFactory<any> {
  async create(config: {
    openAIApiKey: string;
    weaviateUrl: string;
    className: string;
    namespace?: string;
    weaviateApiKey?: string;
    textKey?: string;
  }): Promise<any> {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openAIApiKey
    });
    
    // Import the LangChain Weaviate integration dynamically
    const { WeaviateStore } = await import("@langchain/community/vectorstores/weaviate");
    
    // Initialize with empty texts to create the class if it doesn't exist
    return await WeaviateStore.fromTexts(
      [], // Start with empty documents
      {}, // Empty metadata
      embeddings,
      {
        // Use the correct property names according to the WeaviateStore API
        client: {
          scheme: config.weaviateUrl.startsWith('https') ? 'https' : 'http',
          host: config.weaviateUrl.replace(/^https?:\/\//, '')
        },
        indexName: config.className,
        textKey: config.textKey || "text"
      }
    );
  }
}
