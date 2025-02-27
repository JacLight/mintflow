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
    addEdge,
    useOnSelectionChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Upload, Download } from 'lucide-react';

import { ComponentPanel } from '../workflow/component-panel';
import { InfoNode } from './nodes/info-node';
import { DynamicNode } from './nodes/dynamic-node';
import { AppViewNode } from './nodes/app-view-node';
import { FormNode } from './nodes/app-form';
import CustomEdge from './edges/base-edge';

// Define custom node types
const nodeTypes: NodeTypes = {
    info: InfoNode,
    dynamic: DynamicNode,
    'app-view': AppViewNode,
    'form': FormNode
};

const edgeTypes = {
    custom: CustomEdge
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
            icon: 'Box'
        }
    },
    {
        id: 'app-view-1',
        type: 'app-view',
        position: { x: 250, y: 200 },
        data: {
            label: 'App View Node',
            componentType: 'ChatInterface',
            icon: 'Zap'
        }
    },
];

const initialEdges: Edge[] = [];

// Interface for workflow data
export interface WorkflowData {
    nodes: Node[];
    edges: Edge[];
    name?: string;
    description?: string;
    lastSaved?: string;
}

// Component for the flow canvas with drag and drop functionality
function FlowCanvas() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [selectedElements, setSelectedElements] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useReactFlow();

    // Track selected elements
    useOnSelectionChange({
        onChange: ({ nodes, edges }) => {
            setSelectedElements({ nodes, edges });
        },
    });

    // Save workflow data
    const handleSaveWorkflow = useCallback(() => {
        if (!reactFlowInstance) return;

        const flowData: WorkflowData = {
            nodes: reactFlowInstance.getNodes(),
            edges: reactFlowInstance.getEdges(),
            lastSaved: new Date().toISOString()
        };

        // For demo purposes, we'll save to localStorage
        // In a real app, you would send this to your server API
        localStorage.setItem('savedWorkflow', JSON.stringify(flowData));

        console.log('Workflow saved:', flowData);
        alert('Workflow saved successfully!');
    }, [reactFlowInstance]);

    // Load workflow data
    const handleLoadWorkflow = useCallback(() => {
        // For demo purposes, we'll load from localStorage
        // In a real app, you would fetch this from your server API
        const savedData = localStorage.getItem('savedWorkflow');

        if (savedData) {
            try {
                const flowData: WorkflowData = JSON.parse(savedData);

                if (flowData.nodes && flowData.edges) {
                    setNodes(flowData.nodes);
                    // Ensure all edges have the custom type
                    const edgesWithCustomType = flowData.edges.map(edge => ({
                        ...edge,
                        type: 'custom'
                    }));
                    setEdges(edgesWithCustomType);
                    console.log('Workflow loaded:', flowData);
                    alert('Workflow loaded successfully!');
                }
            } catch (error) {
                console.error('Error loading workflow:', error);
                alert('Error loading workflow data');
            }
        } else {
            alert('No saved workflow found');
        }
    }, [setNodes, setEdges]);

    // Export workflow data as JSON file
    const handleExportWorkflow = useCallback(() => {
        if (!reactFlowInstance) return;

        const flowData: WorkflowData = {
            nodes: reactFlowInstance.getNodes(),
            edges: reactFlowInstance.getEdges(),
            lastSaved: new Date().toISOString()
        };

        const dataStr = JSON.stringify(flowData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `workflow-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }, [reactFlowInstance]);

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
                    setEdges((eds) => addEdge({ ...connection, type: 'custom' }, eds));
                }}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
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
                <Panel position="top-right" className="bg-background border rounded-md shadow-md flex gap-2">
                    <button
                        onClick={handleSaveWorkflow}
                        className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-sm"
                        title="Save workflow"
                    >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={handleLoadWorkflow}
                        className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-sm"
                        title="Load workflow"
                    >
                        <Upload className="h-4 w-4" />
                        <span>Load</span>
                    </button>
                    <button
                        onClick={handleExportWorkflow}
                        className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-sm"
                        title="Export workflow as JSON"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
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
