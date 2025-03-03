import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating ChatPromptTemplate instances
 */
export class ChatPromptTemplateFactory implements ComponentFactory<any> {
  /**
   * Creates a new ChatPromptTemplate
   * 
   * @param config Configuration for the ChatPromptTemplate
   * @returns A new ChatPromptTemplate instance
   */
  async create(config: {
    promptMessages: Array<{
      role?: "system" | "user" | "assistant" | "function" | "tool";
      content: string;
      name?: string;
      templateFormat?: string;
      inputVariables?: string[];
    }>;
    inputVariables?: string[];
    partialVariables?: Record<string, any>;
    validateTemplate?: boolean;
  }): Promise<any> {
    try {
      // Check required parameters
      if (!config.promptMessages || !Array.isArray(config.promptMessages) || config.promptMessages.length === 0) {
        throw new Error("Prompt messages are required and must be a non-empty array");
      }
      
      // Set default values
      const promptMessages = config.promptMessages.map(message => ({
        role: message.role || "user",
        content: message.content,
        name: message.name,
        templateFormat: message.templateFormat || "f-string",
        inputVariables: message.inputVariables || this._extractInputVariables(message.content)
      }));
      
      // Extract all input variables from all messages
      const allInputVariables = new Set<string>();
      for (const message of promptMessages) {
        for (const variable of message.inputVariables) {
          allInputVariables.add(variable);
        }
      }
      
      const inputVariables = config.inputVariables || Array.from(allInputVariables);
      const partialVariables = config.partialVariables || {};
      const validateTemplate = config.validateTemplate !== false;
      
      // Validate the template if required
      if (validateTemplate) {
        this._validateTemplate(promptMessages, inputVariables, partialVariables);
      }
      
      // Create a ChatPromptTemplate
      return {
        promptMessages,
        inputVariables,
        partialVariables,
        
        /**
         * Format the chat prompt with the given values
         * 
         * @param values Values to format the chat prompt with
         * @returns The formatted chat messages
         */
        formatMessages: async (values: Record<string, any> = {}): Promise<Array<{
          role: string;
          content: string;
          name?: string;
        }>> => {
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
            
            // Format each message
            const formattedMessages = [];
            for (const message of promptMessages) {
              // Format the message content
              let formattedContent = message.content;
              for (const [key, value] of Object.entries(allValues)) {
                const regex = new RegExp(`{${key}}`, "g");
                formattedContent = formattedContent.replace(regex, String(value));
              }
              
              // Add the formatted message
              formattedMessages.push({
                role: message.role,
                content: formattedContent,
                ...(message.name ? { name: message.name } : {})
              });
            }
            
            return formattedMessages;
          } catch (error) {
            console.error("Error formatting chat messages:", error);
            throw new Error(`Failed to format chat messages: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Format the chat prompt with the given values as a prompt
         * 
         * @param values Values to format the chat prompt with
         * @returns The formatted prompt
         */
        formatPrompt: async (values: Record<string, any> = {}): Promise<any> => {
          try {
            // Format each message directly here
            // Combine partial variables with provided values
            const allValues = { ...partialVariables, ...values };
            
            // Check if all required variables are provided
            const missingVariables = inputVariables.filter(
              variable => !(variable in allValues)
            );
            
            if (missingVariables.length > 0) {
              throw new Error(`Missing variables: ${missingVariables.join(", ")}`);
            }
            
            // Format each message
            const formattedMessages = [];
            for (const message of promptMessages) {
              // Format the message content
              let formattedContent = message.content;
              for (const [key, value] of Object.entries(allValues)) {
                const regex = new RegExp(`{${key}}`, "g");
                formattedContent = formattedContent.replace(regex, String(value));
              }
              
              // Add the formatted message
              formattedMessages.push({
                role: message.role,
                content: formattedContent,
                ...(message.name ? { name: message.name } : {})
              });
            }
            
            // Return a prompt object
            return {
              messages: formattedMessages,
              toString: () => formattedMessages.map(m => `${m.role}: ${m.content}`).join('\n'),
              toChatMessages: () => formattedMessages
            };
          } catch (error) {
            console.error("Error formatting prompt:", error);
            throw new Error(`Failed to format prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Get the input variables for the chat prompt
         * 
         * @returns The input variables
         */
        getInputVariables: (): string[] => {
          return [...inputVariables];
        },
        
        /**
         * Get the partial variables for the chat prompt
         * 
         * @returns The partial variables
         */
        getPartialVariables: (): Record<string, any> => {
          return { ...partialVariables };
        },
        
        /**
         * Create a copy of the chat prompt with new partial variables
         * 
         * @param newPartialVariables New partial variables to add
         * @returns A new ChatPromptTemplate with the updated partial variables
         */
        partial: async (newPartialVariables: Record<string, any> = {}): Promise<any> => {
          try {
            // Create a new ChatPromptTemplate with the updated partial variables
            return this.create({
              promptMessages,
              inputVariables: inputVariables.filter(
                variable => !(variable in newPartialVariables)
              ),
              partialVariables: { ...partialVariables, ...newPartialVariables },
              validateTemplate
            });
          } catch (error) {
            console.error("Error creating partial chat prompt:", error);
            throw new Error(`Failed to create partial chat prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
    } catch (error) {
      console.error("Error creating ChatPromptTemplate:", error);
      throw new Error(`Failed to create ChatPromptTemplate: ${error instanceof Error ? error.message : String(error)}`);
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
   * Validate a chat prompt template
   * 
   * @param promptMessages The prompt messages
   * @param inputVariables The input variables
   * @param partialVariables The partial variables
   */
  private _validateTemplate(
    promptMessages: Array<{
      role: string;
      content: string;
      name?: string;
      templateFormat: string;
      inputVariables: string[];
    }>,
    inputVariables: string[],
    partialVariables: Record<string, any>
  ): void {
    // Extract all variables from all messages
    const extractedVariables = new Set<string>();
    for (const message of promptMessages) {
      for (const variable of message.inputVariables) {
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
  }
  
  /**
   * Create a system message
   * 
   * @param template The template for the system message
   * @param inputVariables The input variables for the template
   * @returns A system message object
   */
  static systemMessage(template: string, inputVariables?: string[]): {
    role: "system";
    content: string;
    inputVariables: string[];
  } {
    const extractedVariables = template.match(/{([^{}]*)}/g) || [];
    const variables = extractedVariables.map(match => match.slice(1, -1));
    
    return {
      role: "system",
      content: template,
      inputVariables: inputVariables || [...new Set(variables)]
    };
  }
  
  /**
   * Create a user message
   * 
   * @param template The template for the user message
   * @param inputVariables The input variables for the template
   * @returns A user message object
   */
  static userMessage(template: string, inputVariables?: string[]): {
    role: "user";
    content: string;
    inputVariables: string[];
  } {
    const extractedVariables = template.match(/{([^{}]*)}/g) || [];
    const variables = extractedVariables.map(match => match.slice(1, -1));
    
    return {
      role: "user",
      content: template,
      inputVariables: inputVariables || [...new Set(variables)]
    };
  }
  
  /**
   * Create an assistant message
   * 
   * @param template The template for the assistant message
   * @param inputVariables The input variables for the template
   * @returns An assistant message object
   */
  static assistantMessage(template: string, inputVariables?: string[]): {
    role: "assistant";
    content: string;
    inputVariables: string[];
  } {
    const extractedVariables = template.match(/{([^{}]*)}/g) || [];
    const variables = extractedVariables.map(match => match.slice(1, -1));
    
    return {
      role: "assistant",
      content: template,
      inputVariables: inputVariables || [...new Set(variables)]
    };
  }
}
