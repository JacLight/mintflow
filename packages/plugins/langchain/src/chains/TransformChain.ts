import { Chain } from './SequentialChain.js';

/**
 * Type for a transformation function
 */
export type TransformFunction = (input: Record<string, any>) => Promise<Record<string, any>> | Record<string, any>;

/**
 * Options for TransformChain
 */
export interface TransformChainOptions {
  /**
   * The transformation function to apply to the input
   */
  transform: TransformFunction;
  
  /**
   * Optional input keys that the transform function expects
   * If provided, only these keys will be passed to the transform function
   */
  inputKeys?: string[];
  
  /**
   * Optional output keys that the transform function produces
   * If provided, only these keys will be included in the output
   */
  outputKeys?: string[];
  
  /**
   * Optional callback to call before the transformation is applied
   */
  onTransformStart?: (input: Record<string, any>) => void;
  
  /**
   * Optional callback to call after the transformation is applied
   */
  onTransformEnd?: (output: Record<string, any>) => void;
}

/**
 * A chain that transforms input values using a custom transformation function
 */
export class TransformChain implements Chain {
  private transform: TransformFunction;
  private inputKeys?: string[];
  private outputKeys?: string[];
  private onTransformStart?: (input: Record<string, any>) => void;
  private onTransformEnd?: (output: Record<string, any>) => void;
  
  /**
   * Create a new TransformChain
   * 
   * @param options Options for the chain
   */
  constructor(options: TransformChainOptions) {
    this.transform = options.transform;
    this.inputKeys = options.inputKeys;
    this.outputKeys = options.outputKeys;
    this.onTransformStart = options.onTransformStart;
    this.onTransformEnd = options.onTransformEnd;
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the transformation
   * @returns The transformed output
   */
  async run(input: Record<string, any>): Promise<Record<string, any>> {
    // Filter input keys if inputKeys is provided
    let transformInput: Record<string, any> = input;
    if (this.inputKeys) {
      transformInput = {};
      for (const key of this.inputKeys) {
        if (key in input) {
          transformInput[key] = input[key];
        }
      }
    }
    
    // Call the onTransformStart callback if provided
    if (this.onTransformStart) {
      this.onTransformStart(transformInput);
    }
    
    // Apply the transformation
    const transformOutput = await this.transform(transformInput);
    
    // Call the onTransformEnd callback if provided
    if (this.onTransformEnd) {
      this.onTransformEnd(transformOutput);
    }
    
    // Filter output keys if outputKeys is provided
    if (this.outputKeys) {
      const filteredOutput: Record<string, any> = {};
      for (const key of this.outputKeys) {
        if (key in transformOutput) {
          filteredOutput[key] = transformOutput[key];
        }
      }
      return filteredOutput;
    }
    
    // Return the transformed output
    return transformOutput;
  }
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the transformation
   * @returns The transformed output with additional metadata
   */
  async call(input: Record<string, any>): Promise<{ output: Record<string, any>; inputKeys: string[]; outputKeys: string[] }> {
    // Filter input keys if inputKeys is provided
    let transformInput: Record<string, any> = input;
    if (this.inputKeys) {
      transformInput = {};
      for (const key of this.inputKeys) {
        if (key in input) {
          transformInput[key] = input[key];
        }
      }
    }
    
    // Call the onTransformStart callback if provided
    if (this.onTransformStart) {
      this.onTransformStart(transformInput);
    }
    
    // Apply the transformation
    const transformOutput = await this.transform(transformInput);
    
    // Call the onTransformEnd callback if provided
    if (this.onTransformEnd) {
      this.onTransformEnd(transformOutput);
    }
    
    // Filter output keys if outputKeys is provided
    let output = transformOutput;
    if (this.outputKeys) {
      const filteredOutput: Record<string, any> = {};
      for (const key of this.outputKeys) {
        if (key in transformOutput) {
          filteredOutput[key] = transformOutput[key];
        }
      }
      output = filteredOutput;
    }
    
    // Return the transformed output with additional metadata
    return {
      output,
      inputKeys: Object.keys(transformInput),
      outputKeys: Object.keys(output)
    };
  }
}

/**
 * Factory for creating TransformChain instances
 */
export class TransformChainFactory {
  /**
   * Create a new TransformChain
   * 
   * @param options Options for the chain
   * @returns A new TransformChain instance
   */
  static create(options: TransformChainOptions): TransformChain {
    return new TransformChain(options);
  }
  
  /**
   * Create a new TransformChain from a transformation function
   * 
   * @param transform The transformation function to apply to the input
   * @param inputKeys Optional input keys that the transform function expects
   * @param outputKeys Optional output keys that the transform function produces
   * @returns A new TransformChain instance
   */
  static fromFunction(
    transform: TransformFunction,
    inputKeys?: string[],
    outputKeys?: string[]
  ): TransformChain {
    return new TransformChain({
      transform,
      inputKeys,
      outputKeys
    });
  }
  
  /**
   * Create a new TransformChain that extracts specific keys from the input
   * 
   * @param keys The keys to extract from the input
   * @returns A new TransformChain instance
   */
  static extractKeys(keys: string[]): TransformChain {
    return new TransformChain({
      transform: (input: Record<string, any>) => {
        const output: Record<string, any> = {};
        for (const key of keys) {
          if (key in input) {
            output[key] = input[key];
          }
        }
        return output;
      },
      outputKeys: keys
    });
  }
  
  /**
   * Create a new TransformChain that renames keys in the input
   * 
   * @param keyMap A mapping from source keys to target keys
   * @returns A new TransformChain instance
   */
  static renameKeys(keyMap: Record<string, string>): TransformChain {
    return new TransformChain({
      transform: (input: Record<string, any>) => {
        const output: Record<string, any> = { ...input };
        for (const [sourceKey, targetKey] of Object.entries(keyMap)) {
          if (sourceKey in input) {
            output[targetKey] = input[sourceKey];
            delete output[sourceKey];
          }
        }
        return output;
      },
      inputKeys: Object.keys(keyMap)
    });
  }
}
