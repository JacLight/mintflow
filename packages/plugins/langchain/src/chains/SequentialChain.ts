/**
 * Interface for a chain that can be run with input values
 */
export interface Chain {
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the chain
   */
  run(input: Record<string, any>, options?: any): Promise<any>;
}

/**
 * Options for SequentialChain
 */
export interface SequentialChainOptions {
  /**
   * The chains to run in sequence
   */
  chains: Chain[];
  
  /**
   * Optional input key mappings for each chain
   * Maps the output keys from the previous chain to the input keys for the next chain
   * If not provided, the output of the previous chain is passed as-is to the next chain
   */
  inputMappings?: Array<Record<string, string>>;
  
  /**
   * Optional output key mappings for the final result
   * Maps the output keys from the last chain to the output keys for the final result
   * If not provided, the output of the last chain is returned as-is
   */
  outputMapping?: Record<string, string>;
  
  /**
   * Optional callback to call before each chain is run
   */
  onChainStart?: (chainIndex: number, input: Record<string, any>) => void;
  
  /**
   * Optional callback to call after each chain is run
   */
  onChainEnd?: (chainIndex: number, output: any) => void;
}

/**
 * A chain that runs multiple chains in sequence, passing the output of one chain as input to the next
 */
export class SequentialChain implements Chain {
  private chains: Chain[];
  private inputMappings?: Array<Record<string, string>>;
  private outputMapping?: Record<string, string>;
  private onChainStart?: (chainIndex: number, input: Record<string, any>) => void;
  private onChainEnd?: (chainIndex: number, output: any) => void;
  
  /**
   * Create a new SequentialChain
   * 
   * @param options Options for the chain
   */
  constructor(options: SequentialChainOptions) {
    this.chains = options.chains;
    this.inputMappings = options.inputMappings;
    this.outputMapping = options.outputMapping;
    this.onChainStart = options.onChainStart;
    this.onChainEnd = options.onChainEnd;
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the first chain
   * @param options Optional parameters for the chains
   * @returns The output of the last chain
   */
  async run(input: Record<string, any>, options?: any): Promise<any> {
    let currentInput = { ...input };
    let result: any;
    
    // Run each chain in sequence
    for (let i = 0; i < this.chains.length; i++) {
      const chain = this.chains[i];
      
      // Map the input if a mapping is provided
      if (this.inputMappings && this.inputMappings[i]) {
        const mapping = this.inputMappings[i];
        const mappedInput: Record<string, any> = {};
        
        // Apply the mapping
        for (const [targetKey, sourceKey] of Object.entries(mapping)) {
          mappedInput[targetKey] = currentInput[sourceKey];
        }
        
        // Add any unmapped keys from the original input
        for (const [key, value] of Object.entries(currentInput)) {
          if (!(key in mappedInput)) {
            mappedInput[key] = value;
          }
        }
        
        currentInput = mappedInput;
      }
      
      // Call the onChainStart callback if provided
      if (this.onChainStart) {
        this.onChainStart(i, currentInput);
      }
      
      // Run the chain
      result = await chain.run(currentInput, options);
      
      // Call the onChainEnd callback if provided
      if (this.onChainEnd) {
        this.onChainEnd(i, result);
      }
      
      // Update the input for the next chain
      if (typeof result === 'object' && result !== null) {
        currentInput = { ...currentInput, ...result };
      } else {
        currentInput = { ...currentInput, result };
      }
    }
    
    // Map the output if a mapping is provided
    if (this.outputMapping && typeof result === 'object' && result !== null) {
      const mappedOutput: Record<string, any> = {};
      
      // Apply the mapping
      for (const [targetKey, sourceKey] of Object.entries(this.outputMapping)) {
        mappedOutput[targetKey] = result[sourceKey];
      }
      
      return mappedOutput;
    }
    
    // Return the result as-is
    return result;
  }
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the first chain
   * @param options Optional parameters for the chains
   * @returns The output of the last chain with additional metadata
   */
  async call(input: Record<string, any>, options?: any): Promise<{ output: any; intermediateSteps: any[] }> {
    let currentInput = { ...input };
    let result: any;
    const intermediateSteps: any[] = [];
    
    // Run each chain in sequence
    for (let i = 0; i < this.chains.length; i++) {
      const chain = this.chains[i];
      
      // Map the input if a mapping is provided
      if (this.inputMappings && this.inputMappings[i]) {
        const mapping = this.inputMappings[i];
        const mappedInput: Record<string, any> = {};
        
        // Apply the mapping
        for (const [targetKey, sourceKey] of Object.entries(mapping)) {
          mappedInput[targetKey] = currentInput[sourceKey];
        }
        
        // Add any unmapped keys from the original input
        for (const [key, value] of Object.entries(currentInput)) {
          if (!(key in mappedInput)) {
            mappedInput[key] = value;
          }
        }
        
        currentInput = mappedInput;
      }
      
      // Call the onChainStart callback if provided
      if (this.onChainStart) {
        this.onChainStart(i, currentInput);
      }
      
      // Run the chain
      result = await chain.run(currentInput, options);
      
      // Call the onChainEnd callback if provided
      if (this.onChainEnd) {
        this.onChainEnd(i, result);
      }
      
      // Store the intermediate step
      intermediateSteps.push({
        chainIndex: i,
        input: { ...currentInput },
        output: result
      });
      
      // Update the input for the next chain
      if (typeof result === 'object' && result !== null) {
        currentInput = { ...currentInput, ...result };
      } else {
        currentInput = { ...currentInput, result };
      }
    }
    
    // Map the output if a mapping is provided
    if (this.outputMapping && typeof result === 'object' && result !== null) {
      const mappedOutput: Record<string, any> = {};
      
      // Apply the mapping
      for (const [targetKey, sourceKey] of Object.entries(this.outputMapping)) {
        mappedOutput[targetKey] = result[sourceKey];
      }
      
      result = mappedOutput;
    }
    
    // Return the result with intermediate steps
    return {
      output: result,
      intermediateSteps
    };
  }
}

/**
 * Factory for creating SequentialChain instances
 */
export class SequentialChainFactory {
  /**
   * Create a new SequentialChain
   * 
   * @param options Options for the chain
   * @returns A new SequentialChain instance
   */
  static create(options: SequentialChainOptions): SequentialChain {
    return new SequentialChain(options);
  }
  
  /**
   * Create a new SequentialChain from an array of chains
   * 
   * @param chains The chains to run in sequence
   * @returns A new SequentialChain instance
   */
  static fromChains(chains: Chain[]): SequentialChain {
    return new SequentialChain({ chains });
  }
}
