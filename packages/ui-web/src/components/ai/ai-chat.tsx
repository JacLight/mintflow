import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Menu, X, MessageSquare, User, DollarSign, BarChart2, Settings, Clock, Calendar, Zap, AlertCircle, ArrowUpRight, Plus, Paperclip, Send, Minimize2, Maximize2, ArrowRight, Edit3, File } from 'lucide-react';

const AIChat = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatMode, setChatMode] = useState('minimized'); // 'minimized', 'floating', 'sidebar'
    const [showForm, setShowForm] = useState(false);
    const [chatInput, setChatInput] = useState('');

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const cycleChatMode = () => {
        if (chatMode === 'minimized') setChatMode('floating');
        else if (chatMode === 'floating') setChatMode('sidebar');
        else setChatMode('minimized');
    };

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