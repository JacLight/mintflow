import { ChatMessage } from '../agents/OpenAIFunctionsAgent.js';
import { LLM } from '../chains/LLMChain.js';

/**
 * Interface for an entity
 */
export interface Entity {
  /**
   * The name of the entity
   */
  name: string;
  
  /**
   * The type of the entity
   */
  type: string;
  
  /**
   * Information about the entity
   */
  information: string;
  
  /**
   * Optional timestamp for when the entity was last updated
   */
  lastUpdated?: number;
  
  /**
   * Optional metadata for the entity
   */
  metadata?: Record<string, any>;
}

/**
 * Options for EntityMemory
 */
export interface EntityMemoryOptions {
  /**
   * The LLM to use for entity extraction and summarization
   */
  llm: LLM;
  
  /**
   * Optional initial entities
   */
  initialEntities?: Entity[];
  
  /**
   * Optional initial messages
   */
  initialMessages?: ChatMessage[];
  
  /**
   * Optional maximum number of entities to store
   * If the memory exceeds this limit, the oldest entities will be removed
   */
  maxEntities?: number;
  
  /**
   * Optional callback to call when an entity is added
   */
  onEntityAdded?: (entity: Entity) => void;
  
  /**
   * Optional callback to call when an entity is updated
   */
  onEntityUpdated?: (entity: Entity) => void;
  
  /**
   * Optional callback to call when an entity is retrieved
   */
  onEntityRetrieved?: (entity: Entity) => void;
  
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
   * Optional prompt template for entity extraction
   */
  extractionPromptTemplate?: string;
  
  /**
   * Optional prompt template for entity summarization
   */
  summarizationPromptTemplate?: string;
}

/**
 * A memory system that tracks entities mentioned in conversations
 */
export class EntityMemory {
  private llm: LLM;
  private entities: Map<string, Entity>;
  private messages: ChatMessage[];
  private maxEntities: number;
  private onEntityAdded?: (entity: Entity) => void;
  private onEntityUpdated?: (entity: Entity) => void;
  private onEntityRetrieved?: (entity: Entity) => void;
  private onClear?: () => void;
  private inputKey: string;
  private outputKey: string;
  private extractionPromptTemplate: string;
  private summarizationPromptTemplate: string;
  
  /**
   * Create a new EntityMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: EntityMemoryOptions) {
    this.llm = options.llm;
    this.entities = new Map();
    this.messages = [...(options.initialMessages || [])];
    this.maxEntities = options.maxEntities || Infinity;
    this.onEntityAdded = options.onEntityAdded;
    this.onEntityUpdated = options.onEntityUpdated;
    this.onEntityRetrieved = options.onEntityRetrieved;
    this.onClear = options.onClear;
    this.inputKey = options.inputKey || 'input';
    this.outputKey = options.outputKey || 'output';
    this.extractionPromptTemplate = options.extractionPromptTemplate || this.getDefaultExtractionPromptTemplate();
    this.summarizationPromptTemplate = options.summarizationPromptTemplate || this.getDefaultSummarizationPromptTemplate();
    
    // Add initial entities if provided
    if (options.initialEntities) {
      for (const entity of options.initialEntities) {
        this.addEntity(entity);
      }
    }
  }
  
  /**
   * Get the default prompt template for entity extraction
   * 
   * @returns The default prompt template
   */
  private getDefaultExtractionPromptTemplate(): string {
    return `Extract all entities from the following conversation. An entity is a specific person, place, organization, or thing that is mentioned.

For each entity, provide:
1. The entity name
2. The entity type (person, place, organization, thing, etc.)

Format your response as a JSON array of objects with "name" and "type" fields.

Conversation:
{conversation}

Entities (JSON array):`;
  }
  
  /**
   * Get the default prompt template for entity summarization
   * 
   * @returns The default prompt template
   */
  private getDefaultSummarizationPromptTemplate(): string {
    return `Summarize what we know about the entity based on the conversation. If this is a new entity, extract relevant information. If we already have information about the entity, update it with any new details.

Entity: {entity_name}
Entity Type: {entity_type}
Current Information: {current_information}

Conversation:
{conversation}

Updated Information:`;
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
    
    // Extract entities from the message
    await this.extractEntities();
    
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
   * Add an entity to the memory
   * 
   * @param entity The entity to add
   * @returns The added entity
   */
  addEntity(entity: Entity): Entity {
    // Add timestamp if not provided
    if (!entity.lastUpdated) {
      entity.lastUpdated = Date.now();
    }
    
    // Check if the entity already exists
    const existingEntity = this.entities.get(entity.name.toLowerCase());
    
    if (existingEntity) {
      // Update the existing entity
      existingEntity.information = entity.information;
      existingEntity.lastUpdated = entity.lastUpdated;
      
      if (entity.metadata) {
        existingEntity.metadata = {
          ...existingEntity.metadata,
          ...entity.metadata
        };
      }
      
      // Call the onEntityUpdated callback if provided
      if (this.onEntityUpdated) {
        this.onEntityUpdated(existingEntity);
      }
      
      return existingEntity;
    } else {
      // Add the entity
      this.entities.set(entity.name.toLowerCase(), entity);
      
      // Call the onEntityAdded callback if provided
      if (this.onEntityAdded) {
        this.onEntityAdded(entity);
      }
      
      // Remove oldest entities if the memory exceeds the maximum size
      if (this.entities.size > this.maxEntities) {
        this.removeOldestEntities(this.entities.size - this.maxEntities);
      }
      
      return entity;
    }
  }
  
  /**
   * Get an entity from the memory
   * 
   * @param entityName The name of the entity to get
   * @returns The entity, or undefined if it doesn't exist
   */
  getEntity(entityName: string): Entity | undefined {
    const entity = this.entities.get(entityName.toLowerCase());
    
    // Call the onEntityRetrieved callback if provided
    if (entity && this.onEntityRetrieved) {
      this.onEntityRetrieved(entity);
    }
    
    return entity;
  }
  
  /**
   * Get all entities from the memory
   * 
   * @returns An array of all entities
   */
  getEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  /**
   * Get all entities of a specific type
   * 
   * @param type The type of entities to get
   * @returns An array of entities of the specified type
   */
  getEntitiesByType(type: string): Entity[] {
    return this.getEntities().filter(entity => entity.type.toLowerCase() === type.toLowerCase());
  }
  
  /**
   * Clear all entities and messages from the memory
   */
  clear(): void {
    // Clear the entities and messages
    this.entities.clear();
    this.messages = [];
    
    // Call the onClear callback if provided
    if (this.onClear) {
      this.onClear();
    }
  }
  
  /**
   * Get the number of entities in the memory
   * 
   * @returns The number of entities
   */
  size(): number {
    return this.entities.size;
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
   * Extract entities from the conversation
   */
  private async extractEntities(): Promise<void> {
    // Get the conversation string
    const conversation = this.getConversationString();
    
    // Create the prompt
    const prompt = this.extractionPromptTemplate.replace('{conversation}', conversation);
    
    // Extract entities
    const response = await this.llm.complete(prompt);
    
    try {
      // Parse the response as JSON
      const extractedEntities = JSON.parse(response) as Array<{
        name: string;
        type: string;
      }>;
      
      // Process each extracted entity
      for (const extractedEntity of extractedEntities) {
        // Skip if the entity name is empty
        if (!extractedEntity.name || extractedEntity.name.trim() === '') {
          continue;
        }
        
        // Get the existing entity if it exists
        const existingEntity = this.getEntity(extractedEntity.name);
        
        // Summarize the entity
        const information = await this.summarizeEntity(
          extractedEntity.name,
          extractedEntity.type,
          existingEntity?.information || ''
        );
        
        // Add or update the entity
        this.addEntity({
          name: extractedEntity.name,
          type: extractedEntity.type,
          information,
          lastUpdated: Date.now()
        });
      }
    } catch (error) {
      console.error('Error extracting entities:', error);
    }
  }
  
  /**
   * Summarize an entity based on the conversation
   * 
   * @param entityName The name of the entity
   * @param entityType The type of the entity
   * @param currentInformation The current information about the entity
   * @returns The updated information about the entity
   */
  private async summarizeEntity(
    entityName: string,
    entityType: string,
    currentInformation: string
  ): Promise<string> {
    // Get the conversation string
    const conversation = this.getConversationString();
    
    // Create the prompt
    const prompt = this.summarizationPromptTemplate
      .replace('{entity_name}', entityName)
      .replace('{entity_type}', entityType)
      .replace('{current_information}', currentInformation)
      .replace('{conversation}', conversation);
    
    // Generate the summary
    return await this.llm.complete(prompt);
  }
  
  /**
   * Remove the oldest entities
   * 
   * @param count The number of entities to remove
   * @returns The number of entities removed
   */
  private removeOldestEntities(count: number): number {
    // Get all entities sorted by last updated timestamp
    const sortedEntities = this.getEntities()
      .sort((a, b) => (a.lastUpdated || 0) - (b.lastUpdated || 0));
    
    // Remove the oldest entities
    let removed = 0;
    for (let i = 0; i < Math.min(count, sortedEntities.length); i++) {
      const entity = sortedEntities[i];
      this.entities.delete(entity.name.toLowerCase());
      removed++;
    }
    
    return removed;
  }
  
  /**
   * Load memory variables from an input
   * 
   * @param input The input to load from
   * @returns The memory variables
   */
  async loadMemoryVariables(input: Record<string, any> = {}): Promise<Record<string, any>> {
    // Extract entity names from the input
    const entityNames = this.extractEntityNamesFromInput(input[this.inputKey] || '');
    
    // Get the entities
    const relevantEntities: Entity[] = [];
    
    for (const entityName of entityNames) {
      const entity = this.getEntity(entityName);
      if (entity) {
        relevantEntities.push(entity);
      }
    }
    
    // Format the entities as a string
    const entitiesString = relevantEntities.map(entity => {
      return `${entity.name} (${entity.type}): ${entity.information}`;
    }).join('\n\n');
    
    return {
      entities: relevantEntities,
      entitiesString: entitiesString
    };
  }
  
  /**
   * Extract entity names from an input
   * 
   * @param input The input to extract entity names from
   * @returns An array of entity names
   */
  private extractEntityNamesFromInput(input: string): string[] {
    // Get all entity names
    const entityNames = Array.from(this.entities.keys());
    
    // Filter entity names that appear in the input
    return entityNames.filter(entityName => {
      // Create a regex that matches the entity name as a whole word
      const regex = new RegExp(`\\b${entityName}\\b`, 'i');
      return regex.test(input);
    });
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
      entities: Array.from(this.entities.values()),
      messages: this.messages,
      maxEntities: this.maxEntities,
      inputKey: this.inputKey,
      outputKey: this.outputKey,
      extractionPromptTemplate: this.extractionPromptTemplate,
      summarizationPromptTemplate: this.summarizationPromptTemplate
    };
  }
  
  /**
   * Create a memory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @param llm The LLM to use for entity extraction and summarization
   * @returns A new EntityMemory instance
   */
  static fromJSON(json: Record<string, any>, llm: LLM): EntityMemory {
    return new EntityMemory({
      llm,
      initialEntities: json.entities,
      initialMessages: json.messages,
      maxEntities: json.maxEntities,
      inputKey: json.inputKey,
      outputKey: json.outputKey,
      extractionPromptTemplate: json.extractionPromptTemplate,
      summarizationPromptTemplate: json.summarizationPromptTemplate
    });
  }
}

/**
 * Factory for creating EntityMemory instances
 */
export class EntityMemoryFactory {
  /**
   * Create a new EntityMemory
   * 
   * @param options Options for the memory
   * @returns A new EntityMemory instance
   */
  static create(options: EntityMemoryOptions): EntityMemory {
    return new EntityMemory(options);
  }
  
  /**
   * Create a new EntityMemory with custom prompt templates
   * 
   * @param llm The LLM to use for entity extraction and summarization
   * @param extractionPromptTemplate The prompt template for entity extraction
   * @param summarizationPromptTemplate The prompt template for entity summarization
   * @returns A new EntityMemory instance with custom prompt templates
   */
  static withCustomPrompts(
    llm: LLM,
    extractionPromptTemplate: string,
    summarizationPromptTemplate: string
  ): EntityMemory {
    return new EntityMemory({
      llm,
      extractionPromptTemplate,
      summarizationPromptTemplate
    });
  }
  
  /**
   * Create a new EntityMemory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @param llm The LLM to use for entity extraction and summarization
   * @returns A new EntityMemory instance
   */
  static fromJSON(json: Record<string, any>, llm: LLM): EntityMemory {
    return EntityMemory.fromJSON(json, llm);
  }
}
