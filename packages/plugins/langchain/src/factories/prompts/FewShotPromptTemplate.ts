import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating FewShotPromptTemplate instances
 */
export class FewShotPromptTemplateFactory implements ComponentFactory<any> {
  /**
   * Creates a new FewShotPromptTemplate
   * 
   * @param config Configuration for the FewShotPromptTemplate
   * @returns A new FewShotPromptTemplate instance
   */
  async create(config: {
    examples: Array<Record<string, any>>;
    examplePrompt: any;
    prefix?: string;
    suffix?: string;
    exampleSeparator?: string;
    inputVariables?: string[];
    partialVariables?: Record<string, any>;
    templateFormat?: string;
    validateTemplate?: boolean;
  }): Promise<any> {
    try {
      // Check required parameters
      if (!config.examples || !Array.isArray(config.examples) || config.examples.length === 0) {
        throw new Error("Examples are required and must be a non-empty array");
      }
      if (!config.examplePrompt) {
        throw new Error("Example prompt is required");
      }
      
      // Set default values
      const examples = config.examples;
      const examplePrompt = config.examplePrompt;
      const prefix = config.prefix || "";
      const suffix = config.suffix || "";
      const exampleSeparator = config.exampleSeparator || "\n\n";
      const templateFormat = config.templateFormat || "f-string";
      const validateTemplate = config.validateTemplate !== false;
      
      // Extract input variables from prefix and suffix
      const prefixVariables = this._extractInputVariables(prefix);
      const suffixVariables = this._extractInputVariables(suffix);
      
      // Get example prompt input variables
      const examplePromptInputVariables = examplePrompt.getInputVariables ? 
        examplePrompt.getInputVariables() : 
        (examplePrompt.inputVariables || []);
      
      // Combine all input variables
      const allInputVariables = new Set([
        ...prefixVariables,
        ...suffixVariables
      ]);
      
      // Filter out example-specific variables
      for (const variable of examplePromptInputVariables) {
        if (examples.every(example => variable in example)) {
          // This variable is provided by examples, so it's not a partial variable
          continue;
        } else {
          // This variable needs to be provided by the user
          allInputVariables.add(variable);
        }
      }
      
      const inputVariables = config.inputVariables || Array.from(allInputVariables);
      const partialVariables = config.partialVariables || {};
      
      // Validate the template if required
      if (validateTemplate) {
        this._validateTemplate(
          prefix,
          suffix,
          examplePromptInputVariables,
          examples,
          inputVariables,
          partialVariables
        );
      }
      
      // Create a FewShotPromptTemplate
      return {
        examples,
        examplePrompt,
        prefix,
        suffix,
        exampleSeparator,
        inputVariables,
        partialVariables,
        templateFormat,
        
        /**
         * Format the few-shot prompt with the given values
         * 
         * @param values Values to format the prompt with
         * @returns The formatted prompt
         */
        format: async (values: Record<string, any> = {}): Promise<string> => {
          try {
            // Combine partial variables with provided values
            const allValues = { ...partialVariables, ...values };
            
            // Check if all required variables are provided
            const missingVariables = inputVariables.filter(
              variable => !(variable in allValues)
            );
            
            if (missingVariables.length > 0) {
              throw new Error(`Missing variables: ${missingVariables.join(", ")}`);
            }
            
            // Format the prefix
            let formattedPrefix = prefix;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedPrefix = formattedPrefix.replace(regex, String(value));
            }
            
            // Format the examples
            const formattedExamples = [];
            for (const example of examples) {
              // Combine example values with provided values
              const exampleValues = { ...allValues };
              for (const [key, value] of Object.entries(example)) {
                exampleValues[key] = value;
              }
              
              // Format the example
              const formattedExample = await examplePrompt.format(exampleValues);
              formattedExamples.push(formattedExample);
            }
            
            // Format the suffix
            let formattedSuffix = suffix;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedSuffix = formattedSuffix.replace(regex, String(value));
            }
            
            // Combine everything
            return `${formattedPrefix}${formattedExamples.join(exampleSeparator)}${exampleSeparator}${formattedSuffix}`;
          } catch (error) {
            console.error("Error formatting few-shot prompt:", error);
            throw new Error(`Failed to format few-shot prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Format the few-shot prompt with the given values as a prompt
         * 
         * @param values Values to format the prompt with
         * @returns The formatted prompt
         */
        formatPrompt: async (values: Record<string, any> = {}): Promise<any> => {
          try {
            // Format the template directly here
            // Combine partial variables with provided values
            const allValues = { ...partialVariables, ...values };
            
            // Check if all required variables are provided
            const missingVariables = inputVariables.filter(
              variable => !(variable in allValues)
            );
            
            if (missingVariables.length > 0) {
              throw new Error(`Missing variables: ${missingVariables.join(", ")}`);
            }
            
            // Format the prefix
            let formattedPrefix = prefix;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedPrefix = formattedPrefix.replace(regex, String(value));
            }
            
            // Format the examples
            const formattedExamples = [];
            for (const example of examples) {
              // Combine example values with provided values
              const exampleValues = { ...allValues };
              for (const [key, value] of Object.entries(example)) {
                exampleValues[key] = value;
              }
              
              // Format the example
              const formattedExample = await examplePrompt.format(exampleValues);
              formattedExamples.push(formattedExample);
            }
            
            // Format the suffix
            let formattedSuffix = suffix;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedSuffix = formattedSuffix.replace(regex, String(value));
            }
            
            // Combine everything
            const formattedTemplate = `${formattedPrefix}${formattedExamples.join(exampleSeparator)}${exampleSeparator}${formattedSuffix}`;
            
            // Return a prompt object
            return {
              text: formattedTemplate,
              toString: () => formattedTemplate,
              toChatMessages: () => [{
                role: "user",
                content: formattedTemplate
              }]
            };
          } catch (error) {
            console.error("Error formatting prompt:", error);
            throw new Error(`Failed to format prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Get the input variables for the few-shot prompt
         * 
         * @returns The input variables
         */
        getInputVariables: (): string[] => {
          return [...inputVariables];
        },
        
        /**
         * Get the partial variables for the few-shot prompt
         * 
         * @returns The partial variables
         */
        getPartialVariables: (): Record<string, any> => {
          return { ...partialVariables };
        },
        
        /**
         * Create a copy of the few-shot prompt with new partial variables
         * 
         * @param newPartialVariables New partial variables to add
         * @returns A new FewShotPromptTemplate with the updated partial variables
         */
        partial: async (newPartialVariables: Record<string, any> = {}): Promise<any> => {
          try {
            // Create a new FewShotPromptTemplate with the updated partial variables
            return this.create({
              examples,
              examplePrompt,
              prefix,
              suffix,
              exampleSeparator,
              inputVariables: inputVariables.filter(
                variable => !(variable in newPartialVariables)
              ),
              partialVariables: { ...partialVariables, ...newPartialVariables },
              templateFormat,
              validateTemplate
            });
          } catch (error) {
            console.error("Error creating partial few-shot prompt:", error);
            throw new Error(`Failed to create partial few-shot prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
    } catch (error) {
      console.error("Error creating FewShotPromptTemplate:", error);
      throw new Error(`Failed to create FewShotPromptTemplate: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Extract input variables from a template
   * 
   * @param template The template to extract variables from
   * @returns The extracted input variables
   */
  private _extractInputVariables(template: string): string[] {
    const matches = template.match(/{([^{}]*)}/g) || [];
    const variables = matches.map(match => match.slice(1, -1));
    return [...new Set(variables)];
  }
  
  /**
   * Validate a few-shot prompt template
   * 
   * @param prefix The prefix template
   * @param suffix The suffix template
   * @param examplePromptInputVariables The example prompt input variables
   * @param examples The examples
   * @param inputVariables The input variables
   * @param partialVariables The partial variables
   */
  private _validateTemplate(
    prefix: string,
    suffix: string,
    examplePromptInputVariables: string[],
    examples: Array<Record<string, any>>,
    inputVariables: string[],
    partialVariables: Record<string, any>
  ): void {
    // Extract all variables from prefix and suffix
    const prefixVariables = this._extractInputVariables(prefix);
    const suffixVariables = this._extractInputVariables(suffix);
    
    // Combine all extracted variables
    const extractedVariables = new Set([...prefixVariables, ...suffixVariables]);
    
    // Add example prompt variables that are not provided by examples
    for (const variable of examplePromptInputVariables) {
      if (examples.every(example => variable in example)) {
        // This variable is provided by examples, so it's not a user input variable
        continue;
      } else {
        // This variable needs to be provided by the user
        extractedVariables.add(variable);
      }
    }
    
    // Check if all extracted variables are in inputVariables or partialVariables
    const allVariables = new Set([...inputVariables, ...Object.keys(partialVariables)]);
    const missingVariables = Array.from(extractedVariables).filter(
      variable => !allVariables.has(variable)
    );
    
    if (missingVariables.length > 0) {
      throw new Error(`Missing variables in template: ${missingVariables.join(", ")}`);
    }
    
    // Check if all inputVariables are in the template
    const unusedVariables = inputVariables.filter(
      variable => !extractedVariables.has(variable)
    );
    
    if (unusedVariables.length > 0) {
      throw new Error(`Unused variables in inputVariables: ${unusedVariables.join(", ")}`);
    }
    
    // Check if all example prompt variables are provided by examples or inputVariables or partialVariables
    for (const variable of examplePromptInputVariables) {
      if (examples.every(example => variable in example)) {
        // This variable is provided by examples
        continue;
      } else if (allVariables.has(variable)) {
        // This variable is provided by inputVariables or partialVariables
        continue;
      } else {
        throw new Error(`Example prompt variable "${variable}" is not provided by examples, inputVariables, or partialVariables`);
      }
    }
  }
}
