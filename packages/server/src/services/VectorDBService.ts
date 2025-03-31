import { IVectorDB } from '../interfaces/IVectorDB.js';
import { ENV } from '../config/env.js';
import { PineconeService } from './PineconeService.js';
import { WeaviateService } from './WeaviateService.js';

export class VectorDBService {
    private static provider: IVectorDB;

    static async getInstance(): Promise<IVectorDB> {
        if (!VectorDBService.provider) {
            if (ENV.VECTOR_DB_PROVIDER === 'pinecone') {
                VectorDBService.provider = await PineconeService.getInstance();
            } else {
                VectorDBService.provider = await WeaviateService.getInstance();
            }
        }
        return VectorDBService.provider;
    }
}
