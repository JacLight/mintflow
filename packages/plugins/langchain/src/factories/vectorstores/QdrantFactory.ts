import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ComponentFactory } from "../../registry/ComponentRegistry.js";

export class QdrantFactory implements ComponentFactory<QdrantVectorStore> {
  async create(config: {
    apiKey: string;
    qdrantUrl: string;
    collectionName: string;
    namespace?: string;
  }): Promise<QdrantVectorStore> {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.apiKey
    });
    
    // Initialize with empty texts to create the collection if it doesn't exist
    return await QdrantVectorStore.fromTexts(
      [], // Start with empty documents
      {}, // Empty metadata
      embeddings,
      {
        url: config.qdrantUrl,
        collectionName: config.collectionName,
        // Add filter for namespace if provided
        ...(config.namespace && { 
          filter: { namespace: config.namespace } 
        })
      }
    );
  }
}
