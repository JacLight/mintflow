import { z } from 'zod';

/**
 * Interface for custom parser functions
 */
export interface ParserFunction<T = any> {
  (text: string): T;
}

/**
 * Interface for format instruction functions
 */
export interface FormatInstructionFunction {
  (): string;
}

/**
 * Parser for custom output formats
 */
export class CustomOutputParser<T = any> {
  private parserFn: ParserFunction<T>;
  private formatInstructionFn?: FormatInstructionFunction;
  private schema?: z.ZodType;

  /**
   * Create a new CustomOutputParser
   * 
   * @param parserFn Function to parse text into the desired format
   * @param formatInstructionFn Optional function to generate format instructions
   * @param schema Optional Zod schema for validation
   */
  constructor(
    parserFn: ParserFunction<T>,
    formatInstructionFn?: FormatInstructionFunction,
    schema?: z.ZodType
  ) {
    this.parserFn = parserFn;
    this.formatInstructionFn = formatInstructionFn;
    this.schema = schema;
  }

  /**
   * Parse a string into the desired format
   * 
   * @param text Text to parse
   * @returns Parsed output
   */
  parse(text: string): T {
    try {
      // Parse the text using the provided parser function
      const parsed = this.parserFn(text);
      
      // Validate against schema if provided
      if (this.schema) {
        return this.schema.parse(parsed);
      }
      
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse output: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get format instructions for the parser
   * 
   * @returns Format instructions string
   */
  getFormatInstructions(): string {
    if (this.formatInstructionFn) {
      return this.formatInstructionFn();
    }
    
    return "Please format your response according to the specified requirements.";
  }
}

/**
 * Factory for creating CustomOutputParser instances
 */
export class CustomOutputParserFactory {
  /**
   * Create a new CustomOutputParser
   * 
   * @param parserFn Function to parse text into the desired format
   * @param formatInstructionFn Optional function to generate format instructions
   * @param schema Optional Zod schema for validation
   * @returns A new CustomOutputParser instance
   */
  static create<T = any>(
    parserFn: ParserFunction<T>,
    formatInstructionFn?: FormatInstructionFunction,
    schema?: z.ZodType
  ): CustomOutputParser<T> {
    return new CustomOutputParser(parserFn, formatInstructionFn, schema);
  }

  /**
   * Create a regex-based parser
   * 
   * @param regex Regular expression with capture groups
   * @param outputTemplate Template for the output, using {0}, {1}, etc. for capture groups
   * @param formatInstructions Optional format instructions
   * @returns A new CustomOutputParser instance
   */
  static fromRegex(
    regex: RegExp,
    outputTemplate: string | ((matches: RegExpExecArray) => any),
    formatInstructions?: string
  ): CustomOutputParser {
    const parserFn = (text: string): any => {
      const matches = regex.exec(text);
      if (!matches) {
        throw new Error(`Text does not match the provided regex pattern: ${regex}`);
      }
      
      if (typeof outputTemplate === 'function') {
        return outputTemplate(matches);
      }
      
      // Replace {0}, {1}, etc. with the corresponding capture group
      return outputTemplate.replace(/\{(\d+)\}/g, (_, index) => {
        const groupIndex = parseInt(index, 10);
        return matches[groupIndex] || '';
      });
    };
    
    const formatInstructionFn = formatInstructions
      ? () => formatInstructions
      : undefined;
    
    return new CustomOutputParser(parserFn, formatInstructionFn);
  }

  /**
   * Create a parser that extracts specific fields using regex patterns
   * 
   * @param patterns Object mapping field names to regex patterns
   * @param formatInstructions Optional format instructions
   * @returns A new CustomOutputParser instance
   */
  static fromPatterns(
    patterns: Record<string, RegExp>,
    formatInstructions?: string
  ): CustomOutputParser<Record<string, string>> {
    const parserFn = (text: string): Record<string, string> => {
      const result: Record<string, string> = {};
      
      for (const [field, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        if (match && match[1]) {
          result[field] = match[1].trim();
        }
      }
      
      return result;
    };
    
    const formatInstructionFn = formatInstructions
      ? () => formatInstructions
      : () => {
          let instructions = "Please include the following information in your response:\n\n";
          
          for (const field of Object.keys(patterns)) {
            instructions += `- ${field}\n`;
          }
          
          return instructions;
        };
    
    return new CustomOutputParser(parserFn, formatInstructionFn);
  }

  /**
   * Create a parser that splits text into lines or chunks
   * 
   * @param separator Separator to split the text (default: '\n')
   * @param trim Whether to trim each line (default: true)
   * @param filter Optional filter function to exclude certain lines
   * @param formatInstructions Optional format instructions
   * @returns A new CustomOutputParser instance
   */
  static fromSeparator(
    separator: string = '\n',
    trim: boolean = true,
    filter?: (line: string) => boolean,
    formatInstructions?: string
  ): CustomOutputParser<string[]> {
    const parserFn = (text: string): string[] => {
      let lines = text.split(separator);
      
      if (trim) {
        lines = lines.map(line => line.trim());
      }
      
      if (filter) {
        lines = lines.filter(filter);
      }
      
      return lines;
    };
    
    const formatInstructionFn = formatInstructions
      ? () => formatInstructions
      : () => `Please provide your response with each item separated by "${separator}".`;
    
    return new CustomOutputParser(parserFn, formatInstructionFn);
  }
}
