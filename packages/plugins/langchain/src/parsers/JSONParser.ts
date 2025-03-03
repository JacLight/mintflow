import { z } from 'zod';

/**
 * Parser for JSON output
 */
export class JSONParser {
  private schema?: z.ZodType;
  private parserOptions: {
    strict?: boolean;
    removeTrailingComma?: boolean;
  };

  /**
   * Create a new JSONParser
   * 
   * @param schema Optional Zod schema for validation
   * @param options Parser options
   */
  constructor(
    schema?: z.ZodType,
    options: {
      strict?: boolean;
      removeTrailingComma?: boolean;
    } = {}
  ) {
    this.schema = schema;
    this.parserOptions = {
      strict: options.strict ?? true,
      removeTrailingComma: options.removeTrailingComma ?? true,
    };
  }

  /**
   * Parse a string into a JSON object
   * 
   * @param text Text to parse
   * @returns Parsed JSON object
   */
  parse(text: string): any {
    try {
      // Extract JSON from text if it's embedded in other content
      const jsonString = this.extractJSON(text);
      
      // Parse JSON
      let parsed: any;
      
      if (this.parserOptions.removeTrailingComma) {
        // Remove trailing commas which are not valid in JSON but common in JavaScript
        const cleanedJson = this.removeTrailingCommas(jsonString);
        parsed = JSON.parse(cleanedJson);
      } else {
        parsed = JSON.parse(jsonString);
      }
      
      // Validate against schema if provided
      if (this.schema) {
        parsed = this.schema.parse(parsed);
      }
      
      return parsed;
    } catch (error) {
      if (this.parserOptions.strict) {
        throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // In non-strict mode, try to recover and return partial results
      return this.attemptRecovery(text);
    }
  }

  /**
   * Extract JSON from text
   * 
   * @param text Text that may contain JSON
   * @returns Extracted JSON string
   */
  private extractJSON(text: string): string {
    // Look for JSON objects in the text
    const jsonRegex = /\{(?:[^{}]|(\{(?:[^{}]|(\{(?:[^{}]|(\{[^{}]*\}))*\}))*\}))*\}/g;
    const jsonMatches = text.match(jsonRegex);
    
    if (jsonMatches && jsonMatches.length > 0) {
      // Return the largest JSON object found (assuming it's the main one)
      return jsonMatches.reduce((a, b) => a.length > b.length ? a : b);
    }
    
    // Look for JSON arrays
    const arrayRegex = /\[(?:[^\[\]]|(\[(?:[^\[\]]|(\[(?:[^\[\]]|(\[[^\[\]]*\]))*\]))*\]))*\]/g;
    const arrayMatches = text.match(arrayRegex);
    
    if (arrayMatches && arrayMatches.length > 0) {
      // Return the largest JSON array found
      return arrayMatches.reduce((a, b) => a.length > b.length ? a : b);
    }
    
    // If no JSON object or array is found, return the original text
    return text;
  }

  /**
   * Remove trailing commas from JSON string
   * 
   * @param jsonString JSON string that may contain trailing commas
   * @returns Cleaned JSON string
   */
  private removeTrailingCommas(jsonString: string): string {
    // Replace trailing commas in objects
    let cleaned = jsonString.replace(/,\s*}/g, '}');
    
    // Replace trailing commas in arrays
    cleaned = cleaned.replace(/,\s*\]/g, ']');
    
    return cleaned;
  }

  /**
   * Attempt to recover from JSON parsing errors
   * 
   * @param text Text to parse
   * @returns Partially parsed JSON or null
   */
  private attemptRecovery(text: string): any {
    try {
      // Try to extract valid JSON parts
      const jsonString = this.extractJSON(text);
      
      // Try to fix common JSON errors
      const fixedJson = this.fixCommonJsonErrors(jsonString);
      
      // Parse the fixed JSON
      return JSON.parse(fixedJson);
    } catch (error) {
      console.error("Failed to recover JSON:", error);
      
      // If all recovery attempts fail, return null
      return null;
    }
  }

  /**
   * Fix common JSON errors
   * 
   * @param jsonString JSON string with potential errors
   * @returns Fixed JSON string
   */
  private fixCommonJsonErrors(jsonString: string): string {
    let fixed = jsonString;
    
    // Remove trailing commas
    fixed = this.removeTrailingCommas(fixed);
    
    // Fix unquoted property names
    fixed = fixed.replace(/(\w+)(?=\s*:)/g, '"$1"');
    
    // Fix single quotes
    fixed = fixed.replace(/'/g, '"');
    
    // Fix missing quotes around string values
    fixed = fixed.replace(/:(\s*)([a-zA-Z0-9_]+)(\s*[,}])/g, ':"$2"$3');
    
    return fixed;
  }

  /**
   * Get format instructions for the parser
   * 
   * @returns Format instructions string
   */
  getFormatInstructions(): string {
    let instructions = "Your response should be formatted as a JSON object.";
    
    if (this.schema) {
      instructions += " The JSON should conform to the following schema:\n\n";
      instructions += JSON.stringify(this.schema.describe(), null, 2);
    }
    
    return instructions;
  }
}

/**
 * Factory for creating JSONParser instances
 */
export class JSONParserFactory {
  /**
   * Create a new JSONParser
   * 
   * @param schema Optional Zod schema for validation
   * @param options Parser options
   * @returns A new JSONParser instance
   */
  static create(
    schema?: z.ZodType,
    options: {
      strict?: boolean;
      removeTrailingComma?: boolean;
    } = {}
  ): JSONParser {
    return new JSONParser(schema, options);
  }
}
