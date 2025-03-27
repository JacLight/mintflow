'use client';

import { memo } from 'react';
import { NodeProps, Position } from '../mock-xyflow';
import { BaseNode, BaseNodeData } from './base-node';
import { IconRenderer } from '@/components/ui/icon-renderer';

// Action node component
export const ActionNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;

    // Create a new data object with the icon
    const nodeData: BaseNodeData = {
        ...(data as BaseNodeData),
        icon: 'Zap' // Using string name of the icon instead of React element
    };

    return (
        <BaseNode
            {...rest}
            data={nodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
        >
            <div className="flex items-center justify-center rounded-md border bg-purple-500/10 p-2">
                <span className="text-purple-500">
                    <IconRenderer icon="Zap" />
                </span>
                <span className="ml-2 text-xs">Type: Action</span>
            </div>
        </BaseNode>
    );
});

ActionNode.displayName = 'ActionNode';
