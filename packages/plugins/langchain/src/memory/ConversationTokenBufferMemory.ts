import { ChatMessage } from '../agents/OpenAIFunctionsAgent.js';

/**
 * Options for ConversationTokenBufferMemory
 */
export interface ConversationTokenBufferMemoryOptions {
  /**
   * Optional initial messages
   */
  initialMessages?: ChatMessage[];
  
  /**
   * Optional maximum number of tokens to store
   * If the memory exceeds this limit, the oldest messages will be removed
   */
  maxTokens?: number;
  
  /**
   * Optional token counter function
   * If not provided, a simple approximation will be used
   */
  tokenCounter?: (text: string) => number;
  
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
 * A memory system that stores conversation messages up to a token limit
 */
export class ConversationTokenBufferMemory {
  private messages: ChatMessage[];
  private maxTokens: number;
  private tokenCounter: (text: string) => number;
  private onMessageAdded?: (message: ChatMessage) => void;
  private onMessagesRetrieved?: (messages: ChatMessage[]) => void;
  private onClear?: () => void;
  private humanPrefix: string;
  private aiPrefix: string;
  private systemPrefix: string;
  private inputKey: string;
  private outputKey: string;
  private currentTokenCount: number;
  
  /**
   * Create a new ConversationTokenBufferMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: ConversationTokenBufferMemoryOptions = {}) {
    this.messages = [...(options.initialMessages || [])];
    this.maxTokens = options.maxTokens || 2000;
    this.tokenCounter = options.tokenCounter || this.defaultTokenCounter;
    this.onMessageAdded = options.onMessageAdded;
    this.onMessagesRetrieved = options.onMessagesRetrieved;
    this.onClear = options.onClear;
    this.humanPrefix = options.humanPrefix || 'Human';
    this.aiPrefix = options.aiPrefix || 'AI';
    this.systemPrefix = options.systemPrefix || 'System';
    this.inputKey = options.inputKey || 'input';
    this.outputKey = options.outputKey || 'output';
    
    // Calculate the initial token count
    this.currentTokenCount = this.calculateTokenCount(this.messages);
    
    // Trim messages if they exceed the token limit
    this.trimMessages();
  }
  
  /**
   * Default token counter that approximates token count
   * 
   * @param text The text to count tokens for
   * @returns The approximate token count
   */
  private defaultTokenCounter(text: string): number {
    // A very simple approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Calculate the token count for a list of messages
   * 
   * @param messages The messages to calculate token count for
   * @returns The token count
   */
  private calculateTokenCount(messages: ChatMessage[]): number {
    return messages.reduce((count, message) => {
      return count + this.tokenCounter(message.content);
    }, 0);
  }
  
  /**
   * Add a message to the memory
   * 
   * @param message The message to add
   * @returns The added message
   */
  addMessage(message: ChatMessage): ChatMessage {
    // Calculate the token count for the message
    const messageTokens = this.tokenCounter(message.content);
    
    // Add the message
    this.messages.push(message);
    
    // Update the token count
    this.currentTokenCount += messageTokens;
    
    // Call the onMessageAdded callback if provided
    if (this.onMessageAdded) {
      this.onMessageAdded(message);
    }
    
    // Trim messages if they exceed the token limit
    this.trimMessages();
    
    return message;
  }
  
  /**
   * Add a human message to the memory
   * 
   * @param text The text of the message
   * @returns The added message
   */
  addHumanMessage(text: string): ChatMessage {
    return this.addMessage({
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
  addAIMessage(text: string): ChatMessage {
    return this.addMessage({
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
  addSystemMessage(text: string): ChatMessage {
    return this.addMessage({
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
  clear(): void {
    // Clear the messages
    this.messages = [];
    
    // Reset the token count
    this.currentTokenCount = 0;
    
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
   * Get the current token count
   * 
   * @returns The current token count
   */
  getTokenCount(): number {
    return this.currentTokenCount;
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
   * Load memory variables from an input
   * 
   * @param input The input to load from
   * @returns The memory variables
   */
  loadMemoryVariables(input: Record<string, any> = {}): Record<string, any> {
    // Call the onMessagesRetrieved callback if provided
    if (this.onMessagesRetrieved) {
      this.onMessagesRetrieved(this.messages);
    }
    
    return {
      history: this.getConversationString(),
      messages: this.messages
    };
  }
  
  /**
   * Save context from an input/output pair
   * 
   * @param input The input
   * @param output The output
   */
  saveContext(input: Record<string, any>, output: Record<string, any>): void {
    // Extract the input and output text
    const inputText = input[this.inputKey];
    const outputText = output[this.outputKey];
    
    // Add the messages
    if (inputText) {
      this.addHumanMessage(inputText);
    }
    
    if (outputText) {
      this.addAIMessage(outputText);
    }
  }
  
  /**
   * Trim messages if they exceed the token limit
   */
  private trimMessages(): void {
    // If the token count is within the limit, return
    if (this.currentTokenCount <= this.maxTokens) {
      return;
    }
    
    // Remove messages from the beginning until the token count is within the limit
    while (this.currentTokenCount > this.maxTokens && this.messages.length > 0) {
      const oldestMessage = this.messages.shift();
      if (oldestMessage) {
        this.currentTokenCount -= this.tokenCounter(oldestMessage.content);
      }
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
      maxTokens: this.maxTokens,
      currentTokenCount: this.currentTokenCount,
      humanPrefix: this.humanPrefix,
      aiPrefix: this.aiPrefix,
      systemPrefix: this.systemPrefix,
      inputKey: this.inputKey,
      outputKey: this.outputKey
    };
  }
  
  /**
   * Create a memory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @param tokenCounter Optional token counter function
   * @returns A new ConversationTokenBufferMemory instance
   */
  static fromJSON(
    json: Record<string, any>,
    tokenCounter?: (text: string) => number
  ): ConversationTokenBufferMemory {
    return new ConversationTokenBufferMemory({
      initialMessages: json.messages,
      maxTokens: json.maxTokens,
      tokenCounter,
      humanPrefix: json.humanPrefix,
      aiPrefix: json.aiPrefix,
      systemPrefix: json.systemPrefix,
      inputKey: json.inputKey,
      outputKey: json.outputKey
    });
  }
}

/**
 * Factory for creating ConversationTokenBufferMemory instances
 */
export class ConversationTokenBufferMemoryFactory {
  /**
   * Create a new ConversationTokenBufferMemory
   * 
   * @param options Options for the memory
   * @returns A new ConversationTokenBufferMemory instance
   */
  static create(options: ConversationTokenBufferMemoryOptions = {}): ConversationTokenBufferMemory {
    return new ConversationTokenBufferMemory(options);
  }
  
  /**
   * Create a new ConversationTokenBufferMemory with a specific token limit
   * 
   * @param maxTokens The maximum number of tokens to store
   * @param tokenCounter Optional token counter function
   * @returns A new ConversationTokenBufferMemory instance with a specific token limit
   */
  static withTokenLimit(
    maxTokens: number,
    tokenCounter?: (text: string) => number
  ): ConversationTokenBufferMemory {
    return new ConversationTokenBufferMemory({
      maxTokens,
      tokenCounter
    });
  }
  
  /**
   * Create a new ConversationTokenBufferMemory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @param tokenCounter Optional token counter function
   * @returns A new ConversationTokenBufferMemory instance
   */
  static fromJSON(
    json: Record<string, any>,
    tokenCounter?: (text: string) => number
  ): ConversationTokenBufferMemory {
    return ConversationTokenBufferMemory.fromJSON(json, tokenCounter);
  }
}
