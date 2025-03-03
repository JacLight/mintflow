/**
 * Output parsers for LangChain
 * 
 * This module provides parsers for various output formats from LLMs.
 */

// Export parsers
export { JSONParser, JSONParserFactory } from './JSONParser.js';
export { XMLParser, XMLParserFactory } from './XMLParser.js';
export { CSVParser, CSVParserFactory } from './CSVParser.js';
export { ListParser, ListParserFactory } from './ListParser.js';
export { StructuredOutputParser, StructuredOutputParserFactory } from './StructuredOutputParser.js';
export { 
  CustomOutputParser, 
  CustomOutputParserFactory,
  type ParserFunction,
  type FormatInstructionFunction
} from './CustomOutputParser.js';

// Export types
export interface OutputParser<T = any> {
  parse(text: string): T;
  getFormatInstructions(): string;
}
