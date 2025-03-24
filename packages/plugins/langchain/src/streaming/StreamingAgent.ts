import { EventEmitter } from 'events';
import { StreamingLLM, StreamingResponse } from './StreamingLLM.js';
import { Tool } from '../tools/Tool.js';

/**
 * Interface for a streaming agent callback
 */
export interface StreamingAgentCallback {
  /**
   * Called when a token is received
   * 
   * @param token The token
   * @param index The index of the token
   * @param isComplete Whether the response is complete
   */
  (token: string, index: number, isComplete: boolean): void;
}

/**
 * Interface for a streaming agent response
 */
export interface StreamingAgentResponse {
  /**
   * The text of the response
   */
  text: string;
  
  /**
   * The tokens of the response
   */
  tokens: string[];
  
  /**
   * Whether the response is complete
   */
  isComplete: boolean;
  
  /**
   * The input variables
   */
  input: Record<string, any>;
  
  /**
   * The output variables
   */
  output: Record<string, any>;
  
  /**
   * The steps taken by the agent
   */
  steps: AgentStep[];
}

/**
 * Interface for an agent step
 */
export interface AgentStep {
  /**
   * The action taken by the agent
   */
  action: string;
  
  /**
   * The input to the action
   */
  input?: Record<string, any>;
  
  /**
   * The output from the action
   */
  output?: string;
  
  /**
   * The observation from the action
   */
  observation?: string;
}

/**
 * Options for a streaming agent
 */
export interface StreamingAgentOptions {
  /**
   * The LLM to use
   */
  llm: StreamingLLM;
  
  /**
   * The tools available to the agent
   */
  tools: Tool[];
  
  /**
   * The system prompt to use
   */
  systemPrompt?: string;
  
  /**
   * Optional maximum number of steps
   */
  maxSteps?: number;
  
  /**
   * Optional callback to call when a token is received
   */
  onToken?: StreamingAgentCallback;
  
  /**
   * Optional callback to call when the response is complete
   */
  onComplete?: (response: StreamingAgentResponse) => void;
  
  /**
   * Optional callback to call when an error occurs
   */
  onError?: (error: Error) => void;
  
  /**
   * Optional callback to call when a step is taken
   */
  onStep?: (step: AgentStep) => void;
}

/**
 * A streaming agent that can use tools
 */
export class StreamingAgent extends EventEmitter {
  private llm: StreamingLLM;
  private tools: Tool[];
  private systemPrompt: string;
  private maxSteps: number;
  private onToken?: StreamingAgentCallback;
  private onComplete?: (response: StreamingAgentResponse) => void;
  private onError?: (error: Error) => void;
  private onStep?: (step: AgentStep) => void;
  
  /**
   * Create a new StreamingAgent
   * 
   * @param options Options for the agent
   */
  constructor(options: StreamingAgentOptions) {
    super();
    
    this.llm = options.llm;
    this.tools = options.tools;
    this.systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt();
    this.maxSteps = options.maxSteps || 10;
    this.onToken = options.onToken;
    this.onComplete = options.onComplete;
    this.onError = options.onError;
    this.onStep = options.onStep;
    
    // Set up event listeners
    if (this.onToken) {
      this.on('token', this.onToken);
    }
    
    if (this.onComplete) {
      this.on('complete', this.onComplete);
    }
    
    if (this.onError) {
      this.on('error', this.onError);
    }
    
    if (this.onStep) {
      this.on('step', this.onStep);
    }
  }
  
  /**
   * Get the default system prompt
   * 
   * @returns The default system prompt
   */
  private getDefaultSystemPrompt(): string {
    const toolDescriptions = this.tools.map(tool => {
      return `${tool.name}: ${tool.description}`;
    }).join('\n');
    
    return `You are a helpful AI assistant that can use tools to answer questions. You have access to the following tools:

${toolDescriptions}

To use a tool, use the following format:
\`\`\`
Thought: I need to use a tool to help answer the question.
Action: <tool_name>
Action Input: <tool_input>
\`\`\`

After you use a tool, I'll show you the result:
\`\`\`
Observation: <tool_result>
\`\`\`

Then you can use another tool or provide your final answer:
\`\`\`
Thought: I now know the answer.
Final Answer: <your_answer>
\`\`\`

Begin!`;
  }
  
  /**
   * Parse the agent's response to extract the action and input
   * 
   * @param text The agent's response
   * @returns The action and input
   */
  private parseAction(text: string): { action: string; input: string } | null {
    // Look for the action pattern
    const actionMatch = text.match(/Action: (.*?)(?:\n|$)/);
    const actionInputMatch = text.match(/Action Input: (.*?)(?:\n|$)/);
    
    if (actionMatch && actionInputMatch) {
      return {
        action: actionMatch[1].trim(),
        input: actionInputMatch[1].trim()
      };
    }
    
    // Check if the agent is providing a final answer
    const finalAnswerMatch = text.match(/Final Answer: (.*?)(?:\n|$)/s);
    
    if (finalAnswerMatch) {
      return {
        action: 'Final Answer',
        input: finalAnswerMatch[1].trim()
      };
    }
    
    return null;
  }
  
  /**
   * Execute a tool
   * 
   * @param toolName The name of the tool to execute
   * @param toolInput The input to the tool
   * @returns The result of the tool execution
   */
  private async executeTool(toolName: string, toolInput: string): Promise<string> {
    // Find the tool
    const tool = this.tools.find(t => t.name === toolName);
    
    if (!tool) {
      return `Error: Tool '${toolName}' not found. Available tools: ${this.tools.map(t => t.name).join(', ')}`;
    }
    
    try {
      // Execute the tool
      return await tool.execute(toolInput);
    } catch (error: any) {
      return `Error: ${error?.message || 'Unknown error'}`;
    }
  }
  
  /**
   * Run the agent with a query
   * 
   * @param query The query to run the agent with
   * @returns A promise that resolves to the streaming agent response
   */
  async run(query: string): Promise<StreamingAgentResponse> {
    // Create the agent response
    const agentResponse: StreamingAgentResponse = {
      text: '',
      tokens: [],
      isComplete: false,
      input: { query },
      output: { answer: '' },
      steps: []
    };
    
    // Create the initial prompt
    let prompt = `${this.systemPrompt}\n\nHuman: ${query}\n\nAI: `;
    
    // Run the agent loop
    let step = 0;
    let isDone = false;
    
    while (step < this.maxSteps && !isDone) {
      // Call the LLM
      const llmResponse = await this.llm.complete(prompt);
      
      // Add the response to the agent response
      agentResponse.text += llmResponse.text;
      agentResponse.tokens = agentResponse.tokens.concat(llmResponse.tokens);
      
      // Parse the action
      const actionResult = this.parseAction(llmResponse.text);
      
      if (actionResult) {
        const { action, input } = actionResult;
        
        // Create the step
        const agentStep: AgentStep = {
          action,
          input: { value: input }
        };
        
        // Add the step to the agent response
        agentResponse.steps.push(agentStep);
        
        // Emit the step event
        this.emit('step', agentStep);
        
        // Check if the agent is done
        if (action === 'Final Answer') {
          agentResponse.output.answer = input;
          isDone = true;
          break;
        }
        
        // Execute the tool
        const observation = await this.executeTool(action, input);
        
        // Add the observation to the step
        agentStep.observation = observation;
        
        // Update the prompt
        prompt += `${llmResponse.text}\n\nObservation: ${observation}\n\nAI: `;
      } else {
        // If the agent didn't provide an action, assume it's done
        agentResponse.output.answer = llmResponse.text;
        isDone = true;
        break;
      }
      
      // Increment the step counter
      step++;
    }
    
    // Set the response as complete
    agentResponse.isComplete = true;
    
    // Emit the complete event
    this.emit('complete', agentResponse);
    
    // Return the response
    return agentResponse;
  }
  
  /**
   * Stream the agent with a query
   * 
   * @param query The query to stream the agent with
   * @returns A promise that resolves to the streaming agent response
   */
  async stream(query: string): Promise<StreamingAgentResponse> {
    // Create the agent response
    const agentResponse: StreamingAgentResponse = {
      text: '',
      tokens: [],
      isComplete: false,
      input: { query },
      output: { answer: '' },
      steps: []
    };
    
    // Create the initial prompt
    let prompt = `${this.systemPrompt}\n\nHuman: ${query}\n\nAI: `;
    
    // Set up token handler
    const tokenHandler = (token: string, index: number, isComplete: boolean) => {
      // Add the token to the response
      agentResponse.text += token;
      agentResponse.tokens.push(token);
      
      // Emit the token event
      this.emit('token', token, index, isComplete);
    };
    
    // Add the token handler
    this.llm.addTokenCallback(tokenHandler);
    
    try {
      // Run the agent loop
      let step = 0;
      let isDone = false;
      
      while (step < this.maxSteps && !isDone) {
        // Reset the agent response text for this step
        const stepStartIndex = agentResponse.tokens.length;
        
        // Call the LLM
        const llmResponse = await this.llm.complete(prompt);
        
        // Extract the text for this step
        const stepText = agentResponse.tokens.slice(stepStartIndex).join('');
        
        // Parse the action
        const actionResult = this.parseAction(stepText);
        
        if (actionResult) {
          const { action, input } = actionResult;
          
          // Create the step
          const agentStep: AgentStep = {
            action,
            input: { value: input }
          };
          
          // Add the step to the agent response
          agentResponse.steps.push(agentStep);
          
          // Emit the step event
          this.emit('step', agentStep);
          
          // Check if the agent is done
          if (action === 'Final Answer') {
            agentResponse.output.answer = input;
            isDone = true;
            break;
          }
          
          // Execute the tool
          const observation = await this.executeTool(action, input);
          
          // Add the observation to the step
          agentStep.observation = observation;
          
          // Update the prompt
          prompt += `${stepText}\n\nObservation: ${observation}\n\nAI: `;
        } else {
          // If the agent didn't provide an action, assume it's done
          agentResponse.output.answer = stepText;
          isDone = true;
          break;
        }
        
        // Increment the step counter
        step++;
      }
      
      // Set the response as complete
      agentResponse.isComplete = true;
      
      // Emit the complete event
      this.emit('complete', agentResponse);
      
      // Return the response
      return agentResponse;
    } catch (error) {
      // Emit the error event
      this.emit('error', error);
      
      // Rethrow the error
      throw error;
    } finally {
      // Remove the token handler
      this.llm.removeTokenCallback(tokenHandler);
    }
  }
  
  /**
   * Add a token callback
   * 
   * @param callback The callback to add
   */
  addTokenCallback(callback: StreamingAgentCallback): void {
    this.on('token', callback);
  }
  
  /**
   * Remove a token callback
   * 
   * @param callback The callback to remove
   */
  removeTokenCallback(callback: StreamingAgentCallback): void {
    this.off('token', callback);
  }
  
  /**
   * Add a complete callback
   * 
   * @param callback The callback to add
   */
  addCompleteCallback(callback: (response: StreamingAgentResponse) => void): void {
    this.on('complete', callback);
  }
  
  /**
   * Remove a complete callback
   * 
   * @param callback The callback to remove
   */
  removeCompleteCallback(callback: (response: StreamingAgentResponse) => void): void {
    this.off('complete', callback);
  }
  
  /**
   * Add an error callback
   * 
   * @param callback The callback to add
   */
  addErrorCallback(callback: (error: Error) => void): void {
    this.on('error', callback);
  }
  
  /**
   * Remove an error callback
   * 
   * @param callback The callback to remove
   */
  removeErrorCallback(callback: (error: Error) => void): void {
    this.off('error', callback);
  }
  
  /**
   * Add a step callback
   * 
   * @param callback The callback to add
   */
  addStepCallback(callback: (step: AgentStep) => void): void {
    this.on('step', callback);
  }
  
  /**
   * Remove a step callback
   * 
   * @param callback The callback to remove
   */
  removeStepCallback(callback: (step: AgentStep) => void): void {
    this.off('step', callback);
  }
}

/**
 * Factory for creating StreamingAgent instances
 */
export class StreamingAgentFactory {
  /**
   * Create a new StreamingAgent
   * 
   * @param options Options for the agent
   * @returns A new StreamingAgent
   */
  static create(options: StreamingAgentOptions): StreamingAgent {
    return new StreamingAgent(options);
  }
  
  /**
   * Create a new StreamingAgent with a custom system prompt
   * 
   * @param llm The LLM to use
   * @param tools The tools available to the agent
   * @param systemPrompt The system prompt to use
   * @returns A new StreamingAgent with a custom system prompt
   */
  static withSystemPrompt(
    llm: StreamingLLM,
    tools: Tool[],
    systemPrompt: string
  ): StreamingAgent {
    return new StreamingAgent({
      llm,
      tools,
      systemPrompt
    });
  }
  
  /**
   * Create a new StreamingAgent with a maximum number of steps
   * 
   * @param llm The LLM to use
   * @param tools The tools available to the agent
   * @param maxSteps The maximum number of steps
   * @returns A new StreamingAgent with a maximum number of steps
   */
  static withMaxSteps(
    llm: StreamingLLM,
    tools: Tool[],
    maxSteps: number
  ): StreamingAgent {
    return new StreamingAgent({
      llm,
      tools,
      maxSteps
    });
  }
}
