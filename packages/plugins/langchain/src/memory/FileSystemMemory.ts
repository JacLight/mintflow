import { ChatMessage } from '../agents/OpenAIFunctionsAgent.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Options for FileSystemMemory
 */
export interface FileSystemMemoryOptions {
  /**
   * The directory to store memory files in
   */
  directory: string;
  
  /**
   * The session ID to use for storing messages
   * This is used to separate messages from different sessions
   */
  sessionId: string;
  
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
  
  /**
   * Optional flag to pretty-print JSON files
   */
  prettyPrint?: boolean;
}

/**
 * A memory system that stores conversation messages in the file system
 */
export class FileSystemMemory {
  private directory: string;
  private sessionId: string;
  private onMessageAdded?: (message: ChatMessage) => void;
  private onMessagesRetrieved?: (messages: ChatMessage[]) => void;
  private onClear?: () => void;
  private humanPrefix: string;
  private aiPrefix: string;
  private systemPrefix: string;
  private inputKey: string;
  private outputKey: string;
  private prettyPrint: boolean;
  
  /**
   * Create a new FileSystemMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: FileSystemMemoryOptions) {
    this.directory = options.directory;
    this.sessionId = options.sessionId;
    this.onMessageAdded = options.onMessageAdded;
    this.onMessagesRetrieved = options.onMessagesRetrieved;
    this.onClear = options.onClear;
    this.humanPrefix = options.humanPrefix || 'Human';
    this.aiPrefix = options.aiPrefix || 'AI';
    this.systemPrefix = options.systemPrefix || 'System';
    this.inputKey = options.inputKey || 'input';
    this.outputKey = options.outputKey || 'output';
    this.prettyPrint = options.prettyPrint || false;
    
    // Create the directory if it doesn't exist
    this.ensureDirectoryExists();
    
    // Add initial messages if provided
    if (options.initialMessages && options.initialMessages.length > 0) {
      this.addMessages(options.initialMessages);
    }
  }
  
  /**
   * Ensure the directory exists
   */
  private ensureDirectoryExists(): void {
    const sessionDir = this.getSessionDirectory();
    
    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, { recursive: true });
    }
    
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
  }
  
  /**
   * Get the directory for the current session
   * 
   * @returns The session directory
   */
  private getSessionDirectory(): string {
    return path.join(this.directory, this.sessionId);
  }
  
  /**
   * Get the file path for a message
   * 
   * @param index The index of the message
   * @returns The file path
   */
  private getMessageFilePath(index: number): string {
    return path.join(this.getSessionDirectory(), `message_${index.toString().padStart(6, '0')}.json`);
  }
  
  /**
   * Get the file path for the message count
   * 
   * @returns The file path
   */
  private getMessageCountFilePath(): string {
    return path.join(this.getSessionDirectory(), 'message_count.json');
  }
  
  /**
   * Get the current message count
   * 
   * @returns The message count
   */
  private getMessageCount(): number {
    const countFilePath = this.getMessageCountFilePath();
    
    if (!fs.existsSync(countFilePath)) {
      return 0;
    }
    
    try {
      const countJson = fs.readFileSync(countFilePath, 'utf-8');
      const count = JSON.parse(countJson);
      return count.count;
    } catch (error) {
      console.error(`Error reading message count: ${error}`);
      return 0;
    }
  }
  
  /**
   * Set the message count
   * 
   * @param count The message count
   */
  private setMessageCount(count: number): void {
    const countFilePath = this.getMessageCountFilePath();
    
    try {
      const countJson = JSON.stringify({ count }, null, this.prettyPrint ? 2 : undefined);
      fs.writeFileSync(countFilePath, countJson, 'utf-8');
    } catch (error) {
      console.error(`Error writing message count: ${error}`);
    }
  }
  
  /**
   * Add a message to the memory
   * 
   * @param message The message to add
   * @returns The added message
   */
  addMessage(message: ChatMessage): ChatMessage {
    // Get the current message count
    const count = this.getMessageCount();
    
    // Add the message
    const messageFilePath = this.getMessageFilePath(count);
    
    try {
      const messageJson = JSON.stringify({
        message,
        timestamp: Date.now()
      }, null, this.prettyPrint ? 2 : undefined);
      
      fs.writeFileSync(messageFilePath, messageJson, 'utf-8');
      
      // Update the message count
      this.setMessageCount(count + 1);
      
      // Call the onMessageAdded callback if provided
      if (this.onMessageAdded) {
        this.onMessageAdded(message);
      }
    } catch (error) {
      console.error(`Error writing message: ${error}`);
    }
    
    return message;
  }
  
  /**
   * Add multiple messages to the memory
   * 
   * @param messages The messages to add
   */
  addMessages(messages: ChatMessage[]): void {
    for (const message of messages) {
      this.addMessage(message);
    }
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
    const count = this.getMessageCount();
    const messages: ChatMessage[] = [];
    
    for (let i = 0; i < count; i++) {
      const messageFilePath = this.getMessageFilePath(i);
      
      if (fs.existsSync(messageFilePath)) {
        try {
          const messageJson = fs.readFileSync(messageFilePath, 'utf-8');
          const messageData = JSON.parse(messageJson);
          messages.push(messageData.message);
        } catch (error) {
          console.error(`Error reading message: ${error}`);
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
   */
  clear(): void {
    const sessionDir = this.getSessionDirectory();
    
    if (fs.existsSync(sessionDir)) {
      try {
        // Delete all files in the session directory
        const files = fs.readdirSync(sessionDir);
        
        for (const file of files) {
          fs.unlinkSync(path.join(sessionDir, file));
        }
        
        // Reset the message count
        this.setMessageCount(0);
        
        // Call the onClear callback if provided
        if (this.onClear) {
          this.onClear();
        }
      } catch (error) {
        console.error(`Error clearing memory: ${error}`);
      }
    }
  }
  
  /**
   * Get the conversation history as a formatted string
   * 
   * @returns The conversation history
   */
  getConversationString(): string {
    const messages = this.getMessages();
    
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
   * @returns The memory variables
   */
  loadMemoryVariables(input: Record<string, any> = {}): Record<string, any> {
    const messages = this.getMessages();
    const history = this.getConversationString();
    
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
}

/**
 * Factory for creating FileSystemMemory instances
 */
export class FileSystemMemoryFactory {
  /**
   * Create a new FileSystemMemory
   * 
   * @param options Options for the memory
   * @returns A new FileSystemMemory instance
   */
  static create(options: FileSystemMemoryOptions): FileSystemMemory {
    return new FileSystemMemory(options);
  }
  
  /**
   * Create a new FileSystemMemory with a specific directory
   * 
   * @param directory The directory to store memory files in
   * @param sessionId The session ID to use for storing messages
   * @returns A new FileSystemMemory instance with a specific directory
   */
  static withDirectory(
    directory: string,
    sessionId: string
  ): FileSystemMemory {
    return new FileSystemMemory({
      directory,
      sessionId
    });
  }
  
  /**
   * Create a new FileSystemMemory with pretty-printed JSON files
   * 
   * @param directory The directory to store memory files in
   * @param sessionId The session ID to use for storing messages
   * @returns A new FileSystemMemory instance with pretty-printed JSON files
   */
  static withPrettyPrint(
    directory: string,
    sessionId: string
  ): FileSystemMemory {
    return new FileSystemMemory({
      directory,
      sessionId,
      prettyPrint: true
    });
  }
}
