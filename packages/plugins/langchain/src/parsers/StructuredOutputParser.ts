import { z } from 'zod';
import { JSONParser } from './JSONParser.js';

/**
 * Parser for structured output based on a schema
 */
export class StructuredOutputParser {
  private schema: z.ZodObject<any>;
  private jsonParser: JSONParser;
  private parserOptions: {
    strict?: boolean;
  };

  /**
   * Create a new StructuredOutputParser
   * 
   * @param schema Zod schema for validation
   * @param options Parser options
   */
  constructor(
    schema: z.ZodObject<any>,
    options: {
      strict?: boolean;
    } = {}
  ) {
    this.schema = schema;
    this.parserOptions = {
      strict: options.strict ?? true,
    };
    this.jsonParser = new JSONParser(schema, {
      strict: this.parserOptions.strict,
      removeTrailingComma: true,
    });
  }

  /**
   * Parse a string into a structured object
   * 
   * @param text Text to parse
   * @returns Parsed structured object
   */
  parse(text: string): any {
    try {
      // Use JSONParser to parse the text
      return this.jsonParser.parse(text);
    } catch (error) {
      if (this.parserOptions.strict) {
        throw new Error(`Failed to parse structured output: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // In non-strict mode, try to recover
      return this.attemptRecovery(text);
    }
  }

  /**
   * Attempt to recover from parsing errors
   * 
   * @param text Text to parse
   * @returns Partially parsed object or empty object
   */
  private attemptRecovery(text: string): any {
    try {
      // Try to extract key-value pairs from the text
      const keyValuePairs = this.extractKeyValuePairs(text);
      
      // Create an object from the key-value pairs
      const partialObject = Object.fromEntries(keyValuePairs);
      
      // Validate against schema with partial validation
      return this.schema.partial().parse(partialObject);
    } catch (error) {
      console.error("Failed to recover structured output:", error);
      
      // If all recovery attempts fail, return an empty object
      return {};
    }
  }

  /**
   * Extract key-value pairs from text
   * 
   * @param text Text that may contain key-value pairs
   * @returns Array of key-value pairs
   */
  private extractKeyValuePairs(text: string): [string, any][] {
    const pairs: [string, any][] = [];
    
    // Get expected keys from schema
    const schemaShape = this.schema.shape;
    if (!schemaShape) {
      return pairs;
    }
    
    const expectedKeys = Object.keys(schemaShape);
    
    // Look for key-value patterns in the text
    for (const key of expectedKeys) {
      // Try different patterns for key-value pairs
      const patterns = [
        // "key: value" pattern
        new RegExp(`${key}\\s*:\\s*([^\\n]+)`, 'i'),
        // "key = value" pattern
        new RegExp(`${key}\\s*=\\s*([^\\n]+)`, 'i'),
        // "key - value" pattern
        new RegExp(`${key}\\s*-\\s*([^\\n]+)`, 'i'),
        // "key" followed by value on next line
        new RegExp(`${key}\\s*\\n\\s*([^\\n]+)`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const value = match[1].trim();
          
          // Try to parse the value based on the expected type
          const parsedValue = this.parseValue(value);
          
          if (parsedValue !== undefined) {
            pairs.push([key, parsedValue]);
            break;
          }
        }
      }
    }
    
    return pairs;
  }

  /**
   * Parse a value based on its expected type
   * 
   * @param value Value to parse
   * @returns Parsed value
   */
  private parseValue(value: string): any {
    try {
      // Try to parse as JSON first
      try {
        return JSON.parse(value);
      } catch {
        // Not valid JSON, continue with other parsing methods
      }
      
      // Check for boolean values
      if (value.toLowerCase() === 'true') {
        return true;
      }
      if (value.toLowerCase() === 'false') {
        return false;
      }
      
      // Check for number values
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        return Number(value);
      }
      
      // Check for array values
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          return JSON.parse(value);
        } catch {
          // Not a valid JSON array, try comma-separated values
          return value.slice(1, -1).split(',').map(item => item.trim());
        }
      }
      
      // Default to string
      return value;
    } catch (error) {
      console.error("Error parsing value:", error);
      return undefined;
    }
  }

  /**
   * Get format instructions for the parser
   * 
   * @returns Format instructions string
   */
  getFormatInstructions(): string {
    let instructions = "Your response should be formatted as a JSON object with the following structure:\n\n";
    
    // Get schema description
    const schemaShape = this.schema.shape;
    if (schemaShape) {
      const example: Record<string, any> = {};
      
      // Create an example object based on the schema
      for (const key of Object.keys(schemaShape)) {
        // Use simple example values based on common types
        example[key] = "value";
      }
      
      // Add the example to the instructions
      instructions += "```json\n";
      instructions += JSON.stringify(example, null, 2);
      instructions += "\n```\n\n";
    }
    
    instructions += "All fields are required unless explicitly marked as optional.";
    
    return instructions;
  }
}

/**
 * Factory for creating StructuredOutputParser instances
 */
export class StructuredOutputParserFactory {
  /**
   * Create a new StructuredOutputParser
   * 
   * @param schema Zod schema for validation
   * @param options Parser options
   * @returns A new StructuredOutputParser instance
   */
  static create(
    schema: z.ZodObject<any>,
    options: {
      strict?: boolean;
    } = {}
  ): StructuredOutputParser {
    return new StructuredOutputParser(schema, options);
  }
}
