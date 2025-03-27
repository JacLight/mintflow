'use client';

import { memo, useState, useCallback } from 'react';
import { NodeProps, Position, useReactFlow } from '@xyflow/react';
import { Box, ChevronDown, ChevronUp } from 'lucide-react';
import { BaseNode, BaseNodeData } from './base-node';
import { AppmintForm } from '@appmint/form';

// Extended data type for dynamic nodes
export type DynamicNodeData = BaseNodeData & {
    schema?: Record<string, any>;
    formData?: Record<string, any>;
    inputSchema?: any;
    id?: string;
};

// Dynamic node component with form based on schema
export const DynamicNode = memo((props: NodeProps) => {
    const { data, id, ...rest } = props;
    const nodeData = data as DynamicNodeData;
    const [expanded, setExpanded] = useState(false);
    const [localFormData, setLocalFormData] = useState<Record<string, any>>(nodeData.formData || {});
    const reactFlowInstance = useReactFlow();

    console.log('DynamicNode', id, nodeData);

    // Toggle form expansion
    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    // Update form data in the node data
    const updateFormData = useCallback((path: string, value: any, newFormData: Record<string, any>, files: any, error: any) => {
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
                {expanded && (nodeData.schema || nodeData.inputSchema) && (
                    <div className="mt-2 space-y-2 border-t pt-2">
                        <div className="text-xs text-muted-foreground">
                            {/* Use AppmintForm for dynamic form rendering */}
                            <div className="rounded-md bg-white p-2">
                                <AppmintForm
                                    schema={nodeData.inputSchema || nodeData.schema}
                                    initData={localFormData}
                                    rules={[]}
                                    datatype={'node-form'}
                                    id={`form-${nodeData.id || id || 'default'}`}
                                    theme='setting'
                                    onChange={updateFormData}
                                />
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
