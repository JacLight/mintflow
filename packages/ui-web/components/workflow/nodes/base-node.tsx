'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// Base node properties
export type BaseNodeData = {
    label: string;
};

// Base node component with common styling and functionality
export const BaseNode = memo(({
    data,
    selected,
    sourcePosition = Position.Bottom,
    targetPosition = Position.Top,
    children
}: NodeProps & {
    data: BaseNodeData;
    sourcePosition?: Position;
    targetPosition?: Position;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={`rounded-md border bg-background p-3 shadow-md transition-all ${selected ? 'ring-2 ring-primary' : ''
                }`}
        >
            {/* Input handle (target) */}
            <Handle
                type="target"
                position={targetPosition}
                className="!h-3 !w-3 !bg-primary"
            />

            {/* Node content */}
            <div className="flex flex-col gap-2">
                <div className="text-sm font-medium">{data.label}</div>
                {children}
            </div>

            {/* Output handle (source) */}
            <Handle
                type="source"
                position={sourcePosition}
                className="!h-3 !w-3 !bg-primary"
            />
        </div>
    );
});

BaseNode.displayName = 'BaseNode';
