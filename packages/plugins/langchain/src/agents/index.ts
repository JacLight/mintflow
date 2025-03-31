/**
 * Agents for LangChain
 * 
 * This module provides various agent implementations for building autonomous systems with LLMs.
 */

// Import agent interfaces and classes
import { ReActAgent, ReActAgentFactory, type ReActAgentOptions, type ReasoningStep } from './ReActAgent.js';
import { 
  OpenAIFunctionsAgent, 
  OpenAIFunctionsAgentFactory, 
  type OpenAIFunctionsAgentOptions, 
  type FunctionCallStep,
  type ChatMessage,
  type LLMFunctionCallResponse
} from './OpenAIFunctionsAgent.js';
import { 
  PlanAndExecuteAgent, 
  PlanAndExecuteAgentFactory, 
  type PlanAndExecuteAgentOptions, 
  type StepExecution 
} from './PlanAndExecuteAgent.js';
import {
  AgentExecutor,
  AgentExecutorFactory,
  type AgentExecutorOptions
} from './AgentExecutor.js';
import {
  ToolRegistry,
  ToolRegistryFactory,
  type ToolRegistryOptions
} from './ToolRegistry.js';
import {
  AgentMemory,
  AgentMemoryFactory,
  type AgentMemoryOptions,
  type MemoryEntry
} from './AgentMemory.js';

// Export agent interfaces and classes
export { ReActAgent, ReActAgentFactory };
export type { ReActAgentOptions, ReasoningStep };

export { OpenAIFunctionsAgent, OpenAIFunctionsAgentFactory };
export type { 
  OpenAIFunctionsAgentOptions, 
  FunctionCallStep,
  ChatMessage,
  LLMFunctionCallResponse
};

export { PlanAndExecuteAgent, PlanAndExecuteAgentFactory };
export type { PlanAndExecuteAgentOptions, StepExecution };

export { AgentExecutor, AgentExecutorFactory };
export type { AgentExecutorOptions };

export { ToolRegistry, ToolRegistryFactory };
export type { ToolRegistryOptions };

export { AgentMemory, AgentMemoryFactory };
export type { AgentMemoryOptions, MemoryEntry };

/**
 * Create an agent based on the specified type
 * 
 * @param type The type of agent to create
 * @param options Options for the agent
 * @returns The created agent
 */
export function createAgent(
  type: 'react' | 'openai_functions' | 'plan_and_execute',
  options: any
): ReActAgent | OpenAIFunctionsAgent | PlanAndExecuteAgent {
  switch (type) {
    case 'react':
      return ReActAgentFactory.create(options);
    case 'openai_functions':
      return OpenAIFunctionsAgentFactory.create(options);
    case 'plan_and_execute':
      return PlanAndExecuteAgentFactory.create(options);
    default:
      throw new Error(`Unknown agent type: ${type}`);
  }
}
