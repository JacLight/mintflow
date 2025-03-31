/**
 * Chains for LangChain
 * 
 * This module provides various chain implementations for building complex workflows with LLMs.
 */

// Import chain interfaces and types
import { LLM, PromptTemplate } from './LLMChain.js';
import { Chain } from './SequentialChain.js';
import { TransformFunction } from './TransformChain.js';

// Export chain interfaces and types
export type { LLM, PromptTemplate, Chain, TransformFunction };

// Export chain classes
export { LLMChain, LLMChainFactory, type LLMChainOptions } from './LLMChain.js';
export { SequentialChain, SequentialChainFactory, type SequentialChainOptions } from './SequentialChain.js';
export { TransformChain, TransformChainFactory, type TransformChainOptions } from './TransformChain.js';

// Export specialized chains
export { 
  RetrievalQAChain, 
  RetrievalQAChainFactory, 
  type RetrievalQAChainOptions,
  type Retriever,
  type Document
} from './RetrievalQAChain.js';
export { 
  ConversationalRetrievalChain, 
  ConversationalRetrievalChainFactory, 
  type ConversationalRetrievalChainOptions,
  type Message
} from './ConversationalRetrievalChain.js';
export { 
  SummarizationChain, 
  SummarizationChainFactory, 
  type SummarizationChainOptions,
  SummarizationType
} from './SummarizationChain.js';

// Export advanced chains
export {
  MapReduceChain,
  MapReduceChainFactory,
  type MapReduceChainOptions
} from './MapReduceChain.js';
export {
  RouterChain,
  RouterChainFactory,
  type RouterChainOptions,
  type RouterFunction,
  type Route
} from './RouterChain.js';
export {
  ConstitutionalChain,
  ConstitutionalChainFactory,
  type ConstitutionalChainOptions,
  type ConstitutionalPrinciple
} from './ConstitutionalChain.js';

// Export a base Chain class that all chains implement
export abstract class BaseChain implements Chain {
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the chain
   */
  abstract run(input: Record<string, any>, options?: any): Promise<any>;
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the chain with additional metadata
   */
  abstract call(input: Record<string, any>, options?: any): Promise<any>;
}
