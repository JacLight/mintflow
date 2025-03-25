/**
 * Interface for a memory entry
 */
export interface MemoryEntry {
  /**
   * The key for the memory entry
   */
  key: string;
  
  /**
   * The value of the memory entry
   */
  value: any;
  
  /**
   * Optional metadata for the memory entry
   */
  metadata?: Record<string, any>;
  
  /**
   * Optional timestamp for the memory entry
   */
  timestamp?: number;
}

/**
 * Options for AgentMemory
 */
export interface AgentMemoryOptions {
  /**
   * Optional initial memory entries
   */
  initialEntries?: MemoryEntry[];
  
  /**
   * Optional maximum number of entries to store
   * If the memory exceeds this limit, the oldest entries will be removed
   */
  maxEntries?: number;
  
  /**
   * Optional callback to call when a memory entry is added
   */
  onAdd?: (entry: MemoryEntry) => void;
  
  /**
   * Optional callback to call when a memory entry is retrieved
   */
  onGet?: (key: string, entry: MemoryEntry | undefined) => void;
  
  /**
   * Optional callback to call when a memory entry is removed
   */
  onRemove?: (key: string, entry: MemoryEntry | undefined) => void;
  
  /**
   * Optional callback to call when the memory is cleared
   */
  onClear?: () => void;
}

/**
 * A memory system for agents to store and retrieve information
 */
export class AgentMemory {
  private entries: Map<string, MemoryEntry>;
  private maxEntries: number;
  private onAdd?: (entry: MemoryEntry) => void;
  private onGet?: (key: string, entry: MemoryEntry | undefined) => void;
  private onRemove?: (key: string, entry: MemoryEntry | undefined) => void;
  private onClear?: () => void;
  
  /**
   * Create a new AgentMemory
   * 
   * @param options Options for the memory
   */
  constructor(options: AgentMemoryOptions = {}) {
    this.entries = new Map();
    
    // Add initial entries if provided
    if (options.initialEntries) {
      for (const entry of options.initialEntries) {
        this.add(entry);
      }
    }
    
    this.maxEntries = options.maxEntries || Infinity;
    this.onAdd = options.onAdd;
    this.onGet = options.onGet;
    this.onRemove = options.onRemove;
    this.onClear = options.onClear;
  }
  
  /**
   * Add a memory entry
   * 
   * @param entry The memory entry to add
   * @returns The added memory entry
   */
  add(entry: MemoryEntry): MemoryEntry {
    // Add timestamp if not provided
    if (!entry.timestamp) {
      entry.timestamp = Date.now();
    }
    
    // Add the entry
    this.entries.set(entry.key, entry);
    
    // Call the onAdd callback if provided
    if (this.onAdd) {
      this.onAdd(entry);
    }
    
    // Remove oldest entries if the memory exceeds the maximum size
    if (this.entries.size > this.maxEntries) {
      this.removeOldest(this.entries.size - this.maxEntries);
    }
    
    return entry;
  }
  
  /**
   * Get a memory entry
   * 
   * @param key The key of the memory entry to get
   * @returns The memory entry, or undefined if it doesn't exist
   */
  get(key: string): MemoryEntry | undefined {
    const entry = this.entries.get(key);
    
    // Call the onGet callback if provided
    if (this.onGet) {
      this.onGet(key, entry);
    }
    
    return entry;
  }
  
  /**
   * Remove a memory entry
   * 
   * @param key The key of the memory entry to remove
   * @returns Whether the memory entry was removed
   */
  remove(key: string): boolean {
    const entry = this.entries.get(key);
    
    // Check if the entry exists
    if (!entry) {
      return false;
    }
    
    // Remove the entry
    this.entries.delete(key);
    
    // Call the onRemove callback if provided
    if (this.onRemove) {
      this.onRemove(key, entry);
    }
    
    return true;
  }
  
  /**
   * Remove the oldest memory entries
   * 
   * @param count The number of entries to remove
   * @returns The number of entries removed
   */
  removeOldest(count: number): number {
    // Get all entries sorted by timestamp
    const sortedEntries = Array.from(this.entries.values())
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    // Remove the oldest entries
    let removed = 0;
    for (let i = 0; i < Math.min(count, sortedEntries.length); i++) {
      const entry = sortedEntries[i];
      if (this.remove(entry.key)) {
        removed++;
      }
    }
    
    return removed;
  }
  
  /**
   * Clear all memory entries
   */
  clear(): void {
    // Clear the entries
    this.entries.clear();
    
    // Call the onClear callback if provided
    if (this.onClear) {
      this.onClear();
    }
  }
  
  /**
   * Get all memory entries
   * 
   * @returns An array of all memory entries
   */
  getAll(): MemoryEntry[] {
    return Array.from(this.entries.values());
  }
  
  /**
   * Get all memory entries sorted by timestamp
   * 
   * @param ascending Whether to sort in ascending order
   * @returns An array of all memory entries sorted by timestamp
   */
  getAllSorted(ascending: boolean = true): MemoryEntry[] {
    return this.getAll()
      .sort((a, b) => {
        const aTimestamp = a.timestamp || 0;
        const bTimestamp = b.timestamp || 0;
        return ascending ? aTimestamp - bTimestamp : bTimestamp - aTimestamp;
      });
  }
  
  /**
   * Get the number of memory entries
   * 
   * @returns The number of memory entries
   */
  size(): number {
    return this.entries.size;
  }
  
  /**
   * Check if a memory entry exists
   * 
   * @param key The key of the memory entry to check
   * @returns Whether the memory entry exists
   */
  has(key: string): boolean {
    return this.entries.has(key);
  }
  
  /**
   * Filter memory entries based on a predicate
   * 
   * @param predicate The predicate to filter by
   * @returns An array of memory entries that match the predicate
   */
  filter(predicate: (entry: MemoryEntry) => boolean): MemoryEntry[] {
    return this.getAll().filter(predicate);
  }
  
  /**
   * Find a memory entry based on a predicate
   * 
   * @param predicate The predicate to find by
   * @returns The first memory entry that matches the predicate, or undefined if none match
   */
  find(predicate: (entry: MemoryEntry) => boolean): MemoryEntry | undefined {
    return this.getAll().find(predicate);
  }
  
  /**
   * Update a memory entry
   * 
   * @param key The key of the memory entry to update
   * @param updater A function that takes the current entry and returns the updated entry
   * @returns The updated memory entry, or undefined if it doesn't exist
   */
  update(key: string, updater: (entry: MemoryEntry) => MemoryEntry): MemoryEntry | undefined {
    const entry = this.get(key);
    
    // Check if the entry exists
    if (!entry) {
      return undefined;
    }
    
    // Update the entry
    const updatedEntry = updater(entry);
    
    // Add the updated entry
    return this.add(updatedEntry);
  }
  
  /**
   * Convert the memory to a JSON object
   * 
   * @returns A JSON object representing the memory
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {};
    
    for (const [key, entry] of this.entries) {
      json[key] = {
        value: entry.value,
        metadata: entry.metadata,
        timestamp: entry.timestamp
      };
    }
    
    return json;
  }
  
  /**
   * Create a memory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @returns A new AgentMemory instance
   */
  static fromJSON(json: Record<string, any>): AgentMemory {
    const entries: MemoryEntry[] = [];
    
    for (const key of Object.keys(json)) {
      const entryJson = json[key];
      
      entries.push({
        key,
        value: entryJson.value,
        metadata: entryJson.metadata,
        timestamp: entryJson.timestamp
      });
    }
    
    return new AgentMemory({
      initialEntries: entries
    });
  }
}

/**
 * Factory for creating AgentMemory instances
 */
export class AgentMemoryFactory {
  /**
   * Create a new AgentMemory
   * 
   * @param options Options for the memory
   * @returns A new AgentMemory instance
   */
  static create(options: AgentMemoryOptions = {}): AgentMemory {
    return new AgentMemory(options);
  }
  
  /**
   * Create a new AgentMemory with a limited size
   * 
   * @param maxEntries The maximum number of entries to store
   * @returns A new AgentMemory instance with a limited size
   */
  static withLimit(maxEntries: number): AgentMemory {
    return new AgentMemory({
      maxEntries
    });
  }
  
  /**
   * Create a new AgentMemory from a JSON object
   * 
   * @param json A JSON object representing the memory
   * @returns A new AgentMemory instance
   */
  static fromJSON(json: Record<string, any>): AgentMemory {
    return AgentMemory.fromJSON(json);
  }
}
