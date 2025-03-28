'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NodeRunOutputProps {
    output: any;
    onClose: () => void;
}

export const NodeRunOutput: React.FC<NodeRunOutputProps> = ({ output, onClose }) => {
    const [activeTab, setActiveTab] = useState<'output' | 'raw'>('output');

    // Format the output for display
    const formatOutput = (data: any) => {
        if (!data) return 'No output data';

        try {
            if (typeof data === 'string') {
                return data;
            }
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error formatting output:', error);
            return 'Error formatting output';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">Node Run Result</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex border-b">
                    <button
                        className={`px-4 py-2 ${activeTab === 'output' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('output')}
                    >
                        Output
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'raw' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('raw')}
                    >
                        Raw
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {activeTab === 'output' && (
                        <div className="bg-gray-50 p-4 rounded border overflow-auto max-h-[calc(80vh-8rem)]">
                            <pre className="whitespace-pre-wrap break-words text-sm">
                                {formatOutput(output)}
                            </pre>
                        </div>
                    )}

                    {activeTab === 'raw' && (
                        <div className="bg-gray-50 p-4 rounded border overflow-auto max-h-[calc(80vh-8rem)]">
                            <pre className="whitespace-pre-wrap break-words text-sm">
                                {JSON.stringify(output, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="border-t p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
