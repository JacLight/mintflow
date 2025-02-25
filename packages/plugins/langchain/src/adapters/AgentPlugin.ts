// plugins/AgentPlugin.ts

import {
    AIPluginConfig,
    TextGenInput,
    TextGenerationResponse
} from '../interface/index.js';
import { logger } from '@mintflow/common';
import { ConfigService } from '../services/ConfigService.js';
import { RedisService } from '../services/RedisService.js';

/**
 * Tool interface for agent function calling
 */
interface Tool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
    execute: (params: Record<string, any>) => Promise<any>;
}

/**
 * Agent state for tracking execution
 */
interface AgentState {
    agentId: string;
    messages: Array<{
        role: string;
        content: string;
        name?: string;
        function_call?: {
            name: string;
            arguments: string;
        };
    }>;
    tools: Tool[];
    status: 'idle' | 'thinking' | 'executing_tool' | 'finished' | 'error';
    currentTool?: string;
    error?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Agent Framework Service for orchestrating tools and AI interactions
 */
export class AgentService {
    private static instance: AgentService;
    private redis = RedisService.getInstance();
    private config = ConfigService.getInstance().getConfig();
    private tools: Map<string, Tool> = new Map();

    private constructor() { }

    static getInstance(): AgentService {
        if (!AgentService.instance) {
            AgentService.instance = new AgentService();
        }
        return AgentService.instance;
    }

    /**
     * Registers a tool for use with agents
     */
    registerTool(tool: Tool): void {
        this.tools.set(tool.name, tool);
        logger.info(`Registered tool: ${tool.name}`);
    }

    /**
     * Gets all registered tools
     */
    getTools(): Tool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Gets a specific tool by name
     */
    getTool(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    /**
     * Creates a new agent
     */
    async createAgent(
        tools: string[] = [],
        initialMessages: any[] = [],
        metadata: Record<string, any> = {}
    ): Promise<string> {
        // Generate a unique agent ID
        const agentId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Get the specified tools
        const agentTools: Tool[] = tools
            .map(name => this.tools.get(name))
            .filter(Boolean) as Tool[];

        // Create the agent state
        const state: AgentState = {
            agentId,
            messages: initialMessages,
            tools: agentTools,
            status: 'idle',
            metadata,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Save the agent state
        await this.saveAgentState(agentId, state);

        return agentId;
    }

    /**
     * Gets an agent's state
     */
    async getAgentState(agentId: string): Promise<AgentState | null> {
        const key = `agent:${agentId}`;
        const data = await this.redis.client.get(key);

        if (!data) return null;

        try {
            return JSON.parse(data) as AgentState;
        } catch (error) {
            logger.error(`Error parsing agent state for ${agentId}:`, error);
            return null;
        }
    }

    /**
     * Saves an agent's state
     */
    private async saveAgentState(agentId: string, state: AgentState): Promise<void> {
        const key = `agent:${agentId}`;
        await this.redis.client.set(key, JSON.stringify(state));
    }

    /**
     * Updates an agent's state
     */
    private async updateAgentState(
        agentId: string,
        updates: Partial<AgentState>
    ): Promise<AgentState> {
        const state = await this.getAgentState(agentId);
        if (!state) {
            throw new Error(`Agent not found: ${agentId}`);
        }

        const updatedState: AgentState = {
            ...state,
            ...updates,
            updatedAt: new Date()
        };

        await this.saveAgentState(agentId, updatedState);
        return updatedState;
    }

    /**
     * Adds a message to the agent's conversation
     */
    async addMessage(
        agentId: string,
        message: {
            role: string;
            content: string;
            name?: string;
            function_call?: {
                name: string;
                arguments: string;
            };
        }
    ): Promise<AgentState> {
        const state = await this.getAgentState(agentId);
        if (!state) {
            throw new Error(`Agent not found: ${agentId}`);
        }

        const messages = [...state.messages, message];

        return this.updateAgentState(agentId, { messages });
    }

    /**
     * Executes a single step in the agent's reasoning process
     */
    async executeStep(
        agentId: string,
        input: AIPluginConfig & {
            provider?: string;
            model: string;
            temperature?: number;
            systemPrompt?: string;
            maxTokens?: number;
        }
    ): Promise<AgentState> {
        const state = await this.getAgentState(agentId);
        if (!state) {
            throw new Error(`Agent not found: ${agentId}`);
        }

        try {
            // If the agent is already executing a tool, check if it needs to be processed
            if (state.status === 'executing_tool' && state.currentTool) {
                return await this.processFunctionCall(agentId, state);
            }

            // Set the agent to thinking
            await this.updateAgentState(agentId, { status: 'thinking' });

            // Format the tools for the AI model
            const tools = state.tools.map(tool => ({
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }
            }));

            // Prepare the model config with tools
            const modelConfig: TextGenInput = {
                config: input.config,
                provider: input.provider,
                model: input.model,
                systemPrompt: this.generateSystemPrompt(input.systemPrompt, tools),
                temperature: input.temperature || 0.7,
                maxTokens: input.maxTokens,
                prompt: JSON.stringify(state.messages)
            };

            // Generate AI response
            // In a real implementation, this would call your AI plugin
            const aiResponse = await this.mockAIResponse(modelConfig, state.messages, tools);

            // Add the AI response to the messages
            await this.addMessage(agentId, aiResponse);

            // Check if the AI wants to use a tool
            if (aiResponse.function_call) {
                // Set the agent to executing a tool
                await this.updateAgentState(agentId, {
                    status: 'executing_tool',
                    currentTool: aiResponse.function_call.name
                });

                // Process the function call
                return this.processFunctionCall(agentId, {
                    ...state,
                    messages: [...state.messages, aiResponse],
                    status: 'executing_tool',
                    currentTool: aiResponse.function_call.name
                });
            }

            // If there's no function call, just update to finished
            return this.updateAgentState(agentId, { status: 'finished' });
        } catch (error: any) {
            logger.error(`Error executing agent step for ${agentId}:`, error);
            return this.updateAgentState(agentId, {
                status: 'error',
                error: error.message
            });
        }
    }

    /**
     * Process a function call from the agent
     */
    private async processFunctionCall(
        agentId: string,
        state: AgentState
    ): Promise<AgentState> {
        if (!state.currentTool) {
            return this.updateAgentState(agentId, {
                status: 'error',
                error: 'No tool specified for function call'
            });
        }

        const lastMessage = state.messages[state.messages.length - 1];
        if (!lastMessage.function_call) {
            return this.updateAgentState(agentId, {
                status: 'error',
                error: 'Last message does not contain a function call'
            });
        }

        try {
            // Get the tool
            const tool = this.tools.get(state.currentTool);
            if (!tool) {
                throw new Error(`Tool not found: ${state.currentTool}`);
            }

            // Parse the arguments
            const args = JSON.parse(lastMessage.function_call.arguments);

            // Execute the tool
            const result = await tool.execute(args);

            // Add the function result as a message
            const resultMessage = {
                role: 'function',
                name: state.currentTool,
                content: JSON.stringify(result)
            };

            const updatedMessages = [...state.messages, resultMessage];

            // Reset the agent status
            return this.updateAgentState(agentId, {
                messages: updatedMessages,
                status: 'idle',
                currentTool: undefined
            });
        } catch (error: any) {
            logger.error(`Error executing tool ${state.currentTool}:`, error);

            // Add error message
            const errorMessage = {
                role: 'function',
                name: state.currentTool,
                content: JSON.stringify({ error: error.message })
            };

            const updatedMessages = [...state.messages, errorMessage];

            // Update with error
            return this.updateAgentState(agentId, {
                messages: updatedMessages,
                status: 'error',
                error: `Tool execution error: ${error.message}`,
                currentTool: undefined
            });
        }
    }

    /**
     * Mock AI response - replace with actual AI plugin call
     */
    private async mockAIResponse(
        config: TextGenInput,
        messages: any[],
        tools: any[]
    ): Promise<any> {
        // This is a mock implementation - in a real system, you'd call your AI plugin

        // Simplified decision logic for demo purposes
        const lastMessage = messages[messages.length - 1];
        const userMessage = lastMessage.role === 'user' ? lastMessage.content : '';

        // Check if the message contains keywords that suggest using a tool
        const shouldUseTool = userMessage.toLowerCase().includes('search') ||
            userMessage.toLowerCase().includes('calculate') ||
            userMessage.toLowerCase().includes('find');

        if (shouldUseTool && tools.length > 0) {
            // Randomly select a tool
            const tool = tools[Math.floor(Math.random() * tools.length)];

            return {
                role: 'assistant',
                content: null,
                function_call: {
                    name: tool.function.name,
                    arguments: JSON.stringify({
                        query: userMessage
                    })
                }
            };
        }

        // Return a simple text response
        return {
            role: 'assistant',
            content: `I'll help you with: ${userMessage}`
        };
    }

    /**
     * Generates the system prompt with tool descriptions
     */
    private generateSystemPrompt(
        basePrompt?: string,
        tools: any[] = []
    ): string {
        const base = basePrompt || 'You are a helpful AI assistant that can use tools to assist the user.';

        if (tools.length === 0) {
            return base;
        }

        const toolDescriptions = tools.map(tool =>
            `${tool.function.name}: ${tool.function.description}`
        ).join('\n');

        return `${base}\n\nYou have access to the following tools:\n${toolDescriptions}\n\nUse these tools when appropriate to help the user.`;
    }

    /**
     * Runs the agent until it reaches a terminal state or max steps
     */
    async runUntilCompletion(
        agentId: string,
        input: AIPluginConfig & {
            provider?: string;
            model: string;
            temperature?: number;
            systemPrompt?: string;
            maxTokens?: number;
        },
        maxSteps: number = 10
    ): Promise<AgentState> {
        let state = await this.getAgentState(agentId);
        if (!state) {
            throw new Error(`Agent not found: ${agentId}`);
        }

        let steps = 0;

        while (steps < maxSteps) {
            // If the agent is in a terminal state, stop
            if (state.status === 'finished' || state.status === 'error') {
                break;
            }

            // Execute a step
            state = await this.executeStep(agentId, input);
            steps++;

            // Small delay to prevent overloading
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // If we reached max steps but aren't done, mark as an error
        if (steps >= maxSteps && state.status !== 'finished') {
            state = await this.updateAgentState(agentId, {
                status: 'error',
                error: `Reached maximum steps (${maxSteps}) without completion`
            });
        }

        return state;
    }
}

// Sample tool implementations
const calculatorTool: Tool = {
    name: 'calculator',
    description: 'Performs mathematical calculations',
    parameters: {
        type: 'object',
        properties: {
            expression: {
                type: 'string',
                description: 'The mathematical expression to evaluate'
            }
        },
        required: ['expression']
    },
    execute: async (params: { expression: string }) => {
        try {
            // Simple evaluation - in a real app, use a safer method
            return { result: eval(params.expression) };
        } catch (error: any) {
            return { error: error.message };
        }
    }
};

const searchTool: Tool = {
    name: 'search',
    description: 'Searches for information on a topic',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'The search query'
            }
        },
        required: ['query']
    },
    execute: async (params: { query: string }) => {
        // Mock search results
        return {
            results: [
                { title: `Result 1 for ${params.query}`, snippet: 'This is a sample search result.' },
                { title: `Result 2 for ${params.query}`, snippet: 'Another search result example.' }
            ]
        };
    }
};

// Initialize the agent service with default tools
const agentService = AgentService.getInstance();
agentService.registerTool(calculatorTool);
agentService.registerTool(searchTool);

// Plugin definition for integration with your workflow engine
const agentPlugin = {
    id: "agent",
    name: "Agent Framework Plugin",
    icon: "GiRobot",
    description: "Orchestrates AI agents with tool-calling capabilities",
    documentation: "https://docs.example.com/agent",

    inputSchema: {
        tools: { type: 'array', items: { type: 'string' } },
        messages: { type: 'array' },
        metadata: { type: 'object' },
        agentId: { type: 'string' },
        message: { type: 'object' },
        config: { type: 'object' },
        provider: { type: 'string' },
        model: { type: 'string' },
        temperature: { type: 'number' },
        systemPrompt: { type: 'string' },
        maxTokens: { type: 'number' },
        maxSteps: { type: 'number' }
    },

    actions: [
        {
            name: 'createAgent',
            execute: async function (input: {
                tools?: string[];
                messages?: any[];
                metadata?: Record<string, any>;
            }): Promise<string> {
                return agentService.createAgent(
                    input.tools,
                    input.messages,
                    input.metadata
                );
            }
        },
        {
            name: 'addMessage',
            execute: async function (input: {
                agentId: string;
                message: {
                    role: string;
                    content: string;
                    name?: string;
                    function_call?: {
                        name: string;
                        arguments: string;
                    };
                };
            }): Promise<AgentState> {
                return agentService.addMessage(
                    input.agentId,
                    input.message
                );
            }
        },
        {
            name: 'executeStep',
            execute: async function (input: {
                agentId: string;
                config: AIPluginConfig;
                provider?: string;
                model: string;
                temperature?: number;
                systemPrompt?: string;
                maxTokens?: number;
            }): Promise<AgentState> {
                return agentService.executeStep(
                    input.agentId,
                    input
                );
            }
        },
        {
            name: 'runUntilCompletion',
            execute: async function (input: {
                agentId: string;
                config: AIPluginConfig;
                provider?: string;
                model: string;
                temperature?: number;
                systemPrompt?: string;
                maxTokens?: number;
                maxSteps?: number;
            }): Promise<AgentState> {
                return agentService.runUntilCompletion(
                    input.agentId,
                    input,
                    input.maxSteps
                );
            }
        },
        {
            name: 'getAgentState',
            execute: async function (input: {
                agentId: string;
            }): Promise<AgentState | null> {
                return agentService.getAgentState(input.agentId);
            }
        },
        {
            name: 'registerTool',
            execute: async function (input: {
                tool: Tool;
            }): Promise<void> {
                agentService.registerTool(input.tool);
            }
        },
        {
            name: 'getTools',
            execute: async function (): Promise<Tool[]> {
                return agentService.getTools();
            }
        }
    ]
};

export default agentPlugin;