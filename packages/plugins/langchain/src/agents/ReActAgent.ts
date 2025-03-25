import { LLM } from '../chains/LLMChain.js';
import { Tool } from '../tools/Tool.js';

/**
 * Options for ReActAgent
 */
export interface ReActAgentOptions {
  /**
   * The LLM to use for reasoning
   */
  llm: LLM;
  
  /**
   * The tools available to the agent
   */
  tools: Tool[];
  
  /**
   * Optional maximum number of iterations
   * This is a safety measure to prevent infinite loops
   */
  maxIterations?: number;
  
  /**
   * Optional prompt template for the agent
   * If not provided, a default template will be used
   * The template should include {tools}, {question}, and {agent_scratchpad} variables
   */
  promptTemplate?: string;
  
  /**
   * Optional callback to call before each reasoning step
   */
  onReasoning?: (reasoning: string) => void;
  
  /**
   * Optional callback to call before each action
   */
  onAction?: (action: string, input: string) => void;
  
  /**
   * Optional callback to call after each observation
   */
  onObservation?: (observation: string) => void;
  
  /**
   * Optional flag to return intermediate steps
   * If true, the reasoning, actions, and observations will be included in the output
   */
  returnIntermediateSteps?: boolean;
}

/**
 * Interface for a reasoning step
 */
export interface ReasoningStep {
  /**
   * The reasoning text
   */
  reasoning: string;
  
  /**
   * The action to take
   */
  action: string;
  
  /**
   * The input for the action
   */
  actionInput: string;
  
  /**
   * The observation from the action
   */
  observation: string;
}

/**
 * A Reasoning + Acting (ReAct) agent that follows a reasoning-action-observation loop
 */
export class ReActAgent {
  private llm: LLM;
  private tools: Map<string, Tool>;
  private maxIterations: number;
  private promptTemplate: string;
  private onReasoning?: (reasoning: string) => void;
  private onAction?: (action: string, input: string) => void;
  private onObservation?: (observation: string) => void;
  private returnIntermediateSteps: boolean;
  
  /**
   * Create a new ReActAgent
   * 
   * @param options Options for the agent
   */
  constructor(options: ReActAgentOptions) {
    this.llm = options.llm;
    
    // Create a map of tools by name for easy lookup
    this.tools = new Map();
    for (const tool of options.tools) {
      this.tools.set(tool.name, tool);
    }
    
    this.maxIterations = options.maxIterations || 10;
    this.promptTemplate = options.promptTemplate || this.getDefaultPromptTemplate();
    this.onReasoning = options.onReasoning;
    this.onAction = options.onAction;
    this.onObservation = options.onObservation;
    this.returnIntermediateSteps = options.returnIntermediateSteps || false;
  }
  
  /**
   * Get the default prompt template for the agent
   * 
   * @returns The default prompt template
   */
  private getDefaultPromptTemplate(): string {
    return `Answer the following question by reasoning step-by-step and using the provided tools when necessary.

Available tools:
{tools}

Question: {question}

{agent_scratchpad}

Thought: I need to answer the question step-by-step.`;
  }
  
  /**
   * Format the tools as a string for the prompt
   * 
   * @returns The formatted tools
   */
  private formatTools(): string {
    return Array.from(this.tools.values()).map(tool => {
      return `${tool.name}: ${tool.description}`;
    }).join('\n');
  }
  
  /**
   * Format the agent scratchpad (reasoning, actions, and observations) as a string for the prompt
   * 
   * @param steps The reasoning steps
   * @returns The formatted scratchpad
   */
  private formatScratchpad(steps: ReasoningStep[]): string {
    if (steps.length === 0) {
      return '';
    }
    
    return steps.map(step => {
      return `Thought: ${step.reasoning}\nAction: ${step.action}\nAction Input: ${step.actionInput}\nObservation: ${step.observation}`;
    }).join('\n\n');
  }
  
  /**
   * Parse the LLM output to extract the reasoning, action, and action input
   * 
   * @param output The LLM output
   * @returns The reasoning, action, and action input
   */
  private parseOutput(output: string): { reasoning: string; action: string; actionInput: string } {
    // Extract the reasoning
    const reasoningMatch = output.match(/Thought:\s*(.*?)(?=\nAction:|$)/s);
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : '';
    
    // Extract the action
    const actionMatch = output.match(/Action:\s*(.*?)(?=\nAction Input:|$)/s);
    const action = actionMatch ? actionMatch[1].trim() : '';
    
    // Extract the action input
    const actionInputMatch = output.match(/Action Input:\s*(.*?)(?=$)/s);
    const actionInput = actionInputMatch ? actionInputMatch[1].trim() : '';
    
    return { reasoning, action, actionInput };
  }
  
  /**
   * Execute a tool with the given action and input
   * 
   * @param action The action to take
   * @param actionInput The input for the action
   * @returns The observation from the action
   */
  private async executeTool(action: string, actionInput: string): Promise<string> {
    // Check if the action is a valid tool
    const tool = this.tools.get(action);
    if (!tool) {
      return `Error: Tool '${action}' not found. Available tools are: ${Array.from(this.tools.keys()).join(', ')}`;
    }
    
    try {
      // Execute the tool
      return await tool.execute(actionInput);
    } catch (error) {
      return `Error executing tool '${action}': ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  /**
   * Run the agent with the given question
   * 
   * @param question The question to answer
   * @returns The answer to the question
   */
  async run(question: string): Promise<string> {
    const steps: ReasoningStep[] = [];
    
    for (let i = 0; i < this.maxIterations; i++) {
      // Format the prompt
      const prompt = this.promptTemplate
        .replace('{tools}', this.formatTools())
        .replace('{question}', question)
        .replace('{agent_scratchpad}', this.formatScratchpad(steps));
      
      // Run the LLM
      const output = await this.llm.complete(prompt);
      
      // Parse the output
      const { reasoning, action, actionInput } = this.parseOutput(output);
      
      // Call the onReasoning callback if provided
      if (this.onReasoning) {
        this.onReasoning(reasoning);
      }
      
      // Check if the agent wants to finish
      if (action.toLowerCase() === 'final answer') {
        return actionInput;
      }
      
      // Call the onAction callback if provided
      if (this.onAction) {
        this.onAction(action, actionInput);
      }
      
      // Execute the tool
      const observation = await this.executeTool(action, actionInput);
      
      // Call the onObservation callback if provided
      if (this.onObservation) {
        this.onObservation(observation);
      }
      
      // Add the step to the steps array
      steps.push({
        reasoning,
        action,
        actionInput,
        observation
      });
    }
    
    // If we've reached the maximum number of iterations, return a message
    return `I wasn't able to find a definitive answer within the maximum number of iterations (${this.maxIterations}). Here's what I've learned so far: ${steps[steps.length - 1].reasoning}`;
  }
  
  /**
   * Run the agent with the given question and return the answer with additional metadata
   * 
   * @param question The question to answer
   * @returns The answer to the question with additional metadata
   */
  async call(question: string): Promise<{
    answer: string;
    steps?: ReasoningStep[];
  }> {
    const steps: ReasoningStep[] = [];
    
    for (let i = 0; i < this.maxIterations; i++) {
      // Format the prompt
      const prompt = this.promptTemplate
        .replace('{tools}', this.formatTools())
        .replace('{question}', question)
        .replace('{agent_scratchpad}', this.formatScratchpad(steps));
      
      // Run the LLM
      const output = await this.llm.complete(prompt);
      
      // Parse the output
      const { reasoning, action, actionInput } = this.parseOutput(output);
      
      // Call the onReasoning callback if provided
      if (this.onReasoning) {
        this.onReasoning(reasoning);
      }
      
      // Check if the agent wants to finish
      if (action.toLowerCase() === 'final answer') {
        return {
          answer: actionInput,
          steps: this.returnIntermediateSteps ? steps : undefined
        };
      }
      
      // Call the onAction callback if provided
      if (this.onAction) {
        this.onAction(action, actionInput);
      }
      
      // Execute the tool
      const observation = await this.executeTool(action, actionInput);
      
      // Call the onObservation callback if provided
      if (this.onObservation) {
        this.onObservation(observation);
      }
      
      // Add the step to the steps array
      steps.push({
        reasoning,
        action,
        actionInput,
        observation
      });
    }
    
    // If we've reached the maximum number of iterations, return a message
    const answer = `I wasn't able to find a definitive answer within the maximum number of iterations (${this.maxIterations}). Here's what I've learned so far: ${steps[steps.length - 1].reasoning}`;
    
    return {
      answer,
      steps: this.returnIntermediateSteps ? steps : undefined
    };
  }
}

/**
 * Factory for creating ReActAgent instances
 */
export class ReActAgentFactory {
  /**
   * Create a new ReActAgent
   * 
   * @param options Options for the agent
   * @returns A new ReActAgent instance
   */
  static create(options: ReActAgentOptions): ReActAgent {
    return new ReActAgent(options);
  }
  
  /**
   * Create a new ReActAgent with a simple configuration
   * 
   * @param llm The LLM to use for reasoning
   * @param tools The tools available to the agent
   * @param maxIterations The maximum number of iterations
   * @returns A new ReActAgent instance
   */
  static fromLLMAndTools(
    llm: LLM,
    tools: Tool[],
    maxIterations: number = 10
  ): ReActAgent {
    return new ReActAgent({
      llm,
      tools,
      maxIterations
    });
  }
}
