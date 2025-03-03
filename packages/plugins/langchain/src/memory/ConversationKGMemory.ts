import { ChatMessage } from '../agents/OpenAIFunctionsAgent.js';
import { LLM } from '../chains/LLMChain.js';

/**
 * Interface for a knowledge graph triple
 */
export interface KGTriple {
  /**
   * The subject of the triple
   */
  subject: string;
  
  /**
   * The predicate of the triple
   */
  predicate: string;
  
  /**
   * The object of the triple
   */
  object: string;
  
  /**
   * Optional timestamp for when the triple was added
   */
  timestamp?: number;
  
  /**
   * Optional metadata for the triple
   */
  metadata?: Record<string, any>;
}

/**
 * Options for ConversationKGMemory
 */
export interface ConversationKGMemoryOptions {
  /**
   * The LLM to use for triple extraction
   */
  llm: LLM;
  
  /**
   * Optional initial triples
   */
  initialTriples?: KGTriple[];
  
  /**
   * Optional initial messages
   */
  initialMessages?: ChatMessage[];
  
  /**
   * Optional maximum number of triples to store
   * If the memory exceeds this limit, the oldest triples will be removed
   */
  maxTriples?: number;
  
  /**
   * Optional callback to call when a triple is added
   */
  onTripleAdded?: (triple: KGTriple) => void;
  
  /**
   * Optional callback to call when triples are retrieved
   */
  onTriplesRetrieved?: (triples: KGTriple[]) => void;
  
  /**
   * Optional callback to call when the memory is cleared
   */
  onClear?: () => void;
  
  /**
   * Optional input key for extracting human messages
   */
  inputKey?: string;
  
  /**
   * Optional output key for extracting AI messages
   */
  outputKey?: string;
  
  /**
   * Optional prompt template for triple extraction
   */
  extractionPromptTemplate?: string;
}

/**
 * A memory system that builds a knowledge graph from conversations
 */
export class ConversationKGMemory {
  private llm: LLM;
  private triples: KGTriple[];
  private messages: ChatMessage[];
  private maxTriples: number;
  private onTripleAdded?: (triple: KGTriple) => void;
  private onTriplesRetrieved?: (triples: KGTriple[]) => void;
  private onClear?: () => void;
  private inputKey: string;
  private outputKey: string;
  private extractionPromptTemplate: string;
  
  /**
   * Create a new ConversationKGMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: ConversationKGMemoryOptions) {
    this.llm = options.llm;
    this.triples = [...(options.initialTriples || [])];
    this.messages = [...(options.initialMessages || [])];
    this.maxTriples = options.maxTriples || Infinity;
    this.onTripleAdded = options.onTripleAdded;
    this.onTriplesRetrieved = options.onTriplesRetrieved;
    this.onClear = options.onClear;
    this.inputKey = options.inputKey || 'input';
    this.outputKey = options.outputKey || 'output';
    this.extractionPromptTemplate = options.extractionPromptTemplate || this.getDefaultExtractionPromptTemplate();
    
    // Trim triples if they exceed the maximum
    this.trimTriples();
  }
  
  /**
   * Get the default prompt template for triple extraction
   * 
   * @returns The default prompt template
   */
  private getDefaultExtractionPromptTemplate(): string {
    return `Extract knowledge graph triples from the following conversation. A knowledge graph triple is a subject-predicate-object statement that represents a fact.

For example, if the conversation mentions "Alice works at Google", the triple would be (Alice, works at, Google).

Format your response as a JSON array of objects with "subject", "predicate", and "object" fields.

Conversation:
{conversation}

Triples (JSON array):`;
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
    
    // Extract triples from the message
    await this.extractTriples();
    
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
   * Add a triple to the memory
   * 
   * @param triple The triple to add
   * @returns The added triple
   */
  addTriple(triple: KGTriple): KGTriple {
    // Add timestamp if not provided
    if (!triple.timestamp) {
      triple.timestamp = Date.now();
    }
    
    // Add the triple
    this.triples.push(triple);
    
    // Call the onTripleAdded callback if provided
    if (this.onTripleAdded) {
      this.onTripleAdded(triple);
    }
    
    // Trim triples if they exceed the maximum
    this.trimTriples();
    
    return triple;
  }
  
  /**
   * Get all triples from the memory
   * 
   * @returns An array of all triples
   */
  getTriples(): KGTriple[] {
    // Call the onTriplesRetrieved callback if provided
    if (this.onTriplesRetrieved) {
      this.onTriplesRetrieved(this.triples);
    }
    
    return [...this.triples];
  }
  
  /**
   * Get triples with a specific subject
   * 
   * @param subject The subject to filter by
   * @returns An array of triples with the specified subject
   */
  getTriplesWithSubject(subject: string): KGTriple[] {
    const triples = this.triples.filter(triple => 
      triple.subject.toLowerCase() === subject.toLowerCase()
    );
    
    // Call the onTriplesRetrieved callback if provided
    if (this.onTriplesRetrieved) {
      this.onTriplesRetrieved(triples);
    }
    
    return triples;
  }
  
  /**
   * Get triples with a specific predicate
   * 
   * @param predicate The predicate to filter by
   * @returns An array of triples with the specified predicate
   */
  getTriplesWithPredicate(predicate: string): KGTriple[] {
    const triples = this.triples.filter(triple => 
      triple.predicate.toLowerCase() === predicate.toLowerCase()
    );
    
    // Call the onTriplesRetrieved callback if provided
    if (this.onTriplesRetrieved) {
      this.onTriplesRetrieved(triples);
    }
    
    return triples;
  }
  
  /**
   * Get triples with a specific object
   * 
   * @param object The object to filter by
   * @returns An array of triples with the specified object
   */
  getTriplesWithObject(object: string): KGTriple[] {
    const triples = this.triples.filter(triple => 
      triple.object.toLowerCase() === object.toLowerCase()
    );
    
    // Call the onTriplesRetrieved callback if provided
    if (this.onTriplesRetrieved) {
      this.onTriplesRetrieved(triples);
    }
    
    return triples;
  }
  
  /**
   * Clear all triples and messages from the memory
   */
  clear(): void {
    // Clear the triples and messages
    this.triples = [];
    this.messages = [];
    
    // Call the onClear callback if provided
    if (this.onClear) {
      this.onClear();
    }
  }
  
  /**
   * Get the number of triples in the memory
   * 
   * @returns The number of triples
   */
  size(): number {
    return this.triples.length;
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
          prefix = 'Human';
          break;
        case 'assistant':
          prefix = 'AI';
          break;
        case 'system':
          prefix = 'System';
          break;
        default:
          prefix = message.role;
      }
      
      return `${prefix}: ${message.content}`;
    }).join('\n');
  }
  
  /**
   * Extract triples from the conversation
   */
  private async extractTriples(): Promise<void> {
    // Get the conversation string
    const conversation = this.getConversationString();
    
    // Create the prompt
    const prompt = this.extractionPromptTemplate.replace('{conversation}', conversation);
    
    // Extract triples
    const response = await this.llm.complete(prompt);
    
    try {
      // Parse the response as JSON
      const extractedTriples = JSON.parse(response) as Array<{
        subject: string;
        predicate: string;
        object: string;
      }>;
      
      // Add each extracted triple
      for (const extractedTriple of extractedTriples) {
        // Skip if any part of the triple is empty
        if (!extractedTriple.subject || !extractedTriple.predicate || !extractedTriple.object) {
          continue;
        }
        
        // Add the triple
        this.addTriple({
          subject: extractedTriple.subject,
          predicate: extractedTriple.predicate,
          object: extractedTriple.object,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error extracting triples:', error);
    }
  }
  
  /**
   * Trim triples if they exceed the maximum
   */
  private trimTriples(): void {
    if (this.triples.length > this.maxTriples) {
      // Sort triples by timestamp (oldest first)
      this.triples.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      
      // Remove the oldest triples
      this.triples = this.triples.slice(this.triples.length - this.maxTriples);
    }
  }
  
  /**
   * Load memory variables from an input
   * 
   * @param input The input to load from
   * @returns The memory variables
   */
  async loadMemoryVariables(input: Record<string, any> = {}): Promise<Record<string, any>> {
    // Extract entities from the input
    const entities = this.extractEntitiesFromInput(input[this.inputKey] || '');
    
    // Get relevant triples for each entity
    const relevantTriples: KGTriple[] = [];
    
    for (const entity of entities) {
      // Get triples where the entity is the subject
      const subjectTriples = this.getTriplesWithSubject(entity);
      
      // Get triples where the entity is the object
      const objectTriples = this.getTriplesWithObject(entity);
      
      // Add all relevant triples
      relevantTriples.push(...subjectTriples, ...objectTriples);
    }
    
    // Remove duplicates
    const uniqueTriples = this.removeDuplicateTriples(relevantTriples);
    
    // Format the triples as a string
    const triplesString = uniqueTriples.map(triple => {
      return `(${triple.subject}, ${triple.predicate}, ${triple.object})`;
    }).join('\n');
    
    return {
      triples: uniqueTriples,
      triplesString: triplesString
    };
  }
  
  /**
   * Extract entities from an input
   * 
   * @param input The input to extract entities from
   * @returns An array of entities
   */
  private extractEntitiesFromInput(input: string): string[] {
    // Get all subjects and objects from triples
    const entities = new Set<string>();
    
    for (const triple of this.triples) {
      entities.add(triple.subject);
      entities.add(triple.object);
    }
    
    // Filter entities that appear in the input
    return Array.from(entities).filter(entity => {
      // Create a regex that matches the entity as a whole word
      const regex = new RegExp(`\\b${entity}\\b`, 'i');
      return regex.test(input);
    });
  }
  
  /**
   * Remove duplicate triples
   * 
   * @param triples The triples to remove duplicates from
   * @returns An array of unique triples
   */
  private removeDuplicateTriples(triples: KGTriple[]): KGTriple[] {
    const uniqueTriples: KGTriple[] = [];
    const seen = new Set<string>();
    
    for (const triple of triples) {
      const key = `${triple.subject.toLowerCase()}-${triple.predicate.toLowerCase()}-${triple.object.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTriples.push(triple);
      }
    }
    
    return uniqueTriples;
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
      triples: this.triples,
      messages: this.messages,
      maxTriples: this.maxTriples,
      inputKey: this.inputKey,
      outputKey: this.outputKey,
      extractionPromptTemplate: this.extractionPromptTemplate
    };
  }
  
  /**
   * Create a memory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @param llm The LLM to use for triple extraction
   * @returns A new ConversationKGMemory instance
   */
  static fromJSON(json: Record<string, any>, llm: LLM): ConversationKGMemory {
    return new ConversationKGMemory({
      llm,
      initialTriples: json.triples,
      initialMessages: json.messages,
      maxTriples: json.maxTriples,
      inputKey: json.inputKey,
      outputKey: json.outputKey,
      extractionPromptTemplate: json.extractionPromptTemplate
    });
  }
}

/**
 * Factory for creating ConversationKGMemory instances
 */
export class ConversationKGMemoryFactory {
  /**
   * Create a new ConversationKGMemory
   * 
   * @param options Options for the memory
   * @returns A new ConversationKGMemory instance
   */
  static create(options: ConversationKGMemoryOptions): ConversationKGMemory {
    return new ConversationKGMemory(options);
  }
  
  /**
   * Create a new ConversationKGMemory with a custom prompt template
   * 
   * @param llm The LLM to use for triple extraction
   * @param extractionPromptTemplate The prompt template for triple extraction
   * @returns A new ConversationKGMemory instance with a custom prompt template
   */
  static withCustomPrompt(
    llm: LLM,
    extractionPromptTemplate: string
  ): ConversationKGMemory {
    return new ConversationKGMemory({
      llm,
      extractionPromptTemplate
    });
  }
  
  /**
   * Create a new ConversationKGMemory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @param llm The LLM to use for triple extraction
   * @returns A new ConversationKGMemory instance
   */
  static fromJSON(json: Record<string, any>, llm: LLM): ConversationKGMemory {
    return ConversationKGMemory.fromJSON(json, llm);
  }
}
