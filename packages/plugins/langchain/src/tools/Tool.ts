/**
 * Interface for a tool that can be used by an agent
 */
export interface Tool {
  /**
   * The name of the tool
   */
  name: string;
  
  /**
   * The description of the tool
   * This should explain what the tool does and when to use it
   */
  description: string;
  
  /**
   * Execute the tool with the given input
   * 
   * @param input The input to the tool
   * @returns The output of the tool
   */
  execute(input: string): Promise<string>;
  
  /**
   * Optional schema for the tool input
   * This can be used to validate the input before executing the tool
   */
  schema?: {
    /**
     * The type of the input
     */
    type: string;
    
    /**
     * Optional properties for object types
     */
    properties?: Record<string, any>;
    
    /**
     * Optional required properties for object types
     */
    required?: string[];
    
    /**
     * Optional description of the input
     */
    description?: string;
  };
}

/**
 * Base class for tools
 */
export abstract class BaseTool implements Tool {
  /**
   * The name of the tool
   */
  name: string;
  
  /**
   * The description of the tool
   */
  description: string;
  
  /**
   * Optional schema for the tool input
   */
  schema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    description?: string;
  };
  
  /**
   * Create a new tool
   * 
   * @param name The name of the tool
   * @param description The description of the tool
   * @param schema Optional schema for the tool input
   */
  constructor(
    name: string,
    description: string,
    schema?: {
      type: string;
      properties?: Record<string, any>;
      required?: string[];
      description?: string;
    }
  ) {
    this.name = name;
    this.description = description;
    this.schema = schema;
  }
  
  /**
   * Execute the tool with the given input
   * 
   * @param input The input to the tool
   * @returns The output of the tool
   */
  abstract execute(input: string): Promise<string>;
  
  /**
   * Get the tool as a JSON object
   * 
   * @returns The tool as a JSON object
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      description: this.description,
      schema: this.schema
    };
  }
}

/**
 * Function tool that uses a callback function to execute
 */
export class FunctionTool extends BaseTool {
  private func: (input: string) => Promise<string> | string;
  
  /**
   * Create a new function tool
   * 
   * @param name The name of the tool
   * @param description The description of the tool
   * @param func The function to execute
   * @param schema Optional schema for the tool input
   */
  constructor(
    name: string,
    description: string,
    func: (input: string) => Promise<string> | string,
    schema?: {
      type: string;
      properties?: Record<string, any>;
      required?: string[];
      description?: string;
    }
  ) {
    super(name, description, schema);
    this.func = func;
  }
  
  /**
   * Execute the tool with the given input
   * 
   * @param input The input to the tool
   * @returns The output of the tool
   */
  async execute(input: string): Promise<string> {
    return await Promise.resolve(this.func(input));
  }
}
