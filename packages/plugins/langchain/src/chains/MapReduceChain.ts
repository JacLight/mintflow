import { Chain } from './SequentialChain.js';
import { LLM } from './LLMChain.js';
import { OutputParser } from '../parsers/index.js';
import { Document } from './RetrievalQAChain.js';

/**
 * Options for MapReduceChain
 */
export interface MapReduceChainOptions {
  /**
   * The LLM to use for the map step
   */
  mapLLM: LLM;
  
  /**
   * The LLM to use for the reduce step
   * If not provided, mapLLM will be used
   */
  reduceLLM?: LLM;
  
  /**
   * Optional prompt template for the map step
   * If not provided, a default template will be used
   * The template should include a {text} variable
   */
  mapPromptTemplate?: string;
  
  /**
   * Optional prompt template for the reduce step
   * If not provided, a default template will be used
   * The template should include a {texts} variable
   */
  reducePromptTemplate?: string;
  
  /**
   * Optional output parser to parse the LLM output for the map step
   */
  mapOutputParser?: OutputParser;
  
  /**
   * Optional output parser to parse the LLM output for the reduce step
   */
  reduceOutputParser?: OutputParser;
  
  /**
   * Optional callback to call before sending the prompt to the LLM for the map step
   */
  onMapPrompt?: (prompt: string, index: number) => void;
  
  /**
   * Optional callback to call after receiving the output from the LLM for the map step
   */
  onMapOutput?: (output: string, index: number) => void;
  
  /**
   * Optional callback to call before sending the prompt to the LLM for the reduce step
   */
  onReducePrompt?: (prompt: string) => void;
  
  /**
   * Optional callback to call after receiving the output from the LLM for the reduce step
   */
  onReduceOutput?: (output: string) => void;
  
  /**
   * Optional maximum number of tokens for each chunk
   * If not provided, a default value will be used
   */
  chunkSize?: number;
  
  /**
   * Optional overlap between chunks
   * If not provided, a default value will be used
   */
  chunkOverlap?: number;
  
  /**
   * Optional maximum number of chunks to process in parallel during the map step
   * If not provided, chunks will be processed sequentially
   */
  maxConcurrency?: number;
  
  /**
   * Optional function to split text into chunks
   * If not provided, a default splitter will be used
   */
  textSplitter?: (text: string, chunkSize: number, chunkOverlap: number) => string[];
  
  /**
   * Optional maximum number of chunks to combine in a single reduce step
   * If not provided, all chunks will be combined in a single reduce step
   */
  reduceChunkSize?: number;
  
  /**
   * Optional flag to return intermediate results
   * If true, the map results will be included in the output
   */
  returnIntermediateResults?: boolean;
}

/**
 * A chain that applies a map-reduce approach to process large texts or collections of documents
 */
export class MapReduceChain implements Chain {
  private mapLLM: LLM;
  private reduceLLM: LLM;
  private mapPromptTemplate: string;
  private reducePromptTemplate: string;
  private mapOutputParser?: OutputParser;
  private reduceOutputParser?: OutputParser;
  private onMapPrompt?: (prompt: string, index: number) => void;
  private onMapOutput?: (output: string, index: number) => void;
  private onReducePrompt?: (prompt: string) => void;
  private onReduceOutput?: (output: string) => void;
  private chunkSize: number;
  private chunkOverlap: number;
  private maxConcurrency?: number;
  private textSplitter: (text: string, chunkSize: number, chunkOverlap: number) => string[];
  private reduceChunkSize?: number;
  private returnIntermediateResults: boolean;
  
  /**
   * Create a new MapReduceChain
   * 
   * @param options Options for the chain
   */
  constructor(options: MapReduceChainOptions) {
    this.mapLLM = options.mapLLM;
    this.reduceLLM = options.reduceLLM || options.mapLLM;
    this.mapPromptTemplate = options.mapPromptTemplate || 
      "Process the following text and extract the key information:\n\n{text}\n\nKey information:";
    this.reducePromptTemplate = options.reducePromptTemplate || 
      "Combine the following extracted information into a coherent summary:\n\n{texts}\n\nSummary:";
    this.mapOutputParser = options.mapOutputParser;
    this.reduceOutputParser = options.reduceOutputParser;
    this.onMapPrompt = options.onMapPrompt;
    this.onMapOutput = options.onMapOutput;
    this.onReducePrompt = options.onReducePrompt;
    this.onReduceOutput = options.onReduceOutput;
    this.chunkSize = options.chunkSize || 4000;
    this.chunkOverlap = options.chunkOverlap || 200;
    this.maxConcurrency = options.maxConcurrency;
    this.textSplitter = options.textSplitter || this.defaultTextSplitter;
    this.reduceChunkSize = options.reduceChunkSize;
    this.returnIntermediateResults = options.returnIntermediateResults || false;
  }
  
  /**
   * Default text splitter
   * 
   * @param text The text to split
   * @param chunkSize The maximum size of each chunk
   * @param chunkOverlap The overlap between chunks
   * @returns An array of text chunks
   */
  private defaultTextSplitter(text: string, chunkSize: number, chunkOverlap: number): string[] {
    const chunks: string[] = [];
    let startIndex = 0;
    
    while (startIndex < text.length) {
      // Calculate end index
      let endIndex = startIndex + chunkSize;
      
      // Adjust end index to avoid splitting in the middle of a word
      if (endIndex < text.length) {
        // Find the next space after the end index
        const nextSpace = text.indexOf(' ', endIndex);
        if (nextSpace !== -1) {
          endIndex = nextSpace;
        } else {
          endIndex = text.length;
        }
      } else {
        endIndex = text.length;
      }
      
      // Extract the chunk
      const chunk = text.substring(startIndex, endIndex);
      chunks.push(chunk);
      
      // Calculate the next start index with overlap
      startIndex = endIndex - chunkOverlap;
      
      // Ensure the start index is not negative
      if (startIndex < 0) {
        startIndex = 0;
      }
      
      // If we've reached the end of the text, break
      if (startIndex >= text.length) {
        break;
      }
    }
    
    return chunks;
  }
  
  /**
   * Format the map prompt with the given text
   * 
   * @param text The text to process
   * @returns The formatted prompt
   */
  private formatMapPrompt(text: string): string {
    return this.mapPromptTemplate.replace('{text}', text);
  }
  
  /**
   * Format the reduce prompt with the given texts
   * 
   * @param texts The texts to combine
   * @returns The formatted prompt
   */
  private formatReducePrompt(texts: string[]): string {
    return this.reducePromptTemplate.replace('{texts}', texts.join('\n\n'));
  }
  
  /**
   * Process a chunk of text using the map step
   * 
   * @param text The text to process
   * @param index The index of the chunk
   * @param options Optional parameters for the LLM
   * @returns The processed text
   */
  private async mapChunk(text: string, index: number, options?: any): Promise<string> {
    // Format the prompt
    const prompt = this.formatMapPrompt(text);
    
    // Call the onMapPrompt callback if provided
    if (this.onMapPrompt) {
      this.onMapPrompt(prompt, index);
    }
    
    // Run the LLM
    let output = await this.mapLLM.complete(prompt, options);
    
    // Call the onMapOutput callback if provided
    if (this.onMapOutput) {
      this.onMapOutput(output, index);
    }
    
    // Parse the output if a parser is provided
    if (this.mapOutputParser) {
      output = this.mapOutputParser.parse(output);
    }
    
    return output;
  }
  
  /**
   * Combine processed texts using the reduce step
   * 
   * @param texts The texts to combine
   * @param options Optional parameters for the LLM
   * @returns The combined text
   */
  private async reduceTexts(texts: string[], options?: any): Promise<string> {
    // If there's only one text, return it
    if (texts.length === 1) {
      return texts[0];
    }
    
    // Format the prompt
    const prompt = this.formatReducePrompt(texts);
    
    // Call the onReducePrompt callback if provided
    if (this.onReducePrompt) {
      this.onReducePrompt(prompt);
    }
    
    // Run the LLM
    let output = await this.reduceLLM.complete(prompt, options);
    
    // Call the onReduceOutput callback if provided
    if (this.onReduceOutput) {
      this.onReduceOutput(output);
    }
    
    // Parse the output if a parser is provided
    if (this.reduceOutputParser) {
      output = this.reduceOutputParser.parse(output);
    }
    
    return output;
  }
  
  /**
   * Process chunks in parallel
   * 
   * @param chunks The chunks to process
   * @param options Optional parameters for the LLM
   * @returns The processed chunks
   */
  private async processChunksInParallel(chunks: string[], options?: any): Promise<string[]> {
    const results: string[] = [];
    
    // If maxConcurrency is not provided, process all chunks in parallel
    const concurrency = this.maxConcurrency || chunks.length;
    
    // Process chunks in batches
    for (let i = 0; i < chunks.length; i += concurrency) {
      const batch = chunks.slice(i, i + concurrency);
      const batchPromises = batch.map((chunk, index) => 
        this.mapChunk(chunk, i + index, options)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
  
  /**
   * Process chunks sequentially
   * 
   * @param chunks The chunks to process
   * @param options Optional parameters for the LLM
   * @returns The processed chunks
   */
  private async processChunksSequentially(chunks: string[], options?: any): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const result = await this.mapChunk(chunks[i], i, options);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Reduce results in a hierarchical manner
   * 
   * @param results The results to reduce
   * @param options Optional parameters for the LLM
   * @returns The final result
   */
  private async hierarchicalReduce(results: string[], options?: any): Promise<string> {
    // If there's only one result, return it
    if (results.length === 1) {
      return results[0];
    }
    
    // If reduceChunkSize is not provided, reduce all results at once
    if (!this.reduceChunkSize) {
      return this.reduceTexts(results, options);
    }
    
    // Reduce results in chunks
    const reducedResults: string[] = [];
    
    for (let i = 0; i < results.length; i += this.reduceChunkSize) {
      const chunk = results.slice(i, i + this.reduceChunkSize);
      const reducedChunk = await this.reduceTexts(chunk, options);
      reducedResults.push(reducedChunk);
    }
    
    // If there's only one reduced result, return it
    if (reducedResults.length === 1) {
      return reducedResults[0];
    }
    
    // Otherwise, recursively reduce the reduced results
    return this.hierarchicalReduce(reducedResults, options);
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the chain, must include a 'text' or 'documents' key
   * @param options Optional parameters for the chain
   * @returns The result of the chain
   */
  async run(input: Record<string, any>, options?: any): Promise<string> {
    // Extract the text from the input
    let text: string;
    
    if (input.text) {
      // Use the provided text
      text = input.text;
    } else if (input.documents) {
      // Combine the documents into a single text
      const documents: Document[] = input.documents;
      text = documents.map(doc => doc.content).join('\n\n');
    } else {
      throw new Error('Input must include either a "text" or "documents" key');
    }
    
    // Split the text into chunks
    const chunks = this.textSplitter(text, this.chunkSize, this.chunkOverlap);
    
    // Process the chunks
    const mapResults = this.maxConcurrency
      ? await this.processChunksInParallel(chunks, options)
      : await this.processChunksSequentially(chunks, options);
    
    // Reduce the results
    const result = await this.hierarchicalReduce(mapResults, options);
    
    return result;
  }
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the chain, must include a 'text' or 'documents' key
   * @param options Optional parameters for the chain
   * @returns The result of the chain with additional metadata
   */
  async call(input: Record<string, any>, options?: any): Promise<{
    result: string;
    mapResults?: string[];
    chunkCount: number;
    originalLength: number;
    resultLength: number;
  }> {
    // Extract the text from the input
    let text: string;
    
    if (input.text) {
      // Use the provided text
      text = input.text;
    } else if (input.documents) {
      // Combine the documents into a single text
      const documents: Document[] = input.documents;
      text = documents.map(doc => doc.content).join('\n\n');
    } else {
      throw new Error('Input must include either a "text" or "documents" key');
    }
    
    // Calculate the original length
    const originalLength = text.length;
    
    // Split the text into chunks
    const chunks = this.textSplitter(text, this.chunkSize, this.chunkOverlap);
    
    // Process the chunks
    const mapResults = this.maxConcurrency
      ? await this.processChunksInParallel(chunks, options)
      : await this.processChunksSequentially(chunks, options);
    
    // Reduce the results
    const result = await this.hierarchicalReduce(mapResults, options);
    
    // Calculate the result length
    const resultLength = result.length;
    
    // Return the result with additional metadata
    return {
      result,
      mapResults: this.returnIntermediateResults ? mapResults : undefined,
      chunkCount: chunks.length,
      originalLength,
      resultLength
    };
  }
}

/**
 * Factory for creating MapReduceChain instances
 */
export class MapReduceChainFactory {
  /**
   * Create a new MapReduceChain
   * 
   * @param options Options for the chain
   * @returns A new MapReduceChain instance
   */
  static create(options: MapReduceChainOptions): MapReduceChain {
    return new MapReduceChain(options);
  }
  
  /**
   * Create a new MapReduceChain with a simple configuration
   * 
   * @param llm The LLM to use for both map and reduce steps
   * @param chunkSize The maximum size of each chunk
   * @param chunkOverlap The overlap between chunks
   * @returns A new MapReduceChain instance
   */
  static fromLLM(
    llm: LLM,
    chunkSize: number = 4000,
    chunkOverlap: number = 200
  ): MapReduceChain {
    return new MapReduceChain({
      mapLLM: llm,
      chunkSize,
      chunkOverlap
    });
  }
  
  /**
   * Create a new MapReduceChain with separate LLMs for map and reduce steps
   * 
   * @param mapLLM The LLM to use for the map step
   * @param reduceLLM The LLM to use for the reduce step
   * @param chunkSize The maximum size of each chunk
   * @param chunkOverlap The overlap between chunks
   * @returns A new MapReduceChain instance
   */
  static fromLLMs(
    mapLLM: LLM,
    reduceLLM: LLM,
    chunkSize: number = 4000,
    chunkOverlap: number = 200
  ): MapReduceChain {
    return new MapReduceChain({
      mapLLM,
      reduceLLM,
      chunkSize,
      chunkOverlap
    });
  }
  
  /**
   * Create a new MapReduceChain with parallel processing
   * 
   * @param llm The LLM to use for both map and reduce steps
   * @param maxConcurrency The maximum number of chunks to process in parallel
   * @param chunkSize The maximum size of each chunk
   * @param chunkOverlap The overlap between chunks
   * @returns A new MapReduceChain instance
   */
  static parallel(
    llm: LLM,
    maxConcurrency: number = 5,
    chunkSize: number = 4000,
    chunkOverlap: number = 200
  ): MapReduceChain {
    return new MapReduceChain({
      mapLLM: llm,
      chunkSize,
      chunkOverlap,
      maxConcurrency
    });
  }
}
