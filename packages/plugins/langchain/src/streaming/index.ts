/**
 * Streaming module for LangChain
 * 
 * This module provides streaming capabilities for LLMs, chains, and agents.
 */

// Import from StreamingLLM
import {
  StreamingLLM,
  OpenAIStreamingLLM,
  AnthropicStreamingLLM,
  StreamingLLMFactory,
  type StreamingLLMOptions,
  type StreamingResponse,
  type TokenCallback
} from './StreamingLLM.js';

// Import from StreamingChain
import {
  StreamingChain,
  StreamingChainFactory,
  type StreamingChainOptions,
  type StreamingChainResponse,
  type StreamingChainCallback
} from './StreamingChain.js';

// Import from StreamingAgent
import {
  StreamingAgent,
  StreamingAgentFactory,
  type StreamingAgentOptions,
  type StreamingAgentResponse,
  type StreamingAgentCallback,
  type AgentStep
} from './StreamingAgent.js';

// Import Tool
import { Tool } from '../tools/Tool.js';

// Export streaming LLM classes
export {
  StreamingLLM,
  OpenAIStreamingLLM,
  AnthropicStreamingLLM,
  StreamingLLMFactory,
  type StreamingLLMOptions,
  type StreamingResponse,
  type TokenCallback
};

// Export streaming chain classes
export {
  StreamingChain,
  StreamingChainFactory,
  type StreamingChainOptions,
  type StreamingChainResponse,
  type StreamingChainCallback
};

// Export streaming agent classes
export {
  StreamingAgent,
  StreamingAgentFactory,
  type StreamingAgentOptions,
  type StreamingAgentResponse,
  type StreamingAgentCallback,
  type AgentStep
};

/**
 * Create a streaming LLM
 * 
 * @param type The type of LLM to create
 * @param options Options for the LLM
 * @returns The created LLM
 */
export function createStreamingLLM(
  type: 'openai' | 'anthropic',
  options: any
): StreamingLLM {
  switch (type) {
    case 'openai':
      return StreamingLLMFactory.fromOpenAI(
        options.apiKey,
        options.model,
        options
      );
    case 'anthropic':
      return StreamingLLMFactory.fromAnthropic(
        options.apiKey,
        options.model,
        options
      );
    default:
      throw new Error(`Unknown LLM type: ${type}`);
  }
}

/**
 * Create a streaming chain
 * 
 * @param llm The LLM to use
 * @param prompt The prompt template
 * @param options Additional options for the chain
 * @returns The created chain
 */
export function createStreamingChain(
  llm: StreamingLLM,
  prompt: string,
  options: Partial<Omit<StreamingChainOptions, 'llm' | 'prompt'>> = {}
) {
  return StreamingChainFactory.create({
    llm,
    prompt,
    ...options
  });
}

/**
 * Create a streaming agent
 * 
 * @param llm The LLM to use
 * @param tools The tools available to the agent
 * @param options Additional options for the agent
 * @returns The created agent
 */
export function createStreamingAgent(
  llm: StreamingLLM,
  tools: Tool[],
  options: Partial<Omit<StreamingAgentOptions, 'llm' | 'tools'>> = {}
) {
  return StreamingAgentFactory.create({
    llm,
    tools,
    ...options
  });
}
