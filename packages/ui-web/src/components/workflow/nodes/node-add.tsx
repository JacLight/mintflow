'use client';

import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import {  Info, Zap, Settings, Image} from 'lucide-react';

const availableNodeTypes = [
    { id: 'info', label: 'Info Node', icon: <Info className="h-4 w-4" /> },
    { id: 'app-view', label: 'App View', icon: <Zap className="h-4 w-4" /> },
    { id: 'form', label: 'Form View', icon: <IconRenderer icon='FormInput' className="h-4 w-4" /> },
    { id: 'switch', label: 'Switch', icon: <Settings className="h-4 w-4" /> },
    { id: 'image', label: 'Image', icon: <Image className="h-4 w-4" /> },
];

export const NodeAdd: React.FC<any> = ({  selected, id}) => {
    const reactFlowInstance = useReactFlow();
    const [showAddMenu, setShowAddMenu] = useState(false);

    if (!selected) {
        return null;
    }

    const handleAddNode = (nodeType: string, nodeLabel: string, nodeIcon: React.ReactNode) => {
        const currentNode = reactFlowInstance.getNode(id);
        if (currentNode) {
            // Calculate position for new node
            const newNodePosition = {
                x: currentNode.position.x,
                y: currentNode.position.y + 250
            };

            // Create new node
            const newNodeId = `${nodeType}-${Date.now()}`;
            const newNode = {
                id: newNodeId,
                type: nodeType,
                position: newNodePosition,
                data: {
                    label: nodeLabel,
                    icon: nodeIcon
                }
            };

            // Check if current node is already connected to another node
            const currentNodeConnections = reactFlowInstance.getEdges().filter(
                edge => edge.source === id
            );

            if (currentNodeConnections.length > 0) {
                // Get the target of the existing connection
                const existingTargetId = currentNodeConnections[0].target;
                const existingTarget = reactFlowInstance.getNode(existingTargetId);

                if (existingTarget) {
                    // Position the new node between current and existing target
                    newNode.position = {
                        x: currentNode.position.x,
                        y: (currentNode.position.y + existingTarget.position.y) / 2
                    };

                    // Remove existing edge
                    reactFlowInstance.deleteElements({
                        edges: [{ id: currentNodeConnections[0].id }]
                    });

                    // Add new node
                    reactFlowInstance.addNodes(newNode);

                    // Add edges to connect current -> new -> existing
                    reactFlowInstance.addEdges([
                        { id: `e-${id}-${newNodeId}`, source: id, target: newNodeId, type:'custom' },
                        { id: `e-${newNodeId}-${existingTargetId}`, source: newNodeId, target: existingTargetId, type:'custom' }
                    ]);
                }
            } else {
                // Just add the new node and connect it
                reactFlowInstance.addNodes(newNode);
                reactFlowInstance.addEdges([
                    { id: `e-${id}-${newNodeId}`, source: id, target: newNodeId, type:'custom' }
                ]);
            }

            setShowAddMenu(false);
        }
    };

    return (
        <div className="absolute bottom-[-75px]  left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-md shadow border px-2 py-1">
            <div className="flex justify-center gap-2">
                <button
                    className="p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Add"
                    title="Add node"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                >
                    <span className="h-3.5 w-3.5 text-gray-500">
                        <IconRenderer icon='Plus' className="h-3.5 w-3.5" />
                    </span>
                </button>
            </div>
            {showAddMenu && (
                <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full z-10 bg-white rounded-md shadow-lg border p-2 min-w-48"
                >
                    <div className="text-xs font-medium px-2 py-1 text-gray-500 mb-2 border-b pb-2">Add Node</div>
                    {availableNodeTypes.map((nodeType) => (
                        <button
                            key={nodeType.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                            onClick={() => handleAddNode(nodeType.id, nodeType.label, nodeType.icon)}
                        >
                            <span className="mr-3 h-4 w-4 text-gray-600">
                                {nodeType.icon}
                            </span>
                            {nodeType.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Create a component for empty canvas
export const CanvasAddNode: React.FC = () => {
    const reactFlowInstance = useReactFlow();
    const [showAddMenu, setShowAddMenu] = useState(false);

    const handleAddNode = (nodeType: string, nodeLabel: string, nodeIcon: React.ReactNode) => {
        // Get the viewport dimensions
        const viewport = reactFlowInstance.getViewport();
        const { width, height } = reactFlowInstance.getHostDimensions();

        // Calculate center position, accounting for viewport transform
        const centerX = (width / 2 - viewport.x) / viewport.zoom;
        const centerY = (height / 2 - viewport.y) / viewport.zoom;

        // Create new node
        const newNodeId = `${nodeType}-${Date.now()}`;
        const newNode = {
            id: newNodeId,
            type: nodeType,
            position: { x: centerX, y: centerY },
            data: {
                label: nodeLabel,
                icon: nodeIcon
            }
        };

        // Add the new node
        reactFlowInstance.addNodes(newNode);
        setShowAddMenu(false);
    };

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border">
                <div className="text-lg font-medium text-gray-700 mb-2">Start Building Your Workflow</div>
                <div className="text-sm text-gray-500 mb-4">Add your first component to get started</div>
                <button
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                >
                    <IconRenderer icon='Plus' className="h-4 w-4" />
                    <span>Add Component</span>
                </button>
                {showAddMenu && (
                    <div className="absolute top-full mt-2 bg-white rounded-md shadow-lg border p-2 min-w-48 z-20">
                        <div className="text-xs font-medium px-2 py-1 text-gray-500 mb-2 border-b pb-2">Quick Add</div>
                        {availableNodeTypes.map((nodeType) => (
                            <button
                                key={nodeType.id}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                onClick={() => handleAddNode(nodeType.id, nodeType.label, nodeType.icon)}
                            >
                                <span className="mr-3 h-4 w-4 text-gray-600">
                                    {nodeType.icon}
                                </span>
                                {nodeType.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};