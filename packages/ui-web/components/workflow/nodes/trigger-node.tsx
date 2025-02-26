'use client';

import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { CircleDot } from 'lucide-react';
import { BaseNode, BaseNodeData } from './base-node';

// Trigger node component
export const TriggerNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;
    return (
        <BaseNode
            {...rest}
            data={data as BaseNodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
        >
            <div className="flex items-center justify-center rounded-md border bg-primary/10 p-2">
                <CircleDot className="h-4 w-4 text-primary" />
                <span className="ml-2 text-xs">Workflow Trigger</span>
            </div>
        </BaseNode>
    );
});

TriggerNode.displayName = 'TriggerNode';
