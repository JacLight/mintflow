import { ChatMessage } from '../agents/OpenAIFunctionsAgent.js';
import { Document } from '../adapters/RAGPlugin.js';

/**
 * Interface for a vector store
 */
export interface VectorStore {
  /**
   * Add documents to the vector store
   * 
   * @param documents The documents to add
   * @returns The IDs of the added documents
   */
  addDocuments(documents: Document[]): Promise<string[]>;
  
  /**
   * Search for similar documents
   * 
   * @param query The query to search for
   * @param k The number of results to return
   * @returns The similar documents
   */
  similaritySearch(query: string, k?: number): Promise<Document[]>;
  
  /**
   * Delete documents from the vector store
   * 
   * @param ids The IDs of the documents to delete
   * @returns Whether the documents were deleted
   */
  delete(ids: string[]): Promise<boolean>;
}

/**
 * Options for VectorStoreMemory
 */
export interface VectorStoreMemoryOptions {
  /**
   * The vector store to use
   */
  vectorStore: VectorStore;
  
  /**
   * Optional initial messages
   */
  initialMessages?: ChatMessage[];
  
  /**
   * Optional maximum number of messages to store
   * If the memory exceeds this limit, the oldest messages will be removed
   */
  maxMessages?: number;
  
  /**
   * Optional callback to call when a message is added
   */
  onMessageAdded?: (message: ChatMessage) => void;
  
  /**
   * Optional callback to call when messages are retrieved
   */
  onMessagesRetrieved?: (messages: ChatMessage[]) => void;
  
  /**
   * Optional callback to call when the memory is cleared
   */
  onClear?: () => void;
  
  /**
   * Optional human prefix for formatting
   */
  humanPrefix?: string;
  
  /**
   * Optional AI prefix for formatting
   */
  aiPrefix?: string;
  
  /**
   * Optional system prefix for formatting
   */
  systemPrefix?: string;
  
  /**
   * Optional input key for extracting human messages
   */
  inputKey?: string;
  
  /**
   * Optional output key for extracting AI messages
   */
  outputKey?: string;
  
  /**
   * Optional number of relevant messages to retrieve
   */
  k?: number;
  
  /**
   * Optional flag to include metadata in the documents
   */
  includeMetadata?: boolean;
}

/**
 * A memory system that stores conversation messages in a vector store for semantic retrieval
 */
export class VectorStoreMemory {
  private vectorStore: VectorStore;
  private messages: ChatMessage[];
  private maxMessages: number;
  private onMessageAdded?: (message: ChatMessage) => void;
  private onMessagesRetrieved?: (messages: ChatMessage[]) => void;
  private onClear?: () => void;
  private humanPrefix: string;
  private aiPrefix: string;
  private systemPrefix: string;
  private inputKey: string;
  private outputKey: string;
  private k: number;
  private includeMetadata: boolean;
  private documentIds: Map<string, string>;
  
  /**
   * Create a new VectorStoreMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: VectorStoreMemoryOptions) {
    this.vectorStore = options.vectorStore;
    this.messages = [...(options.initialMessages || [])];
    this.maxMessages = options.maxMessages || Infinity;
    this.onMessageAdded = options.onMessageAdded;
    this.onMessagesRetrieved = options.onMessagesRetrieved;
    this.onClear = options.onClear;
    this.humanPrefix = options.humanPrefix || 'Human';
    this.aiPrefix = options.aiPrefix || 'AI';
    this.systemPrefix = options.systemPrefix || 'System';
    this.inputKey = options.inputKey || 'input';
    this.outputKey = options.outputKey || 'output';
    this.k = options.k || 4;
    this.includeMetadata = options.includeMetadata || true;
    this.documentIds = new Map();
    
    // Add initial messages to the vector store
    if (options.initialMessages && options.initialMessages.length > 0) {
      this.addMessagesToVectorStore(options.initialMessages).catch(error => {
        console.error('Error adding initial messages to vector store:', error);
      });
    }
    
    // Trim messages if they exceed the maximum
    this.trimMessages();
  }
  
  /**
   * Add a message to the memory
   * 
   * @param message The message to add
   * @returns The added message
   */
  async addMessage(message: ChatMessage): Promise<ChatMessage> {
    // Add the message to the messages array
    this.messages.push(message);
    
    // Call the onMessageAdded callback if provided
    if (this.onMessageAdded) {
      this.onMessageAdded(message);
    }
    
    // Add the message to the vector store
    await this.addMessagesToVectorStore([message]);
    
    // Trim messages if they exceed the maximum
    this.trimMessages();
    
    return message;
  }
  
  /**
   * Add a human message to the memory
   * 
   * @param text The text of the message
   * @returns The added message
   */
  async addHumanMessage(text: string): Promise<ChatMessage> {
    return await this.addMessage({
      role: 'user',
      content: text
    });
  }
  
  /**
   * Add an AI message to the memory
   * 
   * @param text The text of the message
   * @returns The added message
   */
  async addAIMessage(text: string): Promise<ChatMessage> {
    return await this.addMessage({
      role: 'assistant',
      content: text
    });
  }
  
  /**
   * Add a system message to the memory
   * 
   * @param text The text of the message
   * @returns The added message
   */
  async addSystemMessage(text: string): Promise<ChatMessage> {
    return await this.addMessage({
      role: 'system',
      content: text
    });
  }
  
  /**
   * Get all messages from the memory
   * 
   * @returns An array of all messages
   */
  getMessages(): ChatMessage[] {
    // Call the onMessagesRetrieved callback if provided
    if (this.onMessagesRetrieved) {
      this.onMessagesRetrieved(this.messages);
    }
    
    return [...this.messages];
  }
  
  /**
   * Clear all messages from the memory
   */
  async clear(): Promise<void> {
    // Delete all documents from the vector store
    if (this.documentIds.size > 0) {
      await this.vectorStore.delete(Array.from(this.documentIds.values()));
    }
    
    // Clear the messages and document IDs
    this.messages = [];
    this.documentIds.clear();
    
    // Call the onClear callback if provided
    if (this.onClear) {
      this.onClear();
    }
  }
  
  /**
   * Get the number of messages in the memory
   * 
   * @returns The number of messages
   */
  size(): number {
    return this.messages.length;
  }
  
  /**
   * Get the conversation history as a formatted string
   * 
   * @returns The conversation history
   */
  getConversationString(): string {
    return this.messages.map(message => {
      let prefix = '';
      
      switch (message.role) {
        case 'user':
          prefix = this.humanPrefix;
          break;
        case 'assistant':
          prefix = this.aiPrefix;
          break;
        case 'system':
          prefix = this.systemPrefix;
          break;
        default:
          prefix = message.role;
      }
      
      return `${prefix}: ${message.content}`;
    }).join('\n');
  }
  
  /**
   * Get relevant messages for a query
   * 
   * @param query The query to search for
   * @param k The number of results to return
   * @returns The relevant messages
   */
  async getRelevantMessages(query: string, k?: number): Promise<ChatMessage[]> {
    // Search for similar documents
    const documents = await this.vectorStore.similaritySearch(query, k || this.k);
    
    // Extract the messages from the documents
    const messages: ChatMessage[] = [];
    
    for (const document of documents) {
      try {
        const message = JSON.parse(document.text) as ChatMessage;
        messages.push(message);
      } catch (error) {
        console.error('Error parsing message from document:', error);
      }
    }
    
    return messages;
  }
  
  /**
   * Load memory variables from an input
   * 
   * @param input The input to load from
   * @returns The memory variables
   */
  async loadMemoryVariables(input: Record<string, any> = {}): Promise<Record<string, any>> {
    // Get the query from the input
    const query = input[this.inputKey] || '';
    
    // Get relevant messages for the query
    const relevantMessages = await this.getRelevantMessages(query);
    
    // Format the relevant messages
    const relevantHistory = relevantMessages.map(message => {
      let prefix = '';
      
      switch (message.role) {
        case 'user':
          prefix = this.humanPrefix;
          break;
        case 'assistant':
          prefix = this.aiPrefix;
          break;
        case 'system':
          prefix = this.systemPrefix;
          break;
        default:
          prefix = message.role;
      }
      
      return `${prefix}: ${message.content}`;
    }).join('\n');
    
    // Call the onMessagesRetrieved callback if provided
    if (this.onMessagesRetrieved) {
      this.onMessagesRetrieved(relevantMessages);
    }
    
    return {
      history: relevantHistory,
      messages: relevantMessages
    };
  }
  
  /**
   * Save context from an input/output pair
   * 
   * @param input The input
   * @param output The output
   */
  async saveContext(input: Record<string, any>, output: Record<string, any>): Promise<void> {
    // Extract the input and output text
    const inputText = input[this.inputKey];
    const outputText = output[this.outputKey];
    
    // Add the messages
    if (inputText) {
      await this.addHumanMessage(inputText);
    }
    
    if (outputText) {
      await this.addAIMessage(outputText);
    }
  }
  
  /**
   * Add messages to the vector store
   * 
   * @param messages The messages to add
   */
  private async addMessagesToVectorStore(messages: ChatMessage[]): Promise<void> {
    // Convert messages to documents
    const documents: Document[] = messages.map((message, index) => {
      const id = `${Date.now()}-${index}`;
      const metadata: Record<string, any> = {
        role: message.role,
        timestamp: Date.now()
      };
      
      if (this.includeMetadata && message.name) {
        metadata.name = message.name;
      }
      
      return {
        id,
        text: JSON.stringify(message),
        metadata
      };
    });
    
    // Add documents to the vector store
    const ids = await this.vectorStore.addDocuments(documents);
    
    // Store the document IDs
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const id = ids[i];
      
      // Generate a unique key for the message
      const key = `${message.role}-${message.content}-${Date.now()}-${i}`;
      
      this.documentIds.set(key, id);
    }
  }
  
  /**
   * Trim messages if they exceed the maximum
   */
  private trimMessages(): void {
    if (this.messages.length > this.maxMessages) {
      // Get the messages to remove
      const messagesToRemove = this.messages.slice(0, this.messages.length - this.maxMessages);
      
      // Remove the messages from the messages array
      this.messages = this.messages.slice(this.messages.length - this.maxMessages);
      
      // Remove the messages from the vector store
      this.removeMessagesFromVectorStore(messagesToRemove).catch(error => {
        console.error('Error removing messages from vector store:', error);
      });
    }
  }
  
  /**
   * Remove messages from the vector store
   * 
   * @param messages The messages to remove
   */
  private async removeMessagesFromVectorStore(messages: ChatMessage[]): Promise<void> {
    // Get the document IDs to remove
    const idsToRemove: string[] = [];
    
    for (const message of messages) {
      // Find the document ID for the message
      for (const [key, id] of this.documentIds.entries()) {
        if (key.includes(`${message.role}-${message.content}`)) {
          idsToRemove.push(id);
          this.documentIds.delete(key);
          break;
        }
      }
    }
    
    // Remove the documents from the vector store
    if (idsToRemove.length > 0) {
      await this.vectorStore.delete(idsToRemove);
    }
  }
  
  /**
   * Convert the memory to a JSON object
   * 
   * @returns A JSON object representing the memory
   */
  toJSON(): Record<string, any> {
    return {
      messages: this.messages,
      maxMessages: this.maxMessages,
      humanPrefix: this.humanPrefix,
      aiPrefix: this.aiPrefix,
      systemPrefix: this.systemPrefix,
      inputKey: this.inputKey,
      outputKey: this.outputKey,
      k: this.k,
      includeMetadata: this.includeMetadata
    };
  }
}

/**
 * Factory for creating VectorStoreMemory instances
 */
export class VectorStoreMemoryFactory {
  /**
   * Create a new VectorStoreMemory
   * 
   * @param options Options for the memory
   * @returns A new VectorStoreMemory instance
   */
  static create(options: VectorStoreMemoryOptions): VectorStoreMemory {
    return new VectorStoreMemory(options);
  }
  
  /**
   * Create a new VectorStoreMemory with a specific number of results
   * 
   * @param vectorStore The vector store to use
   * @param k The number of results to return
   * @returns A new VectorStoreMemory instance with a specific number of results
   */
  static withK(vectorStore: VectorStore, k: number): VectorStoreMemory {
    return new VectorStoreMemory({
      vectorStore,
      k
    });
  }
}
