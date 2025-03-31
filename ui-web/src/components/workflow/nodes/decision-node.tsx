'use client';

import { memo, useState, useCallback } from 'react';
import { NodeProps, Position, useReactFlow } from '@xyflow/react';
import { BaseNode, BaseNodeData } from './base-node';
import { isNotEmpty } from '@/lib-client/helpers';
import DecisionTreeBuilder from '../decision/decision-builder';

// Extended data type for dynamic nodes
export type DynamicNodeData = BaseNodeData & {
    schema?: Record<string, any>;
    formData?: Record<string, any>;
    nodeId?: string;
    nodeInfo?: any
};

// Dynamic node component with form based on schema
export const DynamicNode = memo((props: NodeProps) => {
    const { data: nodeData, id, ...rest } = props;
    const [expanded, setExpanded] = useState(false);
    const [localFormData, setLocalFormData] = useState<any>(nodeData || {});
    const reactFlowInstance = useReactFlow();
    const [decisionTree, setDecisionTree] = useState(null);

    console.log('DynamicNode', nodeData);

    // Toggle form expansion
    const toggleExpand = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setExpanded(!expanded);
    };

    // Update form data in the node data
    const updateFormData = useCallback((path: string, value: any, newFormData: Record<string, any>, files: any, error: any) => {
        setLocalFormData(newFormData);

        // Update the node data in the React Flow instance
        const node = reactFlowInstance.getNode(id);
        if (node) {
            const updatedNode = {
                ...node,
                data: {
                    ...node.data,
                    formData: newFormData
                }
            };
            reactFlowInstance.setNodes((nodes) =>
                nodes.map((n) => (n.id === id ? updatedNode : n))
            );
        }
    }, [id, reactFlowInstance]);

    return (
        <BaseNode
            {...rest}
            id={id}
            data={nodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
            isExpanded={expanded}
            toggleExpand={toggleExpand}
        >
            <div className="flex flex-col">


                {/* Form content (expanded) */}
                {expanded && (
                    <div className="mt-2 space-y-2 border-t pt-2">
                        <div className="text-xs text-muted-foreground">
                            <DecisionTreeBuilder data={decisionTree} onUpdate={setDecisionTree} />
                        </div>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});


const cleanSchema = (schema: any) => {
    if (isNotEmpty(schema?.properties)) {
        Object.keys(schema?.properties).forEach((key) => {
            if (schema?.properties[key]?.type === 'object') {
                if (!Object.keys(schema?.properties[key]?.properties).length) {
                    delete schema?.properties[key];
                } else {
                    cleanSchema(schema?.properties[key]);
                }
            }
        });
    }
    if (isNotEmpty(schema?.items?.properties)) {
        Object.keys(schema?.items?.properties).forEach((key) => {
            if (schema?.items?.properties[key]?.type === 'object') {
                if (!Object.keys(schema?.items?.properties[key]?.properties).length) {
                    delete schema?.items?.properties[key];
                } else {
                    cleanSchema(schema?.items?.properties[key]);
                }
            }
        });
    }
}

DynamicNode.displayName = 'DynamicNode';

