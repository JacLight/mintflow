import { z } from 'zod';

/**
 * Parser for CSV output
 */
export class CSVParser {
  private schema?: z.ZodType;
  private parserOptions: {
    delimiter?: string;
    header?: boolean;
    skipEmptyLines?: boolean;
    trimValues?: boolean;
  };

  /**
   * Create a new CSVParser
   * 
   * @param schema Optional Zod schema for validation
   * @param options Parser options
   */
  constructor(
    schema?: z.ZodType,
    options: {
      delimiter?: string;
      header?: boolean;
      skipEmptyLines?: boolean;
      trimValues?: boolean;
    } = {}
  ) {
    this.schema = schema;
    this.parserOptions = {
      delimiter: options.delimiter ?? ',',
      header: options.header ?? true,
      skipEmptyLines: options.skipEmptyLines ?? true,
      trimValues: options.trimValues ?? true,
    };
  }

  /**
   * Parse a string into a CSV object
   * 
   * @param text Text to parse
   * @returns Parsed CSV data as an array of objects or arrays
   */
  parse(text: string): any[] {
    try {
      // Extract CSV from text if it's embedded in other content
      const csvString = this.extractCSV(text);
      
      // Parse CSV
      const parsed = this.parseCSV(csvString);
      
      // Validate against schema if provided
      if (this.schema) {
        return this.schema.parse(parsed);
      }
      
      return parsed;
    } catch (error) {
      console.error("CSV parsing error:", error);
      return [];
    }
  }

  /**
   * Extract CSV from text
   * 
   * @param text Text that may contain CSV
   * @returns Extracted CSV string
   */
  private extractCSV(text: string): string {
    // Look for CSV-like content in the text
    // This is a simple heuristic that looks for lines with consistent delimiters
    const lines = text.split('\n');
    
    // Filter out lines that don't look like CSV
    const csvLines = lines.filter(line => {
      // Skip empty lines if configured to do so
      if (this.parserOptions.skipEmptyLines && line.trim() === '') {
        return false;
      }
      
      // Count delimiters in the line
      const delimiterCount = (line.match(new RegExp(this.escapeRegExp(this.parserOptions.delimiter!), 'g')) || []).length;
      
      // Lines with at least one delimiter are considered CSV
      return delimiterCount > 0;
    });
    
    return csvLines.join('\n');
  }

  /**
   * Parse CSV string into an array of objects or arrays
   * 
   * @param csvString CSV string
   * @returns Parsed CSV data
   */
  private parseCSV(csvString: string): any[] {
    // Split into lines
    const lines = csvString.split('\n').filter(line => 
      !(this.parserOptions.skipEmptyLines && line.trim() === '')
    );
    
    if (lines.length === 0) {
      return [];
    }
    
    // Parse each line into fields
    const rows = lines.map(line => {
      return this.parseCSVLine(line);
    });
    
    // If header is true, use the first row as headers
    if (this.parserOptions.header && rows.length > 1) {
      const headers = rows[0];
      const data = rows.slice(1);
      
      // Convert to array of objects
      return data.map(row => {
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
          if (index < row.length) {
            obj[header] = row[index];
          }
        });
        return obj;
      });
    }
    
    // Return as array of arrays
    return rows;
  }

  /**
   * Parse a single CSV line into an array of fields
   * 
   * @param line CSV line
   * @returns Array of fields
   */
  private parseCSVLine(line: string): string[] {
    const delimiter = this.parserOptions.delimiter!;
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = i < line.length - 1 ? line[i + 1] : '';
      
      // Handle quotes
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip the next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      }
      // Handle delimiters
      else if (char === delimiter && !inQuotes) {
        // End of field
        fields.push(this.parserOptions.trimValues ? currentField.trim() : currentField);
        currentField = '';
      }
      // Handle other characters
      else {
        currentField += char;
      }
    }
    
    // Add the last field
    fields.push(this.parserOptions.trimValues ? currentField.trim() : currentField);
    
    return fields;
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
   * Convert an array of objects or arrays to a CSV string
   * 
   * @param data Data to convert
   * @returns CSV string
   */
  build(data: any[]): string {
    if (data.length === 0) {
      return '';
    }
    
    const delimiter = this.parserOptions.delimiter!;
    
    // Check if data is an array of objects
    const isArrayOfObjects = typeof data[0] === 'object' && !Array.isArray(data[0]);
    
    if (isArrayOfObjects && this.parserOptions.header) {
      // Get headers from the first object
      const headers = Object.keys(data[0]);
      
      // Build header row
      const headerRow = headers.map(header => this.escapeCSVField(header)).join(delimiter);
      
      // Build data rows
      const dataRows = data.map(row => {
        return headers.map(header => {
          const value = row[header];
          return this.escapeCSVField(value !== undefined ? String(value) : '');
        }).join(delimiter);
      });
      
      // Combine header and data rows
      return [headerRow, ...dataRows].join('\n');
    } else {
      // Build data rows for array of arrays
      return data.map(row => {
        if (Array.isArray(row)) {
          return row.map(field => this.escapeCSVField(String(field))).join(delimiter);
        } else {
          return this.escapeCSVField(String(row));
        }
      }).join('\n');
    }
  }

  /**
   * Escape a field for CSV output
   * 
   * @param field Field to escape
   * @returns Escaped field
   */
  private escapeCSVField(field: string): string {
    const delimiter = this.parserOptions.delimiter!;
    
    // If the field contains a delimiter, a quote, or a newline, wrap it in quotes
    if (field.includes(delimiter) || field.includes('"') || field.includes('\n')) {
      // Escape quotes by doubling them
      const escapedField = field.replace(/"/g, '""');
      return `"${escapedField}"`;
    }
    
    return field;
  }

  /**
   * Get format instructions for the parser
   * 
   * @returns Format instructions string
   */
  getFormatInstructions(): string {
    let instructions = "Your response should be formatted as a CSV table.";
    
    if (this.parserOptions.header) {
      instructions += " The first row should contain column headers.";
    }
    
    instructions += ` Use '${this.parserOptions.delimiter}' as the delimiter between fields.`;
    
    if (this.schema) {
      instructions += " The CSV should conform to the provided schema.";
    }
    
    return instructions;
  }
}

/**
 * Factory for creating CSVParser instances
 */
export class CSVParserFactory {
  /**
   * Create a new CSVParser
   * 
   * @param schema Optional Zod schema for validation
   * @param options Parser options
   * @returns A new CSVParser instance
   */
  static create(
    schema?: z.ZodType,
    options: {
      delimiter?: string;
      header?: boolean;
      skipEmptyLines?: boolean;
      trimValues?: boolean;
    } = {}
  ): CSVParser {
    return new CSVParser(schema, options);
  }
}
