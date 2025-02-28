import React, { useCallback, useState } from 'react';
import {
    ReactFlow,
    addEdge,
    Background,
    Controls,
    Panel,
    useNodesState,
    useEdgesState,
    useReactFlow,
    MarkerType,
    Node,
    Edge,
    Connection,
    HandleType,
    ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Trash2, Globe, ExternalLink, Eye, ChevronDown, Check, Play } from 'lucide-react';
import { NodeData } from './types';
import { getNodeTypes, getEdgeTypes, getNodeDefaultData } from './node-registry';
import NodeConfigModal from './modals/node-config-modal';

/**
 * Flow container with custom node and edge types
 */
export const CustomFlow = ({
    initialNodes = [],
    initialEdges = []
}: {
    initialNodes: Node[];
    initialEdges: Edge[];
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const reactFlow = useReactFlow();

    // Get node and edge types from the registry
    // Only include the MM nodes in this flow
    const nodeTypes = getNodeTypes(['input', 'code', 'output']);
    const edgeTypes = getEdgeTypes(['mmCustom']);

    console.log('CustomFlow nodeTypes:', nodeTypes);
    console.log('CustomFlow edgeTypes:', edgeTypes);

    // Handle connections between nodes
    const onConnect = useCallback((params: Connection) => {
        // Get source and target node data
        const sourceNode = nodes.find(node => node.id === params.source);
        const targetNode = nodes.find(node => node.id === params.target);

        if (!sourceNode || !targetNode) return;

        const sourceData = sourceNode.data as NodeData;
        const targetData = targetNode.data as NodeData;

        const sourceHandle = sourceData.handles?.find(h => h.id === params.sourceHandle);
        const targetHandle = targetData.handles?.find(h => h.id === params.targetHandle);

        // Check handle compatibility
        if (sourceHandle && targetHandle) {
            const isCompatible =
                (!sourceHandle.compatibleWith || sourceHandle.compatibleWith.includes(targetHandle.nodeType || '')) &&
                (!targetHandle.compatibleWith || targetHandle.compatibleWith.includes(sourceHandle.nodeType || ''));

            if (!isCompatible) return;
        }

        // Create edge with custom type
        setEdges((eds) =>
            addEdge({
                ...params,
                type: 'mmCustom',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#8b5cf6',
                    width: 15,
                    height: 15,
                },
            }, eds)
        );
    }, [nodes, setEdges]);

    // Handle for when connection starts
    const onConnectStart = useCallback((_: any, { nodeId, handleId, handleType }: { nodeId: string | null; handleId: string | null; handleType: HandleType | null; }) => {
        // Find the node and handle that initiated the connection
        const sourceNode = nodes.find(n => n.id === nodeId);
        if (!sourceNode) return;

        const sourceData = sourceNode.data as NodeData;
        const sourceHandle = sourceData.handles?.find(h => h.id === handleId);
        if (!sourceHandle) return;

        // Get the compatible node types
        const compatibleTypes = sourceHandle.compatibleWith || [];

        // Update handles visibility based on compatibility
        setNodes(nodes.map(node => {
            // Skip the source node
            if (node.id === nodeId) return node;

            const nodeData = node.data as NodeData;

            // Update node's handles visibility
            const updatedHandles = nodeData.handles?.map(handle => {
                // Skip handles of the same type as the source handle
                if (handle.type === handleType) return handle;

                // Check if this handle is compatible
                const isCompatible = compatibleTypes.length === 0 ||
                    compatibleTypes.includes(handle.nodeType || '');

                return {
                    ...handle,
                    isVisible: isCompatible,
                };
            }) || [];

            return {
                ...node,
                data: {
                    ...nodeData,
                    handles: updatedHandles,
                },
            };
        }));
    }, [nodes, setNodes]);

    // Handle for when connection ends
    const onConnectEnd = useCallback(() => {
        // Reset handle visibility
        setNodes(nodes.map(node => {
            const nodeData = node.data as NodeData;

            return {
                ...node,
                data: {
                    ...nodeData,
                    handles: nodeData.handles?.map(handle => ({
                        ...handle,
                        isVisible: true,
                    })) || [],
                },
            };
        }));
    }, [nodes, setNodes]);

    // Handle node selection for configuration
    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedNode(node);
        setIsConfigModalOpen(true);
    }, []);

    // Update node configuration
    const onNodeConfigUpdate = useCallback((updatedNode: Node) => {
        setNodes(nds =>
            nds.map(node =>
                node.id === updatedNode.id ? updatedNode : node
            )
        );
    }, [setNodes]);

    return (
        <div className="w-full h-full bg-gray-950">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                defaultEdgeOptions={{
                    type: 'mmCustom',
                    animated: true,
                }}
                connectionLineStyle={{
                    stroke: '#8b5cf6',
                    strokeWidth: 2,
                }}
                connectionLineType={ConnectionLineType.SmoothStep}
            >
                <Background color="#333" gap={24} size={1} />
                <Controls className="bg-gray-800 border-gray-700 text-white" />
                <Panel position="top-right" className="bg-gray-800 border border-gray-700 rounded-md shadow-lg p-3">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-white">Add Nodes</h3>
                        <div className="flex space-x-2">
                            <button
                                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                aria-label="Add Input Node"
                                onClick={() => {
                                    const nodeId = `input-${Date.now()}`;
                                    const nodeData = getNodeDefaultData('input', 'MM Input');

                                    const newNode = {
                                        id: nodeId,
                                        type: 'input',
                                        position: { x: 100, y: 100 },
                                        data: nodeData
                                    };

                                    setNodes(nds => [...nds, newNode]);
                                }}
                            >
                                Input
                            </button>
                            <button
                                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                aria-label="Add Code Node"
                                onClick={() => {
                                    const nodeId = `code-${Date.now()}`;
                                    const nodeData = getNodeDefaultData('code', 'MM Code');

                                    const newNode = {
                                        id: nodeId,
                                        type: 'code',
                                        position: { x: 300, y: 100 },
                                        data: nodeData
                                    };

                                    setNodes(nds => [...nds, newNode]);
                                }}
                            >
                                Code
                            </button>
                            <button
                                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                aria-label="Add Output Node"
                                onClick={() => {
                                    const nodeId = `output-${Date.now()}`;
                                    const nodeData = getNodeDefaultData('output', 'MM Output');

                                    const newNode = {
                                        id: nodeId,
                                        type: 'output',
                                        position: { x: 500, y: 100 },
                                        data: nodeData
                                    };

                                    setNodes(nds => [...nds, newNode]);
                                }}
                            >
                                Output
                            </button>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {/* Node configuration modal */}
            <NodeConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                node={selectedNode}
                onUpdate={onNodeConfigUpdate}
            />
        </div>
    );
};

export default CustomFlow;
