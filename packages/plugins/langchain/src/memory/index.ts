/**
 * Memory systems for LangChain
 * 
 * This module provides various memory implementations for storing and retrieving conversation history.
 */

// Import memory interfaces and classes
import { 
  ConversationBufferMemory, 
  ConversationBufferMemoryFactory, 
  type ConversationBufferMemoryOptions 
} from './ConversationBufferMemory.js';
import { 
  ConversationSummaryMemory, 
  ConversationSummaryMemoryFactory, 
  type ConversationSummaryMemoryOptions 
} from './ConversationSummaryMemory.js';
import { 
  ConversationTokenBufferMemory, 
  ConversationTokenBufferMemoryFactory, 
  type ConversationTokenBufferMemoryOptions 
} from './ConversationTokenBufferMemory.js';
import {
  VectorStoreMemory,
  VectorStoreMemoryFactory,
  type VectorStoreMemoryOptions,
  type VectorStore
} from './VectorStoreMemory.js';
import {
  EntityMemory,
  EntityMemoryFactory,
  type EntityMemoryOptions,
  type Entity
} from './EntityMemory.js';
import {
  ConversationKGMemory,
  ConversationKGMemoryFactory,
  type ConversationKGMemoryOptions,
  type KGTriple
} from './ConversationKGMemory.js';
import {
  RedisMemory,
  RedisMemoryFactory,
  type RedisMemoryOptions,
  type RedisClient
} from './RedisMemory.js';
import {
  MongoDBMemory,
  MongoDBMemoryFactory,
  type MongoDBMemoryOptions,
  type MongoCollection
} from './MongoDBMemory.js';
import {
  FileSystemMemory,
  FileSystemMemoryFactory,
  type FileSystemMemoryOptions
} from './FileSystemMemory.js';

// Export memory interfaces and classes
export { 
  ConversationBufferMemory, 
  ConversationBufferMemoryFactory 
};
export type { ConversationBufferMemoryOptions };

export { 
  ConversationSummaryMemory, 
  ConversationSummaryMemoryFactory 
};
export type { ConversationSummaryMemoryOptions };

export { 
  ConversationTokenBufferMemory, 
  ConversationTokenBufferMemoryFactory 
};
export type { ConversationTokenBufferMemoryOptions };

export {
  VectorStoreMemory,
  VectorStoreMemoryFactory
};
export type { VectorStoreMemoryOptions, VectorStore };

export {
  EntityMemory,
  EntityMemoryFactory
};
export type { EntityMemoryOptions, Entity };

export {
  ConversationKGMemory,
  ConversationKGMemoryFactory
};
export type { ConversationKGMemoryOptions, KGTriple };

export {
  RedisMemory,
  RedisMemoryFactory
};
export type { RedisMemoryOptions, RedisClient };

export {
  MongoDBMemory,
  MongoDBMemoryFactory
};
export type { MongoDBMemoryOptions, MongoCollection };

export {
  FileSystemMemory,
  FileSystemMemoryFactory
};
export type { FileSystemMemoryOptions };

/**
 * Create a memory system based on the specified type
 * 
 * @param type The type of memory to create
 * @param options Options for the memory
 * @returns The created memory system
 */
export function createMemory(
  type: 'buffer' | 'summary' | 'token_buffer' | 'vector_store' | 'entity' | 'kg' | 
        'redis' | 'mongodb' | 'filesystem',
  options: any
): ConversationBufferMemory | ConversationSummaryMemory | ConversationTokenBufferMemory | 
   VectorStoreMemory | EntityMemory | ConversationKGMemory | 
   RedisMemory | MongoDBMemory | FileSystemMemory {
  switch (type) {
    case 'buffer':
      return ConversationBufferMemoryFactory.create(options);
    case 'summary':
      return ConversationSummaryMemoryFactory.create(options);
    case 'token_buffer':
      return ConversationTokenBufferMemoryFactory.create(options);
    case 'vector_store':
      return VectorStoreMemoryFactory.create(options);
    case 'entity':
      return EntityMemoryFactory.create(options);
    case 'kg':
      return ConversationKGMemoryFactory.create(options);
    case 'redis':
      return RedisMemoryFactory.create(options);
    case 'mongodb':
      return MongoDBMemoryFactory.create(options);
    case 'filesystem':
      return FileSystemMemoryFactory.create(options);
    default:
      throw new Error(`Unknown memory type: ${type}`);
  }
}

/**
 * Base memory interface that all memory systems implement
 */
export interface BaseMemory {
  /**
   * Load memory variables from an input
   * 
   * @param input The input to load from
   * @returns The memory variables
   */
  loadMemoryVariables(input: Record<string, any>): Promise<Record<string, any>> | Record<string, any>;
  
  /**
   * Save context from an input/output pair
   * 
   * @param input The input
   * @param output The output
   */
  saveContext(input: Record<string, any>, output: Record<string, any>): Promise<void> | void;
  
  /**
   * Clear all memory
   */
  clear(): void;
}
