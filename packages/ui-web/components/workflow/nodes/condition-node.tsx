'use client';

import { memo } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { BaseNode, BaseNodeData } from './base-node';
import { IconRender } from './base-node';

// Condition node component with multiple outputs
export const ConditionNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;
    return (
        <div
            className={`rounded-md border bg-background p-3 shadow-md transition-all ${props.selected ? 'ring-2 ring-primary' : ''
                }`}
        >
            {/* Input handle (target) */}
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !bg-primary"
            />

            {/* Node content */}
            <div className="flex flex-col gap-2">
                <div className="text-sm font-medium flex items-center">
                    <span className="mr-2">
                        <IconRender icon="GitBranch" />
                    </span>
                    {(data as BaseNodeData).label}
                </div>
                <div className="flex items-center justify-center rounded-md border bg-amber-500/10 p-2">
                    <GitBranch className="h-4 w-4 text-amber-500" />
                    <span className="ml-2 text-xs">Type: Condition</span>
                </div>
            </div>

            {/* True output handle (source) */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className="!h-3 !w-3 !bg-green-500"
                style={{ left: '30%' }}
            />
            <div className="absolute bottom-0 left-[30%] -mb-5 translate-x-[-50%] text-xs text-green-600">
                True
            </div>

            {/* False output handle (source) */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className="!h-3 !w-3 !bg-red-500"
                style={{ left: '70%' }}
            />
            <div className="absolute bottom-0 left-[70%] -mb-5 translate-x-[-50%] text-xs text-red-600">
                False
            </div>
        </div>
    );
});

ConditionNode.displayName = 'ConditionNode';
