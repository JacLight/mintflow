'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { IconRenderer } from '@/components/ui/icon-renderer';

// Base node properties
export type BaseNodeData = {
    label: string;
    icon?: React.ReactNode | string;
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
            <div className="flex flex-col gap-2 relative">
                {/* Top right icons */}
                <div className="absolute top-0 right-0 flex space-x-1">
                    <button
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Settings"
                        title="Settings"
                    >
                        <span className="h-3.5 w-3.5 text-gray-500">
                            <IconRenderer icon="Settings" />
                        </span>
                    </button>
                    <button
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Duplicate"
                        title="Duplicate"
                    >
                        <span className="h-3.5 w-3.5 text-gray-500">
                            <IconRenderer icon="Copy" />
                        </span>
                    </button>
                    <button
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="More options"
                        title="More options"
                    >
                        <span className="h-3.5 w-3.5 text-gray-500">
                            <IconRenderer icon="MoreHorizontal" />
                        </span>
                    </button>
                </div>

                {/* Node label with icon */}
                <div className="text-sm font-medium flex items-center">
                    {data.icon && (
                        <span className="mr-2">
                            <IconRenderer icon={data.icon} />
                        </span>
                    )}
                    {data.label}
                </div>

                {children}

                {/* Bottom icons - only shown when selected */}
                {selected && (
                    <div className="flex justify-center space-x-2 mt-2 pt-2 border-t">
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Run"
                            title="Run"
                        >
                            <span className="h-3.5 w-3.5 text-gray-500">
                                <IconRenderer icon="Play" />
                            </span>
                        </button>
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Edit"
                            title="Edit"
                        >
                            <span className="h-3.5 w-3.5 text-gray-500">
                                <IconRenderer icon="Edit" />
                            </span>
                        </button>
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Add"
                            title="Add"
                        >
                            <span className="h-3.5 w-3.5 text-gray-500">
                                <IconRenderer icon="Plus" />
                            </span>
                        </button>
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Delete"
                            title="Delete"
                        >
                            <span className="h-3.5 w-3.5 text-gray-500">
                                <IconRenderer icon="Trash" />
                            </span>
                        </button>
                    </div>
                )}
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
