import { LLM } from '../chains/LLMChain.js';
import { Tool } from '../tools/Tool.js';
import { ReActAgent } from './ReActAgent.js';
import { OpenAIFunctionsAgent } from './OpenAIFunctionsAgent.js';
import { PlanAndExecuteAgent } from './PlanAndExecuteAgent.js';

/**
 * Options for AgentExecutor
 */
export interface AgentExecutorOptions {
  /**
   * The agent to execute
   */
  agent: ReActAgent | OpenAIFunctionsAgent | PlanAndExecuteAgent;
  
  /**
   * Optional maximum number of iterations
   * This is a safety measure to prevent infinite loops
   */
  maxIterations?: number;
  
  /**
   * Optional early stopping method
   * If provided, the executor will stop early if the method returns true
   */
  earlyStopping?: (intermediateSteps: any[]) => boolean;
  
  /**
   * Optional callback to call before each iteration
   */
  onIterationStart?: (iteration: number) => void;
  
  /**
   * Optional callback to call after each iteration
   */
  onIterationEnd?: (iteration: number, result: any) => void;
  
  /**
   * Optional flag to return intermediate steps
   * If true, the intermediate steps will be included in the output
   */
  returnIntermediateSteps?: boolean;
}

/**
 * A framework for executing agents
 */
export class AgentExecutor {
  private agent: ReActAgent | OpenAIFunctionsAgent | PlanAndExecuteAgent;
  private maxIterations: number;
  private earlyStopping?: (intermediateSteps: any[]) => boolean;
  private onIterationStart?: (iteration: number) => void;
  private onIterationEnd?: (iteration: number, result: any) => void;
  private returnIntermediateSteps: boolean;
  
  /**
   * Create a new AgentExecutor
   * 
   * @param options Options for the executor
   */
  constructor(options: AgentExecutorOptions) {
    this.agent = options.agent;
    this.maxIterations = options.maxIterations || 10;
    this.earlyStopping = options.earlyStopping;
    this.onIterationStart = options.onIterationStart;
    this.onIterationEnd = options.onIterationEnd;
    this.returnIntermediateSteps = options.returnIntermediateSteps || false;
  }
  
  /**
   * Run the agent with the given input
   * 
   * @param input The input for the agent
   * @returns The output from the agent
   */
  async run(input: string): Promise<string> {
    return await this.agent.run(input);
  }
  
  /**
   * Run the agent with the given input and return the output with additional metadata
   * 
   * @param input The input for the agent
   * @returns The output from the agent with additional metadata
   */
  async call(input: string): Promise<{
    output: string;
    intermediateSteps?: any[];
  }> {
    // Call the agent
    const result = await this.agent.call(input);
    
    // Extract the output and steps based on the agent type
    let output: string;
    let intermediateSteps: any[] | undefined;
    
    if (typeof result === 'object' && result !== null && 'answer' in result) {
      output = result.answer as string;
      intermediateSteps = 'steps' in result ? (result.steps as any[]) : undefined;
    } else if (typeof result === 'string') {
      output = result;
      intermediateSteps = undefined;
    } else {
      // Fallback for any other type
      output = String(result);
      intermediateSteps = undefined;
    }
    
    // Return the output and steps
    return {
      output,
      intermediateSteps: this.returnIntermediateSteps ? intermediateSteps : undefined
    };
  }
}

/**
 * Factory for creating AgentExecutor instances
 */
export class AgentExecutorFactory {
  /**
   * Create a new AgentExecutor
   * 
   * @param options Options for the executor
   * @returns A new AgentExecutor instance
   */
  static create(options: AgentExecutorOptions): AgentExecutor {
    return new AgentExecutor(options);
  }
  
  /**
   * Create a new AgentExecutor from an agent
   * 
   * @param agent The agent to execute
   * @param maxIterations The maximum number of iterations
   * @returns A new AgentExecutor instance
   */
  static fromAgent(
    agent: ReActAgent | OpenAIFunctionsAgent | PlanAndExecuteAgent,
    maxIterations: number = 10
  ): AgentExecutor {
    return new AgentExecutor({
      agent,
      maxIterations
    });
  }
  
  /**
   * Create a new AgentExecutor from an LLM and tools
   * 
   * @param llm The LLM to use
   * @param tools The tools to use
   * @param agentType The type of agent to create
   * @param maxIterations The maximum number of iterations
   * @returns A new AgentExecutor instance
   */
  static fromLLMAndTools(
    llm: LLM,
    tools: Tool[],
    agentType: 'react' | 'openai_functions' | 'plan_and_execute' = 'react',
    maxIterations: number = 10
  ): AgentExecutor {
    let agent;
    
    switch (agentType) {
      case 'react':
        agent = new ReActAgent({
          llm,
          tools,
          maxIterations
        });
        break;
      case 'openai_functions':
        agent = new OpenAIFunctionsAgent({
          llm,
          tools,
          maxIterations
        });
        break;
      case 'plan_and_execute':
        agent = new PlanAndExecuteAgent({
          plannerLLM: llm,
          tools,
          maxSteps: maxIterations
        });
        break;
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
    
    return new AgentExecutor({
      agent,
      maxIterations
    });
  }
}
