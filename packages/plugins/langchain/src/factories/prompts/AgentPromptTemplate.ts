import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating AgentPromptTemplate instances
 */
export class AgentPromptTemplateFactory implements ComponentFactory<any> {
  /**
   * Creates a new AgentPromptTemplate
   * 
   * @param config Configuration for the AgentPromptTemplate
   * @returns A new AgentPromptTemplate instance
   */
  async create(config: {
    prefix?: string;
    suffix?: string;
    formatInstructions?: string;
    toolDescriptions?: string | Array<{name: string, description: string}>;
    toolNames?: string[];
    inputVariables?: string[];
    partialVariables?: Record<string, any>;
    validateTemplate?: boolean;
  }): Promise<any> {
    try {
      // Set default values
      const prefix = config.prefix || "You are an AI assistant that helps people with their tasks.";
      const suffix = config.suffix || "Begin!\n\nQuestion: {input}\nThought: {agent_scratchpad}";
      
      // Format tool descriptions
      let toolDescriptions = "";
      if (config.toolDescriptions) {
        if (typeof config.toolDescriptions === 'string') {
          toolDescriptions = config.toolDescriptions;
        } else if (Array.isArray(config.toolDescriptions)) {
          toolDescriptions = config.toolDescriptions.map(tool => 
            `${tool.name}: ${tool.description}`
          ).join('\n');
        }
      }
      
      // Format tool names
      const toolNames = config.toolNames || [];
      let toolNamesStr = "";
      if (toolNames.length > 0) {
        toolNamesStr = `You have access to the following tools:\n${toolNames.join(', ')}`;
      }
      
      // Format instructions
      const formatInstructions = config.formatInstructions || 
        `Use the following format:
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [${toolNames.join(', ')}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question`;
      
      // Combine all parts
      const template = [
        prefix,
        toolNamesStr,
        toolDescriptions ? `\n${toolDescriptions}` : '',
        `\n${formatInstructions}`,
        `\n${suffix}`
      ].join('');
      
      // Extract input variables from template
      const extractedVariables = this._extractInputVariables(template);
      
      // Ensure 'input' and 'agent_scratchpad' are in the input variables
      extractedVariables.add('input');
      extractedVariables.add('agent_scratchpad');
      
      const inputVariables = config.inputVariables || Array.from(extractedVariables);
      const partialVariables = config.partialVariables || {};
      const validateTemplate = config.validateTemplate !== false;
      
      // Validate the template if required
      if (validateTemplate) {
        this._validateTemplate(
          template,
          inputVariables,
          partialVariables
        );
      }
      
      // Create an AgentPromptTemplate
      return {
        prefix,
        suffix,
        formatInstructions,
        toolDescriptions,
        toolNames,
        template,
        inputVariables,
        partialVariables,
        
        /**
         * Format the agent prompt with the given values
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
            
            return formattedTemplate;
          } catch (error) {
            console.error("Error formatting agent prompt:", error);
            throw new Error(`Failed to format agent prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Format the agent prompt with the given values as a chat prompt
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
            
            // Create chat messages
            const messages = [
              {
                role: "system",
                content: formattedTemplate
              }
            ];
            
            return messages;
          } catch (error) {
            console.error("Error formatting agent chat messages:", error);
            throw new Error(`Failed to format agent chat messages: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Format the agent prompt with the given values as a prompt
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
            
            // Create chat messages
            const formattedMessages = [
              {
                role: "system",
                content: formattedTemplate
              }
            ];
            
            // Return a prompt object
            return {
              text: formattedTemplate,
              messages: formattedMessages,
              toString: () => formattedTemplate,
              toChatMessages: () => formattedMessages
            };
          } catch (error) {
            console.error("Error formatting prompt:", error);
            throw new Error(`Failed to format prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Get the input variables for the agent prompt
         * 
         * @returns The input variables
         */
        getInputVariables: (): string[] => {
          return [...inputVariables];
        },
        
        /**
         * Get the partial variables for the agent prompt
         * 
         * @returns The partial variables
         */
        getPartialVariables: (): Record<string, any> => {
          return { ...partialVariables };
        },
        
        /**
         * Create a copy of the agent prompt with new partial variables
         * 
         * @param newPartialVariables New partial variables to add
         * @returns A new AgentPromptTemplate with the updated partial variables
         */
        partial: async (newPartialVariables: Record<string, any> = {}): Promise<any> => {
          try {
            // Create a new AgentPromptTemplate with the updated partial variables
            return this.create({
              prefix,
              suffix,
              formatInstructions,
              toolDescriptions,
              toolNames,
              inputVariables: inputVariables.filter(
                variable => !(variable in newPartialVariables)
              ),
              partialVariables: { ...partialVariables, ...newPartialVariables },
              validateTemplate
            });
          } catch (error) {
            console.error("Error creating partial agent prompt:", error);
            throw new Error(`Failed to create partial agent prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
    } catch (error) {
      console.error("Error creating AgentPromptTemplate:", error);
      throw new Error(`Failed to create AgentPromptTemplate: ${error instanceof Error ? error.message : String(error)}`);
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
   * Validate an agent prompt template
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
      variable => !extractedVariables.has(variable) && 
                 variable !== 'input' && 
                 variable !== 'agent_scratchpad'
    );
    
    if (unusedVariables.length > 0) {
      throw new Error(`Unused variables in inputVariables: ${unusedVariables.join(", ")}`);
    }
    
    // Check if 'input' and 'agent_scratchpad' are in the template
    if (!extractedVariables.has('input')) {
      throw new Error("Template must include {input}");
    }
    if (!extractedVariables.has('agent_scratchpad')) {
      throw new Error("Template must include {agent_scratchpad}");
    }
  }
}
