'use client';

import { useState, useCallback, useRef, DragEvent, useEffect } from 'react';
import { DataList } from "../common/data-list";
import { ConsolePanel } from '../console';
import WorkflowService from '@/lib/workflow-service';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    Node,
    Edge,
    useReactFlow,
    Panel,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    useOnSelectionChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Upload, Download } from 'lucide-react';

import { ComponentPanel } from './component-panel';
import { getNodeTypes, getEdgeTypes, getNodeDefaultData } from './node-registry';

// Get node and edge types from the registry
// You can filter which nodes to include by passing an array of types
const nodeTypes = getNodeTypes(['info', 'dynamic', 'app-view', 'form', 'improved', 'action', 'condition', 'switch', 'image']);
const edgeTypes = getEdgeTypes(['custom']);

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
    {
        id: 'form-1',
        type: 'form',
        position: { x: 250, y: 200 },
        data: {
            label: 'Form  Node',
            componentType: 'ChatInterface',
            icon: 'Zap'
        }
    },
    {
        id: 'improved-1',
        type: 'improved',
        position: { x: 250, y: 200 },
        data: {
            label: 'Improved Node',
            componentType: 'ChatInterface',
            icon: 'Zap'
        }
    },
    {
        id: 'Action-1',
        type: 'action',
        position: { x: 250, y: 200 },
        data: {
            label: 'Action Node',
            componentType: 'ChatInterface',
            icon: 'Zap'
        }
    },
    {
        id: 'Condition-1',
        type: 'condition',
        position: { x: 250, y: 200 },
        data: {
            label: 'Condition Node',
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
function FlowCanvas({ componentTypes }: { componentTypes: any }) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedElements, setSelectedElements] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
    const [showLoadDialog, setShowLoadDialog] = useState<boolean>(false);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useReactFlow();

    // Register the workflow instance with the WorkflowService
    useEffect(() => {
        if (reactFlowInstance) {
            // Create a workflow instance API for the WorkflowService
            const workflowInstance = {
                addNode: (type: string, nodeId: string, position = { x: 250, y: 250 }) => {
                    try {
                        const nodeInfo = componentTypes.find((c: any) => c.id.toLowerCase() === nodeId.toLowerCase());
                        const nodeData = getNodeDefaultData(type, nodeId);

                        const newNode: Node = {
                            id: nodeId,
                            type,
                            position,
                            data: { nodeId, ...nodeData, nodeInfo }
                        };

                        // Add the new node to the flow
                        setNodes((nds) => nds.concat(newNode));
                        return newNode;
                    } catch (error) {
                        console.error('Error adding node:', error);
                        return null;
                    }
                },
                getNodes: () => reactFlowInstance.getNodes(),
                getEdges: () => reactFlowInstance.getEdges()
            };

            // Register the workflow instance
            WorkflowService.registerWorkflowInstance(workflowInstance);

            return () => {
                // Unregister the workflow instance when the component unmounts
                WorkflowService.registerWorkflowInstance(null);
            };
        }
    }, [reactFlowInstance]);

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

    // Show load dialog
    const handleShowLoadDialog = useCallback((showDialog) => {
        setShowLoadDialog(showDialog);
    }, []);

    // Handle flow selection
    const handleFlowSelect = useCallback((rowEvent: string, rowId: string, row: any) => {
        try {
            if (row && row.data && row.data.flow) {
                const flowData = row.data.flow;

                if (flowData.nodes && flowData.edges) {
                    setNodes(flowData.nodes);
                    // Ensure all edges have the custom type
                    const edgesWithCustomType = flowData.edges.map((edge: Edge) => ({
                        ...edge,
                        type: 'custom'
                    }));
                    setEdges(edgesWithCustomType);
                    console.log('Workflow loaded:', flowData);
                    setShowLoadDialog(false);
                    alert(`Workflow "${row.data.title}" loaded successfully!`);
                }
            } else {
                alert('Selected flow does not contain valid workflow data');
            }
        } catch (error) {
            console.error('Error loading workflow:', error);
            alert('Error loading workflow data');
        }
    }, [setNodes, setEdges]);

    // Close load dialog
    const handleCloseLoadDialog = useCallback(() => {
        setShowLoadDialog(false);
    }, []);

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
            const nodeId = event.dataTransfer.getData('application/reactflow/id');
            const nodeInfo = componentTypes.find((c: any) => c.id.toLowerCase() === nodeId.toLowerCase());

            // Get position where the node was dropped
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top
            });

            // Create a new node with data from the node registry
            const nodeData = getNodeDefaultData(type, nodeId);

            const newNode: Node = {
                id: nodeId,
                type,
                position,
                data: { nodeId, ...nodeData, nodeInfo }
            };

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
            // fitView
            >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-left" className="bg-background border rounded-md shadow-md">
                    <div className="p-2 text-sm font-medium">Workflow Designer - New Flow</div>
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
                        onClick={() => handleShowLoadDialog(!showLoadDialog)}
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
            {/* Load Flow Dialog */}
            <DataList
                show={showLoadDialog}
                datatype={'mintflow'}
                onRowClick={handleFlowSelect}
                onClose={() => handleShowLoadDialog(false)}
            />
        </div>
    );
}

// Main workflow designer component with split layout
export function WorkflowDesigner({ componentTypes, componentGroups }: { componentTypes: any, componentGroups: any }) {
    return (
        <ReactFlowProvider>
            <div className="flex flex-col h-full w-full relative">
                <div className="flex flex-1 min-h-0">
                    <ComponentPanel componentTypes={componentTypes} componentGroups={componentGroups} />
                    <div className="flex-1">
                        <FlowCanvas componentTypes={componentTypes} />
                    </div>
                </div>
                <ConsolePanel />
            </div>
        </ReactFlowProvider>
    );
}
