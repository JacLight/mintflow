/**
 * Interface for a vector DB (Weaviate, Pinecone, etc.).
 */
export interface IVectorDbProvider {
    initSchema(): Promise<void>;
    storeVector(data: { id: string; vector: number[];[key: string]: any }): Promise<any>;
    searchByVector(vector: number[], limit?: number): Promise<any>;
    deleteById?(id: string): Promise<void>;
    updateById?(id: string, data: any): Promise<void>;
}
