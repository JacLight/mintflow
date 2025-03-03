import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating PromptTemplate instances
 */
export class PromptTemplateFactory implements ComponentFactory<any> {
  /**
   * Creates a new PromptTemplate
   * 
   * @param config Configuration for the PromptTemplate
   * @returns A new PromptTemplate instance
   */
  async create(config: {
    template: string;
    inputVariables?: string[];
    partialVariables?: Record<string, any>;
    validateTemplate?: boolean;
    templateFormat?: string;
  }): Promise<any> {
    try {
      // Check required parameters
      if (!config.template) {
        throw new Error("Template is required");
      }
      
      // Set default values
      const template = config.template;
      const inputVariables = config.inputVariables || this._extractInputVariables(template);
      const partialVariables = config.partialVariables || {};
      const validateTemplate = config.validateTemplate !== false;
      const templateFormat = config.templateFormat || "f-string";
      
      // Validate the template if required
      if (validateTemplate) {
        this._validateTemplate(template, inputVariables, partialVariables);
      }
      
      // Create a PromptTemplate
      return {
        template,
        inputVariables,
        partialVariables,
        templateFormat,
        
        /**
         * Format the template with the given values
         * 
         * @param values Values to format the template with
         * @returns The formatted template
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
            
            return formattedTemplate;
          } catch (error) {
            console.error("Error formatting template:", error);
            throw new Error(`Failed to format template: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Format the template with the given values as a prompt
         * 
         * @param values Values to format the template with
         * @returns The formatted prompt
         */
        formatPrompt: async (values: Record<string, any> = {}): Promise<any> => {
          try {
            // Format the template directly here instead of calling this.format
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
         * Get the input variables for the template
         * 
         * @returns The input variables
         */
        getInputVariables: (): string[] => {
          return [...inputVariables];
        },
        
        /**
         * Get the partial variables for the template
         * 
         * @returns The partial variables
         */
        getPartialVariables: (): Record<string, any> => {
          return { ...partialVariables };
        },
        
        /**
         * Create a copy of the template with new partial variables
         * 
         * @param newPartialVariables New partial variables to add
         * @returns A new PromptTemplate with the updated partial variables
         */
        partial: async (newPartialVariables: Record<string, any> = {}): Promise<any> => {
          try {
            // Create a new PromptTemplate with the updated partial variables
            return this.create({
              template,
              inputVariables: inputVariables.filter(
                variable => !(variable in newPartialVariables)
              ),
              partialVariables: { ...partialVariables, ...newPartialVariables },
              validateTemplate,
              templateFormat
            });
          } catch (error) {
            console.error("Error creating partial template:", error);
            throw new Error(`Failed to create partial template: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
    } catch (error) {
      console.error("Error creating PromptTemplate:", error);
      throw new Error(`Failed to create PromptTemplate: ${error instanceof Error ? error.message : String(error)}`);
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
   * Validate a template
   * 
   * @param template The template to validate
   * @param inputVariables The input variables
   * @param partialVariables The partial variables
   */
  private _validateTemplate(
    template: string,
    inputVariables: string[],
    partialVariables: Record<string, any>
  ): void {
    // Extract all variables from the template
    const extractedVariables = this._extractInputVariables(template);
    
    // Check if all extracted variables are in inputVariables or partialVariables
    const allVariables = new Set([...inputVariables, ...Object.keys(partialVariables)]);
    const missingVariables = extractedVariables.filter(
      variable => !allVariables.has(variable)
    );
    
    if (missingVariables.length > 0) {
      throw new Error(`Missing variables in template: ${missingVariables.join(", ")}`);
    }
    
    // Check if all inputVariables are in the template
    const unusedVariables = inputVariables.filter(
      variable => !extractedVariables.includes(variable)
    );
    
    if (unusedVariables.length > 0) {
      throw new Error(`Unused variables in inputVariables: ${unusedVariables.join(", ")}`);
    }
  }
}
