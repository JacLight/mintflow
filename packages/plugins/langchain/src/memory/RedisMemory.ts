import { ChatMessage } from '../agents/OpenAIFunctionsAgent.js';

/**
 * Interface for a Redis client
 */
export interface RedisClient {
  /**
   * Set a key-value pair in Redis
   * 
   * @param key The key
   * @param value The value
   * @param options Optional options
   * @returns A promise that resolves when the operation is complete
   */
  set(key: string, value: string, options?: any): Promise<any>;
  
  /**
   * Get a value from Redis
   * 
   * @param key The key
   * @returns A promise that resolves to the value, or null if the key doesn't exist
   */
  get(key: string): Promise<string | null>;
  
  /**
   * Delete a key from Redis
   * 
   * @param key The key
   * @returns A promise that resolves to the number of keys deleted
   */
  del(key: string): Promise<number>;
  
  /**
   * Get all keys matching a pattern
   * 
   * @param pattern The pattern
   * @returns A promise that resolves to an array of keys
   */
  keys(pattern: string): Promise<string[]>;
  
  /**
   * Set a key-value pair in Redis with an expiration time
   * 
   * @param key The key
   * @param seconds The expiration time in seconds
   * @param value The value
   * @returns A promise that resolves when the operation is complete
   */
  setex(key: string, seconds: number, value: string): Promise<any>;
}

/**
 * Options for RedisMemory
 */
export interface RedisMemoryOptions {
  /**
   * The Redis client to use
   */
  client: RedisClient;
  
  /**
   * The session ID to use for storing messages
   * This is used to separate messages from different sessions
   */
  sessionId: string;
  
  /**
   * Optional prefix for Redis keys
   */
  keyPrefix?: string;
  
  /**
   * Optional expiration time for messages in seconds
   * If provided, messages will be automatically deleted after this time
   */
  expirationSeconds?: number;
  
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
 * A memory system that stores conversation messages in Redis
 */
export class RedisMemory {
  private client: RedisClient;
  private sessionId: string;
  private keyPrefix: string;
  private expirationSeconds?: number;
  private onMessageAdded?: (message: ChatMessage) => void;
  private onMessagesRetrieved?: (messages: ChatMessage[]) => void;
  private onClear?: () => void;
  private humanPrefix: string;
  private aiPrefix: string;
  private systemPrefix: string;
  private inputKey: string;
  private outputKey: string;
  
  /**
   * Create a new RedisMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: RedisMemoryOptions) {
    this.client = options.client;
    this.sessionId = options.sessionId;
    this.keyPrefix = options.keyPrefix || 'langchain:memory:';
    this.expirationSeconds = options.expirationSeconds;
    this.onMessageAdded = options.onMessageAdded;
    this.onMessagesRetrieved = options.onMessagesRetrieved;
    this.onClear = options.onClear;
    this.humanPrefix = options.humanPrefix || 'Human';
    this.aiPrefix = options.aiPrefix || 'AI';
    this.systemPrefix = options.systemPrefix || 'System';
    this.inputKey = options.inputKey || 'input';
    this.outputKey = options.outputKey || 'output';
    
    // Add initial messages if provided
    if (options.initialMessages && options.initialMessages.length > 0) {
      this.addMessages(options.initialMessages).catch(error => {
        console.error('Error adding initial messages to Redis:', error);
      });
    }
  }
  
  /**
   * Get the Redis key for a message
   * 
   * @param index The index of the message
   * @returns The Redis key
   */
  private getMessageKey(index: number): string {
    return `${this.keyPrefix}${this.sessionId}:message:${index}`;
  }
  
  /**
   * Get the Redis key for the message count
   * 
   * @returns The Redis key
   */
  private getMessageCountKey(): string {
    return `${this.keyPrefix}${this.sessionId}:message_count`;
  }
  
  /**
   * Add a message to the memory
   * 
   * @param message The message to add
   * @returns A promise that resolves when the operation is complete
   */
  async addMessage(message: ChatMessage): Promise<void> {
    // Get the current message count
    const countKey = this.getMessageCountKey();
    const countStr = await this.client.get(countKey);
    const count = countStr ? parseInt(countStr, 10) : 0;
    
    // Add the message
    const messageKey = this.getMessageKey(count);
    const messageJson = JSON.stringify(message);
    
    if (this.expirationSeconds) {
      // Set with expiration
      await this.client.setex(messageKey, this.expirationSeconds, messageJson);
      await this.client.setex(countKey, this.expirationSeconds, (count + 1).toString());
    } else {
      // Set without expiration
      await this.client.set(messageKey, messageJson);
      await this.client.set(countKey, (count + 1).toString());
    }
    
    // Call the onMessageAdded callback if provided
    if (this.onMessageAdded) {
      this.onMessageAdded(message);
    }
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
    // Get the current message count
    const countKey = this.getMessageCountKey();
    const countStr = await this.client.get(countKey);
    
    if (!countStr) {
      return [];
    }
    
    const count = parseInt(countStr, 10);
    const messages: ChatMessage[] = [];
    
    // Get all messages
    for (let i = 0; i < count; i++) {
      const messageKey = this.getMessageKey(i);
      const messageJson = await this.client.get(messageKey);
      
      if (messageJson) {
        try {
          const message = JSON.parse(messageJson) as ChatMessage;
          messages.push(message);
        } catch (error) {
          console.error(`Error parsing message from Redis: ${error}`);
        }
      }
    }
    
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
    // Get all keys for this session
    const keys = await this.client.keys(`${this.keyPrefix}${this.sessionId}:*`);
    
    // Delete all keys
    for (const key of keys) {
      await this.client.del(key);
    }
    
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
 * Factory for creating RedisMemory instances
 */
export class RedisMemoryFactory {
  /**
   * Create a new RedisMemory
   * 
   * @param options Options for the memory
   * @returns A new RedisMemory instance
   */
  static create(options: RedisMemoryOptions): RedisMemory {
    return new RedisMemory(options);
  }
  
  /**
   * Create a new RedisMemory with a specific expiration time
   * 
   * @param client The Redis client to use
   * @param sessionId The session ID to use for storing messages
   * @param expirationSeconds The expiration time for messages in seconds
   * @returns A new RedisMemory instance with a specific expiration time
   */
  static withExpiration(
    client: RedisClient,
    sessionId: string,
    expirationSeconds: number
  ): RedisMemory {
    return new RedisMemory({
      client,
      sessionId,
      expirationSeconds
    });
  }
}
