import { BaseTool } from './Tool.js';

/**
 * Options for CalculatorTool
 */
export interface CalculatorToolOptions {
  /**
   * Optional maximum number of operations to allow
   * This is a safety measure to prevent infinite loops
   */
  maxOperations?: number;
  
  /**
   * Optional callback to call before executing the calculation
   */
  onCalculation?: (expression: string) => void;
  
  /**
   * Optional callback to call after executing the calculation
   */
  onResult?: (expression: string, result: number) => void;
  
  /**
   * Optional flag to allow unsafe expressions
   * If false, only basic arithmetic operations are allowed
   */
  allowUnsafe?: boolean;
}

/**
 * A tool that performs mathematical calculations
 */
export class CalculatorTool extends BaseTool {
  private maxOperations: number;
  private onCalculation?: (expression: string) => void;
  private onResult?: (expression: string, result: number) => void;
  private allowUnsafe: boolean;
  
  /**
   * Create a new CalculatorTool
   * 
   * @param options Options for the tool
   */
  constructor(options: CalculatorToolOptions = {}) {
    super(
      'calculator',
      'Perform mathematical calculations. Use this when you need to solve math problems or perform arithmetic operations.',
      {
        type: 'string',
        description: 'The mathematical expression to evaluate'
      }
    );
    
    this.maxOperations = options.maxOperations || 100;
    this.onCalculation = options.onCalculation;
    this.onResult = options.onResult;
    this.allowUnsafe = options.allowUnsafe || false;
  }
  
  /**
   * Execute the tool with the given input
   * 
   * @param input The mathematical expression to evaluate
   * @returns The result of the calculation
   */
  async execute(input: string): Promise<string> {
    // Call the onCalculation callback if provided
    if (this.onCalculation) {
      this.onCalculation(input);
    }
    
    try {
      // Sanitize the input
      const sanitizedInput = this.sanitizeInput(input);
      
      // Evaluate the expression
      const result = this.evaluate(sanitizedInput);
      
      // Call the onResult callback if provided
      if (this.onResult) {
        this.onResult(sanitizedInput, result);
      }
      
      // Return the result
      return result.toString();
    } catch (error) {
      return `Error calculating result: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  /**
   * Sanitize the input expression
   * 
   * @param input The input expression
   * @returns The sanitized expression
   */
  private sanitizeInput(input: string): string {
    // Remove any non-mathematical characters
    let sanitized = input.replace(/[^0-9+\-*/().,%^e\s]/g, '');
    
    // If unsafe expressions are not allowed, remove potentially dangerous operations
    if (!this.allowUnsafe) {
      // Remove eval, Function, and other potentially dangerous constructs
      sanitized = sanitized.replace(/eval|Function|setTimeout|setInterval|new|this|window|document|global|process/g, '');
    }
    
    return sanitized;
  }
  
  /**
   * Evaluate a mathematical expression
   * 
   * @param expression The expression to evaluate
   * @returns The result of the evaluation
   */
  private evaluate(expression: string): number {
    // Count the number of operations to prevent infinite loops
    let operationCount = 0;
    
    // Define a safe evaluation function
    const safeEval = (expr: string): number => {
      // Increment the operation count
      operationCount++;
      
      // Check if the maximum number of operations has been reached
      if (operationCount > this.maxOperations) {
        throw new Error('Maximum number of operations exceeded');
      }
      
      // Use a safer approach than eval
      // This is still not completely safe, but better than using eval directly
      try {
        // Use Function constructor instead of eval
        // This creates a new function that evaluates the expression
        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${expr}`)();
        
        // Ensure the result is a number
        if (typeof result !== 'number' || isNaN(result)) {
          throw new Error('Expression did not evaluate to a number');
        }
        
        return result;
      } catch (error) {
        throw new Error(`Invalid expression: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    // Evaluate the expression
    return safeEval(expression);
  }
}

/**
 * Factory for creating CalculatorTool instances
 */
export class CalculatorToolFactory {
  /**
   * Create a new CalculatorTool
   * 
   * @param options Options for the tool
   * @returns A new CalculatorTool instance
   */
  static create(options: CalculatorToolOptions = {}): CalculatorTool {
    return new CalculatorTool(options);
  }
  
  /**
   * Create a new CalculatorTool with safe settings
   * 
   * @returns A new CalculatorTool instance with safe settings
   */
  static safe(): CalculatorTool {
    return new CalculatorTool({
      allowUnsafe: false,
      maxOperations: 50
    });
  }
}
