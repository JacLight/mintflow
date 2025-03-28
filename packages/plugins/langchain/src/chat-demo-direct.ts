// Direct Usage Example for LangChain Adapter

import { ConfigService } from './services/ConfigService.js';
import { createLangChainModel } from './adapters/LangChainAdapterPlugin.js';
import { chatPlugin } from './adapters/ChatPlugin.js';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * This example demonstrates direct usage of the LangChain adapter
 * without going through the workflow engine.
 */
async function runDirectDemo() {
    console.log('Starting LangChain Direct Usage Demo...');

    try {
        // Get configuration
        const config = ConfigService.getInstance().getAIConfig();

        // 1. Create a LangChain model using our adapter
        console.log('Creating LangChain model...');
        const model = createLangChainModel({
            config,
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            systemPrompt: 'You are a helpful AI assistant specialized in explaining technical concepts.',
            temperature: 0.7
        }) as BaseChatModel;

        // 2. Use the model directly with LangChain's interfaces
        console.log('Sending message to LangChain model...');
        const messages = [
            new SystemMessage('You are a helpful AI assistant specialized in explaining technical concepts.'),
            new HumanMessage('What is LangChain and how does it help with building AI applications?')
        ];

        const response = await model.invoke(messages);
        console.log('\nLangChain Response:');
        console.log(response.content);

        // 3. Create a chat session using our Chat Plugin
        console.log('\nCreating chat session...');
        const userId = `user-${Date.now()}`;
        const createSessionAction = chatPlugin.actions.find(a => a.name === 'createChatSession');
        if (!createSessionAction) {
            throw new Error('createChatSession action not found');
        }

        const sessionMsg: any = {
            userId: "",
            initialContext: {},
            message: 'What is LangChain and how does it help with building AI applications?',
            initialSystemMessage: 'You are a helpful AI assistant.'
        }
        const sessionId = await createSessionAction.execute(sessionMsg);
        console.log(`Created chat session: ${sessionId}`);

        // 4. Send a message using the chat plugin
        console.log('\nSending message to chat session...');
        const sendMessageAction = chatPlugin.actions.find(a => a.name === 'sendMessage');
        if (!sendMessageAction) {
            throw new Error('sendMessage action not found');
        }

        const chatMessage: any = {
            userId: "",
            initialContext: {},
            sessionId: sessionId,
            message: 'What is LangChain and how does it help with building AI applications?',
            initialSystemMessage: 'You are a helpful AI assistant.'
        }
        const chatResponse = await sendMessageAction.execute(chatMessage);

        console.log('\nChat Response:');
        console.log(chatResponse.response.content);

        console.log('\nDemo completed successfully!');
    } catch (error) {
        console.error('Error in direct demo:', error);
    }
}

// Run the demo if this file is executed directly
if (require.main === module) {
    runDirectDemo().catch(console.error);
}

export { runDirectDemo };
