// // LangChain/LangGraph Integration Guide

// /**
//  * This guide demonstrates how to integrate the implemented LangChain/LangGraph components
//  * with your existing workflow engine.
//  */

// // 1. Import the plugins
// import langchainAdapterPlugin from './plugins/LangChainAdapterPlugin.js';
// import langGraphPlugin from './plugins/LangGraphPlugin.js';
// import memoryPlugin from './plugins/MemoryPlugin.js';
// import ragPlugin from './plugins/RAGPlugin.js';
// import agentPlugin from './plugins/AgentPlugin.js';
// import promptPlugin from './plugins/PromptPlugin.js';
// import outputParserPlugin from './plugins/OutputParserPlugin.js';

// // 2. Import your existing workflow engine services
// import { FlowEngine } from './services/FlowEngine.js';
// import { NodeExecutorService } from './services/NodeExecutorService.js';
// import { ConfigService } from './services/ConfigService.js';
// import { RedisService } from './services/RedisService.js';

// // 3. Register the plugins with your workflow engine
// // This function would be called during your application startup

// export async function registerLangChainPlugins() {
//     // Initialize dependency services
//     const config = ConfigService.getInstance().getConfig();
//     const redis = RedisService.getInstance();

//     // Register all LLM plugins
//     const plugins = [
//         langchainAdapterPlugin,
//         langGraphPlugin,
//         memoryPlugin,
//         ragPlugin,
//         agentPlugin,
//         promptPlugin,
//         outputParserPlugin
//     ];

//     // Example registration logic - adapt to your plugin system
//     for (const plugin of plugins) {
//         console.log(`Registering plugin: ${plugin.id}`);

//         // Register each action as a node type in your workflow engine
//         for (const action of plugin.actions) {
//             console.log(`  - Registering action: ${action.name}`);

//             // In your actual code, you would register these with your plugin system
//             // registerNodeType(`${plugin.id}.${action.name}`, action.execute);
//         }
//     }

//     console.log('All LangChain/LangGraph plugins registered successfully');
// }

// // 4. Example usage in a workflow

// /**
//  * Here's an example of how to use these plugins in a workflow:
//  */

// export async function exampleLangChainWorkflow() {
//     // Get your existing configuration
//     const config = ConfigService.getInstance().getConfig();
//     const flowEngine = FlowEngine.getInstance();

//     // Create a sample workflow definition
//     const sampleFlowDefinition = {
//         flowId: 'langchain-sample-flow',
//         tenantId: 'demo',
//         name: 'LangChain Sample Flow',
//         description: 'Demonstrates integration with LangChain',
//         overallStatus: 'draft',
//         definition: {
//             nodes: [
//                 {
//                     nodeId: 'start',
//                     type: 'start',
//                     plugin: 'system',
//                     action: 'start',
//                     nextNodes: ['createModel']
//                 },
//                 {
//                     nodeId: 'createModel',
//                     type: 'process',
//                     plugin: 'langchain-adapter',
//                     action: 'createLangChainModel',
//                     input: {
//                         config: config.ai,
//                         provider: 'openai',
//                         model: 'gpt-4o',
//                         systemPrompt: 'You are a helpful assistant that provides concise responses.',
//                         temperature: 0.7
//                     },
//                     nextNodes: ['createPrompt']
//                 },
//                 {
//                     nodeId: 'createPrompt',
//                     type: 'process',
//                     plugin: 'prompt',
//                     action: 'createTemplate',
//                     input: {
//                         template: {
//                             name: 'customer-inquiry',
//                             description: 'Template for handling customer inquiries',
//                             template: 'Please respond to the following customer question: {{question}}',
//                             tags: ['customer-service']
//                         }
//                     },
//                     nextNodes: ['formatPrompt']
//                 },
//                 {
//                     nodeId: 'formatPrompt',
//                     type: 'process',
//                     plugin: 'prompt',
//                     action: 'formatTemplate',
//                     input: {
//                         templateIdOrObject: '{{createPrompt_result.id}}',
//                         variables: {
//                             question: 'How do I cancel my subscription?'
//                         }
//                     },
//                     nextNodes: ['createMemory']
//                 },
//                 {
//                     nodeId: 'createMemory',
//                     type: 'process',
//                     plugin: 'memory',
//                     action: 'createMemory',
//                     input: {
//                         key: 'conversation-{{$flowRunId}}',
//                         initialMessages: [{
//                             role: 'system',
//                             content: 'This is a customer service conversation.'
//                         }]
//                     },
//                     nextNodes: ['callModel']
//                 },
//                 {
//                     nodeId: 'callModel',
//                     type: 'process',
//                     plugin: 'langchain-adapter',
//                     action: 'generateFromMessages',
//                     input: {
//                         config: config.ai,
//                         provider: 'openai',
//                         model: 'gpt-4o',
//                         messages: [
//                             {
//                                 role: 'system',
//                                 content: 'You are a helpful assistant that provides concise responses.'
//                             },
//                             {
//                                 role: 'user',
//                                 content: '{{formatPrompt_result}}'
//                             }
//                         ]
//                     },
//                     nextNodes: ['parseOutput']
//                 },
//                 {
//                     nodeId: 'parseOutput',
//                     type: 'process',
//                     plugin: 'output-parser',
//                     action: 'parse',
//                     input: {
//                         output: '{{callModel_result.text}}',
//                         options: {
//                             schema: {
//                                 response: 'string',
//                                 sentiment: 'string',
//                                 followupQuestions: []
//                             }
//                         }
//                     },
//                     nextNodes: ['saveToMemory']
//                 },
//                 {
//                     nodeId: 'saveToMemory',
//                     type: 'process',
//                     plugin: 'memory',
//                     action: 'addMessage',
//                     input: {
//                         key: 'conversation-{{$flowRunId}}',
//                         message: {
//                             role: 'assistant',
//                             content: '{{callModel_result.text}}'
//                         }
//                     },
//                     nextNodes: ['end']
//                 },
//                 {
//                     nodeId: 'end',
//                     type: 'end',
//                     plugin: 'system',
//                     action: 'end'
//                 }
//             ]
//         }
//     };

//     // Create and run the flow
//     // await flowEngine.startFlow('demo', 'langchain-sample-flow');

//     return sampleFlowDefinition;
// }

// // 5. Example agent workflow with RAG
// export async function exampleAgentWithRAGWorkflow() {
//     // Get your existing configuration
//     const config = ConfigService.getInstance().getConfig();

//     // Create a sample agent+RAG workflow definition
//     const ragAgentWorkflow = {
//         flowId: 'rag-agent-flow',
//         tenantId: 'demo',
//         name: 'RAG Agent Flow',
//         description: 'Demonstrates integration with RAG and Agents',
//         overallStatus: 'draft',
//         definition: {
//             nodes: [
//                 {
//                     nodeId: 'start',
//                     type: 'start',
//                     plugin: 'system',
//                     action: 'start',
//                     nextNodes: ['processDocument']
//                 },
//                 {
//                     nodeId: 'processDocument',
//                     type: 'process',
//                     plugin: 'rag',
//                     action: 'processDocument',
//                     input: {
//                         document: {
//                             id: 'docs-1',
//                             text: 'Our cancellation policy allows customers to cancel their subscription at any time. Refunds are provided for annual plans within 30 days of purchase. To cancel, customers can visit their account settings page and click "Cancel Subscription". For immediate assistance, customers can contact support@example.com.',
//                             metadata: {
//                                 source: 'knowledge_base',
//                                 category: 'subscription'
//                             }
//                         },
//                         namespace: 'customer-support',
//                         config: config.ai
//                     },
//                     nextNodes: ['createQueryEmbedding']
//                 },
//                 {
//                     nodeId: 'createQueryEmbedding',
//                     type: 'process',
//                     plugin: 'rag',
//                     action: 'createQueryEmbedding',
//                     input: {
//                         query: 'How do I cancel my subscription and get a refund?',
//                         config: config.ai
//                     },
//                     nextNodes: ['searchDocs']
//                 },
//                 {
//                     nodeId: 'searchDocs',
//                     type: 'process',
//                     plugin: 'rag',
//                     action: 'searchSimilarDocuments',
//                     input: {
//                         namespace: 'customer-support',
//                         queryEmbedding: '{{createQueryEmbedding_result}}',
//                         options: {
//                             maxResults: 3,
//                             minScore: 0.7
//                         }
//                     },
//                     nextNodes: ['createAgent']
//                 },
//                 {
//                     nodeId: 'createAgent',
//                     type: 'process',
//                     plugin: 'agent',
//                     action: 'createAgent',
//                     input: {
//                         tools: ['calculator', 'search'],
//                         metadata: {
//                             purpose: 'customer-support'
//                         }
//                     },
//                     nextNodes: ['addContextToAgent']
//                 },
//                 {
//                     nodeId: 'addContextToAgent',
//                     type: 'process',
//                     plugin: 'agent',
//                     action: 'addMessage',
//                     input: {
//                         agentId: '{{createAgent_result}}',
//                         message: {
//                             role: 'system',
//                             content: 'You are a customer support agent. Use the provided context to answer customer questions accurately.'
//                         }
//                     },
//                     nextNodes: ['addDocumentsToAgent']
//                 },
//                 {
//                     nodeId: 'addDocumentsToAgent',
//                     type: 'process',
//                     plugin: 'agent',
//                     action: 'addMessage',
//                     input: {
//                         agentId: '{{createAgent_result}}',
//                         message: {
//                             role: 'system',
//                             content: 'Context information: {{searchDocs_result.map(r => r.document.text).join(" ")}}'
//                         }
//                     },
//                     nextNodes: ['addUserQuestion']
//                 },
//                 {
//                     nodeId: 'addUserQuestion',
//                     type: 'process',
//                     plugin: 'agent',
//                     action: 'addMessage',
//                     input: {
//                         agentId: '{{createAgent_result}}',
//                         message: {
//                             role: 'user',
//                             content: 'How do I cancel my subscription and get a refund?'
//                         }
//                     },
//                     nextNodes: ['runAgent']
//                 },
//                 {
//                     nodeId: 'runAgent',
//                     type: 'process',
//                     plugin: 'agent',
//                     action: 'runUntilCompletion',
//                     input: {
//                         agentId: '{{createAgent_result}}',
//                         config: config.ai,
//                         provider: 'openai',
//                         model: 'gpt-4o',
//                         maxSteps: 5
//                     },
//                     nextNodes: ['formatResponse']
//                 },
//                 {
//                     nodeId: 'formatResponse',
//                     type: 'process',
//                     plugin: 'output-parser',
//                     action: 'parse',
//                     input: {
//                         output: '{{runAgent_result.messages.filter(m => m.role === "assistant").pop().content}}',
//                         options: {
//                             schema: {
//                                 response: 'string',
//                                 actionItems: [],
//                                 sources: []
//                             }
//                         }
//                     },
//                     nextNodes: ['end']
//                 },
//                 {
//                     nodeId: 'end',
//                     type: 'end',
//                     plugin: 'system',
//                     action: 'end'
//                 }
//             ]
//         }
//     };

//     return ragAgentWorkflow;
// }

// // 6. LangGraph integration example
// export async function exampleLangGraphWorkflow() {
//     // Get your existing configuration
//     const config = ConfigService.getInstance().getConfig();

//     // Create a sample LangGraph workflow
//     const langGraphWorkflow = {
//         flowId: 'langgraph-flow',
//         tenantId: 'demo',
//         name: 'LangGraph Flow',
//         description: 'Demonstrates integration with LangGraph for complex orchestration',
//         overallStatus: 'draft',
//         definition: {
//             nodes: [
//                 {
//                     nodeId: 'start',
//                     type: 'start',
//                     plugin: 'system',
//                     action: 'start',
//                     nextNodes: ['initializeGraph']
//                 },
//                 {
//                     nodeId: 'initializeGraph',
//                     type: 'process',
//                     plugin: 'langgraph',
//                     action: 'initializeGraph',
//                     input: {
//                         flowRunId: '{{$flowRunId}}',
//                         values: {
//                             query: 'How can I improve my website\'s SEO?',
//                             context: {},
//                             plan: [],
//                             results: []
//                         }
//                     },
//                     nextNodes: ['createModel']
//                 },
//                 {
//                     nodeId: 'createModel',
//                     type: 'process',
//                     plugin: 'langchain-adapter',
//                     action: 'createLangChainModel',
//                     input: {
//                         config: config.ai,
//                         provider: 'openai',
//                         model: 'gpt-4o',
//                         systemPrompt: 'You are an expert assistant that helps plan and execute tasks step by step.'
//                     },
//                     nextNodes: ['createPlanner']
//                 },
//                 {
//                     nodeId: 'createPlanner',
//                     type: 'process',
//                     plugin: 'prompt',
//                     action: 'createTemplate',
//                     input: {
//                         template: {
//                             name: 'planner-prompt',
//                             description: 'Creates a step-by-step plan',
//                             template: 'Create a detailed plan to answer the following question: {{query}}. Break this down into 3-5 specific steps.'
//                         }
//                     },
//                     nextNodes: ['executePlannerStep']
//                 },
//                 {
//                     nodeId: 'executePlannerStep',
//                     type: 'process',
//                     plugin: 'langgraph',
//                     action: 'executeStep',
//                     input: {
//                         flowRunId: '{{$flowRunId}}'
//                     },
//                     nextNodes: ['checkPlannerResult']
//                 },
//                 {
//                     nodeId: 'checkPlannerResult',
//                     type: 'condition',
//                     plugin: 'system',
//                     action: 'evaluate',
//                     input: {
//                         condition: '{{executePlannerStep_result.values.plan && executePlannerStep_result.values.plan.length > 0}}'
//                     },
//                     branches: [
//                         {
//                             condition: 'true',
//                             targetNodeId: 'executeResearchStep'
//                         },
//                         {
//                             condition: 'false',
//                             targetNodeId: 'generatePlan'
//                         }
//                     ]
//                 },
//                 {
//                     nodeId: 'generatePlan',
//                     type: 'process',
//                     plugin: 'langchain-adapter',
//                     action: 'generateFromMessages',
//                     input: {
//                         config: config.ai,
//                         provider: 'openai',
//                         model: 'gpt-4o',
//                         messages: [
//                             {
//                                 role: 'system',
//                                 content: 'You are an expert assistant that helps plan tasks step by step.'
//                             },
//                             {
//                                 role: 'user',
//                                 content: 'Create a detailed plan to answer the following question: {{initializeGraph_result.values.query}}. Break this down into 3-5 specific steps.'
//                             }
//                         ]
//                     },
//                     nextNodes: ['parsePlan']
//                 },
//                 {
//                     nodeId: 'parsePlan',
//                     type: 'process',
//                     plugin: 'output-parser',
//                     action: 'parse',
//                     input: {
//                         output: '{{generatePlan_result.text}}',
//                         options: {
//                             schema: {
//                                 plan: []
//                             }
//                         }
//                     },
//                     nextNodes: ['updateGraphWithPlan']
//                 },
//                 {
//                     nodeId: 'updateGraphWithPlan',
//                     type: 'process',
//                     plugin: 'langgraph',
//                     action: 'updateGraphState',
//                     input: {
//                         flowRunId: '{{$flowRunId}}',
//                         updates: {
//                             values: {
//                                 plan: '{{parsePlan_result.data.plan}}'
//                             }
//                         }
//                     },
//                     nextNodes: ['executeResearchStep']
//                 },
//                 {
//                     nodeId: 'executeResearchStep',
//                     type: 'process',
//                     plugin: 'langgraph',
//                     action: 'executeStep',
//                     input: {
//                         flowRunId: '{{$flowRunId}}'
//                     },
//                     nextNodes: ['checkCompletion']
//                 },
//                 {
//                     nodeId: 'checkCompletion',
//                     type: 'condition',
//                     plugin: 'system',
//                     action: 'evaluate',
//                     input: {
//                         condition: '{{executeResearchStep_result.completed}}'
//                     },
//                     branches: [
//                         {
//                             condition: 'true',
//                             targetNodeId: 'end'
//                         },
//                         {
//                             condition: 'false',
//                             targetNodeId: 'executeResearchStep'
//                         }
//                     ]
//                 },
//                 {
//                     nodeId: 'end',
//                     type: 'end',
//                     plugin: 'system',
//                     action: 'end'
//                 }
//             ]
//         }
//     };

//     return langGraphWorkflow;
// }

// // Additional integration examples could be added here