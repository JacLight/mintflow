import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ComponentFactory } from "../../registry/ComponentRegistry.js";

export class ChromaFactory implements ComponentFactory<Chroma> {
  async create(config: {
    apiKey: string;
    namespace: string;
    url?: string;
    collectionName?: string;
  }): Promise<Chroma> {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.apiKey
    });
    
    return new Chroma(embeddings, {
      url: config.url || "http://localhost:8000",
      collectionName: config.collectionName || config.namespace
    });
  }
}
