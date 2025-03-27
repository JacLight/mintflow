import { Document } from "langchain/document";
import { ComponentFactory } from "../../registry/ComponentRegistry.js";

export class MongoDBLoaderFactory implements ComponentFactory<any> {
  async create(config: any): Promise<any> {
    // TODO: Install @langchain/community package
    // This is a dummy implementation until the proper package is installed
    console.warn("MongoDBLoader is not fully implemented. Please install @langchain/community package.");
    
    return {
      load: async () => {
        return [
          new Document({
            pageContent: "Dummy content for MongoDBLoader",
            metadata: { source: "dummy-source" }
          })
        ];
      }
    };
  }
}
