// Chat and LangChain Plugin Usage Examples

/**
 * This guide demonstrates how to use the comprehensive Chat Plugin within your workflow,
 * how it integrates with human-in-the-loop scenarios, and how to use the LangChain adapter.
 */

// Import your workflow engine services and the plugins
import { FlowEngine } from './services/FlowEngine.js';
import { NodeExecutorService } from './services/NodeExecutorService.js';
import { ConfigService } from './services/ConfigService.js';
import { chatPlugin } from './adapters/ChatPlugin.js';
import { createLangChainModel } from './adapters/LangChainAdapterPlugin.js';
import { BaseChatModel } from 'langchain/chat_models/base';
import { HumanMessage, SystemMessage } from 'langchain/schema';

/**
 * Example 1: Basic Chat Workflow
 * 
 * This example shows a simple workflow that creates a chat session and handles
 * a conversation with the AI, including memory management.
 */
export async function exampleBasicChatWorkflow() {
    // Get your existing configuration
    const config = ConfigService.getInstance().getConfig();

    // Create a sample workflow definition
    const basicChatFlow = {
        flowId: 'basic-chat-flow',
        tenantId: 'demo',
        name: 'Basic Chat Flow',
        description: 'Demonstrates basic chat functionality with memory',
        overallStatus: 'draft',
        definition: {
            nodes: [
                {
                    nodeId: 'start',
                    type: 'start',
                    plugin: 'system',
                    action: 'start',
                    nextNodes: ['createChatSession']
                },
                {
                    nodeId: 'createChatSession',
                    type: 'process',
                    plugin: 'chat',
                    action: 'createChatSession',
                    input: {
                        userId: '{{$userId}}',
                        initialSystemMessage: 'You are a helpful assistant that provides concise responses. Be friendly but professional.'
                    },
                    nextNodes: ['processUserMessage']
                },
                {
                    nodeId: 'processUserMessage',
                    type: 'process',
                    plugin: 'chat',
                    action: 'sendMessage',
                    input: {
                        sessionId: '{{createChatSession_result}}',
                        message: '{{$userMessage}}',
                        config: {
                            ...config.ai,
                            provider: 'openai',
                            model: 'gpt-4o',
                            temperature: 0.7
                        }
                    },
                    nextNodes: ['checkForHandoff']
                },
                {
                    nodeId: 'checkForHandoff',
                    type: 'condition',
                    plugin: 'system',
                    action: 'evaluate',
                    input: {
                        condition: '{{processUserMessage_result.handoff && processUserMessage_result.handoff.requested}}'
                    },
                    branches: [
                        {
                            condition: 'true',
                            targetNodeId: 'handleHumanHandoff'
                        },
                        {
                            condition: 'false',
                            targetNodeId: 'returnResponse'
                        }
                    ]
                },
                {
                    nodeId: 'handleHumanHandoff',
                    type: 'process',
                    plugin: 'system',
                    action: 'notify',
                    input: {
                        channel: 'agent-queue',
                        payload: {
                            type: 'handoff_request',
                            sessionId: '{{createChatSession_result}}',
                            reason: '{{processUserMessage_result.handoff.reason}}',
                            userId: '{{$userId}}'
                        }
                    },
                    nextNodes: ['returnHandoffResponse']
                },
                {
                    nodeId: 'returnHandoffResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: '{{processUserMessage_result.response.content}}',
                            handoffRequested: true,
                            sessionId: '{{createChatSession_result}}'
                        }
                    }
                },
                {
                    nodeId: 'returnResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: '{{processUserMessage_result.response.content}}',
                            sessionId: '{{createChatSession_result}}'
                        }
                    }
                }
            ]
        }
    };

    return basicChatFlow;
}

/**
 * Example 2: Chat with Tools Workflow
 * 
 * This example shows a workflow that uses tools within the chat context
 * to provide enhanced functionality.
 */
export async function exampleChatWithToolsWorkflow() {
    // Get your existing configuration
    const config = ConfigService.getInstance().getConfig();

    // Create a sample workflow definition
    const chatWithToolsFlow = {
        flowId: 'chat-with-tools-flow',
        tenantId: 'demo',
        name: 'Chat With Tools Flow',
        description: 'Demonstrates chat functionality with tool calling',
        overallStatus: 'draft',
        definition: {
            nodes: [
                {
                    nodeId: 'start',
                    type: 'start',
                    plugin: 'system',
                    action: 'start',
                    nextNodes: ['registerCustomTool']
                },
                {
                    nodeId: 'registerCustomTool',
                    type: 'process',
                    plugin: 'chat',
                    action: 'registerTool',
                    input: {
                        tool: {
                            name: 'getProductDetails',
                            description: 'Get details about a product by ID or name',
                            parameters: {
                                type: 'object',
                                properties: {
                                    productId: {
                                        type: 'string',
                                        description: 'ID of the product'
                                    },
                                    productName: {
                                        type: 'string',
                                        description: 'Name of the product'
                                    }
                                },
                                required: ['productId']
                            },
                            execute: async (params) => {
                                // Mock product database - would connect to real database in production
                                const products = {
                                    'prod-123': {
                                        name: 'Ultra Smart Watch',
                                        price: 299.99,
                                        features: ['Heart rate monitor', 'GPS', 'Water resistant'],
                                        inStock: true
                                    },
                                    'prod-456': {
                                        name: 'Premium Headphones',
                                        price: 199.99,
                                        features: ['Noise cancellation', 'Bluetooth', 'Long battery life'],
                                        inStock: false
                                    }
                                };

                                // Look up product
                                const product = products[params.productId];
                                if (!product) {
                                    return { error: 'Product not found' };
                                }

                                return product;
                            }
                        }
                    },
                    nextNodes: ['createChatSession']
                },
                {
                    nodeId: 'createChatSession',
                    type: 'process',
                    plugin: 'chat',
                    action: 'createChatSession',
                    input: {
                        userId: '{{$userId}}',
                        initialSystemMessage: 'You are a helpful product assistant that can provide information about our products.'
                    },
                    nextNodes: ['processUserMessage']
                },
                {
                    nodeId: 'processUserMessage',
                    type: 'process',
                    plugin: 'chat',
                    action: 'sendMessage',
                    input: {
                        sessionId: '{{createChatSession_result}}',
                        message: '{{$userMessage}}',
                        config: {
                            ...config.ai,
                            provider: 'openai',
                            model: 'gpt-4o',
                            temperature: 0.7
                        }
                    },
                    nextNodes: ['returnResponse']
                },
                {
                    nodeId: 'returnResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: '{{processUserMessage_result.response.content}}',
                            sessionId: '{{createChatSession_result}}'
                        }
                    }
                }
            ]
        }
    };

    return chatWithToolsFlow;
}

/**
 * Example 3: Human-in-the-Loop Workflow
 * 
 * This example demonstrates a complete human-in-the-loop workflow,
 * where a human agent can take over and then transfer back to AI.
 */
export async function exampleHumanInTheLoopWorkflow() {
    // Get your existing configuration
    const config = ConfigService.getInstance().getConfig();

    // Create a sample workflow definition
    const humanInTheLoopFlow = {
        flowId: 'human-in-the-loop-flow',
        tenantId: 'demo',
        name: 'Human-in-the-Loop Flow',
        description: 'Demonstrates human agent takeover and transfer back to AI',
        overallStatus: 'draft',
        definition: {
            nodes: [
                // User message handling
                {
                    nodeId: 'start',
                    type: 'start',
                    plugin: 'system',
                    action: 'start',
                    nextNodes: ['getSessionStatus']
                },
                {
                    nodeId: 'getSessionStatus',
                    type: 'process',
                    plugin: 'chat',
                    action: 'getSessionContext',
                    input: {
                        sessionId: '{{$sessionId}}'
                    },
                    nextNodes: ['checkSessionExists']
                },
                {
                    nodeId: 'checkSessionExists',
                    type: 'condition',
                    plugin: 'system',
                    action: 'evaluate',
                    input: {
                        condition: '{{getSessionStatus_result !== null}}'
                    },
                    branches: [
                        {
                            condition: 'true',
                            targetNodeId: 'processMessage'
                        },
                        {
                            condition: 'false',
                            targetNodeId: 'createNewSession'
                        }
                    ]
                },
                {
                    nodeId: 'createNewSession',
                    type: 'process',
                    plugin: 'chat',
                    action: 'createChatSession',
                    input: {
                        userId: '{{$userId}}',
                        initialSystemMessage: 'You are a helpful assistant for our company. If you cannot solve a customer issue, offer to transfer them to a human agent.'
                    },
                    nextNodes: ['updateSessionId']
                },
                {
                    nodeId: 'updateSessionId',
                    type: 'process',
                    plugin: 'system',
                    action: 'assign',
                    input: {
                        variable: 'sessionId',
                        value: '{{createNewSession_result}}'
                    },
                    nextNodes: ['processMessage']
                },
                {
                    nodeId: 'processMessage',
                    type: 'process',
                    plugin: 'chat',
                    action: 'sendMessage',
                    input: {
                        sessionId: '{{$sessionId || updateSessionId_result.sessionId}}',
                        message: '{{$userMessage}}',
                        config: {
                            ...config.ai,
                            provider: 'openai',
                            model: 'gpt-4o',
                            temperature: 0.7
                        }
                    },
                    nextNodes: ['checkHandoffStatus']
                },

                // Handoff logic
                {
                    nodeId: 'checkHandoffStatus',
                    type: 'condition',
                    plugin: 'system',
                    action: 'evaluate',
                    input: {
                        condition: '{{processMessage_result.handoff !== undefined && processMessage_result.handoff.requested === true}}'
                    },
                    branches: [
                        {
                            condition: 'true',
                            targetNodeId: 'notifyAgents'
                        },
                        {
                            condition: 'false',
                            targetNodeId: 'returnAIResponse'
                        }
                    ]
                },
                {
                    nodeId: 'notifyAgents',
                    type: 'process',
                    plugin: 'system',
                    action: 'notify',
                    input: {
                        channel: 'agent-queue',
                        payload: {
                            type: 'handoff_request',
                            sessionId: '{{$sessionId || updateSessionId_result.sessionId}}',
                            reason: '{{processMessage_result.handoff.reason}}',
                            userId: '{{$userId}}'
                        }
                    },
                    nextNodes: ['returnHandoffResponse']
                },

                // Response handling
                {
                    nodeId: 'returnAIResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: '{{processMessage_result.response.content}}',
                            sessionId: '{{$sessionId || updateSessionId_result.sessionId}}',
                            source: 'ai'
                        }
                    }
                },
                {
                    nodeId: 'returnHandoffResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: '{{processMessage_result.response.content}}',
                            handoffRequested: true,
                            sessionId: '{{$sessionId || updateSessionId_result.sessionId}}',
                            source: 'ai_handoff'
                        }
                    }
                }
            ]
        }
    };

    // Human agent handling flow
    const humanAgentFlow = {
        flowId: 'human-agent-flow',
        tenantId: 'demo',
        name: 'Human Agent Flow',
        description: 'Handles human agent interactions with chat',
        overallStatus: 'draft',
        definition: {
            nodes: [
                {
                    nodeId: 'start',
                    type: 'start',
                    plugin: 'system',
                    action: 'start',
                    nextNodes: ['determineAction']
                },
                {
                    nodeId: 'determineAction',
                    type: 'condition',
                    plugin: 'system',
                    action: 'evaluate',
                    input: {
                        condition: '{{$action}}'
                    },
                    branches: [
                        {
                            condition: '$action === "takeover"',
                            targetNodeId: 'agentTakeover'
                        },
                        {
                            condition: '$action === "sendMessage"',
                            targetNodeId: 'agentSendMessage'
                        },
                        {
                            condition: '$action === "transferToAI"',
                            targetNodeId: 'agentTransferToAI'
                        }
                    ]
                },

                // Agent takeover
                {
                    nodeId: 'agentTakeover',
                    type: 'process',
                    plugin: 'chat',
                    action: 'humanTakeoverChat',
                    input: {
                        sessionId: '{{$sessionId}}',
                        agentId: '{{$agentId}}',
                        agentName: '{{$agentName}}'
                    },
                    nextNodes: ['returnTakeoverResponse']
                },
                {
                    nodeId: 'returnTakeoverResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: 'Agent has taken over the conversation',
                            sessionId: '{{$sessionId}}',
                            status: 'with_human',
                            success: true
                        }
                    }
                },

                // Agent send message
                {
                    nodeId: 'agentSendMessage',
                    type: 'process',
                    plugin: 'chat',
                    action: 'sendHumanAgentMessage',
                    input: {
                        sessionId: '{{$sessionId}}',
                        message: '{{$message}}',
                        agentId: '{{$agentId}}',
                        agentName: '{{$agentName}}'
                    },
                    nextNodes: ['returnAgentMessageResponse']
                },
                {
                    nodeId: 'returnAgentMessageResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: '{{$message}}',
                            sessionId: '{{$sessionId}}',
                            source: 'human_agent',
                            agentName: '{{$agentName}}',
                            success: true
                        }
                    }
                },

                // Transfer back to AI
                {
                    nodeId: 'agentTransferToAI',
                    type: 'process',
                    plugin: 'chat',
                    action: 'transferToAI',
                    input: {
                        sessionId: '{{$sessionId}}',
                        agentId: '{{$agentId}}',
                        transferMessage: '{{$transferMessage}}'
                    },
                    nextNodes: ['returnTransferResponse']
                },
                {
                    nodeId: 'returnTransferResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: 'Conversation transferred back to AI assistant',
                            sessionId: '{{$sessionId}}',
                            status: 'active',
                            success: true
                        }
                    }
                }
            ]
        }
    };

    return { userFlow: humanInTheLoopFlow, agentFlow: humanAgentFlow };
}

/**
 * Example 4: Hybrid Chat with Memory Embeddings and RAG
 * 
 * This example shows a workflow that combines chat with embedding-based
 * memory retrieval and RAG for context-aware responses.
 */
export async function exampleEmbeddingMemoryWithRAG() {
    // Get your existing configuration
    const config = ConfigService.getInstance().getConfig();

    // Import RAG plugin
    import ragPlugin from './plugins/RAGPlugin.js';

    // Create a sample workflow definition
    const embeddingMemoryFlow = {
        flowId: 'embedding-memory-flow',
        tenantId: 'demo',
        name: 'Embedding Memory with RAG Flow',
        description: 'Demonstrates chat with embedding-based memory and RAG',
        overallStatus: 'draft',
        definition: {
            nodes: [
                {
                    nodeId: 'start',
                    type: 'start',
                    plugin: 'system',
                    action: 'start',
                    nextNodes: ['createChatSession']
                },
                {
                    nodeId: 'createChatSession',
                    type: 'process',
                    plugin: 'chat',
                    action: 'createChatSession',
                    input: {
                        userId: '{{$userId}}',
                        initialSystemMessage: 'You are a helpful assistant with access to knowledge about our company\'s products and services.'
                    },
                    nextNodes: ['createQueryEmbedding']
                },
                {
                    nodeId: 'createQueryEmbedding',
                    type: 'process',
                    plugin: 'rag',
                    action: 'createQueryEmbedding',
                    input: {
                        query: '{{$userMessage}}',
                        config: config.ai
                    },
                    nextNodes: ['searchDocuments']
                },
                {
                    nodeId: 'searchDocuments',
                    type: 'process',
                    plugin: 'rag',
                    action: 'searchSimilarDocuments',
                    input: {
                        namespace: 'product-docs',
                        queryEmbedding: '{{createQueryEmbedding_result}}',
                        options: {
                            maxResults: 3,
                            minScore: 0.7
                        }
                    },
                    nextNodes: ['findRelevantMessages']
                },
                {
                    nodeId: 'findRelevantMessages',
                    type: 'process',
                    plugin: 'chat',
                    action: 'getRelevantMessages',
                    input: {
                        sessionId: '{{createChatSession_result}}',
                        query: '{{$userMessage}}',
                        count: 5
                    },
                    nextNodes: ['buildEnhancedContext']
                },
                {
                    nodeId: 'buildEnhancedContext',
                    type: 'process',
                    plugin: 'system',
                    action: 'transform',
                    input: {
                        data: {
                            sessionId: '{{createChatSession_result}}',
                            relevantDocs: '{{searchDocuments_result}}',
                            relevantMessages: '{{findRelevantMessages_result}}',
                            userQuery: '{{$userMessage}}'
                        },
                        transform: (data) => {
                            // Build enhanced system message with relevant context
                            const docContext = data.relevantDocs
                                .map(doc => doc.document.text)
                                .join('\n\n');

                            return {
                                systemMessage: `Below is relevant information from our knowledge base:\n\n${docContext}\n\nPlease use this context to answer the user's question.`,
                                messages: data.relevantMessages,
                                sessionId: data.sessionId,
                                userQuery: data.userQuery
                            };
                        }
                    },
                    nextNodes: ['addContextMessage']
                },
                {
                    nodeId: 'addContextMessage',
                    type: 'process',
                    plugin: 'chat',
                    action: 'addMessage',
                    input: {
                        sessionId: '{{buildEnhancedContext_result.sessionId}}',
                        message: {
                            role: 'system',
                            content: '{{buildEnhancedContext_result.systemMessage}}'
                        },
                        options: {
                            useEmbeddings: true
                        }
                    },
                    nextNodes: ['processChatMessage']
                },
                {
                    nodeId: 'processChatMessage',
                    type: 'process',
                    plugin: 'chat',
                    action: 'sendMessage',
                    input: {
                        sessionId: '{{buildEnhancedContext_result.sessionId}}',
                        message: '{{buildEnhancedContext_result.userQuery}}',
                        config: {
                            ...config.ai,
                            provider: 'openai',
                            model: 'gpt-4o',
                            temperature: 0.7
                        }
                    },
                    nextNodes: ['returnResponse']
                },
                {
                    nodeId: 'returnResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: '{{processChatMessage_result.response.content}}',
                            sessionId: '{{buildEnhancedContext_result.sessionId}}',
                            relevantDocuments: '{{searchDocuments_result.length}}',
                            relevantMessages: '{{findRelevantMessages_result.length}}'
                        }
                    }
                }
            ]
        }
    };

    return embeddingMemoryFlow;
}

/**
 * Example 5: Using LangChain Adapter
 * 
 * This example demonstrates how to use the LangChain adapter to integrate
 * with LangChain's ecosystem of tools and capabilities.
 */
export async function exampleLangChainAdapter() {
    // Get your existing configuration
    const config = ConfigService.getInstance().getConfig();

    // Create a sample workflow definition
    const langChainFlow = {
        flowId: 'langchain-adapter-flow',
        tenantId: 'demo',
        name: 'LangChain Adapter Flow',
        description: 'Demonstrates using LangChain with MintFlow',
        overallStatus: 'draft',
        definition: {
            nodes: [
                {
                    nodeId: 'start',
                    type: 'start',
                    plugin: 'system',
                    action: 'start',
                    nextNodes: ['createLangChainModel']
                },
                {
                    nodeId: 'createLangChainModel',
                    type: 'process',
                    plugin: 'langchain-adapter',
                    action: 'createLangChainModel',
                    input: {
                        config: config.ai,
                        provider: 'openai',
                        model: 'gpt-4o',
                        systemPrompt: 'You are a helpful AI assistant specialized in explaining technical concepts.',
                        temperature: 0.7
                    },
                    nextNodes: ['generateResponse']
                },
                {
                    nodeId: 'generateResponse',
                    type: 'process',
                    plugin: 'langchain-adapter',
                    action: 'generateFromMessages',
                    input: {
                        config: config.ai,
                        provider: 'openai',
                        model: 'gpt-4o',
                        systemPrompt: 'You are a helpful AI assistant specialized in explaining technical concepts.',
                        temperature: 0.7,
                        messages: [
                            { role: 'system', content: 'You are a helpful AI assistant specialized in explaining technical concepts.' },
                            { role: 'user', content: '{{$userMessage}}' }
                        ]
                    },
                    nextNodes: ['returnResponse']
                },
                {
                    nodeId: 'returnResponse',
                    type: 'end',
                    plugin: 'system',
                    action: 'end',
                    input: {
                        response: {
                            message: '{{generateResponse_result.text}}',
                            usage: '{{generateResponse_result.usage}}'
                        }
                    }
                }
            ]
        }
    };

    return langChainFlow;
}

// Additional examples and usage information could be added here
