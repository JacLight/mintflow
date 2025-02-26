'use client';

import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Box } from 'lucide-react';
import { BaseNode, BaseNodeData } from './base-node';

// Task node component
export const TaskNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;
    return (
        <BaseNode
            {...rest}
            data={data as BaseNodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
        >
            <div className="flex items-center justify-center rounded-md border bg-blue-500/10 p-2">
                <Box className="h-4 w-4 text-blue-500" />
                <span className="ml-2 text-xs">Task</span>
            </div>
        </BaseNode>
    );
});

TaskNode.displayName = 'TaskNode';
