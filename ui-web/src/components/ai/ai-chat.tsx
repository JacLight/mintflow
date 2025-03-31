<<<<<<< HEAD
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, User, Send, Minimize2, Maximize2, Paperclip, RefreshCw, Trash2, Terminal } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import WorkflowService from '@/lib/workflow-service';

// Socket event types for AI server (must match server-side enum)
enum AIEventTypes {
    AI_REQUEST = 'ai_request',
    AI_RESPONSE = 'ai_response',
    AI_STREAM_START = 'ai_stream_start',
    AI_STREAM_CHUNK = 'ai_stream_chunk',
    AI_STREAM_END = 'ai_stream_end',
    AI_ERROR = 'ai_error',
    AI_COMMAND = 'ai_command',
    AI_COMMAND_RESULT = 'ai_command_result'
}

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isComplete?: boolean;
    isCommand?: boolean;
    commandResult?: any;
}
=======
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Menu, X, MessageSquare, User, DollarSign, BarChart2, Settings, Clock, Calendar, Zap, AlertCircle, ArrowUpRight, Plus, Paperclip, Send, Minimize2, Maximize2, ArrowRight, Edit3, File } from 'lucide-react';
>>>>>>> parent of e867858 (Refactor Socket.IO configuration, add AI Assistant page, and update sidebar links)

const AIChat = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatMode, setChatMode] = useState('minimized'); // 'minimized', 'floating', 'sidebar'
    const [showForm, setShowForm] = useState(false);
    const [chatInput, setChatInput] = useState('');

<<<<<<< HEAD
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeRequestIdRef = useRef<string | null>(null);

    // Function to attach all socket event handlers
    const attachSocketEventHandlers = (socket: Socket) => {
        // Socket event handlers
        socket.on('connect', () => {
            console.log('Connected to AI namespace');
            setIsConnected(true);
            setError(null);

            // Add welcome message
            setMessages([
                {
                    id: uuidv4(),
                    role: 'assistant',
                    content: 'Hello! I\'m your personal assistant. You can ask me questions or give me commands like "create a new flow" or "add an inject node". Type "help" to see all available commands.',
                    timestamp: new Date()
                }
            ]);
        });

        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
            setIsConnected(false);
            setError('Failed to connect to the assistant. Please try again later.');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from AI namespace');
            setIsConnected(false);
        });

        // Handle AI responses
        socket.on(AIEventTypes.AI_RESPONSE, (data) => {
            console.log('AI response received:', data);
            setIsLoading(false);
            activeRequestIdRef.current = null;

            setMessages(prev => [
                ...prev,
                {
                    id: uuidv4(),
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                }
            ]);
        });

        // Handle streaming responses
        socket.on(AIEventTypes.AI_STREAM_START, (data) => {
            console.log('AI stream started:', data);

            // Add a new message for the stream
            setMessages(prev => [
                ...prev,
                {
                    id: data.requestId,
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                    isComplete: false
                }
            ]);
        });

        socket.on(AIEventTypes.AI_STREAM_CHUNK, (data) => {
            // Update the streaming message with new content
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === data.requestId
                        ? { ...msg, content: msg.content + data.chunk }
                        : msg
                )
            );
        });

        socket.on(AIEventTypes.AI_STREAM_END, (data) => {
            console.log('AI stream ended:', data);
            setIsLoading(false);
            activeRequestIdRef.current = null;

            // Mark the message as complete
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === data.requestId
                        ? { ...msg, isComplete: true }
                        : msg
                )
            );
        });

        socket.on(AIEventTypes.AI_ERROR, (data) => {
            console.error('AI error:', data);
            setIsLoading(false);
            activeRequestIdRef.current = null;

            // Format the error message for display
            let errorMessage = data.error || 'An error occurred while processing your request.';

            // Handle circular reference errors with a more user-friendly message
            if (errorMessage.includes('circular structure') || errorMessage.includes('Circular reference')) {
                errorMessage = 'The server encountered a technical issue while processing your request. Please try again.';
            }

            setError(errorMessage);

            // Add error message
            setMessages(prev => [
                ...prev,
                {
                    id: uuidv4(),
                    role: 'system',
                    content: `Error: ${errorMessage}`,
                    timestamp: new Date()
                }
            ]);
        });

        // Handle command results
        socket.on(AIEventTypes.AI_COMMAND_RESULT, (data) => {
            console.log('Command result received:', data);

            // Execute the command in the workflow
            if (data.command === 'add_node' && data.result && data.result.success) {
                // Add the node to the workflow
                const nodeType = data.result.nodeType || 'info';
                const nodeId = data.result.nodeId || `node-${Date.now()}`;

                try {
                    // Use the WorkflowService to add the node
                    const newNode = WorkflowService.addNode(nodeType, nodeId);
                    console.log('Node added to workflow:', newNode);

                    // Update the command result with the actual node
                    data.result.actualNode = newNode;
                } catch (error) {
                    console.error('Error adding node to workflow:', error);
                }
            }

            // Add command result message
            setMessages(prev => [
                ...prev,
                {
                    id: uuidv4(),
                    role: 'system',
                    content: `Command executed: ${data.command}`,
                    timestamp: new Date(),
                    isCommand: true,
                    commandResult: data.result
                }
            ]);
        });

        socket.on('history_cleared', () => {
            console.log('Conversation history cleared');
            setMessages([
                {
                    id: uuidv4(),
                    role: 'assistant',
                    content: 'Conversation history has been cleared. You can ask me questions or use commands like "create flow" or "list flows". Type "help" to see all available commands.',
                    timestamp: new Date()
                }
            ]);
        });
    };

    // Connect to socket when component mounts
    useEffect(() => {
        try {
            // Initialize socket connection
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IP || 'http://localhost:7001';

            // Connect to the AI namespace with the correct Socket.IO path
            const socket = io(`${socketUrl}/ai`, {
                path: '/socket.io' // This should match SOCKET_PATH in server's .env
            });

            socketRef.current = socket;

            // Attach event handlers
            attachSocketEventHandlers(socket);
        } catch (err) {
            console.error('Error creating socket:', err);
            setError('Failed to initialize connection to the assistant.');
        }

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
=======
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
>>>>>>> parent of e867858 (Refactor Socket.IO configuration, add AI Assistant page, and update sidebar links)

    const cycleChatMode = () => {
        if (chatMode === 'minimized') setChatMode('floating');
        else if (chatMode === 'floating') setChatMode('sidebar');
        else setChatMode('minimized');
    };

<<<<<<< HEAD
    // We'll let the AI determine if this is a command
    const isHelpCommand = (input: string): boolean => {
        return input.trim().toLowerCase() === 'help';
    };

    // Show help message
    const showHelp = () => {
        setMessages(prev => [
            ...prev,
            {
                id: uuidv4(),
                role: 'system',
                content: `
Available commands:
- add [node type] node: Add a node to the active flow
  Available node types include: info, dynamic, app-view, form, action, condition, switch, image, inject, timer, delay, fetch, webhook, mqtt, array, json, xml, csv, modify, queue, start, and many more
- create flow [name]: Create a new flow
- list flows: List all available flows
- help: Show this help message
                `,
                timestamp: new Date(),
                isCommand: true
            }
        ]);
    };

    const handleSendMessage = () => {
        if (!chatInput.trim() || !isConnected || isLoading) return;

        // Don't allow sending if there's an active request
        if (activeRequestIdRef.current) return;

        const userMessage = chatInput.trim();
        setChatInput('');

        // Add user message to chat
        setMessages(prev => [
            ...prev,
            {
                id: uuidv4(),
                role: 'user',
                content: userMessage,
                timestamp: new Date()
            }
        ]);

        // Handle help command locally, other commands are handled by the server
        if (isHelpCommand(userMessage)) {
            showHelp();
            return;
        }

        // Send as regular message to server
        const requestId = uuidv4();
        activeRequestIdRef.current = requestId;
        setIsLoading(true);

        socketRef.current?.emit(AIEventTypes.AI_REQUEST, {
            requestId,
            prompt: userMessage,
            stream: true // Use streaming for better UX
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearConversation = () => {
        if (socketRef.current) {
            socketRef.current.emit('clear_history');
        }
    };

    const renderMessages = () => {
        return messages.map((message) => (
            <div key={message.id} className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mr-2">
                        {message.isCommand ? (
                            <Terminal size={16} />
                        ) : (
                            <MessageSquare size={16} />
                        )}
                    </div>
                )}
                <div
                    className={`${message.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-lg rounded-tr-none'
                        : message.role === 'system'
                            ? message.isCommand
                                ? 'bg-green-100 text-green-800 rounded-lg rounded-tl-none'
                                : 'bg-orange-100 text-orange-800 rounded-lg rounded-tl-none'
                            : 'bg-zinc-100 rounded-lg rounded-tl-none'
                        } p-3 max-w-xs md:max-w-md`}
                >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && !message.isComplete && (
                        <div className="mt-2 flex items-center">
                            <div className="animate-spin mr-2">
                                <RefreshCw size={12} />
                            </div>
                            <span className="text-xs text-zinc-500">Thinking...</span>
                        </div>
                    )}
                    {message.commandResult && (
                        <div className="mt-2 text-xs">
                            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(message.commandResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
                {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 ml-2">
                        <User size={16} />
                    </div>
                )}
            </div>
        ));
    };

=======
>>>>>>> parent of e867858 (Refactor Socket.IO configuration, add AI Assistant page, and update sidebar links)
    return (
        <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden shrink-0">
            {chatMode === 'sidebar' && (
                <div className=" border-l border-zinc-200 bg-white flex flex-col">
                    <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
                        <h3 className="font-medium">Business Assistant</h3>
                        <button onClick={cycleChatMode} className="text-zinc-400 hover:text-zinc-700">
                            <Minimize2 size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex justify-end mb-4">
                            <div className="bg-indigo-600 text-white rounded-lg rounded-tr-none p-3 max-w-xs">
                                <p className="text-sm">How's the upcoming payroll looking?</p>
                            </div>
                        </div>

                        <div className="flex mb-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mr-2">
                                <MessageSquare size={16} />
                            </div>
                            <div className="bg-zinc-100 rounded-lg rounded-tl-none p-3 max-w-xs">
                                <p className="text-sm">The next payroll run is scheduled for March 15th with a total of $28,351.65 for 18 employees and 4 contractors.</p>
                                <p className="text-sm mt-2">There's an issue with Sarah Johnson's timesheet - she's missing 4 hours on March 5th.</p>
                                <div className="mt-3">
                                    <button className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 mr-2">
                                        Fix timesheet
                                    </button>
                                    <button className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">
                                        Review payroll
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mb-4">
                            <div className="bg-indigo-600 text-white rounded-lg rounded-tr-none p-3 max-w-xs">
                                <p className="text-sm">Fix Sarah's timesheet by adding 4 hours on March 5th</p>
                            </div>
                        </div>

                        <div className="flex mb-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mr-2">
                                <MessageSquare size={16} />
                            </div>
                            <div className="bg-zinc-100 rounded-lg rounded-tl-none p-3 max-w-xs">
                                <p className="text-sm">I've updated Sarah Johnson's timesheet for March 5th, adding 4 hours of regular time.</p>
                                <p className="text-sm mt-2">Her total hours for the pay period are now 80 hours. This will increase the payroll amount to $28,442.77.</p>
                                <div className="mt-3">
                                    <button className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 mr-2">
                                        Confirm changes
                                    </button>
                                    <button className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">
                                        View details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-zinc-200">
                        <div className="flex items-center bg-zinc-100 rounded-lg p-1">
                            <input
                                type="text"
                                placeholder="Message Business Assistant..."
                                className="flex-1 bg-transparent border-none text-sm p-2 focus:outline-none"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                            />
                            <button className="p-2 text-zinc-400 hover:text-zinc-700">
                                <Paperclip size={18} />
                            </button>
                            <button className="p-2 text-indigo-600 hover:text-indigo-800">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Chat */}
            {chatMode === 'floating' && (
                <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-lg border border-zinc-200 flex flex-col z-20" style={{ height: '400px' }}>
                    <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
                        <h3 className="font-medium">Business Assistant</h3>
                        <div className="flex items-center">
                            <button onClick={() => setChatMode('sidebar')} className="text-zinc-400 hover:text-zinc-700 mr-2">
                                <Maximize2 size={18} />
                            </button>
                            <button onClick={() => setChatMode('minimized')} className="text-zinc-400 hover:text-zinc-700">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex mb-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mr-2">
                                <MessageSquare size={16} />
                            </div>
                            <div className="bg-zinc-100 rounded-lg rounded-tl-none p-3 max-w-xs">
                                <p className="text-sm">Hi Jessica! How can I help you today?</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-zinc-200">
                        <div className="flex items-center bg-zinc-100 rounded-lg p-1">
                            <input
                                type="text"
                                placeholder="Message Business Assistant..."
                                className="flex-1 bg-transparent border-none text-sm p-2 focus:outline-none"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                            />
                            <button className="p-2 text-zinc-400 hover:text-zinc-700">
                                <Paperclip size={18} />
                            </button>
                            <button className="p-2 text-indigo-600 hover:text-indigo-800">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Minimized Chat Button */}
            {chatMode === 'minimized' && (
                <button
                    onClick={cycleChatMode}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 z-20"
                >
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    );
};

export default AIChat;