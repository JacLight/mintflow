import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ComponentFactory } from "../../registry/ComponentRegistry.js";

export class FAISSFactory implements ComponentFactory<FaissStore> {
  async create(config: {
    apiKey: string;
    namespace: string;
    storePath?: string;
  }): Promise<FaissStore> {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.apiKey
    });
    
    // Initialize FAISS store with empty documents
    const faissStore = await FaissStore.fromTexts(
      [], // Start with empty documents
      [], // Empty metadata
      embeddings
    );
    
    // Save the index for persistence if a path is provided
    if (config.storePath) {
      await faissStore.save(config.storePath);
    } else {
      await faissStore.save(`./data/faiss/${config.namespace}`);
    }
    
    return faissStore;
  }
}
