'use client';

import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { Node, NodeProps, Position, useReactFlow } from '@xyflow/react';
import { BaseNode, BaseNodeData } from './base-node';
import { useDynamicHandlePositions } from '../utils/handle-position-utils';

// Extended data type for switch nodes
export type SwitchNodeData = {
    options?: Array<{
        name: string;
        label: string;
        value: string;
    }>;
    selectedOption?: string;
    label?: string;
} & BaseNodeData;

// Switch node component with dynamic handle positioning
export const SwitchNode = memo((props: NodeProps) => {
    const { data, id, ...rest } = props;
    // Cast the data to SwitchNodeData to fix TypeScript errors
    const nodeData = data as SwitchNodeData;

    const [expanded, setExpanded] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string>(nodeData.selectedOption || '');
    const reactFlowInstance = useReactFlow();

    // Default options if none provided
    const options = useMemo(() => {
        return nodeData.options || [
            { name: 'option1', label: 'Option 1', value: 'option1' },
            { name: 'option2', label: 'Option 2', value: 'option2' },
            { name: 'option3', label: 'Option 3', value: 'option3' }
        ];
    }, [nodeData.options]);

    // Calculate dynamic handle positions for the options
    const dynamicHandlePositions = useDynamicHandlePositions(
        id,
        options,
        {
            strategy: 'distribute',
            containerWidth: expanded ? 350 : 250,
            containerHeight: options.length * 40 // Approximate height based on number of options
        }
    );

    // Toggle form expansion
    const toggleExpand = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setExpanded(!expanded);
    };

    // Handle option selection
    const handleOptionChange = (value: string) => {
        setSelectedOption(value);

        // Update the node data in the React Flow instance
        const node = reactFlowInstance.getNode(id);
        if (node) {
            const updatedNode = {
                ...node,
                data: {
                    ...node.data,
                    selectedOption: value
                }
            };
            reactFlowInstance.setNodes((nodes) =>
                nodes.map((n) => (n.id === id ? updatedNode : n))
            );
        }
    };

    // Create outputs based on options
    const outputs = useMemo(() => {
        return options.map(option => ({
            name: option.name,
            type: 'any',
            label: option.label
        }));
    }, [options]);

    return (
        <BaseNode
            {...rest}
            id={id}
            data={{
                ...nodeData,
                label: nodeData.label || 'Switch',
                outputs,
                dynamicHandlePositions
            }}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
            isExpanded={expanded}
            toggleExpand={toggleExpand}
        >
            <div className="flex flex-col">
                <div className="switch-options-container">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`p-2 my-1 rounded cursor-pointer border ${selectedOption === option.value ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                            onClick={() => handleOptionChange(option.value)}
                        >
                            <div className="text-sm">{option.label}</div>
                        </div>
                    ))}
                </div>

                {expanded && (
                    <div className="mt-4 pt-2 border-t">
                        <button
                            className="px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded"
                            onClick={() => {
                                // Add a new option
                                const newOption = {
                                    name: `option${options.length + 1}`,
                                    label: `Option ${options.length + 1}`,
                                    value: `option${options.length + 1}`
                                };

                                // Update the node data in the React Flow instance
                                const node = reactFlowInstance.getNode(id);
                                if (node) {
                                    const updatedNode = {
                                        ...node,
                                        data: {
                                            ...node.data,
                                            options: [...options, newOption]
                                        }
                                    };
                                    reactFlowInstance.setNodes((nodes) =>
                                        nodes.map((n) => (n.id === id ? updatedNode : n))
                                    );
                                }
                            }}
                        >
                            Add Option
                        </button>

                        {options.length > 1 && (
                            <button
                                className="ml-2 px-2 py-1 text-xs bg-red-50 border border-red-200 rounded"
                                onClick={() => {
                                    // Remove the last option
                                    if (options.length <= 1) return;

                                    // Update the node data in the React Flow instance
                                    const node = reactFlowInstance.getNode(id);
                                    if (node) {
                                        const updatedNode = {
                                            ...node,
                                            data: {
                                                ...node.data,
                                                options: options.slice(0, -1)
                                            }
                                        };
                                        reactFlowInstance.setNodes((nodes) =>
                                            nodes.map((n) => (n.id === id ? updatedNode : n))
                                        );
                                    }
                                }}
                            >
                                Remove Last Option
                            </button>
                        )}
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

SwitchNode.displayName = 'SwitchNode';
