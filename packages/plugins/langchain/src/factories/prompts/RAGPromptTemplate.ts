import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating RAGPromptTemplate instances
 */
export class RAGPromptTemplateFactory implements ComponentFactory<any> {
  /**
   * Creates a new RAGPromptTemplate
   * 
   * @param config Configuration for the RAGPromptTemplate
   * @returns A new RAGPromptTemplate instance
   */
  async create(config: {
    systemTemplate?: string;
    questionTemplate: string;
    contextTemplate?: string;
    includeSourceDocuments?: boolean;
    inputVariables?: string[];
    partialVariables?: Record<string, any>;
    validateTemplate?: boolean;
  }): Promise<any> {
    try {
      // Check required parameters
      if (!config.questionTemplate) {
        throw new Error("Question template is required");
      }
      
      // Set default values
      const systemTemplate = config.systemTemplate || "You are a helpful assistant that answers questions based on the provided context.";
      const questionTemplate = config.questionTemplate;
      const contextTemplate = config.contextTemplate || "Context:\n{context}";
      const includeSourceDocuments = config.includeSourceDocuments !== false;
      const validateTemplate = config.validateTemplate !== false;
      
      // Extract input variables from templates
      const systemVariables = this._extractInputVariables(systemTemplate);
      const questionVariables = this._extractInputVariables(questionTemplate);
      const contextVariables = this._extractInputVariables(contextTemplate);
      
      // Combine all input variables
      const allInputVariables = new Set([
        ...systemVariables,
        ...questionVariables,
        ...contextVariables
      ]);
      
      // Ensure 'context' is in the input variables
      allInputVariables.add('context');
      
      // Ensure 'question' is in the input variables
      allInputVariables.add('question');
      
      // If source documents are included, add 'sources' to the input variables
      if (includeSourceDocuments) {
        allInputVariables.add('sources');
      }
      
      const inputVariables = config.inputVariables || Array.from(allInputVariables);
      const partialVariables = config.partialVariables || {};
      
      // Validate the template if required
      if (validateTemplate) {
        this._validateTemplate(
          systemTemplate,
          questionTemplate,
          contextTemplate,
          inputVariables,
          partialVariables
        );
      }
      
      // Create a RAGPromptTemplate
      return {
        systemTemplate,
        questionTemplate,
        contextTemplate,
        includeSourceDocuments,
        inputVariables,
        partialVariables,
        
        /**
         * Format the RAG prompt with the given values
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
            
            // Format the system template
            let formattedSystem = systemTemplate;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedSystem = formattedSystem.replace(regex, String(value));
            }
            
            // Format the context template
            let formattedContext = contextTemplate;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedContext = formattedContext.replace(regex, String(value));
            }
            
            // Format the question template
            let formattedQuestion = questionTemplate;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedQuestion = formattedQuestion.replace(regex, String(value));
            }
            
            // Format the sources if included
            let formattedSources = "";
            if (includeSourceDocuments && 'sources' in allValues) {
              const sources = allValues.sources;
              if (Array.isArray(sources) && sources.length > 0) {
                formattedSources = "\n\nSources:\n" + sources.map((source: any, index: number) => {
                  if (typeof source === 'string') {
                    return `${index + 1}. ${source}`;
                  } else if (source && typeof source === 'object') {
                    // Handle source objects with metadata
                    const sourceText = source.text || source.content || source.pageContent || JSON.stringify(source);
                    const metadata = source.metadata ? ` (${JSON.stringify(source.metadata)})` : '';
                    return `${index + 1}. ${sourceText}${metadata}`;
                  }
                  return `${index + 1}. ${JSON.stringify(source)}`;
                }).join("\n");
              }
            }
            
            // Combine everything
            return `${formattedSystem}\n\n${formattedContext}\n\n${formattedQuestion}${formattedSources}`;
          } catch (error) {
            console.error("Error formatting RAG prompt:", error);
            throw new Error(`Failed to format RAG prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Format the RAG prompt with the given values as a chat prompt
         * 
         * @param values Values to format the prompt with
         * @returns The formatted chat messages
         */
        formatMessages: async (values: Record<string, any> = {}): Promise<Array<{
          role: string;
          content: string;
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
            
            // Format the system template
            let formattedSystem = systemTemplate;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedSystem = formattedSystem.replace(regex, String(value));
            }
            
            // Format the context template
            let formattedContext = contextTemplate;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedContext = formattedContext.replace(regex, String(value));
            }
            
            // Format the question template
            let formattedQuestion = questionTemplate;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedQuestion = formattedQuestion.replace(regex, String(value));
            }
            
            // Format the sources if included
            let formattedSources = "";
            if (includeSourceDocuments && 'sources' in allValues) {
              const sources = allValues.sources;
              if (Array.isArray(sources) && sources.length > 0) {
                formattedSources = "\n\nSources:\n" + sources.map((source: any, index: number) => {
                  if (typeof source === 'string') {
                    return `${index + 1}. ${source}`;
                  } else if (source && typeof source === 'object') {
                    // Handle source objects with metadata
                    const sourceText = source.text || source.content || source.pageContent || JSON.stringify(source);
                    const metadata = source.metadata ? ` (${JSON.stringify(source.metadata)})` : '';
                    return `${index + 1}. ${sourceText}${metadata}`;
                  }
                  return `${index + 1}. ${JSON.stringify(source)}`;
                }).join("\n");
              }
            }
            
            // Create chat messages
            const messages = [
              {
                role: "system",
                content: formattedSystem
              },
              {
                role: "user",
                content: `${formattedContext}\n\n${formattedQuestion}${formattedSources}`
              }
            ];
            
            return messages;
          } catch (error) {
            console.error("Error formatting RAG chat messages:", error);
            throw new Error(`Failed to format RAG chat messages: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Format the RAG prompt with the given values as a prompt
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
            
            // Format the system template
            let formattedSystem = systemTemplate;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedSystem = formattedSystem.replace(regex, String(value));
            }
            
            // Format the context template
            let formattedContext = contextTemplate;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedContext = formattedContext.replace(regex, String(value));
            }
            
            // Format the question template
            let formattedQuestion = questionTemplate;
            for (const [key, value] of Object.entries(allValues)) {
              const regex = new RegExp(`{${key}}`, "g");
              formattedQuestion = formattedQuestion.replace(regex, String(value));
            }
            
            // Format the sources if included
            let formattedSources = "";
            if (includeSourceDocuments && 'sources' in allValues) {
              const sources = allValues.sources;
              if (Array.isArray(sources) && sources.length > 0) {
                formattedSources = "\n\nSources:\n" + sources.map((source: any, index: number) => {
                  if (typeof source === 'string') {
                    return `${index + 1}. ${source}`;
                  } else if (source && typeof source === 'object') {
                    // Handle source objects with metadata
                    const sourceText = source.text || source.content || source.pageContent || JSON.stringify(source);
                    const metadata = source.metadata ? ` (${JSON.stringify(source.metadata)})` : '';
                    return `${index + 1}. ${sourceText}${metadata}`;
                  }
                  return `${index + 1}. ${JSON.stringify(source)}`;
                }).join("\n");
              }
            }
            
            // Combine everything for the text format
            const formattedTemplate = `${formattedSystem}\n\n${formattedContext}\n\n${formattedQuestion}${formattedSources}`;
            
            // Create chat messages
            const formattedMessages = [
              {
                role: "system",
                content: formattedSystem
              },
              {
                role: "user",
                content: `${formattedContext}\n\n${formattedQuestion}${formattedSources}`
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
         * Get the input variables for the RAG prompt
         * 
         * @returns The input variables
         */
        getInputVariables: (): string[] => {
          return [...inputVariables];
        },
        
        /**
         * Get the partial variables for the RAG prompt
         * 
         * @returns The partial variables
         */
        getPartialVariables: (): Record<string, any> => {
          return { ...partialVariables };
        },
        
        /**
         * Create a copy of the RAG prompt with new partial variables
         * 
         * @param newPartialVariables New partial variables to add
         * @returns A new RAGPromptTemplate with the updated partial variables
         */
        partial: async (newPartialVariables: Record<string, any> = {}): Promise<any> => {
          try {
            // Create a new RAGPromptTemplate with the updated partial variables
            return this.create({
              systemTemplate,
              questionTemplate,
              contextTemplate,
              includeSourceDocuments,
              inputVariables: inputVariables.filter(
                variable => !(variable in newPartialVariables)
              ),
              partialVariables: { ...partialVariables, ...newPartialVariables },
              validateTemplate
            });
          } catch (error) {
            console.error("Error creating partial RAG prompt:", error);
            throw new Error(`Failed to create partial RAG prompt: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
    } catch (error) {
      console.error("Error creating RAGPromptTemplate:", error);
      throw new Error(`Failed to create RAGPromptTemplate: ${error instanceof Error ? error.message : String(error)}`);
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
   * Validate a RAG prompt template
   * 
   * @param systemTemplate The system template
   * @param questionTemplate The question template
   * @param contextTemplate The context template
   * @param inputVariables The input variables
   * @param partialVariables The partial variables
   */
  private _validateTemplate(
    systemTemplate: string,
    questionTemplate: string,
    contextTemplate: string,
    inputVariables: string[],
    partialVariables: Record<string, any>
  ): void {
    // Extract all variables from templates
    const systemVariables = this._extractInputVariables(systemTemplate);
    const questionVariables = this._extractInputVariables(questionTemplate);
    const contextVariables = this._extractInputVariables(contextTemplate);
    
    // Combine all extracted variables
    const extractedVariables = new Set([
      ...systemVariables,
      ...questionVariables,
      ...contextVariables
    ]);
    
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
                 variable !== 'context' && 
                 variable !== 'question' && 
                 variable !== 'sources'
    );
    
    if (unusedVariables.length > 0) {
      throw new Error(`Unused variables in inputVariables: ${unusedVariables.join(", ")}`);
    }
    
    // Check if 'context' is in the context template
    if (!contextVariables.includes('context')) {
      throw new Error("Context template must include {context}");
    }
  }
}
