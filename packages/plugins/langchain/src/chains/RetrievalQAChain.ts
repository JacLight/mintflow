import { Chain } from './SequentialChain.js';
import { LLM } from './LLMChain.js';
import { OutputParser } from '../parsers/index.js';

/**
 * Interface for a retriever that can retrieve documents based on a query
 */
export interface Retriever {
  /**
   * Retrieve documents based on a query
   * 
   * @param query The query to retrieve documents for
   * @param options Optional parameters for the retrieval
   * @returns The retrieved documents
   */
  retrieve(query: string, options?: any): Promise<Document[]>;
}

/**
 * Interface for a document
 */
export interface Document {
  /**
   * The content of the document
   */
  content: string;
  
  /**
   * Optional metadata for the document
   */
  metadata?: Record<string, any>;
}

/**
 * Options for RetrievalQAChain
 */
export interface RetrievalQAChainOptions {
  /**
   * The retriever to use for retrieving documents
   */
  retriever: Retriever;
  
  /**
   * The LLM to use for generating answers
   */
  llm: LLM;
  
  /**
   * Optional prompt template for the question
   * If not provided, a default template will be used
   * The template should include {question} and {context} variables
   */
  promptTemplate?: string;
  
  /**
   * Optional output parser to parse the LLM output
   */
  outputParser?: OutputParser;
  
  /**
   * Optional callback to call before retrieval
   */
  onRetrieval?: (query: string) => void;
  
  /**
   * Optional callback to call after retrieval with the retrieved documents
   */
  onDocumentsRetrieved?: (documents: Document[]) => void;
  
  /**
   * Optional callback to call before sending the prompt to the LLM
   */
  onPrompt?: (prompt: string) => void;
  
  /**
   * Optional callback to call after receiving the answer from the LLM
   */
  onAnswer?: (answer: string) => void;
  
  /**
   * Optional function to format the retrieved documents into a context string
   * If not provided, a default formatter will be used
   */
  documentFormatter?: (documents: Document[]) => string;
  
  /**
   * Optional maximum number of documents to retrieve
   * If not provided, all retrieved documents will be used
   */
  maxDocuments?: number;
  
  /**
   * Optional flag to include document sources in the answer
   * If true, the sources will be included in the answer
   */
  includeSources?: boolean;
}

/**
 * A chain that combines a retriever and an LLM to answer questions based on retrieved documents
 */
export class RetrievalQAChain implements Chain {
  private retriever: Retriever;
  private llm: LLM;
  private promptTemplate: string;
  private outputParser?: OutputParser;
  private onRetrieval?: (query: string) => void;
  private onDocumentsRetrieved?: (documents: Document[]) => void;
  private onPrompt?: (prompt: string) => void;
  private onAnswer?: (answer: string) => void;
  private documentFormatter: (documents: Document[]) => string;
  private maxDocuments?: number;
  private includeSources: boolean;
  
  /**
   * Create a new RetrievalQAChain
   * 
   * @param options Options for the chain
   */
  constructor(options: RetrievalQAChainOptions) {
    this.retriever = options.retriever;
    this.llm = options.llm;
    this.promptTemplate = options.promptTemplate || 
      "Answer the following question based on the provided context:\n\nContext:\n{context}\n\nQuestion: {question}\n\nAnswer:";
    this.outputParser = options.outputParser;
    this.onRetrieval = options.onRetrieval;
    this.onDocumentsRetrieved = options.onDocumentsRetrieved;
    this.onPrompt = options.onPrompt;
    this.onAnswer = options.onAnswer;
    this.documentFormatter = options.documentFormatter || this.defaultDocumentFormatter;
    this.maxDocuments = options.maxDocuments;
    this.includeSources = options.includeSources || false;
  }
  
  /**
   * Default formatter for documents
   * 
   * @param documents The documents to format
   * @returns A formatted string containing the document contents
   */
  private defaultDocumentFormatter(documents: Document[]): string {
    return documents.map((doc, index) => {
      const metadata = doc.metadata ? ` (${JSON.stringify(doc.metadata)})` : '';
      return `Document ${index + 1}${metadata}:\n${doc.content}`;
    }).join('\n\n');
  }
  
  /**
   * Format the prompt with the given question and context
   * 
   * @param question The question to answer
   * @param context The context to use for answering the question
   * @returns The formatted prompt
   */
  private formatPrompt(question: string, context: string): string {
    return this.promptTemplate
      .replace('{question}', question)
      .replace('{context}', context);
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the chain, must include a 'question' key
   * @param options Optional parameters for the chain
   * @returns The answer to the question
   */
  async run(input: Record<string, any>, options?: any): Promise<string> {
    // Extract the question from the input
    const question = input.question;
    if (!question) {
      throw new Error('Input must include a "question" key');
    }
    
    // Call the onRetrieval callback if provided
    if (this.onRetrieval) {
      this.onRetrieval(question);
    }
    
    // Retrieve documents
    let documents = await this.retriever.retrieve(question, options);
    
    // Limit the number of documents if maxDocuments is provided
    if (this.maxDocuments !== undefined && documents.length > this.maxDocuments) {
      documents = documents.slice(0, this.maxDocuments);
    }
    
    // Call the onDocumentsRetrieved callback if provided
    if (this.onDocumentsRetrieved) {
      this.onDocumentsRetrieved(documents);
    }
    
    // Format the documents into a context string
    const context = this.documentFormatter(documents);
    
    // Format the prompt
    const prompt = this.formatPrompt(question, context);
    
    // Call the onPrompt callback if provided
    if (this.onPrompt) {
      this.onPrompt(prompt);
    }
    
    // Run the LLM
    let answer = await this.llm.complete(prompt, options);
    
    // Call the onAnswer callback if provided
    if (this.onAnswer) {
      this.onAnswer(answer);
    }
    
    // Parse the output if a parser is provided
    if (this.outputParser) {
      answer = this.outputParser.parse(answer);
    }
    
    // Include sources if requested
    if (this.includeSources) {
      const sources = documents.map((doc, index) => {
        const metadata = doc.metadata ? ` (${JSON.stringify(doc.metadata)})` : '';
        return `Source ${index + 1}${metadata}`;
      }).join('\n');
      
      return `${answer}\n\nSources:\n${sources}`;
    }
    
    // Return the answer
    return answer;
  }
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the chain, must include a 'question' key
   * @param options Optional parameters for the chain
   * @returns The answer to the question with additional metadata
   */
  async call(input: Record<string, any>, options?: any): Promise<{
    answer: string;
    documents: Document[];
    prompt: string;
    rawAnswer: string;
  }> {
    // Extract the question from the input
    const question = input.question;
    if (!question) {
      throw new Error('Input must include a "question" key');
    }
    
    // Call the onRetrieval callback if provided
    if (this.onRetrieval) {
      this.onRetrieval(question);
    }
    
    // Retrieve documents
    let documents = await this.retriever.retrieve(question, options);
    
    // Limit the number of documents if maxDocuments is provided
    if (this.maxDocuments !== undefined && documents.length > this.maxDocuments) {
      documents = documents.slice(0, this.maxDocuments);
    }
    
    // Call the onDocumentsRetrieved callback if provided
    if (this.onDocumentsRetrieved) {
      this.onDocumentsRetrieved(documents);
    }
    
    // Format the documents into a context string
    const context = this.documentFormatter(documents);
    
    // Format the prompt
    const prompt = this.formatPrompt(question, context);
    
    // Call the onPrompt callback if provided
    if (this.onPrompt) {
      this.onPrompt(prompt);
    }
    
    // Run the LLM
    const rawAnswer = await this.llm.complete(prompt, options);
    
    // Call the onAnswer callback if provided
    if (this.onAnswer) {
      this.onAnswer(rawAnswer);
    }
    
    // Parse the output if a parser is provided
    let answer = this.outputParser ? this.outputParser.parse(rawAnswer) : rawAnswer;
    
    // Include sources if requested
    if (this.includeSources && typeof answer === 'string') {
      const sources = documents.map((doc, index) => {
        const metadata = doc.metadata ? ` (${JSON.stringify(doc.metadata)})` : '';
        return `Source ${index + 1}${metadata}`;
      }).join('\n');
      
      answer = `${answer}\n\nSources:\n${sources}`;
    }
    
    // Return the answer with additional metadata
    return {
      answer,
      documents,
      prompt,
      rawAnswer
    };
  }
}

/**
 * Factory for creating RetrievalQAChain instances
 */
export class RetrievalQAChainFactory {
  /**
   * Create a new RetrievalQAChain
   * 
   * @param options Options for the chain
   * @returns A new RetrievalQAChain instance
   */
  static create(options: RetrievalQAChainOptions): RetrievalQAChain {
    return new RetrievalQAChain(options);
  }
  
  /**
   * Create a new RetrievalQAChain with a simple configuration
   * 
   * @param retriever The retriever to use
   * @param llm The LLM to use
   * @param includeSources Whether to include sources in the answer
   * @returns A new RetrievalQAChain instance
   */
  static fromRetrieverAndLLM(
    retriever: Retriever,
    llm: LLM,
    includeSources: boolean = false
  ): RetrievalQAChain {
    return new RetrievalQAChain({
      retriever,
      llm,
      includeSources
    });
  }
}
