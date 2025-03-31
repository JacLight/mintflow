'use client';

import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { BaseNode, BaseNodeData } from './base-node';
import { IconRenderer } from '@/components/ui/icon-renderer';

// Extended data type for info nodes
export type InfoNodeData = BaseNodeData & {
    content?: string;
};

// Information node component
export const InfoNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;
    // Add default values for required BaseNodeData properties
    const nodeData: InfoNodeData = {
        label: data?.label || 'Info Node',
        ...(data as Record<string, unknown>)
    };

    // Add icon to the node data
    const enhancedNodeData: InfoNodeData = {
        ...nodeData,
        icon: 'Info' // Using string name of the icon
    };

    return (
        <BaseNode
            {...rest}
            data={enhancedNodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
        >
            <div className="flex flex-col gap-2 rounded-md border bg-blue-500/10 p-3">
                <div className="flex items-center">
                    <span className="mr-2 text-blue-500">
                        <IconRenderer icon="Info" />
                    </span>
                    <span className="text-xs font-medium">Type: Information</span>
                </div>
                {nodeData.content && (
                    <div className="text-xs text-muted-foreground">
                        {nodeData.content}
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

InfoNode.displayName = 'InfoNode';
