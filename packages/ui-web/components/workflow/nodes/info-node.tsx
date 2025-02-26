'use client';

import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Info } from 'lucide-react';
import { BaseNode, BaseNodeData } from './base-node';

// Extended data type for info nodes
export type InfoNodeData = BaseNodeData & {
    content?: string;
};

// Information node component
export const InfoNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;
    const nodeData = data as InfoNodeData;

    return (
        <BaseNode
            {...rest}
            data={nodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
        >
            <div className="flex flex-col gap-2 rounded-md border bg-blue-500/10 p-3">
                <div className="flex items-center">
                    <Info className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium">Information</span>
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
