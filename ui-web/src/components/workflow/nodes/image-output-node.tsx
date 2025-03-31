'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { NodeProps, Position, useReactFlow } from '@xyflow/react';
import { BaseNode, BaseNodeData } from './base-node';
import { NodePosition } from '../types';

// Extended data type for image output nodes
export type ImageOutputNodeData = {
    imageUrl?: string;
    label?: string;
} & BaseNodeData;

// Image output node component with custom handle positioning
export const ImageOutputNode = memo((props: NodeProps) => {
    const { data, id, ...rest } = props;
    // Cast the data to ImageOutputNodeData to fix TypeScript errors
    const nodeData = data as ImageOutputNodeData;

    const [expanded, setExpanded] = useState(false);
    const reactFlowInstance = useReactFlow();

    // Custom position for the output handle - bottom right
    const customSourcePosition: NodePosition = useMemo(() => ({
        position: Position.Bottom,
        offsetX: 100, // Move to the right
        offsetY: 0
    }), []);

    // Toggle form expansion
    const toggleExpand = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setExpanded(!expanded);
    };

    // Default image if none provided
    const imageUrl = nodeData.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Output';

    return (
        <BaseNode
            {...rest}
            id={id}
            data={{
                ...nodeData,
                label: nodeData.label || 'Image Output',
                sourcePosition: customSourcePosition
            }}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
            isExpanded={expanded}
            toggleExpand={toggleExpand}
        >
            <div className="flex flex-col">
                <div className="image-container relative">
                    <img
                        src={imageUrl}
                        alt="Output"
                        className="w-full rounded-md border border-gray-200"
                    />

                    {/* Indicator for the handle position */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full opacity-50" />
                </div>

                {expanded && (
                    <div className="mt-4 pt-2 border-t">
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                                type="text"
                                value={imageUrl}
                                placeholder="Enter image URL"
                                aria-label="Image URL"
                                onChange={(e) => {
                                    // Update the node data in the React Flow instance
                                    const node = reactFlowInstance.getNode(id);
                                    if (node) {
                                        const updatedNode = {
                                            ...node,
                                            data: {
                                                ...node.data,
                                                imageUrl: e.target.value
                                            }
                                        };
                                        reactFlowInstance.setNodes((nodes) =>
                                            nodes.map((n) => (n.id === id ? updatedNode : n))
                                        );
                                    }
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                        </div>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

ImageOutputNode.displayName = 'ImageOutputNode';
