'use client';

import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { BaseNode, BaseNodeData } from './base-node';

// Action node component
export const ActionNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;
    return (
        <BaseNode
            {...rest}
            data={data as BaseNodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
        >
            <div className="flex items-center justify-center rounded-md border bg-purple-500/10 p-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="ml-2 text-xs">Action</span>
            </div>
        </BaseNode>
    );
});

ActionNode.displayName = 'ActionNode';
