import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating StructuredPromptTemplate instances
 */
export class StructuredPromptTemplateFactory implements ComponentFactory<any> {
  /**
   * Creates a new StructuredPromptTemplate
   * 
   * @param config Configuration for the StructuredPromptTemplate
   * @returns A new StructuredPromptTemplate instance
   */
  async create(config: {
    template: string;
    schema: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
    inputVariables?: string[];
    partialVariables?: Record<string, any>;
    validateTemplate?: boolean;
    outputParser?: any;
  }): Promise<any> {
    try {
      // Check required parameters
      if (!config.template) {
        throw new Error("Template is required");
      }
      if (!config.schema) {
        throw new Error("Schema is required");
      }
      
      // Set default values
      const template = config.template;
      const schema = config.schema;
      const validateTemplate = config.validateTemplate !== false;
      const outputParser = config.outputParser;
      
      // Extract input variables from template
      const extractedVariables = this._extractInputVariables(template);
      
      const inputVariables = config.inputVariables || Array.from(extractedVariables);
      const partialVariables = config.partialVariables || {};
      
      // Validate the template if required
      if (validateTemplate) {
        this._validateTemplate(
          template,
          inputVariables,
          partialVariables
        );
      }
      
      // Create a StructuredPromptTemplate
      return {
        template,
        schema,
        inputVariables,
        partialVariables,
        outputParser,
        
        /**
         * Format the structured prompt with the given values
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
            
            // Format the template
            let formattedTemplate = template;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedTemplate = formattedTemplate.replace(regex, String(value));
            }
            
            // Add schema information
            const schemaStr = JSON.stringify(schema, null, 2);
            formattedTemplate += `\n\nYour response should be formatted as a JSON object that conforms to the following schema:\n${schemaStr}`;
            
            return formattedTemplate;
          } catch (error) {
            console.error("Error formatting structured prompt:", error);
            throw new Error(`Failed to format structured prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Format the structured prompt with the given values as a chat prompt
         * 
         * @param values Values to format the prompt with
         * @returns The formatted chat messages
         */
        formatMessages: async (values: Record<string, any> = {}): Promise<Array<{
          role: string;
          content: string;
        }>> => {
          try {
            // Format the template directly
            // Combine partial variables with provided values
            const allValues = { ...partialVariables, ...values };
            
            // Check if all required variables are provided
            const missingVariables = inputVariables.filter(
              variable => !(variable in allValues)
            );
            
            if (missingVariables.length > 0) {
              throw new Error(`Missing variables: ${missingVariables.join(", ")}`);
            }
            
            // Format the template
            let formattedTemplate = template;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedTemplate = formattedTemplate.replace(regex, String(value));
            }
            
            // Add schema information
            const schemaStr = JSON.stringify(schema, null, 2);
            formattedTemplate += `\n\nYour response should be formatted as a JSON object that conforms to the following schema:\n${schemaStr}`;
            
            // Create chat messages
            const messages = [
              {
                role: "user",
                content: formattedTemplate
              }
            ];
            
            return messages;
          } catch (error) {
            console.error("Error formatting structured chat messages:", error);
            throw new Error(`Failed to format structured chat messages: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Format the structured prompt with the given values as a prompt
         * 
         * @param values Values to format the prompt with
         * @returns The formatted prompt
         */
        formatPrompt: async (values: Record<string, any> = {}): Promise<any> => {
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
            
            // Format the template
            let formattedTemplate = template;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedTemplate = formattedTemplate.replace(regex, String(value));
            }
            
            // Add schema information
            const schemaStr = JSON.stringify(schema, null, 2);
            formattedTemplate += `\n\nYour response should be formatted as a JSON object that conforms to the following schema:\n${schemaStr}`;
            
            // Create chat messages
            const formattedMessages = [
              {
                role: "user",
                content: formattedTemplate
              }
            ];
            
            // Return a prompt object
            return {
              text: formattedTemplate,
              messages: formattedMessages,
              toString: () => formattedTemplate,
              toChatMessages: () => formattedMessages,
              outputParser: outputParser
            };
          } catch (error) {
            console.error("Error formatting prompt:", error);
            throw new Error(`Failed to format prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Get the input variables for the structured prompt
         * 
         * @returns The input variables
         */
        getInputVariables: (): string[] => {
          return [...inputVariables];
        },
        
        /**
         * Get the partial variables for the structured prompt
         * 
         * @returns The partial variables
         */
        getPartialVariables: (): Record<string, any> => {
          return { ...partialVariables };
        },
        
        /**
         * Get the schema for the structured prompt
         * 
         * @returns The schema
         */
        getSchema: (): any => {
          return { ...schema };
        },
        
        /**
         * Create a copy of the structured prompt with new partial variables
         * 
         * @param newPartialVariables New partial variables to add
         * @returns A new StructuredPromptTemplate with the updated partial variables
         */
        partial: async (newPartialVariables: Record<string, any> = {}): Promise<any> => {
          try {
            // Create a new StructuredPromptTemplate with the updated partial variables
            return this.create({
              template,
              schema,
              inputVariables: inputVariables.filter(
                variable => !(variable in newPartialVariables)
              ),
              partialVariables: { ...partialVariables, ...newPartialVariables },
              validateTemplate,
              outputParser
            });
          } catch (error) {
            console.error("Error creating partial structured prompt:", error);
            throw new Error(`Failed to create partial structured prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
    } catch (error) {
      console.error("Error creating StructuredPromptTemplate:", error);
      throw new Error(`Failed to create StructuredPromptTemplate: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Extract input variables from a template
   * 
   * @param template The template to extract variables from
   * @returns The extracted input variables
   */
  private _extractInputVariables(template: string): Set<string> {
    const matches = template.match(/{([^{}]*)}/g) || [];
    const variables = matches.map(match => match.slice(1, -1));
    return new Set(variables);
  }
  
  /**
   * Validate a structured prompt template
   * 
   * @param template The template
   * @param inputVariables The input variables
   * @param partialVariables The partial variables
   */
  private _validateTemplate(
    template: string,
    inputVariables: string[],
    partialVariables: Record<string, any>
  ): void {
    // Extract all variables from template
    const extractedVariables = this._extractInputVariables(template);
    
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
  }
}
