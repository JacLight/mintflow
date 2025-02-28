'use client';

import { memo, useState, useCallback } from 'react';
import { NodeProps, Position, useReactFlow } from '@xyflow/react';
import { Box, ChevronDown, ChevronUp } from 'lucide-react';
import { BaseNode, BaseNodeData } from './base-node';

// Extended data type for dynamic nodes
export type DynamicNodeData = BaseNodeData & {
    schema?: Record<string, any>;
    formData?: Record<string, any>;
};

// Dynamic node component with form based on schema
export const DynamicNode = memo((props: NodeProps) => {
    const { data, id, ...rest } = props;
    const nodeData = data as DynamicNodeData;
    const [expanded, setExpanded] = useState(false);
    const [localFormData, setLocalFormData] = useState<Record<string, any>>(nodeData.formData || {});
    const reactFlowInstance = useReactFlow();

    // Toggle form expansion
    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    // Update form data in the node data
    const updateFormData = useCallback((newFormData: Record<string, any>) => {
        setLocalFormData(newFormData);

        // Update the node data in the React Flow instance
        const node = reactFlowInstance.getNode(id);
        if (node) {
            const updatedNode = {
                ...node,
                data: {
                    ...node.data,
                    formData: newFormData
                }
            };
            reactFlowInstance.setNodes((nodes) =>
                nodes.map((n) => (n.id === id ? updatedNode : n))
            );
        }
    }, [id, reactFlowInstance]);

    // Handle input change
    const handleInputChange = useCallback((fieldName: string, value: any) => {
        updateFormData({
            ...localFormData,
            [fieldName]: value
        });
    }, [localFormData, updateFormData]);

    // Render form fields based on schema
    const renderFormFields = () => {
        if (!nodeData.schema || !nodeData.schema.properties) {
            return <div className="text-xs text-gray-500">No schema properties defined</div>;
        }

        return Object.entries(nodeData.schema.properties).map(([key, schema]: [string, any]) => {
            const value = localFormData[key] || '';

            // Render different input types based on schema type
            switch (schema.type) {
                case 'string':
                    if (schema.enum) {
                        return (
                            <div key={key} className="mb-2">
                                <label className="block text-xs font-medium mb-1">{key}</label>
                                <select
                                    value={value}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    className="w-full text-xs p-1 border rounded"
                                    aria-label={key}
                                >
                                    {schema.enum.map((option: string) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    }
                    return (
                        <div key={key} className="mb-2">
                            <label className="block text-xs font-medium mb-1">{key}</label>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                                className="w-full text-xs p-1 border rounded"
                                aria-label={key}
                            />
                        </div>
                    );
                case 'number':
                    return (
                        <div key={key} className="mb-2">
                            <label className="block text-xs font-medium mb-1">{key}</label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                                className="w-full text-xs p-1 border rounded"
                                aria-label={key}
                            />
                        </div>
                    );
                case 'boolean':
                    return (
                        <div key={key} className="mb-2 flex items-center">
                            <input
                                type="checkbox"
                                checked={!!value}
                                onChange={(e) => handleInputChange(key, e.target.checked)}
                                className="mr-2"
                                aria-label={key}
                            />
                            <label className="text-xs font-medium">{key}</label>
                        </div>
                    );
                default:
                    return null;
            }
        });
    };

    return (
        <BaseNode
            {...rest}
            id={id}
            data={nodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
        >
            <div className="flex flex-col gap-2 rounded-md border bg-green-500/10 p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Box className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium">Dynamic Node</span>
                    </div>
                    <button
                        onClick={toggleExpand}
                        className="rounded-full p-1 hover:bg-muted"
                    >
                        {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Form content (expanded) */}
                {expanded && nodeData.schema && (
                    <div className="mt-2 space-y-2 border-t pt-2">
                        <div className="text-xs text-muted-foreground">
                            {/* Dynamic form based on schema */}
                            <div className="rounded-md bg-white p-2">
                                {renderFormFields()}
                            </div>

                            {/* Display current form data */}
                            <div className="mt-2 rounded-md bg-muted p-2">
                                <div className="text-xs font-medium mb-1">Current Form Data:</div>
                                <pre className="text-[10px] overflow-auto max-h-32">
                                    {JSON.stringify(localFormData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

DynamicNode.displayName = 'DynamicNode';
