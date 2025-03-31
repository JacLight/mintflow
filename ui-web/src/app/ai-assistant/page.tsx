'use client';

import React from 'react';
import AIChat from '../../components/ai/ai-chat';

export default function AIAssistantPage() {
    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">AI Assistant Demo</h1>
                <p className="mb-8 text-zinc-600">
                    This page demonstrates the personal AI assistant integration. Click the chat button in the bottom right corner to start a conversation.
                </p>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Features</h2>
                    <ul className="list-disc pl-5 space-y-2 text-zinc-600">
                        <li>Real-time conversation with the AI assistant</li>
                        <li>Streaming responses for better user experience</li>
                        <li>Conversation history management</li>
                        <li>Multiple chat modes: minimized, floating, and sidebar</li>
                        <li>Error handling and connection status</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
                    <h2 className="text-xl font-semibold mb-4">Try asking:</h2>
                    <ul className="list-disc pl-5 space-y-2 text-zinc-600">
                        <li>"What can you help me with?"</li>
                        <li>"How do I create a new project in MintFlow?"</li>
                        <li>"Give me some tips for optimizing my workflow"</li>
                        <li>"Explain how the AI assistant works"</li>
                    </ul>
                </div>
            </div>

            {/* The AIChat component will render the chat interface */}
            <AIChat />
        </div>
    );
}
