import { Tool } from '../tools/Tool.js';
import { WebSearchTool } from '../tools/WebSearchTool.js';
import { CalculatorTool } from '../tools/CalculatorTool.js';
import { WikipediaTool } from '../tools/WikipediaTool.js';
import { FileSystemTool } from '../tools/FileSystemTool.js';

/**
 * Options for ToolRegistry
 */
export interface ToolRegistryOptions {
  /**
   * Optional initial tools to register
   */
  initialTools?: Tool[];
  
  /**
   * Optional flag to allow duplicate tool names
   * If false, registering a tool with an existing name will throw an error
   */
  allowDuplicates?: boolean;
  
  /**
   * Optional callback to call when a tool is registered
   */
  onRegister?: (tool: Tool) => void;
  
  /**
   * Optional callback to call when a tool is unregistered
   */
  onUnregister?: (toolName: string) => void;
}

/**
 * A registry for tools that can be used by agents
 */
export class ToolRegistry {
  private tools: Map<string, Tool>;
  private allowDuplicates: boolean;
  private onRegister?: (tool: Tool) => void;
  private onUnregister?: (toolName: string) => void;
  
  /**
   * Create a new ToolRegistry
   * 
   * @param options Options for the registry
   */
  constructor(options: ToolRegistryOptions = {}) {
    this.tools = new Map();
    
    // Register initial tools if provided
    if (options.initialTools) {
      for (const tool of options.initialTools) {
        this.register(tool);
      }
    }
    
    this.allowDuplicates = options.allowDuplicates || false;
    this.onRegister = options.onRegister;
    this.onUnregister = options.onUnregister;
  }
  
  /**
   * Register a tool with the registry
   * 
   * @param tool The tool to register
   * @returns The registered tool
   * @throws Error if a tool with the same name already exists and allowDuplicates is false
   */
  register(tool: Tool): Tool {
    // Check if a tool with the same name already exists
    if (!this.allowDuplicates && this.tools.has(tool.name)) {
      throw new Error(`Tool with name '${tool.name}' already exists in the registry`);
    }
    
    // Register the tool
    this.tools.set(tool.name, tool);
    
    // Call the onRegister callback if provided
    if (this.onRegister) {
      this.onRegister(tool);
    }
    
    return tool;
  }
  
  /**
   * Unregister a tool from the registry
   * 
   * @param toolName The name of the tool to unregister
   * @returns Whether the tool was unregistered
   */
  unregister(toolName: string): boolean {
    // Check if the tool exists
    if (!this.tools.has(toolName)) {
      return false;
    }
    
    // Unregister the tool
    this.tools.delete(toolName);
    
    // Call the onUnregister callback if provided
    if (this.onUnregister) {
      this.onUnregister(toolName);
    }
    
    return true;
  }
  
  /**
   * Get a tool from the registry
   * 
   * @param toolName The name of the tool to get
   * @returns The tool, or undefined if it doesn't exist
   */
  get(toolName: string): Tool | undefined {
    return this.tools.get(toolName);
  }
  
  /**
   * Get all tools from the registry
   * 
   * @returns An array of all tools
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  /**
   * Get all tool names from the registry
   * 
   * @returns An array of all tool names
   */
  getNames(): string[] {
    return Array.from(this.tools.keys());
  }
  
  /**
   * Check if a tool exists in the registry
   * 
   * @param toolName The name of the tool to check
   * @returns Whether the tool exists
   */
  has(toolName: string): boolean {
    return this.tools.has(toolName);
  }
  
  /**
   * Get the number of tools in the registry
   * 
   * @returns The number of tools
   */
  size(): number {
    return this.tools.size;
  }
  
  /**
   * Clear all tools from the registry
   */
  clear(): void {
    // Get all tool names
    const toolNames = this.getNames();
    
    // Unregister each tool
    for (const toolName of toolNames) {
      this.unregister(toolName);
    }
  }
  
  /**
   * Filter tools based on a predicate
   * 
   * @param predicate The predicate to filter by
   * @returns An array of tools that match the predicate
   */
  filter(predicate: (tool: Tool) => boolean): Tool[] {
    return this.getAll().filter(predicate);
  }
  
  /**
   * Find a tool based on a predicate
   * 
   * @param predicate The predicate to find by
   * @returns The first tool that matches the predicate, or undefined if none match
   */
  find(predicate: (tool: Tool) => boolean): Tool | undefined {
    return this.getAll().find(predicate);
  }
}

/**
 * Factory for creating ToolRegistry instances
 */
export class ToolRegistryFactory {
  /**
   * Create a new ToolRegistry
   * 
   * @param options Options for the registry
   * @returns A new ToolRegistry instance
   */
  static create(options: ToolRegistryOptions = {}): ToolRegistry {
    return new ToolRegistry(options);
  }
  
  /**
   * Create a new ToolRegistry with default tools
   * 
   * @param options Options for the registry
   * @returns A new ToolRegistry instance with default tools
   */
  static withDefaultTools(options: {
    webSearchApiKey?: string;
    rootDir?: string;
  } = {}): ToolRegistry {
    const tools: Tool[] = [];
    
    // Add calculator tool
    tools.push(new CalculatorTool());
    
    // Add Wikipedia tool
    tools.push(new WikipediaTool());
    
    // Add web search tool if API key is provided
    if (options.webSearchApiKey) {
      tools.push(new WebSearchTool({
        apiKey: options.webSearchApiKey,
        searchEngine: 'google'
      }));
    }
    
    // Add file system tool if root directory is provided
    if (options.rootDir) {
      tools.push(new FileSystemTool({
        rootDir: options.rootDir,
        allowedOperations: ['read', 'list', 'exists']
      }));
    }
    
    return new ToolRegistry({
      initialTools: tools
    });
  }
}
