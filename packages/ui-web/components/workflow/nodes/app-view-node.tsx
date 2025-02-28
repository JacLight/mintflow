'use client';

import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Layout, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import { BaseNode, BaseNodeData } from './base-node';

// Extended data type for app view nodes
export type AppViewNodeData = BaseNodeData & {
    componentType?: string;
    componentProps?: Record<string, any>;
};

// App View node component
export const AppViewNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;
    const nodeData = data as AppViewNodeData;
    const [expanded, setExpanded] = useState(false);

    // Toggle expansion
    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <BaseNode
            {...rest}
            data={nodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
        >
            <div className={`flex flex-col gap-2 rounded-md border bg-purple-500/10 p-3 ${expanded ? 'w-96 h-64' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Layout className="mr-2 h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium">
                            {nodeData.componentType || 'App View'}
                        </span>
                    </div>
                    <button
                        onClick={toggleExpand}
                        className="rounded-full p-1 hover:bg-muted"
                    >
                        {expanded ? (
                            <Minimize2 className="h-4 w-4" />
                        ) : (
                            <Maximize2 className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Component view area */}
                <div className={`bg-background rounded-md border ${expanded ? 'flex-1' : 'h-20'} flex items-center justify-center`}>
                    <div className="text-xs text-muted-foreground">
                        {nodeData.componentType ? (
                            `Custom component: ${nodeData.componentType}`
                        ) : (
                            'No component specified'
                        )}
                    </div>
                </div>
            </div>
        </BaseNode>
    );
});

AppViewNode.displayName = 'AppViewNode';
