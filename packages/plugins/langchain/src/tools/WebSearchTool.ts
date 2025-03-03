import { BaseTool } from './Tool.js';

/**
 * Options for WebSearchTool
 */
export interface WebSearchToolOptions {
  /**
   * The API key for the search engine
   */
  apiKey: string;
  
  /**
   * The search engine to use
   * Supported values: 'google', 'bing', 'duckduckgo'
   */
  searchEngine?: 'google' | 'bing' | 'duckduckgo';
  
  /**
   * The maximum number of results to return
   */
  maxResults?: number;
  
  /**
   * Optional callback to call before executing the search
   */
  onSearch?: (query: string) => void;
  
  /**
   * Optional callback to call after executing the search
   */
  onResults?: (results: SearchResult[]) => void;
}

/**
 * Interface for a search result
 */
export interface SearchResult {
  /**
   * The title of the search result
   */
  title: string;
  
  /**
   * The URL of the search result
   */
  url: string;
  
  /**
   * The snippet of the search result
   */
  snippet: string;
}

/**
 * A tool that performs web searches
 */
export class WebSearchTool extends BaseTool {
  private apiKey: string;
  private searchEngine: 'google' | 'bing' | 'duckduckgo';
  private maxResults: number;
  private onSearch?: (query: string) => void;
  private onResults?: (results: SearchResult[]) => void;
  
  /**
   * Create a new WebSearchTool
   * 
   * @param options Options for the tool
   */
  constructor(options: WebSearchToolOptions) {
    super(
      'web_search',
      'Search the web for information. Use this when you need to find information about recent events, specific facts, or any information that you don\'t have.',
      {
        type: 'string',
        description: 'The search query'
      }
    );
    
    this.apiKey = options.apiKey;
    this.searchEngine = options.searchEngine || 'google';
    this.maxResults = options.maxResults || 5;
    this.onSearch = options.onSearch;
    this.onResults = options.onResults;
  }
  
  /**
   * Execute the tool with the given input
   * 
   * @param input The search query
   * @returns The search results
   */
  async execute(input: string): Promise<string> {
    // Call the onSearch callback if provided
    if (this.onSearch) {
      this.onSearch(input);
    }
    
    try {
      // Perform the search
      const results = await this.search(input);
      
      // Call the onResults callback if provided
      if (this.onResults) {
        this.onResults(results);
      }
      
      // Format the results
      return this.formatResults(results);
    } catch (error) {
      return `Error performing web search: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  /**
   * Perform a search with the given query
   * 
   * @param query The search query
   * @returns The search results
   */
  private async search(query: string): Promise<SearchResult[]> {
    // In a real implementation, this would make an API call to the search engine
    // For now, we'll simulate a search with mock results
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock results
    return [
      {
        title: 'Example Search Result 1',
        url: 'https://example.com/1',
        snippet: 'This is an example search result that matches the query: ' + query
      },
      {
        title: 'Example Search Result 2',
        url: 'https://example.com/2',
        snippet: 'Another example search result for the query: ' + query
      },
      {
        title: 'Example Search Result 3',
        url: 'https://example.com/3',
        snippet: 'A third example search result related to: ' + query
      }
    ].slice(0, this.maxResults);
  }
  
  /**
   * Format the search results as a string
   * 
   * @param results The search results
   * @returns The formatted results
   */
  private formatResults(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No results found.';
    }
    
    return results.map((result, index) => {
      return `[${index + 1}] ${result.title}\n${result.url}\n${result.snippet}`;
    }).join('\n\n');
  }
}

/**
 * Factory for creating WebSearchTool instances
 */
export class WebSearchToolFactory {
  /**
   * Create a new WebSearchTool
   * 
   * @param options Options for the tool
   * @returns A new WebSearchTool instance
   */
  static create(options: WebSearchToolOptions): WebSearchTool {
    return new WebSearchTool(options);
  }
  
  /**
   * Create a new WebSearchTool with Google search
   * 
   * @param apiKey The API key for Google Custom Search
   * @param maxResults The maximum number of results to return
   * @returns A new WebSearchTool instance
   */
  static google(apiKey: string, maxResults: number = 5): WebSearchTool {
    return new WebSearchTool({
      apiKey,
      searchEngine: 'google',
      maxResults
    });
  }
  
  /**
   * Create a new WebSearchTool with Bing search
   * 
   * @param apiKey The API key for Bing Search
   * @param maxResults The maximum number of results to return
   * @returns A new WebSearchTool instance
   */
  static bing(apiKey: string, maxResults: number = 5): WebSearchTool {
    return new WebSearchTool({
      apiKey,
      searchEngine: 'bing',
      maxResults
    });
  }
}
