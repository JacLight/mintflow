/**
 * Tools for LangChain
 * 
 * This module provides various tools that can be used by agents to interact with external systems.
 */

// Import tool interfaces and classes
import { Tool, BaseTool, FunctionTool } from './Tool.js';
import { 
  WebSearchTool, 
  WebSearchToolFactory, 
  type WebSearchToolOptions,
  type SearchResult
} from './WebSearchTool.js';
import { 
  CalculatorTool, 
  CalculatorToolFactory, 
  type CalculatorToolOptions 
} from './CalculatorTool.js';
import { 
  WikipediaTool, 
  WikipediaToolFactory, 
  type WikipediaToolOptions,
  type WikipediaResult
} from './WikipediaTool.js';
import { 
  FileSystemTool, 
  FileSystemToolFactory, 
  type FileSystemToolOptions 
} from './FileSystemTool.js';

// Export tool interfaces and base classes
export { BaseTool, FunctionTool };
export type { Tool };

// Export web search tool
export { 
  WebSearchTool, 
  WebSearchToolFactory
};
export type { WebSearchToolOptions, SearchResult };

// Export calculator tool
export { 
  CalculatorTool, 
  CalculatorToolFactory
};
export type { CalculatorToolOptions };

// Export Wikipedia tool
export { 
  WikipediaTool, 
  WikipediaToolFactory
};
export type { WikipediaToolOptions, WikipediaResult };

// Export file system tool
export { 
  FileSystemTool, 
  FileSystemToolFactory
};
export type { FileSystemToolOptions };

/**
 * Create a set of default tools
 * 
 * @param options Options for the tools
 * @returns An array of default tools
 */
export function createDefaultTools(options: {
  webSearchApiKey?: string;
  rootDir?: string;
} = {}): Tool[] {
  const tools: Tool[] = [];
  
  // Add calculator tool
  tools.push(CalculatorToolFactory.safe());
  
  // Add Wikipedia tool
  tools.push(WikipediaToolFactory.create());
  
  // Add web search tool if API key is provided
  if (options.webSearchApiKey) {
    tools.push(WebSearchToolFactory.google(options.webSearchApiKey));
  }
  
  // Add file system tool if root directory is provided
  if (options.rootDir) {
    tools.push(FileSystemToolFactory.readOnly(options.rootDir));
  }
  
  return tools;
}
