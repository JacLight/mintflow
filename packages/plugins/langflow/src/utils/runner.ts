/**
 * Utilities for communicating with the Langflow runner
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuration for the Langflow runner
 */
export interface RunnerConfig {
  baseUrl?: string;
  timeout?: number;
}

/**
 * Default configuration for the Langflow runner
 */
const DEFAULT_CONFIG: RunnerConfig = {
  baseUrl: 'http://localhost:3000/api/langflow',
  timeout: 30000
};

/**
 * Client for communicating with the Langflow runner
 */
export class LangflowRunnerClient {
  private config: RunnerConfig;
  private axiosInstance;

  /**
   * Create a new Langflow runner client
   * 
   * @param config Configuration for the client
   */
  constructor(config: RunnerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout
    });
  }

  /**
   * Execute a task on the Langflow runner
   * 
   * @param componentType The type of component to execute
   * @param method The method to execute
   * @param config The configuration for the task
   * @param input The input data for the task
   * @returns The result of the task
   */
  async executeTask<T>(
    componentType: string,
    method: string,
    config: Record<string, any> = {},
    input: Record<string, any> = {}
  ): Promise<T> {
    try {
      // Create the task
      const task = {
        id: uuidv4(),
        componentType,
        method,
        config,
        input
      };

      // Send the task to the runner
      const response = await this.axiosInstance.post('/execute', task);

      // Return the result
      return response.data.result;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Langflow runner error: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Langflow runner is not responding');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Error executing task: ${error.message}`);
      }
    }
  }

  /**
   * Execute a vector store task
   * 
   * @param method The method to execute
   * @param config The configuration for the task
   * @param input The input data for the task
   * @returns The result of the task
   */
  async executeVectorStoreTask<T>(
    method: string,
    config: Record<string, any> = {},
    input: Record<string, any> = {}
  ): Promise<T> {
    return this.executeTask<T>(config.type || 'chroma', method, config, input);
  }

  /**
   * Execute a LangGraph task
   * 
   * @param method The method to execute
   * @param config The configuration for the task
   * @param input The input data for the task
   * @returns The result of the task
   */
  async executeLangGraphTask<T>(
    method: string,
    config: Record<string, any> = {},
    input: Record<string, any> = {}
  ): Promise<T> {
    return this.executeTask<T>('langgraph', method, config, input);
  }

  /**
   * Execute an agent task
   * 
   * @param method The method to execute
   * @param config The configuration for the task
   * @param input The input data for the task
   * @returns The result of the task
   */
  async executeAgentTask<T>(
    method: string,
    config: Record<string, any> = {},
    input: Record<string, any> = {}
  ): Promise<T> {
    return this.executeTask<T>('agent', method, config, input);
  }

  /**
   * Execute a document task
   * 
   * @param method The method to execute
   * @param config The configuration for the task
   * @param input The input data for the task
   * @returns The result of the task
   */
  async executeDocumentTask<T>(
    method: string,
    config: Record<string, any> = {},
    input: Record<string, any> = {}
  ): Promise<T> {
    return this.executeTask<T>('document', method, config, input);
  }
}

/**
 * Create a new Langflow runner client
 * 
 * @param config Configuration for the client
 * @returns A new Langflow runner client
 */
export function createRunnerClient(config: RunnerConfig = {}): LangflowRunnerClient {
  return new LangflowRunnerClient(config);
}

/**
 * Default Langflow runner client
 */
export const defaultRunnerClient = createRunnerClient();
