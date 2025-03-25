import { LLM } from '../chains/LLMChain.js';
import { Tool } from '../tools/Tool.js';

/**
 * Interface for a chat message
 */
export interface ChatMessage {
  role: string;
  content: string;
  name?: string;
}

/**
 * Options for OpenAIFunctionsAgent
 */
export interface OpenAIFunctionsAgentOptions {
  /**
   * The LLM to use for reasoning
   * Must be an OpenAI model that supports function calling
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
   * Optional system message for the agent
   * If not provided, a default message will be used
   */
  systemMessage?: string;
  
  /**
   * Optional callback to call before each reasoning step
   */
  onReasoning?: (reasoning: string) => void;
  
  /**
   * Optional callback to call before each function call
   */
  onFunctionCall?: (functionName: string, arguments_: Record<string, any>) => void;
  
  /**
   * Optional callback to call after each function result
   */
  onFunctionResult?: (functionName: string, result: string) => void;
  
  /**
   * Optional flag to return intermediate steps
   * If true, the reasoning, function calls, and results will be included in the output
   */
  returnIntermediateSteps?: boolean;
}

/**
 * Interface for a function call step
 */
export interface FunctionCallStep {
  /**
   * The reasoning text
   */
  reasoning: string;
  
  /**
   * The name of the function to call
   */
  functionName: string;
  
  /**
   * The arguments for the function
   */
  arguments: Record<string, any>;
  
  /**
   * The result of the function call
   */
  result: string;
}

/**
 * Interface for an LLM response with function calling
 */
export interface LLMFunctionCallResponse {
  /**
   * The content of the response
   */
  content: string;
  
  /**
   * Optional function call information
   */
  function_call?: {
    /**
     * The name of the function to call
     */
    name: string;
    
    /**
     * The arguments for the function as a JSON string
     */
    arguments: string;
  };
}

/**
 * An agent that uses OpenAI's function calling capability to interact with tools
 */
export class OpenAIFunctionsAgent {
  private llm: LLM;
  private tools: Map<string, Tool>;
  private maxIterations: number;
  private systemMessage: string;
  private onReasoning?: (reasoning: string) => void;
  private onFunctionCall?: (functionName: string, arguments_: Record<string, any>) => void;
  private onFunctionResult?: (functionName: string, result: string) => void;
  private returnIntermediateSteps: boolean;
  
  /**
   * Create a new OpenAIFunctionsAgent
   * 
   * @param options Options for the agent
   */
  constructor(options: OpenAIFunctionsAgentOptions) {
    this.llm = options.llm;
    
    // Create a map of tools by name for easy lookup
    this.tools = new Map();
    for (const tool of options.tools) {
      this.tools.set(tool.name, tool);
    }
    
    this.maxIterations = options.maxIterations || 10;
    this.systemMessage = options.systemMessage || this.getDefaultSystemMessage();
    this.onReasoning = options.onReasoning;
    this.onFunctionCall = options.onFunctionCall;
    this.onFunctionResult = options.onFunctionResult;
    this.returnIntermediateSteps = options.returnIntermediateSteps || false;
  }
  
  /**
   * Get the default system message for the agent
   * 
   * @returns The default system message
   */
  private getDefaultSystemMessage(): string {
    return `You are a helpful AI assistant that can use tools to answer questions. 
Think step-by-step to determine the best approach. 
If you need to use a tool, call the appropriate function. 
If you know the answer directly, respond to the user.`;
  }
  
  /**
   * Convert tools to OpenAI function definitions
   * 
   * @returns The OpenAI function definitions
   */
  private toolsToFunctions(): Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }> {
    return Array.from(this.tools.values()).map(tool => {
      // Create a basic function definition
      const functionDef = {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: {} as Record<string, any>,
          required: [] as string[]
        }
      };
      
      // If the tool has a schema, use it for the parameters
      if (tool.schema) {
        if (tool.schema.type === 'string') {
          // For string inputs, create a single 'input' parameter
          functionDef.parameters.properties = {
            input: {
              type: 'string',
              description: tool.schema.description || 'The input for the tool'
            }
          };
          functionDef.parameters.required = ['input'];
        } else if (tool.schema.type === 'object' && tool.schema.properties) {
          // For object inputs, use the properties directly
          functionDef.parameters.properties = tool.schema.properties;
          functionDef.parameters.required = tool.schema.required || [];
        }
      } else {
        // Default to a single 'input' parameter if no schema is provided
        functionDef.parameters.properties = {
          input: {
            type: 'string',
            description: 'The input for the tool'
          }
        };
        functionDef.parameters.required = ['input'];
      }
      
      return functionDef;
    });
  }
  
  /**
   * Execute a tool with the given function name and arguments
   * 
   * @param functionName The name of the function to call
   * @param arguments_ The arguments for the function
   * @returns The result of the function call
   */
  private async executeTool(functionName: string, arguments_: Record<string, any>): Promise<string> {
    // Check if the function name is a valid tool
    const tool = this.tools.get(functionName);
    if (!tool) {
      return `Error: Tool '${functionName}' not found. Available tools are: ${Array.from(this.tools.keys()).join(', ')}`;
    }
    
    try {
      // Convert the arguments to a string input for the tool
      let input: string;
      
      if (tool.schema?.type === 'string') {
        // For string inputs, use the 'input' parameter directly
        input = arguments_.input || '';
      } else {
        // For object inputs, stringify the arguments
        input = JSON.stringify(arguments_);
      }
      
      // Execute the tool
      return await tool.execute(input);
    } catch (error) {
      return `Error executing tool '${functionName}': ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  /**
   * Call the LLM with the given messages and functions
   * 
   * @param messages The messages to send to the LLM
   * @param functions The functions to make available to the LLM
   * @returns The LLM response
   */
  private async callLLM(
    messages: ChatMessage[],
    functions: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
    }>
  ): Promise<LLMFunctionCallResponse> {
    // In a real implementation, this would call the OpenAI API with function calling
    // For now, we'll simulate a response
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    // Simulate reasoning
    const reasoning = `I need to answer the question: "${lastUserMessage}". Let me think about how to approach this...`;
    
    // Call the onReasoning callback if provided
    if (this.onReasoning) {
      this.onReasoning(reasoning);
    }
    
    // Randomly decide whether to call a function or return an answer
    const shouldCallFunction = Math.random() > 0.3 || messages.length < 4;
    
    if (shouldCallFunction && functions.length > 0) {
      // Randomly select a function to call
      const functionIndex = Math.floor(Math.random() * functions.length);
      const functionToCall = functions[functionIndex];
      
      // Create a simple argument for the function
      const functionArgs = { input: lastUserMessage };
      
      // Return a function call
      return {
        content: reasoning,
        function_call: {
          name: functionToCall.name,
          arguments: JSON.stringify(functionArgs)
        }
      };
    } else {
      // Return a final answer
      return {
        content: `Based on the information I have, I can answer your question: "${lastUserMessage}". The answer is: This is a simulated response from the OpenAI Functions agent.`
      };
    }
  }
  
  /**
   * Run the agent with the given question
   * 
   * @param question The question to answer
   * @returns The answer to the question
   */
  async run(question: string): Promise<string> {
    // Convert tools to OpenAI function definitions
    const functions = this.toolsToFunctions();
    
    // Initialize the conversation with the system message and user question
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemMessage },
      { role: 'user', content: question }
    ];
    
    // Run the conversation for up to maxIterations
    for (let i = 0; i < this.maxIterations; i++) {
      // Call the LLM with the current messages and functions
      const response = await this.callLLM(messages, functions);
      
      // Add the assistant's message to the conversation
      messages.push({ role: 'assistant', content: response.content || '' });
      
      // Check if the assistant wants to call a function
      if (response.function_call) {
        const functionName = response.function_call.name;
        let functionArgs: Record<string, any> = {};
        
        try {
          // Parse the function arguments
          functionArgs = JSON.parse(response.function_call.arguments);
        } catch (error) {
          // If the arguments can't be parsed, use an empty object
          functionArgs = {};
        }
        
        // Call the onFunctionCall callback if provided
        if (this.onFunctionCall) {
          this.onFunctionCall(functionName, functionArgs);
        }
        
        // Execute the tool
        const result = await this.executeTool(functionName, functionArgs);
        
        // Call the onFunctionResult callback if provided
        if (this.onFunctionResult) {
          this.onFunctionResult(functionName, result);
        }
        
        // Add the function call result to the conversation
        messages.push({
          role: 'function',
          name: functionName,
          content: result
        });
      } else {
        // If the assistant doesn't want to call a function, we're done
        return response.content || '';
      }
    }
    
    // If we've reached the maximum number of iterations, return a message
    return `I wasn't able to find a definitive answer within the maximum number of iterations (${this.maxIterations}). Here's what I've learned so far: ${messages[messages.length - 1].content}`;
  }
  
  /**
   * Run the agent with the given question and return the answer with additional metadata
   * 
   * @param question The question to answer
   * @returns The answer to the question with additional metadata
   */
  async call(question: string): Promise<{
    answer: string;
    steps?: FunctionCallStep[];
  }> {
    // Convert tools to OpenAI function definitions
    const functions = this.toolsToFunctions();
    
    // Initialize the conversation with the system message and user question
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemMessage },
      { role: 'user', content: question }
    ];
    
    // Initialize the steps array
    const steps: FunctionCallStep[] = [];
    
    // Run the conversation for up to maxIterations
    for (let i = 0; i < this.maxIterations; i++) {
      // Call the LLM with the current messages and functions
      const response = await this.callLLM(messages, functions);
      
      // Add the assistant's message to the conversation
      messages.push({ role: 'assistant', content: response.content || '' });
      
      // Check if the assistant wants to call a function
      if (response.function_call) {
        const functionName = response.function_call.name;
        let functionArgs: Record<string, any> = {};
        
        try {
          // Parse the function arguments
          functionArgs = JSON.parse(response.function_call.arguments);
        } catch (error) {
          // If the arguments can't be parsed, use an empty object
          functionArgs = {};
        }
        
        // Call the onFunctionCall callback if provided
        if (this.onFunctionCall) {
          this.onFunctionCall(functionName, functionArgs);
        }
        
        // Execute the tool
        const result = await this.executeTool(functionName, functionArgs);
        
        // Call the onFunctionResult callback if provided
        if (this.onFunctionResult) {
          this.onFunctionResult(functionName, result);
        }
        
        // Add the function call result to the conversation
        messages.push({
          role: 'function',
          name: functionName,
          content: result
        });
        
        // Add the step to the steps array
        steps.push({
          reasoning: response.content || '',
          functionName,
          arguments: functionArgs,
          result
        });
      } else {
        // If the assistant doesn't want to call a function, we're done
        return {
          answer: response.content || '',
          steps: this.returnIntermediateSteps ? steps : undefined
        };
      }
    }
    
    // If we've reached the maximum number of iterations, return a message
    const answer = `I wasn't able to find a definitive answer within the maximum number of iterations (${this.maxIterations}). Here's what I've learned so far: ${messages[messages.length - 1].content}`;
    
    return {
      answer,
      steps: this.returnIntermediateSteps ? steps : undefined
    };
  }
}

/**
 * Factory for creating OpenAIFunctionsAgent instances
 */
export class OpenAIFunctionsAgentFactory {
  /**
   * Create a new OpenAIFunctionsAgent
   * 
   * @param options Options for the agent
   * @returns A new OpenAIFunctionsAgent instance
   */
  static create(options: OpenAIFunctionsAgentOptions): OpenAIFunctionsAgent {
    return new OpenAIFunctionsAgent(options);
  }
  
  /**
   * Create a new OpenAIFunctionsAgent with a simple configuration
   * 
   * @param llm The LLM to use for reasoning
   * @param tools The tools available to the agent
   * @param maxIterations The maximum number of iterations
   * @returns A new OpenAIFunctionsAgent instance
   */
  static fromLLMAndTools(
    llm: LLM,
    tools: Tool[],
    maxIterations: number = 10
  ): OpenAIFunctionsAgent {
    return new OpenAIFunctionsAgent({
      llm,
      tools,
      maxIterations
    });
  }
  
  /**
   * Create a new OpenAIFunctionsAgent with a custom system message
   * 
   * @param llm The LLM to use for reasoning
   * @param tools The tools available to the agent
   * @param systemMessage The system message for the agent
   * @returns A new OpenAIFunctionsAgent instance
   */
  static withSystemMessage(
    llm: LLM,
    tools: Tool[],
    systemMessage: string
  ): OpenAIFunctionsAgent {
    return new OpenAIFunctionsAgent({
      llm,
      tools,
      systemMessage
    });
  }
}
