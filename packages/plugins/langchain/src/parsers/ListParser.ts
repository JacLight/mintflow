import { z } from 'zod';

/**
 * Parser for list output
 */
export class ListParser {
  private schema?: z.ZodType;
  private parserOptions: {
    separator?: string;
    itemPrefix?: string;
    trimItems?: boolean;
    removeEmptyItems?: boolean;
  };

  /**
   * Create a new ListParser
   * 
   * @param schema Optional Zod schema for validation
   * @param options Parser options
   */
  constructor(
    schema?: z.ZodType,
    options: {
      separator?: string;
      itemPrefix?: string;
      trimItems?: boolean;
      removeEmptyItems?: boolean;
    } = {}
  ) {
    this.schema = schema;
    this.parserOptions = {
      separator: options.separator ?? '\n',
      itemPrefix: options.itemPrefix ?? '',
      trimItems: options.trimItems ?? true,
      removeEmptyItems: options.removeEmptyItems ?? true,
    };
  }

  /**
   * Parse a string into a list
   * 
   * @param text Text to parse
   * @returns Parsed list as an array
   */
  parse(text: string): string[] {
    try {
      // Extract list from text if it's embedded in other content
      const listString = this.extractList(text);
      
      // Split the text by the separator
      let items = listString.split(this.parserOptions.separator!);
      
      // Process items
      items = items.map(item => {
        // Remove item prefix if specified
        if (this.parserOptions.itemPrefix && item.startsWith(this.parserOptions.itemPrefix)) {
          item = item.substring(this.parserOptions.itemPrefix.length);
        }
        
        // Remove common list markers (numbers, bullets, etc.)
        item = this.removeListMarkers(item);
        
        // Trim whitespace if configured
        if (this.parserOptions.trimItems) {
          item = item.trim();
        }
        
        return item;
      });
      
      // Remove empty items if configured
      if (this.parserOptions.removeEmptyItems) {
        items = items.filter(item => item.trim() !== '');
      }
      
      // Validate against schema if provided
      if (this.schema) {
        return this.schema.parse(items);
      }
      
      return items;
    } catch (error) {
      console.error("List parsing error:", error);
      return [];
    }
  }

  /**
   * Extract list from text
   * 
   * @param text Text that may contain a list
   * @returns Extracted list string
   */
  private extractList(text: string): string {
    // Look for list-like content in the text
    const lines = text.split('\n');
    
    // Check for Markdown-style lists
    const markdownListRegex = /^(\s*)([-*+]|\d+\.)\s+/;
    const markdownListLines = lines.filter(line => markdownListRegex.test(line));
    
    if (markdownListLines.length > 0) {
      return markdownListLines.join('\n');
    }
    
    // Check for numbered lists (1. 2. 3. etc.)
    const numberedListRegex = /^\s*\d+\.\s+/;
    const numberedListLines = lines.filter(line => numberedListRegex.test(line));
    
    if (numberedListLines.length > 0) {
      return numberedListLines.join('\n');
    }
    
    // Check for bullet lists (• ◦ ‣ etc.)
    const bulletListRegex = /^\s*[•◦‣⁃⁌⁍⦾⦿⧫⧶⧸⨀⨁⨂⨃⨬⨭⨮⨯]\s+/;
    const bulletListLines = lines.filter(line => bulletListRegex.test(line));
    
    if (bulletListLines.length > 0) {
      return bulletListLines.join('\n');
    }
    
    // Check for custom prefix if specified
    if (this.parserOptions.itemPrefix) {
      const prefixRegex = new RegExp(`^\\s*${this.escapeRegExp(this.parserOptions.itemPrefix)}\\s*`);
      const prefixLines = lines.filter(line => prefixRegex.test(line));
      
      if (prefixLines.length > 0) {
        return prefixLines.join('\n');
      }
    }
    
    // If no list-like content is found, return the original text
    return text;
  }

  /**
   * Remove common list markers from a string
   * 
   * @param text Text that may contain list markers
   * @returns Text with list markers removed
   */
  private removeListMarkers(text: string): string {
    // Remove Markdown-style list markers
    let result = text.replace(/^\s*[-*+]\s+/, '');
    
    // Remove numbered list markers
    result = result.replace(/^\s*\d+\.\s+/, '');
    
    // Remove bullet list markers
    result = result.replace(/^\s*[•◦‣⁃⁌⁍⦾⦿⧫⧶⧸⨀⨁⨂⨃⨬⨭⨮⨯]\s+/, '');
    
    return result;
  }

  /**
   * Escape special characters in a string for use in a regular expression
   * 
   * @param string String to escape
   * @returns Escaped string
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Convert an array to a list string
   * 
   * @param items Items to convert
   * @returns List string
   */
  build(items: string[]): string {
    if (items.length === 0) {
      return '';
    }
    
    // Format each item
    const formattedItems = items.map(item => {
      // Add item prefix if specified
      if (this.parserOptions.itemPrefix) {
        return `${this.parserOptions.itemPrefix}${item}`;
      }
      
      return item;
    });
    
    // Join items with the separator
    return formattedItems.join(this.parserOptions.separator!);
  }

  /**
   * Get format instructions for the parser
   * 
   * @returns Format instructions string
   */
  getFormatInstructions(): string {
    let instructions = "Your response should be formatted as a list.";
    
    if (this.parserOptions.separator === '\n') {
      instructions += " Each item should be on a new line.";
    } else {
      instructions += ` Items should be separated by '${this.parserOptions.separator}'.`;
    }
    
    if (this.parserOptions.itemPrefix) {
      instructions += ` Each item should start with '${this.parserOptions.itemPrefix}'.`;
    }
    
    if (this.schema) {
      instructions += " The list should conform to the provided schema.";
    }
    
    return instructions;
  }
}

/**
 * Factory for creating ListParser instances
 */
export class ListParserFactory {
  /**
   * Create a new ListParser
   * 
   * @param schema Optional Zod schema for validation
   * @param options Parser options
   * @returns A new ListParser instance
   */
  static create(
    schema?: z.ZodType,
    options: {
      separator?: string;
      itemPrefix?: string;
      trimItems?: boolean;
      removeEmptyItems?: boolean;
    } = {}
  ): ListParser {
    return new ListParser(schema, options);
  }
}
