import { ChatMessage } from '../agents/OpenAIFunctionsAgent.js';

/**
 * Interface for a MongoDB collection
 */
export interface MongoCollection {
  /**
   * Insert a document into the collection
   * 
   * @param document The document to insert
   * @returns A promise that resolves when the operation is complete
   */
  insertOne(document: any): Promise<any>;
  
  /**
   * Find documents in the collection
   * 
   * @param filter The filter to apply
   * @param options Optional options
   * @returns A promise that resolves to a cursor for the matching documents
   */
  find(filter: any, options?: any): {
    toArray(): Promise<any[]>;
    sort(sort: any): any;
  };
  
  /**
   * Delete documents from the collection
   * 
   * @param filter The filter to apply
   * @returns A promise that resolves when the operation is complete
   */
  deleteMany(filter: any): Promise<any>;
  
  /**
   * Count documents in the collection
   * 
   * @param filter The filter to apply
   * @returns A promise that resolves to the number of matching documents
   */
  countDocuments(filter: any): Promise<number>;
  
  /**
   * Create an index on the collection
   * 
   * @param spec The index specification
   * @param options Optional options
   * @returns A promise that resolves when the operation is complete
   */
  createIndex(spec: any, options?: any): Promise<string>;
}

/**
 * Options for MongoDBMemory
 */
export interface MongoDBMemoryOptions {
  /**
   * The MongoDB collection to use
   */
  collection: MongoCollection;
  
  /**
   * The session ID to use for storing messages
   * This is used to separate messages from different sessions
   */
  sessionId: string;
  
  /**
   * Optional time-to-live in seconds for messages
   * If provided, messages will be automatically deleted after this time
   */
  ttlSeconds?: number;
  
  /**
   * Optional initial messages
   */
  initialMessages?: ChatMessage[];
  
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
}

/**
 * A memory system that stores conversation messages in MongoDB
 */
export class MongoDBMemory {
  private collection: MongoCollection;
  private sessionId: string;
  private ttlSeconds?: number;
  private onMessageAdded?: (message: ChatMessage) => void;
  private onMessagesRetrieved?: (messages: ChatMessage[]) => void;
  private onClear?: () => void;
  private humanPrefix: string;
  private aiPrefix: string;
  private systemPrefix: string;
  private inputKey: string;
  private outputKey: string;
  
  /**
   * Create a new MongoDBMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: MongoDBMemoryOptions) {
    this.collection = options.collection;
    this.sessionId = options.sessionId;
    this.ttlSeconds = options.ttlSeconds;
    this.onMessageAdded = options.onMessageAdded;
    this.onMessagesRetrieved = options.onMessagesRetrieved;
    this.onClear = options.onClear;
    this.humanPrefix = options.humanPrefix || 'Human';
    this.aiPrefix = options.aiPrefix || 'AI';
    this.systemPrefix = options.systemPrefix || 'System';
    this.inputKey = options.inputKey || 'input';
    this.outputKey = options.outputKey || 'output';
    
    // Create TTL index if TTL is provided
    if (this.ttlSeconds) {
      this.createTTLIndex().catch(error => {
        console.error('Error creating TTL index:', error);
      });
    }
    
    // Add initial messages if provided
    if (options.initialMessages && options.initialMessages.length > 0) {
      this.addMessages(options.initialMessages).catch(error => {
        console.error('Error adding initial messages to MongoDB:', error);
      });
    }
  }
  
  /**
   * Create a TTL index on the collection
   * 
   * @returns A promise that resolves when the operation is complete
   */
  private async createTTLIndex(): Promise<void> {
    await this.collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: this.ttlSeconds }
    );
  }
  
  /**
   * Add a message to the memory
   * 
   * @param message The message to add
   * @returns A promise that resolves when the operation is complete
   */
  async addMessage(message: ChatMessage): Promise<void> {
    // Create the document
    const document = {
      sessionId: this.sessionId,
      message,
      createdAt: new Date(),
      index: await this.getNextIndex()
    };
    
    // Insert the document
    await this.collection.insertOne(document);
    
    // Call the onMessageAdded callback if provided
    if (this.onMessageAdded) {
      this.onMessageAdded(message);
    }
  }
  
  /**
   * Get the next index for a message
   * 
   * @returns A promise that resolves to the next index
   */
  private async getNextIndex(): Promise<number> {
    // Count the number of messages for this session
    return await this.collection.countDocuments({ sessionId: this.sessionId });
  }
  
  /**
   * Add multiple messages to the memory
   * 
   * @param messages The messages to add
   * @returns A promise that resolves when the operation is complete
   */
  async addMessages(messages: ChatMessage[]): Promise<void> {
    for (const message of messages) {
      await this.addMessage(message);
    }
  }
  
  /**
   * Add a human message to the memory
   * 
   * @param text The text of the message
   * @returns A promise that resolves when the operation is complete
   */
  async addHumanMessage(text: string): Promise<void> {
    await this.addMessage({
      role: 'user',
      content: text
    });
  }
  
  /**
   * Add an AI message to the memory
   * 
   * @param text The text of the message
   * @returns A promise that resolves when the operation is complete
   */
  async addAIMessage(text: string): Promise<void> {
    await this.addMessage({
      role: 'assistant',
      content: text
    });
  }
  
  /**
   * Add a system message to the memory
   * 
   * @param text The text of the message
   * @returns A promise that resolves when the operation is complete
   */
  async addSystemMessage(text: string): Promise<void> {
    await this.addMessage({
      role: 'system',
      content: text
    });
  }
  
  /**
   * Get all messages from the memory
   * 
   * @returns A promise that resolves to an array of all messages
   */
  async getMessages(): Promise<ChatMessage[]> {
    // Find all documents for this session
    const documents = await this.collection
      .find({ sessionId: this.sessionId })
      .sort({ index: 1 })
      .toArray();
    
    // Extract the messages
    const messages = documents.map(doc => doc.message);
    
    // Call the onMessagesRetrieved callback if provided
    if (this.onMessagesRetrieved) {
      this.onMessagesRetrieved(messages);
    }
    
    return messages;
  }
  
  /**
   * Clear all messages from the memory
   * 
   * @returns A promise that resolves when the operation is complete
   */
  async clear(): Promise<void> {
    // Delete all documents for this session
    await this.collection.deleteMany({ sessionId: this.sessionId });
    
    // Call the onClear callback if provided
    if (this.onClear) {
      this.onClear();
    }
  }
  
  /**
   * Get the conversation history as a formatted string
   * 
   * @returns A promise that resolves to the conversation history
   */
  async getConversationString(): Promise<string> {
    const messages = await this.getMessages();
    
    return messages.map(message => {
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
   * Load memory variables from an input
   * 
   * @param input The input to load from
   * @returns A promise that resolves to the memory variables
   */
  async loadMemoryVariables(input: Record<string, any> = {}): Promise<Record<string, any>> {
    const messages = await this.getMessages();
    const history = await this.getConversationString();
    
    return {
      history,
      messages
    };
  }
  
  /**
   * Save context from an input/output pair
   * 
   * @param input The input
   * @param output The output
   * @returns A promise that resolves when the operation is complete
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
}

/**
 * Factory for creating MongoDBMemory instances
 */
export class MongoDBMemoryFactory {
  /**
   * Create a new MongoDBMemory
   * 
   * @param options Options for the memory
   * @returns A new MongoDBMemory instance
   */
  static create(options: MongoDBMemoryOptions): MongoDBMemory {
    return new MongoDBMemory(options);
  }
  
  /**
   * Create a new MongoDBMemory with a specific TTL
   * 
   * @param collection The MongoDB collection to use
   * @param sessionId The session ID to use for storing messages
   * @param ttlSeconds The time-to-live in seconds for messages
   * @returns A new MongoDBMemory instance with a specific TTL
   */
  static withTTL(
    collection: MongoCollection,
    sessionId: string,
    ttlSeconds: number
  ): MongoDBMemory {
    return new MongoDBMemory({
      collection,
      sessionId,
      ttlSeconds
    });
  }
}
