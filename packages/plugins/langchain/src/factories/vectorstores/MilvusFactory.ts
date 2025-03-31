import { OpenAIEmbeddings } from "@langchain/openai";
import { ComponentFactory } from "../../registry/ComponentRegistry.js";

// We'll use any type for now to avoid TypeScript errors
export class MilvusFactory implements ComponentFactory<any> {
  async create(config: {
    openAIApiKey: string;
    milvusUrl: string;
    collectionName: string;
    namespace?: string;
    username?: string;
    password?: string;
  }): Promise<any> {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openAIApiKey
    });
    
    // Import the LangChain Milvus integration dynamically
    const { Milvus } = await import("@langchain/community/vectorstores/milvus");
    
    // Parse Milvus URL to get host and port
    const url = new URL(config.milvusUrl);
    const host = url.hostname;
    const port = parseInt(url.port || "19530");
    
    // Initialize with empty texts to create the collection if it doesn't exist
    return await Milvus.fromTexts(
      [], // Start with empty documents
      {}, // Empty metadata
      embeddings,
      {
        url: config.milvusUrl,
        collectionName: config.collectionName,
        ...(config.username && { username: config.username }),
        ...(config.password && { password: config.password }),
        // Add filter for namespace if provided
        ...(config.namespace && {
          filter: `namespace == "${config.namespace}"`
        })
      }
    );
  }
}
