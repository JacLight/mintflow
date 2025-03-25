import React, { useState } from 'react';
import { Node, HandleType } from '@xyflow/react';
import { X } from 'lucide-react';
import { NodeData, HandleData } from '../types';

/**
 * Modal for node configuration 
 */
export const NodeConfigModal = ({
    isOpen,
    onClose,
    node,
    onUpdate
}: {
    isOpen: boolean;
    onClose: () => void;
    node: Node | null;
    onUpdate: (node: Node) => void;
}) => {
    if (!isOpen || !node) return null;

    const [nodeConfig, setNodeConfig] = useState<Node>(node);

    const updateNodeConfig = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(nodeConfig);
        onClose();
    };

    // Safely access data properties
    const nodeData = nodeConfig.data as NodeData;
    const handles = nodeData.handles || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-lg font-medium text-white">Configure Node</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={updateNodeConfig} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm text-gray-400">Label</label>
                        <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            value={nodeData.title || ''}
                            aria-label="Node Label"
                            onChange={(e) => setNodeConfig({
                                ...nodeConfig,
                                data: { ...nodeData, title: e.target.value }
                            })}
                        />
                    </div>

                    {/* Handle configuration */}
                    <div className="space-y-2">
                        <label className="block text-sm text-gray-400">Handles</label>
                        <div className="bg-gray-800 p-3 rounded space-y-3">
                            {handles.map((handle: HandleData, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <select
                                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                                        value={handle.type}
                                        aria-label={`Handle ${index + 1} Type`}
                                        onChange={(e) => {
                                            const newHandles = [...handles];
                                            newHandles[index] = { ...newHandles[index], type: e.target.value as HandleType };
                                            setNodeConfig({
                                                ...nodeConfig,
                                                data: { ...nodeData, handles: newHandles }
                                            });
                                        }}
                                    >
                                        <option value="source">Output</option>
                                        <option value="target">Input</option>
                                    </select>

                                    <input
                                        type="text"
                                        placeholder="Node type"
                                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white flex-grow"
                                        value={handle.nodeType || ''}
                                        aria-label={`Handle ${index + 1} Node Type`}
                                        onChange={(e) => {
                                            const newHandles = [...handles];
                                            newHandles[index] = { ...newHandles[index], nodeType: e.target.value };
                                            setNodeConfig({
                                                ...nodeConfig,
                                                data: { ...nodeData, handles: newHandles }
                                            });
                                        }}
                                    />

                                    <button
                                        type="button"
                                        className="text-red-500 hover:text-red-400"
                                        aria-label={`Remove Handle ${index + 1}`}
                                        onClick={() => {
                                            const newHandles = handles.filter((_, i) => i !== index);
                                            setNodeConfig({
                                                ...nodeConfig,
                                                data: { ...nodeData, handles: newHandles }
                                            });
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded w-full"
                                aria-label="Add Handle"
                                onClick={() => {
                                    setNodeConfig({
                                        ...nodeConfig,
                                        data: {
                                            ...nodeData,
                                            handles: [
                                                ...handles,
                                                { id: `handle-${Date.now()}`, type: 'source', nodeType: 'default', position: '50%' }
                                            ]
                                        }
                                    });
                                }}
                            >
                                Add Handle
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                            onClick={onClose}
                            aria-label="Cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                            aria-label="Save changes"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NodeConfigModal;
