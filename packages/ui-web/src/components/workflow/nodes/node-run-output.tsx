'use client';

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';

interface NodeRunOutputProps {
    output: any;
    onClose: () => void;
}

export const NodeRunOutput: React.FC<NodeRunOutputProps> = ({ output, onClose }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'output' | 'raw'>('summary');

    // Determine if the run was successful
    const isSuccess = !output?.error;

    // Get execution time if available
    const executionTime = output?.executionTime || output?.metadata?.executionTime;

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

    // Extract error message if present
    const getErrorMessage = () => {
        if (!output?.error) return null;

        if (typeof output.error === 'string') {
            return output.error;
        } else if (output.error?.message) {
            return output.error.message;
        } else {
            return JSON.stringify(output.error, null, 2);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center">
                        {isSuccess ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <h2 className="text-lg font-semibold">
                            Node Run {isSuccess ? 'Success' : 'Failed'}
                        </h2>
                    </div>
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
                        className={`px-4 py-2 ${activeTab === 'summary' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('summary')}
                    >
                        Summary
                    </button>
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
                    {activeTab === 'summary' && (
                        <div className="space-y-4">
                            {/* Status card */}
                            <div className={`p-4 rounded-lg border ${isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center">
                                    {isSuccess ? (
                                        <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                                    ) : (
                                        <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                                    )}
                                    <div>
                                        <h3 className="font-medium">
                                            {isSuccess ? 'Node executed successfully' : 'Node execution failed'}
                                        </h3>
                                        {executionTime && (
                                            <p className="text-sm text-gray-600 flex items-center mt-1">
                                                <Clock className="h-4 w-4 mr-1" />
                                                Execution time: {typeof executionTime === 'number' ? `${executionTime}ms` : executionTime}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Error message if failed */}
                            {!isSuccess && getErrorMessage() && (
                                <div className="p-4 rounded-lg border border-red-200 bg-white">
                                    <h3 className="font-medium text-red-600 mb-2">Error Details</h3>
                                    <pre className="whitespace-pre-wrap break-words text-sm bg-red-50 p-3 rounded border border-red-100">
                                        {getErrorMessage()}
                                    </pre>
                                </div>
                            )}

                            {/* Output preview */}
                            <div className="p-4 rounded-lg border border-gray-200 bg-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium">Output Preview</h3>
                                    <button
                                        onClick={() => setActiveTab('output')}
                                        className="text-sm text-purple-600 hover:text-purple-800"
                                    >
                                        View Full Output
                                    </button>
                                </div>
                                <div className="bg-gray-50 p-3 rounded border overflow-auto max-h-[200px]">
                                    <pre className="whitespace-pre-wrap break-words text-sm">
                                        {formatOutput(isSuccess ? output : output?.result || output)}
                                    </pre>
                                </div>
                            </div>

                            {/* Metadata if available */}
                            {output?.metadata && (
                                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                                    <div className="flex items-center mb-2">
                                        <Info className="h-4 w-4 text-gray-500 mr-2" />
                                        <h3 className="font-medium">Metadata</h3>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <pre className="whitespace-pre-wrap break-words text-sm">
                                            {JSON.stringify(output.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'output' && (
                        <div className="bg-gray-50 p-4 rounded border overflow-auto max-h-[calc(80vh-8rem)]">
                            <pre className="whitespace-pre-wrap break-words text-sm">
                                {formatOutput(isSuccess ? output : output?.result || output)}
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
