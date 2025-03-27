import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ComponentFactory } from "../../registry/ComponentRegistry.js";

export class PineconeFactory implements ComponentFactory<PineconeStore> {
  async create(config: {
    apiKey: string;
    pineconeApiKey: string;
    pineconeEnvironment: string;
    pineconeIndex: string;
    namespace?: string;
  }): Promise<PineconeStore> {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.apiKey
    });
    
    // Initialize Pinecone client
    const { Pinecone } = await import('@pinecone-database/pinecone');
    const pinecone = new Pinecone({
      apiKey: config.pineconeApiKey,
      environment: config.pineconeEnvironment
    });
    
    // Get the index
    const index = pinecone.Index(config.pineconeIndex);
    
    // Create the vector store
    return await PineconeStore.fromExistingIndex(
      embeddings,
      {
        pineconeIndex: index as any, // TODO: Fix type mismatch
        namespace: config.namespace
      }
    );
  }
}
