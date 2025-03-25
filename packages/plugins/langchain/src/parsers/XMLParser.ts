import { z } from 'zod';

/**
 * Simple XML Parser
 */
export class XMLParser {
  private schema?: z.ZodType;
  private ignoreAttributes: boolean;
  private trimValues: boolean;

  /**
   * Create a new XMLParser
   * 
   * @param schema Optional Zod schema for validation
   * @param options Parser options
   */
  constructor(
    schema?: z.ZodType,
    options: {
      ignoreAttributes?: boolean;
      trimValues?: boolean;
    } = {}
  ) {
    this.schema = schema;
    this.ignoreAttributes = options.ignoreAttributes ?? false;
    this.trimValues = options.trimValues ?? true;
  }

  /**
   * Parse a string into an XML object
   * 
   * @param text Text to parse
   * @returns Parsed XML object
   */
  parse(text: string): any {
    try {
      // Very simple XML parsing
      const obj = this.parseXmlString(text);
      
      // Validate against schema if provided
      if (this.schema) {
        return this.schema.parse(obj);
      }
      
      return obj;
    } catch (error) {
      console.error("XML parsing error:", error);
      return {};
    }
  }

  /**
   * Convert a JavaScript object to XML
   * 
   * @param obj Object to convert
   * @returns XML string
   */
  build(obj: any): string {
    try {
      // Validate against schema if provided
      if (this.schema) {
        obj = this.schema.parse(obj);
      }
      
      // Convert JavaScript object to XML string
      return this.buildXmlString(obj);
    } catch (error) {
      throw new Error(`Failed to build XML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse XML string to JavaScript object
   * 
   * @param xml XML string
   * @returns JavaScript object
   */
  private parseXmlString(xml: string): any {
    // Clean up XML
    xml = xml.replace(/<\?xml.*?\?>/g, '').trim();
    
    if (!xml) {
      return {};
    }
    
    // Extract the first tag
    const firstTagMatch = xml.match(/<([^\s\/>]+)/);
    if (!firstTagMatch) {
      return {};
    }
    
    const rootTagName = firstTagMatch[1];
    const result: any = {};
    result[rootTagName] = {};
    
    // Check if it's a self-closing tag
    if (xml.includes('/>')) {
      // Extract attributes if needed
      if (!this.ignoreAttributes) {
        const attrMatch = xml.match(/<[^\s\/>]+([^>]*)\/>/);
        if (attrMatch && attrMatch[1]) {
          const attrs = this.parseAttributes(attrMatch[1]);
          if (Object.keys(attrs).length > 0) {
            result[rootTagName]['@attributes'] = attrs;
          }
        }
      }
      return result;
    }
    
    // Extract content between opening and closing tags
    const contentMatch = xml.match(new RegExp(`<${rootTagName}[^>]*>(.*?)</${rootTagName}>`, 's'));
    if (!contentMatch) {
      return result;
    }
    
    const content = contentMatch[1];
    
    // Extract attributes if needed
    if (!this.ignoreAttributes) {
      const attrMatch = xml.match(new RegExp(`<${rootTagName}([^>]*)>`));
      if (attrMatch && attrMatch[1]) {
        const attrs = this.parseAttributes(attrMatch[1]);
        if (Object.keys(attrs).length > 0) {
          result[rootTagName]['@attributes'] = attrs;
        }
      }
    }
    
    // Check if content has child tags
    if (/<[^>]+>/.test(content)) {
      // Simple child tag extraction
      const matches = [];
      
      // Use a safer approach to extract matches
      let tempContent = content;
      while (tempContent.length > 0) {
        const tagStart = tempContent.indexOf('<');
        if (tagStart === -1) break;
        
        // Skip if it's a closing tag
        if (tempContent.charAt(tagStart + 1) === '/') {
          tempContent = tempContent.substring(tagStart + 1);
          continue;
        }
        
        // Find tag name
        const tagNameEnd = Math.min(
          tempContent.indexOf(' ', tagStart + 1) !== -1 ? tempContent.indexOf(' ', tagStart + 1) : Number.MAX_SAFE_INTEGER,
          tempContent.indexOf('>', tagStart + 1) !== -1 ? tempContent.indexOf('>', tagStart + 1) : Number.MAX_SAFE_INTEGER,
          tempContent.indexOf('/', tagStart + 1) !== -1 ? tempContent.indexOf('/', tagStart + 1) : Number.MAX_SAFE_INTEGER
        );
        
        if (tagNameEnd === Number.MAX_SAFE_INTEGER) {
          tempContent = tempContent.substring(tagStart + 1);
          continue;
        }
        
        const tagName = tempContent.substring(tagStart + 1, tagNameEnd);
        
        // Find closing tag or self-closing tag
        const selfClosingEnd = tempContent.indexOf('/>', tagStart);
        const closingTagStart = tempContent.indexOf(`</${tagName}>`, tagStart);
        
        if (selfClosingEnd !== -1 && (closingTagStart === -1 || selfClosingEnd < closingTagStart)) {
          // Self-closing tag
          const endPos = selfClosingEnd + 2;
          matches.push(tempContent.substring(tagStart, endPos));
          tempContent = tempContent.substring(endPos);
        } else if (closingTagStart !== -1) {
          // Normal tag
          const endPos = closingTagStart + tagName.length + 3; // +3 for </> characters
          matches.push(tempContent.substring(tagStart, endPos));
          tempContent = tempContent.substring(endPos);
        } else {
          // Invalid tag, skip it
          tempContent = tempContent.substring(tagStart + 1);
        }
      }
      
      // Process child tags
      for (const childTag of matches) {
        const childObj = this.parseXmlString(childTag);
        
        // Add to parent
        for (const key in childObj) {
          if (result[rootTagName][key]) {
            if (!Array.isArray(result[rootTagName][key])) {
              result[rootTagName][key] = [result[rootTagName][key]];
            }
            result[rootTagName][key].push(childObj[key]);
          } else {
            result[rootTagName][key] = childObj[key];
          }
        }
      }
      
      // Check if there's text content mixed with tags
      // Use a simpler approach to extract text content
      let textContent = '';
      let textTempContent = content;
      
      // Remove all tags
      while (textTempContent.length > 0) {
        const tagStart = textTempContent.indexOf('<');
        if (tagStart === -1) {
          // No more tags, add remaining content
          textContent += textTempContent;
          break;
        }
        
        // Add text before tag
        if (tagStart > 0) {
          textContent += textTempContent.substring(0, tagStart);
        }
        
        // Find end of tag
        const tagEnd = textTempContent.indexOf('>', tagStart);
        if (tagEnd === -1) {
          // Invalid tag, break
          break;
        }
        
        // Move past this tag
        textTempContent = textTempContent.substring(tagEnd + 1);
      }
      
      // Add text content if not empty
      textContent = textContent.trim();
      if (textContent) {
        result[rootTagName]['#text'] = this.trimValues ? textContent.trim() : textContent;
      }
    } else {
      // Just text content
      result[rootTagName]['#text'] = this.trimValues ? content.trim() : content;
    }
    
    return result;
  }

  /**
   * Parse attributes from a string
   * 
   * @param attrString Attribute string
   * @returns Attributes object
   */
  private parseAttributes(attrString: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    
    // Simple attribute extraction using a different approach
    const attrPairs = attrString.match(/([^\s=]+)=["']([^"']*)["']/g) || [];
    
    for (const pair of attrPairs) {
      const equalPos = pair.indexOf('=');
      if (equalPos > 0) {
        const name = pair.substring(0, equalPos).trim();
        let value = pair.substring(equalPos + 1).trim();
        
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        
        attrs[name] = value;
      }
    }
    
    return attrs;
  }

  /**
   * Build XML string from JavaScript object
   * 
   * @param obj JavaScript object
   * @param nodeName Optional node name
   * @returns XML string
   */
  private buildXmlString(obj: any, nodeName: string = 'root'): string {
    let xml = '';
    
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      xml = `<${nodeName}>${obj}</${nodeName}>`;
    } else if (Array.isArray(obj)) {
      for (const item of obj) {
        xml += this.buildXmlString(item, nodeName);
      }
    } else if (typeof obj === 'object') {
      let attrs = '';
      let content = '';
      
      for (const prop in obj) {
        if (prop === '@attributes') {
          for (const attr in obj[prop]) {
            attrs += ` ${attr}="${obj[prop][attr]}"`;
          }
        } else if (prop === '#text') {
          content += obj[prop];
        } else {
          content += this.buildXmlString(obj[prop], prop);
        }
      }
      
      if (content === '') {
        xml = `<${nodeName}${attrs}/>`;
      } else {
        xml = `<${nodeName}${attrs}>${content}</${nodeName}>`;
      }
    }
    
    return xml;
  }

  /**
   * Get format instructions for the parser
   * 
   * @returns Format instructions string
   */
  getFormatInstructions(): string {
    let instructions = "Your response should be formatted as an XML document.";
    
    if (this.schema) {
      instructions += " The XML should conform to the provided schema.";
    }
    
    return instructions;
  }
}

/**
 * Factory for creating XMLParser instances
 */
export class XMLParserFactory {
  /**
   * Create a new XMLParser
   * 
   * @param schema Optional Zod schema for validation
   * @param options Parser options
   * @returns A new XMLParser instance
   */
  static create(
    schema?: z.ZodType,
    options: {
      ignoreAttributes?: boolean;
      trimValues?: boolean;
    } = {}
  ): XMLParser {
    return new XMLParser(schema, options);
  }
}
