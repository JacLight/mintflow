'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MoreHorizontal, Settings, Copy, Trash, Play, Edit, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Base node properties
export type BaseNodeData = {
    label: string;
    icon?: React.ReactNode | string;
};

// Icon renderer component
export const IconRender = ({ icon }: { icon?: React.ReactNode | string }) => {
    if (!icon) return null;

    if (typeof icon === 'string') {
        // Try to find the icon in Lucide icons
        const IconComponent = (LucideIcons as any)[icon];
        if (IconComponent) {
            return <IconComponent className="h-4 w-4 text-primary" />;
        }
        // If not found, return the string (could be a class name or other identifier)
        return <span className="h-4 w-4 flex items-center justify-center">{icon}</span>;
    }

    // If it's already a React element, just return it
    return <>{icon}</>;
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
                        <Settings className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    <button
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Duplicate"
                        title="Duplicate"
                    >
                        <Copy className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    <button
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="More options"
                        title="More options"
                    >
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                </div>

                {/* Node label with icon */}
                <div className="text-sm font-medium flex items-center">
                    {data.icon && (
                        <span className="mr-2">
                            <IconRender icon={data.icon} />
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
                            <Play className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Edit"
                            title="Edit"
                        >
                            <Edit className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Add"
                            title="Add"
                        >
                            <Plus className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Delete"
                            title="Delete"
                        >
                            <Trash className="h-3.5 w-3.5 text-gray-500" />
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
