'use client';

import { useState, useCallback, useRef, DragEvent } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    Node,
    Edge,
    NodeTypes,
    useReactFlow,
    Panel,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ComponentPanel } from '../workflow/component-panel';
import { InfoNode } from './nodes/info-node';
import { DynamicNode } from './nodes/dynamic-node';
import { AppViewNode } from './nodes/app-view-node';

// Define custom node types
const nodeTypes: NodeTypes = {
    info: InfoNode,
    dynamic: DynamicNode,
    'app-view': AppViewNode
};

// Sample schema for dynamic node
const sampleSchema = {
    type: 'object',
    properties: {
        join: {
            type: 'string',
            enum: ['or', 'and'],
            group: 'max'
        },
        max: {
            type: 'number',
            group: 'max'
        },
        filters: {
            type: 'array',
            layout: 'horizontal',
            showIndex: true,
            items: {
                type: 'object',
                layout: 'horizontal',
                properties: {
                    source: {
                        type: 'string',
                        enum: ['data', 'flow'],
                        group: 'filter'
                    }
                }
            }
        }
    }
};

// Initial nodes and edges
const initialNodes: Node[] = [
    {
        id: 'info-1',
        type: 'info',
        position: { x: 100, y: 50 },
        data: {
            label: 'Information Node',
            content: 'This is a workflow designer for MintFlow. Drag components from the panel to create your workflow.',
            icon: 'info'
        }
    },
    {
        id: 'dynamic-1',
        type: 'dynamic',
        position: { x: 400, y: 50 },
        data: {
            label: 'Dynamic Node',
            schema: sampleSchema,
            icon: 'box'
        }
    },
    {
        id: 'app-view-1',
        type: 'app-view',
        position: { x: 250, y: 200 },
        data: {
            label: 'App View Node',
            componentType: 'ChatInterface',
            icon: 'zap'
        }
    }
];

const initialEdges: Edge[] = [];

// Component for the flow canvas with drag and drop functionality
function FlowCanvas() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useReactFlow();

    // Handle when a node is dropped on the canvas
    const onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            if (!reactFlowWrapper.current || !reactFlowInstance) return;

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow/type');
            const name = event.dataTransfer.getData('application/reactflow/name');

            // Get position where the node was dropped
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top
            });

            // Create a new node with appropriate data based on type
            let newNode: Node;
            const nodeId = `${type}-${Date.now()}`;

            switch (type) {
                case 'info':
                    newNode = {
                        id: nodeId,
                        type,
                        position,
                        data: {
                            label: name,
                            content: 'Add your information here'
                        }
                    };
                    break;

                case 'dynamic':
                    newNode = {
                        id: nodeId,
                        type,
                        position,
                        data: {
                            label: name,
                            schema: {
                                type: 'object',
                                properties: {
                                    // Default empty schema
                                    name: { type: 'string' }
                                }
                            }
                        }
                    };
                    break;

                case 'app-view':
                    newNode = {
                        id: nodeId,
                        type,
                        position,
                        data: {
                            label: name,
                            componentType: 'Default'
                        }
                    };
                    break;

                default:
                    newNode = {
                        id: nodeId,
                        type,
                        position,
                        data: { label: name }
                    };
            }

            // Add the new node to the flow
            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
    );

    // Handle drag over event
    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <div className="h-full w-full" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={(changes) => {
                    setNodes((nds) => {
                        return applyNodeChanges(changes, nds);
                    });
                }}
                onEdgesChange={(changes) => {
                    setEdges((eds) => {
                        return applyEdgeChanges(changes, eds);
                    });
                }}
                onConnect={(connection) => {
                    setEdges((eds) => addEdge(connection, eds));
                }}
                nodeTypes={nodeTypes}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-left" className="bg-background border rounded-md shadow-md">
                    <div className="p-2 text-sm font-medium">Workflow Designer</div>
                </Panel>
            </ReactFlow>
        </div>
    );
}

// Main workflow designer component with split layout
export function WorkflowDesigner() {
    return (
        <ReactFlowProvider>
            <div className="flex h-full w-full">
                <ComponentPanel />
                <div className="flex-1">
                    <FlowCanvas />
                </div>
            </div>
        </ReactFlowProvider>
    );
}
