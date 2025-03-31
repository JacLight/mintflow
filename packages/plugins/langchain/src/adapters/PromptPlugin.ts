import { ComponentRegistry } from '../registry/ComponentRegistry.js';
import { PromptTemplateFactory } from '../factories/prompts/PromptTemplate.js';
import { ChatPromptTemplateFactory } from '../factories/prompts/ChatPromptTemplate.js';
import { FewShotPromptTemplateFactory } from '../factories/prompts/FewShotPromptTemplate.js';
import { RAGPromptTemplateFactory } from '../factories/prompts/RAGPromptTemplate.js';
import { AgentPromptTemplateFactory } from '../factories/prompts/AgentPromptTemplate.js';
import { StructuredPromptTemplateFactory } from '../factories/prompts/StructuredPromptTemplate.js';

// Register prompt factories
const registry = ComponentRegistry.getInstance();
registry.registerComponent("prompt-template", new PromptTemplateFactory());
registry.registerComponent("chat-prompt-template", new ChatPromptTemplateFactory());
registry.registerComponent("few-shot-prompt-template", new FewShotPromptTemplateFactory());
registry.registerComponent("rag-prompt-template", new RAGPromptTemplateFactory());
registry.registerComponent("agent-prompt-template", new AgentPromptTemplateFactory());
registry.registerComponent("structured-prompt-template", new StructuredPromptTemplateFactory());

/**
 * Template version
 */
export enum TemplateVersion {
  V1 = "v1",
  V2 = "v2"
}

/**
 * Prompt template
 */
export interface PromptTemplate {
  template: string;
  inputVariables: string[];
  partialVariables?: Record<string, any>;
  templateFormat?: string;
  validateTemplate?: boolean;
  version?: TemplateVersion;
}

// Import the PromptTemplateRegistry and ABTestingFramework
import { PromptTemplateRegistry } from '../registry/PromptTemplateRegistry.js';
import { ABTestingFramework } from '../testing/ABTestingFramework.js';

/**
 * Prompt Service for creating and managing prompts
 */
export class PromptService {
  private static instance: PromptService;
  private componentRegistry = ComponentRegistry.getInstance();
  private templateRegistry = PromptTemplateRegistry.getInstance();
  private abTestingFramework = ABTestingFramework.getInstance();

  private constructor() {}

  static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  /**
   * Creates a PromptTemplate
   * 
   * @param options Options for the PromptTemplate
   * @returns A new PromptTemplate
   */
  async createPromptTemplate(options: {
    template: string;
    inputVariables?: string[];
    partialVariables?: Record<string, any>;
    validateTemplate?: boolean;
    templateFormat?: string;
  }): Promise<any> {
    try {
      // Get the PromptTemplate factory
      const factory = this.componentRegistry.getComponentFactory("prompt-template");
      
      // Create the prompt template with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating PromptTemplate:", error);
      throw new Error(`Failed to create prompt template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a ChatPromptTemplate
   * 
   * @param options Options for the ChatPromptTemplate
   * @returns A new ChatPromptTemplate
   */
  async createChatPromptTemplate(options: {
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
      // Get the ChatPromptTemplate factory
      const factory = this.componentRegistry.getComponentFactory("chat-prompt-template");
      
      // Create the chat prompt template with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating ChatPromptTemplate:", error);
      throw new Error(`Failed to create chat prompt template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a FewShotPromptTemplate
   * 
   * @param options Options for the FewShotPromptTemplate
   * @returns A new FewShotPromptTemplate
   */
  async createFewShotPromptTemplate(options: {
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
      // Get the FewShotPromptTemplate factory
      const factory = this.componentRegistry.getComponentFactory("few-shot-prompt-template");
      
      // Create the few-shot prompt template with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating FewShotPromptTemplate:", error);
      throw new Error(`Failed to create few-shot prompt template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a system message for a ChatPromptTemplate
   * 
   * @param template The template for the system message
   * @param inputVariables The input variables for the template
   * @returns A system message object
   */
  createSystemMessage(template: string, inputVariables?: string[]): {
    role: "system";
    content: string;
    inputVariables: string[];
  } {
    return ChatPromptTemplateFactory.systemMessage(template, inputVariables);
  }

  /**
   * Creates a user message for a ChatPromptTemplate
   * 
   * @param template The template for the user message
   * @param inputVariables The input variables for the template
   * @returns A user message object
   */
  createUserMessage(template: string, inputVariables?: string[]): {
    role: "user";
    content: string;
    inputVariables: string[];
  } {
    return ChatPromptTemplateFactory.userMessage(template, inputVariables);
  }

  /**
   * Creates an assistant message for a ChatPromptTemplate
   * 
   * @param template The template for the assistant message
   * @param inputVariables The input variables for the template
   * @returns An assistant message object
   */
  createAssistantMessage(template: string, inputVariables?: string[]): {
    role: "assistant";
    content: string;
    inputVariables: string[];
  } {
    return ChatPromptTemplateFactory.assistantMessage(template, inputVariables);
  }

  /**
   * Creates a RAGPromptTemplate
   * 
   * @param options Options for the RAGPromptTemplate
   * @returns A new RAGPromptTemplate
   */
  async createRAGPromptTemplate(options: {
    systemTemplate?: string;
    questionTemplate: string;
    contextTemplate?: string;
    includeSourceDocuments?: boolean;
    inputVariables?: string[];
    partialVariables?: Record<string, any>;
    validateTemplate?: boolean;
  }): Promise<any> {
    try {
      // Get the RAGPromptTemplate factory
      const factory = this.componentRegistry.getComponentFactory("rag-prompt-template");
      
      // Create the RAG prompt template with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating RAGPromptTemplate:", error);
      throw new Error(`Failed to create RAG prompt template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates an AgentPromptTemplate
   * 
   * @param options Options for the AgentPromptTemplate
   * @returns A new AgentPromptTemplate
   */
  async createAgentPromptTemplate(options: {
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
      // Get the AgentPromptTemplate factory
      const factory = this.componentRegistry.getComponentFactory("agent-prompt-template");
      
      // Create the agent prompt template with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating AgentPromptTemplate:", error);
      throw new Error(`Failed to create agent prompt template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a StructuredPromptTemplate
   * 
   * @param options Options for the StructuredPromptTemplate
   * @returns A new StructuredPromptTemplate
   */
  async createStructuredPromptTemplate(options: {
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
      // Get the StructuredPromptTemplate factory
      const factory = this.componentRegistry.getComponentFactory("structured-prompt-template");
      
      // Create the structured prompt template with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating StructuredPromptTemplate:", error);
      throw new Error(`Failed to create structured prompt template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Plugin definition for integration with MintFlow
const promptPlugin = {
  id: "prompt",
  name: "Prompt Plugin",
  icon: "GiPaperClip",
  description: "Prompt template capabilities for AI applications",
  documentation: "https://js.langchain.com/docs/modules/model_io/prompts/",
  
  inputSchema: {
    type: 'object',
    properties: {
      template: { type: 'string' },
      inputVariables: { type: 'array' },
      partialVariables: { type: 'object' },
      values: { type: 'object' }
    }
  },
  
  actions: [
    {
      name: 'createPromptTemplate',
      description: 'Create a PromptTemplate',
      inputSchema: {
        type: 'object',
        properties: {
          template: { 
            type: 'string',
            description: 'The template string'
          },
          inputVariables: { 
            type: 'array',
            description: 'The input variables for the template'
          },
          partialVariables: { 
            type: 'object',
            description: 'Partial variables for the template'
          },
          validateTemplate: { 
            type: 'boolean',
            description: 'Whether to validate the template'
          },
          templateFormat: { 
            type: 'string',
            description: 'The format of the template'
          }
        },
        required: ['template']
      },
      outputSchema: {
        type: 'object',
        description: 'PromptTemplate'
      },
      execute: async function(input: {
        template: string;
        inputVariables?: string[];
        partialVariables?: Record<string, any>;
        validateTemplate?: boolean;
        templateFormat?: string;
      }): Promise<any> {
        const service = PromptService.getInstance();
        return service.createPromptTemplate(input);
      }
    },
    {
      name: 'createChatPromptTemplate',
      description: 'Create a ChatPromptTemplate',
      inputSchema: {
        type: 'object',
        properties: {
          promptMessages: { 
            type: 'array',
            description: 'The prompt messages'
          },
          inputVariables: { 
            type: 'array',
            description: 'The input variables for the template'
          },
          partialVariables: { 
            type: 'object',
            description: 'Partial variables for the template'
          },
          validateTemplate: { 
            type: 'boolean',
            description: 'Whether to validate the template'
          }
        },
        required: ['promptMessages']
      },
      outputSchema: {
        type: 'object',
        description: 'ChatPromptTemplate'
      },
      execute: async function(input: {
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
        const service = PromptService.getInstance();
        return service.createChatPromptTemplate(input);
      }
    },
    {
      name: 'createFewShotPromptTemplate',
      description: 'Create a FewShotPromptTemplate',
      inputSchema: {
        type: 'object',
        properties: {
          examples: { 
            type: 'array',
            description: 'The examples for the few-shot prompt'
          },
          examplePrompt: { 
            type: 'object',
            description: 'The example prompt'
          },
          prefix: { 
            type: 'string',
            description: 'The prefix for the few-shot prompt'
          },
          suffix: { 
            type: 'string',
            description: 'The suffix for the few-shot prompt'
          },
          exampleSeparator: { 
            type: 'string',
            description: 'The separator between examples'
          },
          inputVariables: { 
            type: 'array',
            description: 'The input variables for the template'
          },
          partialVariables: { 
            type: 'object',
            description: 'Partial variables for the template'
          },
          validateTemplate: { 
            type: 'boolean',
            description: 'Whether to validate the template'
          },
          templateFormat: { 
            type: 'string',
            description: 'The format of the template'
          }
        },
        required: ['examples', 'examplePrompt']
      },
      outputSchema: {
        type: 'object',
        description: 'FewShotPromptTemplate'
      },
      execute: async function(input: {
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
        const service = PromptService.getInstance();
        return service.createFewShotPromptTemplate(input);
      }
    },
    {
      name: 'createSystemMessage',
      description: 'Create a system message for a ChatPromptTemplate',
      inputSchema: {
        type: 'object',
        properties: {
          template: { 
            type: 'string',
            description: 'The template string'
          },
          inputVariables: { 
            type: 'array',
            description: 'The input variables for the template'
          }
        },
        required: ['template']
      },
      outputSchema: {
        type: 'object',
        description: 'System message'
      },
      execute: function(input: {
        template: string;
        inputVariables?: string[];
      }): any {
        const service = PromptService.getInstance();
        return service.createSystemMessage(input.template, input.inputVariables);
      }
    },
    {
      name: 'createUserMessage',
      description: 'Create a user message for a ChatPromptTemplate',
      inputSchema: {
        type: 'object',
        properties: {
          template: { 
            type: 'string',
            description: 'The template string'
          },
          inputVariables: { 
            type: 'array',
            description: 'The input variables for the template'
          }
        },
        required: ['template']
      },
      outputSchema: {
        type: 'object',
        description: 'User message'
      },
      execute: function(input: {
        template: string;
        inputVariables?: string[];
      }): any {
        const service = PromptService.getInstance();
        return service.createUserMessage(input.template, input.inputVariables);
      }
    },
    {
      name: 'createAssistantMessage',
      description: 'Create an assistant message for a ChatPromptTemplate',
      inputSchema: {
        type: 'object',
        properties: {
          template: { 
            type: 'string',
            description: 'The template string'
          },
          inputVariables: { 
            type: 'array',
            description: 'The input variables for the template'
          }
        },
        required: ['template']
      },
      outputSchema: {
        type: 'object',
        description: 'Assistant message'
      },
      execute: function(input: {
        template: string;
        inputVariables?: string[];
      }): any {
        const service = PromptService.getInstance();
        return service.createAssistantMessage(input.template, input.inputVariables);
      }
    },
    {
      name: 'formatPrompt',
      description: 'Format a prompt with values',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { 
            type: 'object',
            description: 'The prompt to format'
          },
          values: { 
            type: 'object',
            description: 'The values to format the prompt with'
          }
        },
        required: ['prompt', 'values']
      },
      outputSchema: {
        type: 'object',
        description: 'Formatted prompt'
      },
      execute: async function(input: {
        prompt: any;
        values: Record<string, any>;
      }): Promise<any> {
        try {
          // Check if the prompt has a formatPrompt method
          if (typeof input.prompt.formatPrompt !== 'function') {
            throw new Error("Invalid prompt: missing formatPrompt method");
          }
          
          // Format the prompt
          return input.prompt.formatPrompt(input.values);
        } catch (error) {
          console.error("Error formatting prompt:", error);
          throw new Error(`Failed to format prompt: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    },
    {
      name: 'format',
      description: 'Format a prompt template with values',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { 
            type: 'object',
            description: 'The prompt to format'
          },
          values: { 
            type: 'object',
            description: 'The values to format the prompt with'
          }
        },
        required: ['prompt', 'values']
      },
      outputSchema: {
        type: 'string',
        description: 'Formatted prompt string'
      },
      execute: async function(input: {
        prompt: any;
        values: Record<string, any>;
      }): Promise<string> {
        try {
          // Check if the prompt has a format method
          if (typeof input.prompt.format !== 'function') {
            throw new Error("Invalid prompt: missing format method");
          }
          
          // Format the prompt
          return input.prompt.format(input.values);
        } catch (error) {
          console.error("Error formatting prompt:", error);
          throw new Error(`Failed to format prompt: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    },
    {
      name: 'createRAGPromptTemplate',
      description: 'Create a RAGPromptTemplate for retrieval-augmented generation',
      inputSchema: {
        type: 'object',
        properties: {
          systemTemplate: { 
            type: 'string',
            description: 'The system template'
          },
          questionTemplate: { 
            type: 'string',
            description: 'The question template'
          },
          contextTemplate: { 
            type: 'string',
            description: 'The context template'
          },
          includeSourceDocuments: { 
            type: 'boolean',
            description: 'Whether to include source documents'
          },
          inputVariables: { 
            type: 'array',
            description: 'The input variables for the template'
          },
          partialVariables: { 
            type: 'object',
            description: 'Partial variables for the template'
          },
          validateTemplate: { 
            type: 'boolean',
            description: 'Whether to validate the template'
          }
        },
        required: ['questionTemplate']
      },
      outputSchema: {
        type: 'object',
        description: 'RAGPromptTemplate'
      },
      execute: async function(input: {
        systemTemplate?: string;
        questionTemplate: string;
        contextTemplate?: string;
        includeSourceDocuments?: boolean;
        inputVariables?: string[];
        partialVariables?: Record<string, any>;
        validateTemplate?: boolean;
      }): Promise<any> {
        const service = PromptService.getInstance();
        return service.createRAGPromptTemplate(input);
      }
    },
    {
      name: 'createAgentPromptTemplate',
      description: 'Create an AgentPromptTemplate for agent-based workflows',
      inputSchema: {
        type: 'object',
        properties: {
          prefix: { 
            type: 'string',
            description: 'The prefix for the agent prompt'
          },
          suffix: { 
            type: 'string',
            description: 'The suffix for the agent prompt'
          },
          formatInstructions: { 
            type: 'string',
            description: 'The format instructions for the agent'
          },
          toolDescriptions: { 
            type: ['string', 'array'],
            description: 'The tool descriptions'
          },
          toolNames: { 
            type: 'array',
            description: 'The tool names'
          },
          inputVariables: { 
            type: 'array',
            description: 'The input variables for the template'
          },
          partialVariables: { 
            type: 'object',
            description: 'Partial variables for the template'
          },
          validateTemplate: { 
            type: 'boolean',
            description: 'Whether to validate the template'
          }
        }
      },
      outputSchema: {
        type: 'object',
        description: 'AgentPromptTemplate'
      },
      execute: async function(input: {
        prefix?: string;
        suffix?: string;
        formatInstructions?: string;
        toolDescriptions?: string | Array<{name: string, description: string}>;
        toolNames?: string[];
        inputVariables?: string[];
        partialVariables?: Record<string, any>;
        validateTemplate?: boolean;
      }): Promise<any> {
        const service = PromptService.getInstance();
        return service.createAgentPromptTemplate(input);
      }
    },
    {
      name: 'createStructuredPromptTemplate',
      description: 'Create a StructuredPromptTemplate for structured outputs',
      inputSchema: {
        type: 'object',
        properties: {
          template: { 
            type: 'string',
            description: 'The template string'
          },
          schema: { 
            type: 'object',
            description: 'The JSON schema for the output'
          },
          inputVariables: { 
            type: 'array',
            description: 'The input variables for the template'
          },
          partialVariables: { 
            type: 'object',
            description: 'Partial variables for the template'
          },
          validateTemplate: { 
            type: 'boolean',
            description: 'Whether to validate the template'
          },
          outputParser: { 
            type: 'object',
            description: 'The output parser'
          }
        },
        required: ['template', 'schema']
      },
      outputSchema: {
        type: 'object',
        description: 'StructuredPromptTemplate'
      },
      execute: async function(input: {
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
        const service = PromptService.getInstance();
        return service.createStructuredPromptTemplate(input);
      }
    }
  ]
};

export default promptPlugin;
