import { LLM } from '../chains/LLMChain.js';
import { Tool } from '../tools/Tool.js';

/**
 * Options for PlanAndExecuteAgent
 */
export interface PlanAndExecuteAgentOptions {
  /**
   * The LLM to use for planning
   */
  plannerLLM: LLM;
  
  /**
   * The LLM to use for execution
   * If not provided, plannerLLM will be used
   */
  executorLLM?: LLM;
  
  /**
   * The tools available to the agent
   */
  tools: Tool[];
  
  /**
   * Optional maximum number of steps
   * This is a safety measure to prevent infinite loops
   */
  maxSteps?: number;
  
  /**
   * Optional prompt template for the planner
   * If not provided, a default template will be used
   * The template should include a {question} variable
   */
  plannerPromptTemplate?: string;
  
  /**
   * Optional prompt template for the executor
   * If not provided, a default template will be used
   * The template should include {plan}, {step}, {context}, and {tools} variables
   */
  executorPromptTemplate?: string;
  
  /**
   * Optional callback to call after planning
   */
  onPlan?: (plan: string[]) => void;
  
  /**
   * Optional callback to call before executing a step
   */
  onStepStart?: (step: string, index: number) => void;
  
  /**
   * Optional callback to call after executing a step
   */
  onStepEnd?: (step: string, result: string, index: number) => void;
  
  /**
   * Optional flag to return intermediate steps
   * If true, the plan and step results will be included in the output
   */
  returnIntermediateSteps?: boolean;
}

/**
 * Interface for a step execution
 */
export interface StepExecution {
  /**
   * The step description
   */
  step: string;
  
  /**
   * The result of executing the step
   */
  result: string;
}

/**
 * An agent that first plans a sequence of steps and then executes them
 */
export class PlanAndExecuteAgent {
  private plannerLLM: LLM;
  private executorLLM: LLM;
  private tools: Map<string, Tool>;
  private maxSteps: number;
  private plannerPromptTemplate: string;
  private executorPromptTemplate: string;
  private onPlan?: (plan: string[]) => void;
  private onStepStart?: (step: string, index: number) => void;
  private onStepEnd?: (step: string, result: string, index: number) => void;
  private returnIntermediateSteps: boolean;
  
  /**
   * Create a new PlanAndExecuteAgent
   * 
   * @param options Options for the agent
   */
  constructor(options: PlanAndExecuteAgentOptions) {
    this.plannerLLM = options.plannerLLM;
    this.executorLLM = options.executorLLM || options.plannerLLM;
    
    // Create a map of tools by name for easy lookup
    this.tools = new Map();
    for (const tool of options.tools) {
      this.tools.set(tool.name, tool);
    }
    
    this.maxSteps = options.maxSteps || 5;
    this.plannerPromptTemplate = options.plannerPromptTemplate || this.getDefaultPlannerPromptTemplate();
    this.executorPromptTemplate = options.executorPromptTemplate || this.getDefaultExecutorPromptTemplate();
    this.onPlan = options.onPlan;
    this.onStepStart = options.onStepStart;
    this.onStepEnd = options.onStepEnd;
    this.returnIntermediateSteps = options.returnIntermediateSteps || false;
  }
  
  /**
   * Get the default prompt template for the planner
   * 
   * @returns The default prompt template
   */
  private getDefaultPlannerPromptTemplate(): string {
    return `You are a planner that creates a step-by-step plan to answer a question.
Think carefully about what steps are needed to answer the question accurately.
Create a plan with 2-5 steps. Each step should be clear and actionable.
Format your plan as a numbered list, with each step on a new line starting with "Step X:".

Question: {question}

Plan:`;
  }
  
  /**
   * Get the default prompt template for the executor
   * 
   * @returns The default prompt template
   */
  private getDefaultExecutorPromptTemplate(): string {
    return `You are an executor that carries out a specific step in a plan to answer a question.
You have access to the following tools:

{tools}

Your task is to execute the following step in the plan:

{step}

Here is the full plan for context:
{plan}

Previous steps results:
{context}

Execute the step and provide the result. If you need to use a tool, specify which tool to use and provide the input.
If you can execute the step without using a tool, provide the result directly.`;
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
   * Create a plan for answering the question
   * 
   * @param question The question to answer
   * @returns The plan as an array of steps
   */
  private async createPlan(question: string): Promise<string[]> {
    // Format the prompt
    const prompt = this.plannerPromptTemplate.replace('{question}', question);
    
    // Run the LLM
    const planText = await this.plannerLLM.complete(prompt);
    
    // Parse the plan into steps
    const steps = this.parsePlan(planText);
    
    // Call the onPlan callback if provided
    if (this.onPlan) {
      this.onPlan(steps);
    }
    
    return steps;
  }
  
  /**
   * Parse a plan text into an array of steps
   * 
   * @param planText The plan text
   * @returns The plan as an array of steps
   */
  private parsePlan(planText: string): string[] {
    // Split the plan into lines
    const lines = planText.split('\n');
    
    // Filter out empty lines and parse steps
    return lines
      .filter(line => line.trim().length > 0)
      .filter(line => /^(Step \d+:|^\d+\.)/.test(line.trim()))
      .map(line => {
        // Remove the "Step X:" prefix
        return line.replace(/^(Step \d+:|^\d+\.)\s*/, '').trim();
      });
  }
  
  /**
   * Execute a step in the plan
   * 
   * @param step The step to execute
   * @param plan The full plan
   * @param context The context from previous steps
   * @returns The result of executing the step
   */
  private async executeStep(step: string, plan: string[], context: string): Promise<string> {
    // Format the prompt
    const prompt = this.executorPromptTemplate
      .replace('{step}', step)
      .replace('{plan}', plan.map((s, i) => `Step ${i + 1}: ${s}`).join('\n'))
      .replace('{context}', context)
      .replace('{tools}', this.formatTools());
    
    // Run the LLM
    const executionResult = await this.executorLLM.complete(prompt);
    
    // Check if the result contains a tool call
    const toolCallMatch = executionResult.match(/Tool: (\w+)\nInput: (.*?)(?=\n|$)/s);
    if (toolCallMatch) {
      const toolName = toolCallMatch[1];
      const toolInput = toolCallMatch[2].trim();
      
      // Execute the tool
      return await this.executeTool(toolName, toolInput);
    }
    
    // If no tool call is found, return the execution result directly
    return executionResult;
  }
  
  /**
   * Execute a tool with the given name and input
   * 
   * @param toolName The name of the tool to execute
   * @param toolInput The input for the tool
   * @returns The result of executing the tool
   */
  private async executeTool(toolName: string, toolInput: string): Promise<string> {
    // Check if the tool exists
    const tool = this.tools.get(toolName);
    if (!tool) {
      return `Error: Tool '${toolName}' not found. Available tools are: ${Array.from(this.tools.keys()).join(', ')}`;
    }
    
    try {
      // Execute the tool
      return await tool.execute(toolInput);
    } catch (error) {
      return `Error executing tool '${toolName}': ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  /**
   * Run the agent with the given question
   * 
   * @param question The question to answer
   * @returns The answer to the question
   */
  async run(question: string): Promise<string> {
    // Create a plan
    const plan = await this.createPlan(question);
    
    // Limit the number of steps to maxSteps
    const limitedPlan = plan.slice(0, this.maxSteps);
    
    // Execute each step in the plan
    let context = '';
    for (let i = 0; i < limitedPlan.length; i++) {
      const step = limitedPlan[i];
      
      // Call the onStepStart callback if provided
      if (this.onStepStart) {
        this.onStepStart(step, i);
      }
      
      // Execute the step
      const result = await this.executeStep(step, limitedPlan, context);
      
      // Call the onStepEnd callback if provided
      if (this.onStepEnd) {
        this.onStepEnd(step, result, i);
      }
      
      // Add the result to the context
      context += `Step ${i + 1}: ${step}\nResult: ${result}\n\n`;
    }
    
    // Generate a final answer based on the context
    const finalPrompt = `Based on the following steps and results, provide a comprehensive answer to the question: "${question}"\n\n${context}`;
    
    return await this.executorLLM.complete(finalPrompt);
  }
  
  /**
   * Run the agent with the given question and return the answer with additional metadata
   * 
   * @param question The question to answer
   * @returns The answer to the question with additional metadata
   */
  async call(question: string): Promise<{
    answer: string;
    plan?: string[];
    steps?: StepExecution[];
  }> {
    // Create a plan
    const plan = await this.createPlan(question);
    
    // Limit the number of steps to maxSteps
    const limitedPlan = plan.slice(0, this.maxSteps);
    
    // Execute each step in the plan
    let context = '';
    const steps: StepExecution[] = [];
    
    for (let i = 0; i < limitedPlan.length; i++) {
      const step = limitedPlan[i];
      
      // Call the onStepStart callback if provided
      if (this.onStepStart) {
        this.onStepStart(step, i);
      }
      
      // Execute the step
      const result = await this.executeStep(step, limitedPlan, context);
      
      // Call the onStepEnd callback if provided
      if (this.onStepEnd) {
        this.onStepEnd(step, result, i);
      }
      
      // Add the result to the context
      context += `Step ${i + 1}: ${step}\nResult: ${result}\n\n`;
      
      // Add the step to the steps array
      steps.push({
        step,
        result
      });
    }
    
    // Generate a final answer based on the context
    const finalPrompt = `Based on the following steps and results, provide a comprehensive answer to the question: "${question}"\n\n${context}`;
    
    const answer = await this.executorLLM.complete(finalPrompt);
    
    return {
      answer,
      plan: this.returnIntermediateSteps ? limitedPlan : undefined,
      steps: this.returnIntermediateSteps ? steps : undefined
    };
  }
}

/**
 * Factory for creating PlanAndExecuteAgent instances
 */
export class PlanAndExecuteAgentFactory {
  /**
   * Create a new PlanAndExecuteAgent
   * 
   * @param options Options for the agent
   * @returns A new PlanAndExecuteAgent instance
   */
  static create(options: PlanAndExecuteAgentOptions): PlanAndExecuteAgent {
    return new PlanAndExecuteAgent(options);
  }
  
  /**
   * Create a new PlanAndExecuteAgent with a simple configuration
   * 
   * @param llm The LLM to use for both planning and execution
   * @param tools The tools available to the agent
   * @param maxSteps The maximum number of steps
   * @returns A new PlanAndExecuteAgent instance
   */
  static fromLLMAndTools(
    llm: LLM,
    tools: Tool[],
    maxSteps: number = 5
  ): PlanAndExecuteAgent {
    return new PlanAndExecuteAgent({
      plannerLLM: llm,
      tools,
      maxSteps
    });
  }
  
  /**
   * Create a new PlanAndExecuteAgent with separate LLMs for planning and execution
   * 
   * @param plannerLLM The LLM to use for planning
   * @param executorLLM The LLM to use for execution
   * @param tools The tools available to the agent
   * @returns A new PlanAndExecuteAgent instance
   */
  static withSeparateLLMs(
    plannerLLM: LLM,
    executorLLM: LLM,
    tools: Tool[]
  ): PlanAndExecuteAgent {
    return new PlanAndExecuteAgent({
      plannerLLM,
      executorLLM,
      tools
    });
  }
}
