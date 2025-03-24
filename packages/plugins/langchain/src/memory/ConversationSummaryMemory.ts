import { ChatMessage } from '../agents/OpenAIFunctionsAgent.js';
import { LLM } from '../chains/LLMChain.js';

/**
 * Options for ConversationSummaryMemory
 */
export interface ConversationSummaryMemoryOptions {
  /**
   * The LLM to use for summarization
   */
  llm: LLM;
  
  /**
   * Optional initial messages
   */
  initialMessages?: ChatMessage[];
  
  /**
   * Optional initial summary
   */
  initialSummary?: string;
  
  /**
   * Optional maximum number of tokens for the summary
   */
  maxTokens?: number;
  
  /**
   * Optional callback to call when a message is added
   */
  onMessageAdded?: (message: ChatMessage) => void;
  
  /**
   * Optional callback to call when the summary is updated
   */
  onSummaryUpdated?: (summary: string) => void;
  
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
   * Optional prompt template for summarization
   */
  promptTemplate?: string;
  
  /**
   * Optional buffer size before summarization
   * If the number of new messages exceeds this limit, the conversation will be summarized
   */
  bufferSize?: number;
}

/**
 * A memory system that summarizes the conversation history to save tokens
 */
export class ConversationSummaryMemory {
  private llm: LLM;
  private messages: ChatMessage[];
  private summary: string;
  private maxTokens: number;
  private onMessageAdded?: (message: ChatMessage) => void;
  private onSummaryUpdated?: (summary: string) => void;
  private onClear?: () => void;
  private humanPrefix: string;
  private aiPrefix: string;
  private systemPrefix: string;
  private inputKey: string;
  private outputKey: string;
  private promptTemplate: string;
  private bufferSize: number;
  private buffer: ChatMessage[];
  
  /**
   * Create a new ConversationSummaryMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: ConversationSummaryMemoryOptions) {
    this.llm = options.llm;
    this.messages = [...(options.initialMessages || [])];
    this.summary = options.initialSummary || '';
    this.maxTokens = options.maxTokens || 2000;
    this.onMessageAdded = options.onMessageAdded;
    this.onSummaryUpdated = options.onSummaryUpdated;
    this.onClear = options.onClear;
    this.humanPrefix = options.humanPrefix || 'Human';
    this.aiPrefix = options.aiPrefix || 'AI';
    this.systemPrefix = options.systemPrefix || 'System';
    this.inputKey = options.inputKey || 'input';
    this.outputKey = options.outputKey || 'output';
    this.promptTemplate = options.promptTemplate || this.getDefaultPromptTemplate();
    this.bufferSize = options.bufferSize || 5;
    this.buffer = [];
    
    // If there are initial messages and no summary, generate a summary
    if (this.messages.length > 0 && !this.summary) {
      this.summarizeMessages(this.messages).then(summary => {
        this.summary = summary;
        
        // Call the onSummaryUpdated callback if provided
        if (this.onSummaryUpdated) {
          this.onSummaryUpdated(this.summary);
        }
      }).catch(error => {
        console.error('Error generating initial summary:', error);
      });
    }
  }
  
  /**
   * Get the default prompt template for summarization
   * 
   * @returns The default prompt template
   */
  private getDefaultPromptTemplate(): string {
    return `Progressively summarize the lines of conversation provided, adding onto the previous summary returning a new summary.

EXAMPLE
Current summary:
The human asks what the AI thinks of artificial intelligence. The AI thinks artificial intelligence is a force for good.

New lines of conversation:
Human: Why do you think artificial intelligence is a force for good?
AI: I think artificial intelligence will help humans reach their full potential by automating routine tasks and allowing them to focus on creative and fulfilling work.

New summary:
The human asks what the AI thinks of artificial intelligence. The AI thinks artificial intelligence is a force for good because it will help humans reach their full potential by automating routine tasks and allowing them to focus on creative and fulfilling work.
END OF EXAMPLE

Current summary:
{summary}

New lines of conversation:
{new_lines}

New summary:`;
  }
  
  /**
   * Add a message to the memory
   * 
   * @param message The message to add
   * @returns The added message
   */
  async addMessage(message: ChatMessage): Promise<ChatMessage> {
    // Add the message to the buffer
    this.buffer.push(message);
    
    // Call the onMessageAdded callback if provided
    if (this.onMessageAdded) {
      this.onMessageAdded(message);
    }
    
    // Add the message to the messages array
    this.messages.push(message);
    
    // If the buffer size exceeds the limit, summarize the conversation
    if (this.buffer.length >= this.bufferSize) {
      await this.summarizeBuffer();
    }
    
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
    return [...this.messages];
  }
  
  /**
   * Get the current summary
   * 
   * @returns The current summary
   */
  getSummary(): string {
    return this.summary;
  }
  
  /**
   * Clear all messages and summary from the memory
   */
  clear(): void {
    // Clear the messages, buffer, and summary
    this.messages = [];
    this.buffer = [];
    this.summary = '';
    
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
   * Format messages as a string
   * 
   * @param messages The messages to format
   * @returns The formatted messages
   */
  private formatMessages(messages: ChatMessage[]): string {
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
   * Summarize messages
   * 
   * @param messages The messages to summarize
   * @returns The summary
   */
  private async summarizeMessages(messages: ChatMessage[]): Promise<string> {
    // If there are no messages, return an empty summary
    if (messages.length === 0) {
      return '';
    }
    
    // Format the messages
    const formattedMessages = this.formatMessages(messages);
    
    // Create the prompt
    const prompt = this.promptTemplate
      .replace('{summary}', this.summary)
      .replace('{new_lines}', formattedMessages);
    
    // Generate the summary
    return await this.llm.complete(prompt);
  }
  
  /**
   * Summarize the buffer and update the summary
   */
  private async summarizeBuffer(): Promise<void> {
    // If there are no messages in the buffer, return
    if (this.buffer.length === 0) {
      return;
    }
    
    // Summarize the buffer
    const newSummary = await this.summarizeMessages(this.buffer);
    
    // Update the summary
    this.summary = newSummary;
    
    // Clear the buffer
    this.buffer = [];
    
    // Call the onSummaryUpdated callback if provided
    if (this.onSummaryUpdated) {
      this.onSummaryUpdated(this.summary);
    }
  }
  
  /**
   * Load memory variables from an input
   * 
   * @param input The input to load from
   * @returns The memory variables
   */
  async loadMemoryVariables(input: Record<string, any> = {}): Promise<Record<string, any>> {
    // Ensure the buffer is summarized
    await this.summarizeBuffer();
    
    return {
      summary: this.summary,
      messages: this.messages
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
   * Convert the memory to a JSON object
   * 
   * @returns A JSON object representing the memory
   */
  toJSON(): Record<string, any> {
    return {
      messages: this.messages,
      summary: this.summary,
      maxTokens: this.maxTokens,
      humanPrefix: this.humanPrefix,
      aiPrefix: this.aiPrefix,
      systemPrefix: this.systemPrefix,
      inputKey: this.inputKey,
      outputKey: this.outputKey,
      promptTemplate: this.promptTemplate,
      bufferSize: this.bufferSize
    };
  }
}

/**
 * Factory for creating ConversationSummaryMemory instances
 */
export class ConversationSummaryMemoryFactory {
  /**
   * Create a new ConversationSummaryMemory
   * 
   * @param options Options for the memory
   * @returns A new ConversationSummaryMemory instance
   */
  static create(options: ConversationSummaryMemoryOptions): ConversationSummaryMemory {
    return new ConversationSummaryMemory(options);
  }
  
  /**
   * Create a new ConversationSummaryMemory with a custom prompt template
   * 
   * @param llm The LLM to use for summarization
   * @param promptTemplate The prompt template for summarization
   * @returns A new ConversationSummaryMemory instance with a custom prompt template
   */
  static withCustomPrompt(llm: LLM, promptTemplate: string): ConversationSummaryMemory {
    return new ConversationSummaryMemory({
      llm,
      promptTemplate
    });
  }
  
  /**
   * Create a new ConversationSummaryMemory with a specific buffer size
   * 
   * @param llm The LLM to use for summarization
   * @param bufferSize The buffer size before summarization
   * @returns A new ConversationSummaryMemory instance with a specific buffer size
   */
  static withBufferSize(llm: LLM, bufferSize: number): ConversationSummaryMemory {
    return new ConversationSummaryMemory({
      llm,
      bufferSize
    });
  }
}
