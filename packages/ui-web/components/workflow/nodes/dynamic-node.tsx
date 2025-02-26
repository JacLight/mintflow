'use client';

import { memo, useState } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Box, ChevronDown, ChevronUp } from 'lucide-react';
import { BaseNode, BaseNodeData } from './base-node';

// Extended data type for dynamic nodes
export type DynamicNodeData = BaseNodeData & {
    schema?: Record<string, any>;
    formData?: Record<string, any>;
};

// Dynamic node component with form based on schema
export const DynamicNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;
    const nodeData = data as DynamicNodeData;
    const [expanded, setExpanded] = useState(false);

    // Toggle form expansion
    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <BaseNode
            {...rest}
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
                            {/* This would be replaced with a dynamic form based on the schema */}
                            <div className="rounded-md bg-muted p-2">
                                <pre className="text-[10px] overflow-auto max-h-32">
                                    {JSON.stringify(nodeData.schema, null, 2)}
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
