import { Chain } from './SequentialChain.js';
import { LLM } from './LLMChain.js';
import { OutputParser } from '../parsers/index.js';
import { Document } from './RetrievalQAChain.js';

/**
 * Summarization type
 */
export enum SummarizationType {
  /**
   * Summarize the entire text at once
   */
  SINGLE = 'single',
  
  /**
   * Summarize the text in chunks, then summarize the summaries
   */
  MAP_REDUCE = 'map_reduce',
  
  /**
   * Summarize the text in chunks, then refine the summary with each chunk
   */
  REFINE = 'refine'
}

/**
 * Options for SummarizationChain
 */
export interface SummarizationChainOptions {
  /**
   * The LLM to use for generating summaries
   */
  llm: LLM;
  
  /**
   * Optional prompt template for summarization
   * If not provided, a default template will be used
   * The template should include a {text} variable
   */
  promptTemplate?: string;
  
  /**
   * Optional prompt template for refining summaries
   * Only used if type is REFINE
   * If not provided, a default template will be used
   * The template should include {existing_summary} and {text} variables
   */
  refinePromptTemplate?: string;
  
  /**
   * Optional output parser to parse the LLM output
   */
  outputParser?: OutputParser;
  
  /**
   * Optional callback to call before sending the prompt to the LLM
   */
  onPrompt?: (prompt: string) => void;
  
  /**
   * Optional callback to call after receiving the summary from the LLM
   */
  onSummary?: (summary: string) => void;
  
  /**
   * Optional maximum number of tokens for each chunk
   * Only used if type is MAP_REDUCE or REFINE
   * If not provided, a default value will be used
   */
  chunkSize?: number;
  
  /**
   * Optional overlap between chunks
   * Only used if type is MAP_REDUCE or REFINE
   * If not provided, a default value will be used
   */
  chunkOverlap?: number;
  
  /**
   * Optional type of summarization to use
   * If not provided, SINGLE will be used
   */
  type?: SummarizationType;
  
  /**
   * Optional maximum length of the summary
   * If provided, the summary will be truncated to this length
   */
  maxSummaryLength?: number;
  
  /**
   * Optional function to split text into chunks
   * Only used if type is MAP_REDUCE or REFINE
   * If not provided, a default splitter will be used
   */
  textSplitter?: (text: string, chunkSize: number, chunkOverlap: number) => string[];
}

/**
 * A chain that summarizes a document or a collection of documents using an LLM
 */
export class SummarizationChain implements Chain {
  private llm: LLM;
  private promptTemplate: string;
  private refinePromptTemplate: string;
  private outputParser?: OutputParser;
  private onPrompt?: (prompt: string) => void;
  private onSummary?: (summary: string) => void;
  private chunkSize: number;
  private chunkOverlap: number;
  private type: SummarizationType;
  private maxSummaryLength?: number;
  private textSplitter: (text: string, chunkSize: number, chunkOverlap: number) => string[];
  
  /**
   * Create a new SummarizationChain
   * 
   * @param options Options for the chain
   */
  constructor(options: SummarizationChainOptions) {
    this.llm = options.llm;
    this.promptTemplate = options.promptTemplate || 
      "Summarize the following text:\n\n{text}\n\nSummary:";
    this.refinePromptTemplate = options.refinePromptTemplate || 
      "You have been given an existing summary:\n{existing_summary}\n\nRefine this summary with additional information from the following text:\n{text}\n\nRefined summary:";
    this.outputParser = options.outputParser;
    this.onPrompt = options.onPrompt;
    this.onSummary = options.onSummary;
    this.chunkSize = options.chunkSize || 4000;
    this.chunkOverlap = options.chunkOverlap || 200;
    this.type = options.type || SummarizationType.SINGLE;
    this.maxSummaryLength = options.maxSummaryLength;
    this.textSplitter = options.textSplitter || this.defaultTextSplitter;
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
   * Format the prompt with the given text
   * 
   * @param text The text to summarize
   * @returns The formatted prompt
   */
  private formatPrompt(text: string): string {
    return this.promptTemplate.replace('{text}', text);
  }
  
  /**
   * Format the refine prompt with the given text and existing summary
   * 
   * @param text The text to incorporate into the summary
   * @param existingSummary The existing summary to refine
   * @returns The formatted prompt
   */
  private formatRefinePrompt(text: string, existingSummary: string): string {
    return this.refinePromptTemplate
      .replace('{text}', text)
      .replace('{existing_summary}', existingSummary);
  }
  
  /**
   * Summarize text using the single approach
   * 
   * @param text The text to summarize
   * @param options Optional parameters for the LLM
   * @returns The summary
   */
  private async summarizeSingle(text: string, options?: any): Promise<string> {
    // Format the prompt
    const prompt = this.formatPrompt(text);
    
    // Call the onPrompt callback if provided
    if (this.onPrompt) {
      this.onPrompt(prompt);
    }
    
    // Run the LLM
    let summary = await this.llm.complete(prompt, options);
    
    // Call the onSummary callback if provided
    if (this.onSummary) {
      this.onSummary(summary);
    }
    
    // Parse the output if a parser is provided
    if (this.outputParser) {
      summary = this.outputParser.parse(summary);
    }
    
    // Truncate the summary if maxSummaryLength is provided
    if (this.maxSummaryLength !== undefined && typeof summary === 'string' && summary.length > this.maxSummaryLength) {
      summary = summary.substring(0, this.maxSummaryLength);
    }
    
    return summary;
  }
  
  /**
   * Summarize text using the map-reduce approach
   * 
   * @param text The text to summarize
   * @param options Optional parameters for the LLM
   * @returns The summary
   */
  private async summarizeMapReduce(text: string, options?: any): Promise<string> {
    // Split the text into chunks
    const chunks = this.textSplitter(text, this.chunkSize, this.chunkOverlap);
    
    // If there's only one chunk, use the single approach
    if (chunks.length === 1) {
      return this.summarizeSingle(chunks[0], options);
    }
    
    // Summarize each chunk
    const chunkSummaries: string[] = [];
    for (const chunk of chunks) {
      const chunkSummary = await this.summarizeSingle(chunk, options);
      chunkSummaries.push(chunkSummary);
    }
    
    // Combine the chunk summaries
    const combinedSummaries = chunkSummaries.join('\n\n');
    
    // Summarize the combined summaries
    return this.summarizeSingle(combinedSummaries, options);
  }
  
  /**
   * Summarize text using the refine approach
   * 
   * @param text The text to summarize
   * @param options Optional parameters for the LLM
   * @returns The summary
   */
  private async summarizeRefine(text: string, options?: any): Promise<string> {
    // Split the text into chunks
    const chunks = this.textSplitter(text, this.chunkSize, this.chunkOverlap);
    
    // If there's only one chunk, use the single approach
    if (chunks.length === 1) {
      return this.summarizeSingle(chunks[0], options);
    }
    
    // Summarize the first chunk
    let summary = await this.summarizeSingle(chunks[0], options);
    
    // Refine the summary with each subsequent chunk
    for (let i = 1; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Format the refine prompt
      const prompt = this.formatRefinePrompt(chunk, summary);
      
      // Call the onPrompt callback if provided
      if (this.onPrompt) {
        this.onPrompt(prompt);
      }
      
      // Run the LLM
      let refinedSummary = await this.llm.complete(prompt, options);
      
      // Call the onSummary callback if provided
      if (this.onSummary) {
        this.onSummary(refinedSummary);
      }
      
      // Parse the output if a parser is provided
      if (this.outputParser) {
        refinedSummary = this.outputParser.parse(refinedSummary);
      }
      
      // Update the summary
      summary = refinedSummary;
    }
    
    // Truncate the summary if maxSummaryLength is provided
    if (this.maxSummaryLength !== undefined && typeof summary === 'string' && summary.length > this.maxSummaryLength) {
      summary = summary.substring(0, this.maxSummaryLength);
    }
    
    return summary;
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the chain, must include a 'text' or 'documents' key
   * @param options Optional parameters for the chain
   * @returns The summary
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
    
    // Summarize the text based on the type
    switch (this.type) {
      case SummarizationType.SINGLE:
        return this.summarizeSingle(text, options);
      case SummarizationType.MAP_REDUCE:
        return this.summarizeMapReduce(text, options);
      case SummarizationType.REFINE:
        return this.summarizeRefine(text, options);
      default:
        throw new Error(`Unknown summarization type: ${this.type}`);
    }
  }
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the chain, must include a 'text' or 'documents' key
   * @param options Optional parameters for the chain
   * @returns The summary with additional metadata
   */
  async call(input: Record<string, any>, options?: any): Promise<{
    summary: string;
    type: SummarizationType;
    chunkCount?: number;
    originalLength: number;
    summaryLength: number;
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
    
    // Summarize the text based on the type
    let summary: string;
    let chunkCount: number | undefined;
    
    switch (this.type) {
      case SummarizationType.SINGLE:
        summary = await this.summarizeSingle(text, options);
        break;
      case SummarizationType.MAP_REDUCE:
        const mapReduceChunks = this.textSplitter(text, this.chunkSize, this.chunkOverlap);
        chunkCount = mapReduceChunks.length;
        summary = await this.summarizeMapReduce(text, options);
        break;
      case SummarizationType.REFINE:
        const refineChunks = this.textSplitter(text, this.chunkSize, this.chunkOverlap);
        chunkCount = refineChunks.length;
        summary = await this.summarizeRefine(text, options);
        break;
      default:
        throw new Error(`Unknown summarization type: ${this.type}`);
    }
    
    // Calculate the summary length
    const summaryLength = summary.length;
    
    // Return the summary with additional metadata
    return {
      summary,
      type: this.type,
      chunkCount,
      originalLength,
      summaryLength
    };
  }
}

/**
 * Factory for creating SummarizationChain instances
 */
export class SummarizationChainFactory {
  /**
   * Create a new SummarizationChain
   * 
   * @param options Options for the chain
   * @returns A new SummarizationChain instance
   */
  static create(options: SummarizationChainOptions): SummarizationChain {
    return new SummarizationChain(options);
  }
  
  /**
   * Create a new SummarizationChain with a simple configuration
   * 
   * @param llm The LLM to use
   * @param type The type of summarization to use
   * @returns A new SummarizationChain instance
   */
  static fromLLM(
    llm: LLM,
    type: SummarizationType = SummarizationType.SINGLE
  ): SummarizationChain {
    return new SummarizationChain({
      llm,
      type
    });
  }
  
  /**
   * Create a new SummarizationChain with a map-reduce approach
   * 
   * @param llm The LLM to use
   * @param chunkSize The maximum size of each chunk
   * @param chunkOverlap The overlap between chunks
   * @returns A new SummarizationChain instance
   */
  static mapReduce(
    llm: LLM,
    chunkSize: number = 4000,
    chunkOverlap: number = 200
  ): SummarizationChain {
    return new SummarizationChain({
      llm,
      type: SummarizationType.MAP_REDUCE,
      chunkSize,
      chunkOverlap
    });
  }
  
  /**
   * Create a new SummarizationChain with a refine approach
   * 
   * @param llm The LLM to use
   * @param chunkSize The maximum size of each chunk
   * @param chunkOverlap The overlap between chunks
   * @returns A new SummarizationChain instance
   */
  static refine(
    llm: LLM,
    chunkSize: number = 4000,
    chunkOverlap: number = 200
  ): SummarizationChain {
    return new SummarizationChain({
      llm,
      type: SummarizationType.REFINE,
      chunkSize,
      chunkOverlap
    });
  }
}
