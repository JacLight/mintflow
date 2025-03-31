import { BaseTool } from './Tool.js';

/**
 * Options for WikipediaTool
 */
export interface WikipediaToolOptions {
  /**
   * The maximum number of search results to return
   */
  maxResults?: number;
  
  /**
   * The maximum number of characters to include in each article summary
   */
  maxSummaryLength?: number;
  
  /**
   * Optional callback to call before executing the search
   */
  onSearch?: (query: string) => void;
  
  /**
   * Optional callback to call after executing the search
   */
  onResults?: (results: WikipediaResult[]) => void;
  
  /**
   * Optional language code for Wikipedia
   * Default is 'en' for English
   */
  language?: string;
}

/**
 * Interface for a Wikipedia search result
 */
export interface WikipediaResult {
  /**
   * The title of the article
   */
  title: string;
  
  /**
   * The URL of the article
   */
  url: string;
  
  /**
   * The summary of the article
   */
  summary: string;
}

/**
 * A tool that searches Wikipedia for information
 */
export class WikipediaTool extends BaseTool {
  private maxResults: number;
  private maxSummaryLength: number;
  private onSearch?: (query: string) => void;
  private onResults?: (results: WikipediaResult[]) => void;
  private language: string;
  
  /**
   * Create a new WikipediaTool
   * 
   * @param options Options for the tool
   */
  constructor(options: WikipediaToolOptions = {}) {
    super(
      'wikipedia',
      'Search Wikipedia for information. Use this when you need to find factual information about a topic, person, place, event, or concept.',
      {
        type: 'string',
        description: 'The search query for Wikipedia'
      }
    );
    
    this.maxResults = options.maxResults || 3;
    this.maxSummaryLength = options.maxSummaryLength || 500;
    this.onSearch = options.onSearch;
    this.onResults = options.onResults;
    this.language = options.language || 'en';
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
      return `Error searching Wikipedia: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  /**
   * Perform a search with the given query
   * 
   * @param query The search query
   * @returns The search results
   */
  private async search(query: string): Promise<WikipediaResult[]> {
    // In a real implementation, this would make an API call to Wikipedia
    // For now, we'll simulate a search with mock results
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock results
    return [
      {
        title: query,
        url: `https://${this.language}.wikipedia.org/wiki/${encodeURIComponent(query.replace(/ /g, '_'))}`,
        summary: `This is a simulated Wikipedia summary for "${query}". In a real implementation, this would contain actual content from Wikipedia. The summary would provide key information about the topic, including its definition, history, and significance. Wikipedia is a free online encyclopedia, created and edited by volunteers around the world and hosted by the Wikimedia Foundation.`
      },
      {
        title: `History of ${query}`,
        url: `https://${this.language}.wikipedia.org/wiki/History_of_${encodeURIComponent(query.replace(/ /g, '_'))}`,
        summary: `This is a simulated Wikipedia summary for "History of ${query}". This article would typically cover the historical development and evolution of ${query} throughout different time periods and across various cultures or regions. It would include key milestones, influential figures, and significant events related to ${query}.`
      },
      {
        title: `${query} in popular culture`,
        url: `https://${this.language}.wikipedia.org/wiki/${encodeURIComponent(query.replace(/ /g, '_'))}_in_popular_culture`,
        summary: `This is a simulated Wikipedia summary for "${query} in popular culture". This article would discuss how ${query} has been represented and referenced in various forms of media, including literature, film, television, music, and art. It would highlight notable examples and analyze the cultural impact and significance of ${query} in contemporary society.`
      }
    ].slice(0, this.maxResults).map(result => ({
      ...result,
      summary: result.summary.length > this.maxSummaryLength
        ? result.summary.substring(0, this.maxSummaryLength) + '...'
        : result.summary
    }));
  }
  
  /**
   * Format the search results as a string
   * 
   * @param results The search results
   * @returns The formatted results
   */
  private formatResults(results: WikipediaResult[]): string {
    if (results.length === 0) {
      return 'No results found on Wikipedia.';
    }
    
    return results.map((result, index) => {
      return `[${index + 1}] ${result.title}\n${result.url}\n\n${result.summary}`;
    }).join('\n\n---\n\n');
  }
}

/**
 * Factory for creating WikipediaTool instances
 */
export class WikipediaToolFactory {
  /**
   * Create a new WikipediaTool
   * 
   * @param options Options for the tool
   * @returns A new WikipediaTool instance
   */
  static create(options: WikipediaToolOptions = {}): WikipediaTool {
    return new WikipediaTool(options);
  }
  
  /**
   * Create a new WikipediaTool with a specific language
   * 
   * @param language The language code for Wikipedia
   * @param maxResults The maximum number of results to return
   * @returns A new WikipediaTool instance
   */
  static withLanguage(language: string, maxResults: number = 3): WikipediaTool {
    return new WikipediaTool({
      language,
      maxResults
    });
  }
}
