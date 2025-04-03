'use client';

import React, { useEffect, useState } from 'react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import DataViewer from '@/components/data-viewer';
import { runNode } from '@/lib/node-service';
import { getResponseErrorMessage } from '@/lib-client/helpers';
import { useSiteStore } from '@/context/site-store';
interface NodeRunProps {
    id: string;
    input: any;
    nodeInfo: any;
    setRunStatus?: any;
    setIsRunning?: any;
    runTimestamp?: number;
    runStatus?: string;
}


export const NodeRun: React.FC<NodeRunProps> = ({ id, input, runStatus, nodeInfo, runTimestamp, setIsRunning, setRunStatus }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'output' | 'raw' | 'view'>('summary');
    const [showRunDetails, setShowRunDetails] = useState(false);
    const [output, setRunOutput] = useState<any>(null);
    const [lastRunTimestamp, setLastRunTimestamp] = useState<number>(0);

    useEffect(() => {
        if (runTimestamp > lastRunTimestamp) {
            handlePlay();
        }

    }, [runTimestamp]);

    // Determine if the run was successful
    const isSuccess = !output?.error;

    // Get execution time if available
    const executionTime = output?.executionTime || output?.metadata?.executionTime;

    // Format the output for display

    const handlePlay = async () => {
        try {
            // Get the node type from the id or data
            const nodeType = id.split('-')[0]; // Assuming id format is like "inject-123456"
            const plugin = nodeType;
            const action = input?.action || nodeType; // Default action is same as plugin name

            // Get input values - this would need to be expanded based on your actual input handling
            console.log(`Running node ${id} (plugin: ${plugin}, action: ${action})`);

            setIsRunning(true);
            setRunStatus('idle'); // Reset status when starting a new run

            // Prepare data for the API call
            const data = {
                nodeId: id,
                plugin,
                action,
                input
            };

            // Call the API to run the node
            setRunStatus('running');
            const result = await runNode(data);

            console.log('Node run result:', result);
            setRunOutput(result);

            // Set the run status based on the result
            if (result && result.error) {
                setRunStatus('error');
            } else {
                setRunStatus('success');
            }
        } catch (error) {
            const msg = getResponseErrorMessage(error);
            useSiteStore().ui.getState().showNotice(msg, 'error');
            console.error(error);
            setRunStatus('error');
        } finally {
            setLastRunTimestamp(Date.now());
            setIsRunning(false);
        }
    };

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

    if (!runStatus || runStatus === 'idle') return null;

    return (
        <div className='relative inline-flex items-center'>
            <button
                onClick={() => setShowRunDetails(!showRunDetails)}
                className="rounded-full hover:bg-gray-100 transition-colors"
                title={`Run ${runStatus === 'success' ? 'succeeded' : 'failed'} at ${new Date(lastRunTimestamp || '').toLocaleTimeString()}`}
            >
                {runStatus === 'success' ? (
                    <IconRenderer icon='Check' className="h-4 w-4 text-green-500" />
                ) : (
                    <IconRenderer icon='AlertCircle' className="h-4 w-4 text-red-500" />
                )}
            </button>

            {showRunDetails && (
                <div className="absolute top-8 -left-10 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-96 max-w-3xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between border-b p-4">
                            <div className="flex items-center">
                                {isSuccess ? (
                                    <IconRenderer icon='CheckCircle' className="h-5 w-5 text-green-500 mr-2" />
                                ) : (
                                    <IconRenderer icon='AlertCircle' className="h-5 w-5 text-red-500 mr-2" />
                                )}
                                <h2 className="text-lg font-semibold">
                                    Node Run {isSuccess ? 'Success' : 'Failed'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowRunDetails(false)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                                aria-label="Close"
                            >
                                <IconRenderer icon='X' className="h-5 w-5 text-gray-500" />
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
                            <button
                                className={`px-4 py-2 ${activeTab === 'view' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('view')}
                            >
                                View
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {activeTab === 'view' && (
                                <div className="h-full">
                                    <DataViewer
                                        data={isSuccess ? output : output?.result || output}
                                        showViewerSelector={true}
                                        showRawToggle={true}
                                    />
                                </div>
                            )}

                            {activeTab === 'summary' && (
                                <div className="space-y-4">
                                    {/* Status card */}
                                    <div className={`p-4 rounded-lg border ${isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex items-center">
                                            {isSuccess ? (
                                                <IconRenderer icon='CheckCircle' className="h-6 w-6 text-green-500 mr-3" />
                                            ) : (
                                                <IconRenderer icon='AlertCircle' className="h-6 w-6 text-red-500 mr-3" />
                                            )}
                                            <div>
                                                <h3 className="font-medium">
                                                    {isSuccess ? 'Node executed successfully' : 'Node execution failed'}
                                                </h3>
                                                {executionTime && (
                                                    <p className="text-sm text-gray-600 flex items-center mt-1">
                                                        <IconRenderer icon='Clock' className="h-4 w-4 mr-1" />
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
                                                <IconRenderer icon='Info' className="h-4 w-4 text-gray-500 mr-2" />
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
                    </div>
                </div>
            )}
        </div>

    );
};
