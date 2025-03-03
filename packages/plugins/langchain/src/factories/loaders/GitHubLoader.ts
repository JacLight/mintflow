import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating GitHub document loaders
 */
export class GitHubLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new GitHub document loader
   * 
   * @param config Configuration for the GitHub loader
   * @returns A new GitHub document loader instance
   */
  async create(config: {
    owner: string;
    repo: string;
    branch?: string;
    recursive?: boolean;
    unknown?: string;
    accessToken?: string;
    ignoreFiles?: string[];
    ignorePaths?: string[];
    maxConcurrency?: number;
    maxRetries?: number;
  }): Promise<any> {
    try {
      // Dynamically import the GitHubLoader
      const { GithubRepoLoader } = await import("@langchain/community/document_loaders/web/github");
      
      // Create the GitHub loader with the provided configuration
      return new GithubRepoLoader(
        `https://github.com/${config.owner}/${config.repo}`,
        {
          branch: config.branch || "main",
          recursive: config.recursive !== undefined ? config.recursive : true,
          unknown: config.unknown || "warn",
          accessToken: config.accessToken,
          ignoreFiles: config.ignoreFiles,
          ignorePaths: config.ignorePaths,
          maxConcurrency: config.maxConcurrency,
          maxRetries: config.maxRetries
        }
      );
    } catch (error) {
      console.error("Error creating GitHubLoader:", error);
      throw new Error(`Failed to create GitHubLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
