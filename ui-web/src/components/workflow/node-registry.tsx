import React from 'react';
import { NodeTypes, EdgeTypes } from '@xyflow/react';
import { LucideIcon, CircleDot, Box, GitBranch, Zap, FormInput } from 'lucide-react';

// Import all node components
import { InfoNode } from './nodes/info-node';
import { DynamicNode } from './nodes/dynamic-node';
import { AppViewNode } from './nodes/app-view-node';
import { FormNode } from './nodes/app-form';
import { ActionNode } from './nodes/action-node';
import { ConditionNode } from './nodes/condition-node';

// Import edge components
import CustomEdge from './edges/base-edge';
import { SwitchNode } from './nodes/switch-node';
import { ImageOutputNode } from './nodes/image-output-node';

// Node type definition
export type NodeDefinition = {
    type: string;
    name: string;
    description: string;
    icon: LucideIcon;
    component: React.ComponentType<any>;
    createDefaultData: (name: string) => any;
};

// Global registry of all available node types
export const NODE_REGISTRY: NodeDefinition[] = [
    {
        type: 'info',
        name: 'Information',
        description: 'Display information',
        icon: CircleDot,
        component: InfoNode,
        createDefaultData: (name) => ({
            label: name,
            content: 'Add your information here'
        })
    },
    {
        type: 'dynamic',
        name: 'Dynamic',
        description: 'Form-based node with schema',
        icon: Box,
        component: DynamicNode,
        createDefaultData: (name) => ({
            label: name,
            schema: {
                type: 'object',
                properties: {
                    // Default empty schema
                    name: { type: 'string' }
                }
            }
        })
    },
    {
        type: 'app-view',
        name: 'App View',
        description: 'Display custom component',
        icon: Zap,
        component: AppViewNode,
        createDefaultData: (name) => ({
            label: name,
            componentType: 'Default'
        })
    },
    {
        type: 'form',
        name: 'Form',
        description: 'Display custom component',
        icon: FormInput,
        component: FormNode,
        createDefaultData: (name) => ({
            label: name,
            fields: []
        })
    },
    {
        type: 'action',
        name: 'Action',
        description: 'Display custom component',
        icon: Zap,
        component: ActionNode,
        createDefaultData: (name) => ({
            label: name
        })
    },
    {
        type: 'condition',
        name: 'Condition',
        description: 'Display custom component',
        icon: Box,
        component: ConditionNode,
        createDefaultData: (name) => ({
            label: name
        })
    },
    {
        type: 'switch',
        name: 'Switch',
        description: 'Switch node',
        icon: GitBranch,
        component: SwitchNode,
        createDefaultData: (name) => ({
            label: name,
            branches: []
        })
    },
    {
        type: 'image',
        name: 'Image',
        description: 'Image node',
        icon: GitBranch,
        component: ImageOutputNode,
        createDefaultData: (name) => ({
            label: name,
            branches: []
        })
    },
];

// Edge type registry
export const EDGE_REGISTRY = {
    custom: CustomEdge,
};

// Helper function to get node types for ReactFlow
export const getNodeTypes = (includeTypes?: string[]): NodeTypes => {
    if (!includeTypes) {
        // Return all node types
        const allTypes = NODE_REGISTRY.reduce((types, node) => {
            types[node.type] = node.component;
            return types;
        }, {} as NodeTypes);
        console.log('All node types:', allTypes);
        return allTypes;
    }

    // Return only the specified node types
    const filteredTypes = NODE_REGISTRY
        .filter(node => includeTypes.includes(node.type))
        .reduce((types, node) => {
            types[node.type] = node.component;
            return types;
        }, {} as NodeTypes);
    console.log('Filtered node types:', filteredTypes, 'for types:', includeTypes);
    return filteredTypes;
};

// Helper function to get edge types for ReactFlow
export const getEdgeTypes = (includeTypes?: string[]): EdgeTypes => {
    if (!includeTypes) {
        // Return all edge types
        return EDGE_REGISTRY;
    }

    // Return only the specified edge types
    return Object.entries(EDGE_REGISTRY)
        .filter(([key]) => includeTypes.includes(key))
        .reduce((types, [key, component]) => {
            types[key] = component;
            return types;
        }, {} as EdgeTypes);
};

// Helper function to get component types for the component panel
export const getComponentTypes = (includeTypes?: string[]) => {
    if (!includeTypes) {
        // Return all component types
        return NODE_REGISTRY.map(({ type, name, description, icon }) => ({
            type,
            name,
            description,
            icon
        }));
    }

    // Return only the specified component types
    return NODE_REGISTRY
        .filter(node => includeTypes.includes(node.type))
        .map(({ type, name, description, icon }) => ({
            type,
            name,
            description,
            icon
        }));
};

// Helper function to get default data for a node type
export const getNodeDefaultData = (type: string, name: string) => {
    console.log('getNodeDefaultData called with type:', type, 'name:', name);
    const nodeDefinition = NODE_REGISTRY.find(node => node.type === type);
    if (nodeDefinition) {
        const data = nodeDefinition.createDefaultData(name);
        console.log('getNodeDefaultData returning:', data);
        return data;
    }
    // Fallback if node type not found
    console.log('getNodeDefaultData fallback for type:', type);
    return { label: name };
};
