import { ChatMessage } from '../agents/OpenAIFunctionsAgent.js';

/**
 * Options for ConversationBufferMemory
 */
export interface ConversationBufferMemoryOptions {
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
}

/**
 * A memory system that stores conversation messages in a buffer
 */
export class ConversationBufferMemory {
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
  
  /**
   * Create a new ConversationBufferMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: ConversationBufferMemoryOptions = {}) {
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
    
    // Trim messages if they exceed the maximum
    this.trimMessages();
  }
  
  /**
   * Add a message to the memory
   * 
   * @param message The message to add
   * @returns The added message
   */
  addMessage(message: ChatMessage): ChatMessage {
    // Add the message
    this.messages.push(message);
    
    // Call the onMessageAdded callback if provided
    if (this.onMessageAdded) {
      this.onMessageAdded(message);
    }
    
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
   * Trim messages if they exceed the maximum
   */
  private trimMessages(): void {
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(this.messages.length - this.maxMessages);
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
      outputKey: this.outputKey
    };
  }
  
  /**
   * Create a memory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @returns A new ConversationBufferMemory instance
   */
  static fromJSON(json: Record<string, any>): ConversationBufferMemory {
    return new ConversationBufferMemory({
      initialMessages: json.messages,
      maxMessages: json.maxMessages,
      humanPrefix: json.humanPrefix,
      aiPrefix: json.aiPrefix,
      systemPrefix: json.systemPrefix,
      inputKey: json.inputKey,
      outputKey: json.outputKey
    });
  }
}

/**
 * Factory for creating ConversationBufferMemory instances
 */
export class ConversationBufferMemoryFactory {
  /**
   * Create a new ConversationBufferMemory
   * 
   * @param options Options for the memory
   * @returns A new ConversationBufferMemory instance
   */
  static create(options: ConversationBufferMemoryOptions = {}): ConversationBufferMemory {
    return new ConversationBufferMemory(options);
  }
  
  /**
   * Create a new ConversationBufferMemory with a limited size
   * 
   * @param maxMessages The maximum number of messages to store
   * @returns A new ConversationBufferMemory instance with a limited size
   */
  static withLimit(maxMessages: number): ConversationBufferMemory {
    return new ConversationBufferMemory({
      maxMessages
    });
  }
  
  /**
   * Create a new ConversationBufferMemory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @returns A new ConversationBufferMemory instance
   */
  static fromJSON(json: Record<string, any>): ConversationBufferMemory {
    return ConversationBufferMemory.fromJSON(json);
  }
}
