import { Chain } from './SequentialChain.js';
import { LLM } from './LLMChain.js';
import { OutputParser } from '../parsers/index.js';
import { Document, Retriever } from './RetrievalQAChain.js';

/**
 * Interface for a message in a conversation
 */
export interface Message {
  /**
   * The role of the message sender (e.g., 'user', 'assistant', 'system')
   */
  role: string;
  
  /**
   * The content of the message
   */
  content: string;
}

/**
 * Options for ConversationalRetrievalChain
 */
export interface ConversationalRetrievalChainOptions {
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
   * The template should include {question}, {context}, and {chat_history} variables
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
   * Optional function to format the chat history into a string
   * If not provided, a default formatter will be used
   */
  historyFormatter?: (history: Message[]) => string;
  
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
  
  /**
   * Optional maximum number of messages to include in the chat history
   * If not provided, all messages will be included
   */
  maxHistoryMessages?: number;
  
  /**
   * Optional system message to prepend to the chat history
   * If provided, this message will be added as a system message at the beginning of the history
   */
  systemMessage?: string;
  
  /**
   * Optional flag to use a standalone question generation step
   * If true, the chain will first generate a standalone question based on the chat history
   * before retrieving documents
   */
  useStandaloneQuestionGeneration?: boolean;
  
  /**
   * Optional prompt template for generating standalone questions
   * Only used if useStandaloneQuestionGeneration is true
   * The template should include {question} and {chat_history} variables
   */
  questionGenerationPromptTemplate?: string;
}

/**
 * A chain that combines a retriever and an LLM to answer questions based on retrieved documents,
 * while maintaining conversation history
 */
export class ConversationalRetrievalChain implements Chain {
  private retriever: Retriever;
  private llm: LLM;
  private promptTemplate: string;
  private outputParser?: OutputParser;
  private onRetrieval?: (query: string) => void;
  private onDocumentsRetrieved?: (documents: Document[]) => void;
  private onPrompt?: (prompt: string) => void;
  private onAnswer?: (answer: string) => void;
  private documentFormatter: (documents: Document[]) => string;
  private historyFormatter: (history: Message[]) => string;
  private maxDocuments?: number;
  private includeSources: boolean;
  private maxHistoryMessages?: number;
  private systemMessage?: string;
  private useStandaloneQuestionGeneration: boolean;
  private questionGenerationPromptTemplate: string;
  
  /**
   * Create a new ConversationalRetrievalChain
   * 
   * @param options Options for the chain
   */
  constructor(options: ConversationalRetrievalChainOptions) {
    this.retriever = options.retriever;
    this.llm = options.llm;
    this.promptTemplate = options.promptTemplate || 
      "Answer the following question based on the provided context and chat history:\n\nContext:\n{context}\n\nChat History:\n{chat_history}\n\nQuestion: {question}\n\nAnswer:";
    this.outputParser = options.outputParser;
    this.onRetrieval = options.onRetrieval;
    this.onDocumentsRetrieved = options.onDocumentsRetrieved;
    this.onPrompt = options.onPrompt;
    this.onAnswer = options.onAnswer;
    this.documentFormatter = options.documentFormatter || this.defaultDocumentFormatter;
    this.historyFormatter = options.historyFormatter || this.defaultHistoryFormatter;
    this.maxDocuments = options.maxDocuments;
    this.includeSources = options.includeSources || false;
    this.maxHistoryMessages = options.maxHistoryMessages;
    this.systemMessage = options.systemMessage;
    this.useStandaloneQuestionGeneration = options.useStandaloneQuestionGeneration || false;
    this.questionGenerationPromptTemplate = options.questionGenerationPromptTemplate || 
      "Given the following conversation and a follow-up question, rephrase the follow-up question to be a standalone question that captures all relevant context from the conversation.\n\nChat History:\n{chat_history}\n\nFollow-up Question: {question}\n\nStandalone Question:";
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
   * Default formatter for chat history
   * 
   * @param history The chat history to format
   * @returns A formatted string containing the chat history
   */
  private defaultHistoryFormatter(history: Message[]): string {
    return history.map(message => {
      return `${message.role}: ${message.content}`;
    }).join('\n');
  }
  
  /**
   * Format the prompt with the given question, context, and chat history
   * 
   * @param question The question to answer
   * @param context The context to use for answering the question
   * @param chatHistory The chat history
   * @returns The formatted prompt
   */
  private formatPrompt(question: string, context: string, chatHistory: string): string {
    return this.promptTemplate
      .replace('{question}', question)
      .replace('{context}', context)
      .replace('{chat_history}', chatHistory);
  }
  
  /**
   * Generate a standalone question based on the chat history and the current question
   * 
   * @param question The current question
   * @param history The chat history
   * @returns A standalone question that captures the context from the chat history
   */
  private async generateStandaloneQuestion(question: string, history: Message[]): Promise<string> {
    // Format the chat history
    const chatHistory = this.historyFormatter(history);
    
    // Format the prompt
    const prompt = this.questionGenerationPromptTemplate
      .replace('{question}', question)
      .replace('{chat_history}', chatHistory);
    
    // Run the LLM
    const standaloneQuestion = await this.llm.complete(prompt);
    
    // Return the standalone question
    return standaloneQuestion.trim();
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the chain, must include 'question' and 'history' keys
   * @param options Optional parameters for the chain
   * @returns The answer to the question
   */
  async run(input: Record<string, any>, options?: any): Promise<string> {
    // Extract the question and history from the input
    const question = input.question;
    if (!question) {
      throw new Error('Input must include a "question" key');
    }
    
    let history: Message[] = input.history || [];
    if (!Array.isArray(history)) {
      throw new Error('Input "history" must be an array of messages');
    }
    
    // Add system message if provided
    if (this.systemMessage && history.length === 0) {
      history = [{ role: 'system', content: this.systemMessage }, ...history];
    }
    
    // Limit the number of messages in the history if maxHistoryMessages is provided
    if (this.maxHistoryMessages !== undefined && history.length > this.maxHistoryMessages) {
      history = history.slice(history.length - this.maxHistoryMessages);
    }
    
    // Generate a standalone question if enabled
    let queryQuestion = question;
    if (this.useStandaloneQuestionGeneration && history.length > 0) {
      queryQuestion = await this.generateStandaloneQuestion(question, history);
    }
    
    // Call the onRetrieval callback if provided
    if (this.onRetrieval) {
      this.onRetrieval(queryQuestion);
    }
    
    // Retrieve documents
    let documents = await this.retriever.retrieve(queryQuestion, options);
    
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
    
    // Format the chat history
    const chatHistory = this.historyFormatter(history);
    
    // Format the prompt
    const prompt = this.formatPrompt(question, context, chatHistory);
    
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
   * @param input Input values for the chain, must include 'question' and 'history' keys
   * @param options Optional parameters for the chain
   * @returns The answer to the question with additional metadata
   */
  async call(input: Record<string, any>, options?: any): Promise<{
    answer: string;
    documents: Document[];
    prompt: string;
    rawAnswer: string;
    standaloneQuestion?: string;
  }> {
    // Extract the question and history from the input
    const question = input.question;
    if (!question) {
      throw new Error('Input must include a "question" key');
    }
    
    let history: Message[] = input.history || [];
    if (!Array.isArray(history)) {
      throw new Error('Input "history" must be an array of messages');
    }
    
    // Add system message if provided
    if (this.systemMessage && history.length === 0) {
      history = [{ role: 'system', content: this.systemMessage }, ...history];
    }
    
    // Limit the number of messages in the history if maxHistoryMessages is provided
    if (this.maxHistoryMessages !== undefined && history.length > this.maxHistoryMessages) {
      history = history.slice(history.length - this.maxHistoryMessages);
    }
    
    // Generate a standalone question if enabled
    let queryQuestion = question;
    let standaloneQuestion: string | undefined;
    if (this.useStandaloneQuestionGeneration && history.length > 0) {
      standaloneQuestion = await this.generateStandaloneQuestion(question, history);
      queryQuestion = standaloneQuestion;
    }
    
    // Call the onRetrieval callback if provided
    if (this.onRetrieval) {
      this.onRetrieval(queryQuestion);
    }
    
    // Retrieve documents
    let documents = await this.retriever.retrieve(queryQuestion, options);
    
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
    
    // Format the chat history
    const chatHistory = this.historyFormatter(history);
    
    // Format the prompt
    const prompt = this.formatPrompt(question, context, chatHistory);
    
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
      rawAnswer,
      standaloneQuestion
    };
  }
}

/**
 * Factory for creating ConversationalRetrievalChain instances
 */
export class ConversationalRetrievalChainFactory {
  /**
   * Create a new ConversationalRetrievalChain
   * 
   * @param options Options for the chain
   * @returns A new ConversationalRetrievalChain instance
   */
  static create(options: ConversationalRetrievalChainOptions): ConversationalRetrievalChain {
    return new ConversationalRetrievalChain(options);
  }
  
  /**
   * Create a new ConversationalRetrievalChain with a simple configuration
   * 
   * @param retriever The retriever to use
   * @param llm The LLM to use
   * @param systemMessage Optional system message to prepend to the chat history
   * @param includeSources Whether to include sources in the answer
   * @returns A new ConversationalRetrievalChain instance
   */
  static fromRetrieverAndLLM(
    retriever: Retriever,
    llm: LLM,
    systemMessage?: string,
    includeSources: boolean = false
  ): ConversationalRetrievalChain {
    return new ConversationalRetrievalChain({
      retriever,
      llm,
      systemMessage,
      includeSources,
      useStandaloneQuestionGeneration: true
    });
  }
}
