import { OpenAIEmbeddings } from "@langchain/openai";
import { ComponentFactory } from "../../registry/ComponentRegistry.js";

// We'll use any type for now to avoid TypeScript errors
export class RedisFactory implements ComponentFactory<any> {
  async create(config: {
    openAIApiKey: string;
    redisUrl: string;
    indexName: string;
    namespace?: string;
    redisPassword?: string;
    dimensions?: number;
  }): Promise<any> {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openAIApiKey
    });
    
    // Import the LangChain Redis integration dynamically
    const { RedisVectorStore } = await import("@langchain/community/vectorstores/redis");
    
    // Parse Redis URL to get host and port
    const url = new URL(config.redisUrl);
    const host = url.hostname;
    const port = parseInt(url.port || "6379");
    
    // Create a Redis client
    const { createClient } = await import("redis");
    const client = createClient({
      url: config.redisUrl,
      ...(config.redisPassword && { password: config.redisPassword })
    });
    
    // Connect to Redis
    await client.connect();
    
    // Initialize with empty texts to create the index if it doesn't exist
    return await RedisVectorStore.fromTexts(
      [], // Start with empty documents
      {}, // Empty metadata
      embeddings,
      {
        redisClient: client,
        indexName: config.indexName,
        keyPrefix: config.namespace || "doc:"
        // Note: dimensions is handled internally by the embeddings model
      }
    );
  }
}
