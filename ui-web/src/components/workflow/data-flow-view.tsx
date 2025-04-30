'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Edge, Node, useReactFlow } from '@xyflow/react';
import ViewManager from '../common/view-manager';
import DataViewer from '../data-viewer/data-viewer';
import { IconRenderer } from '../ui/icon-renderer';
import { classNames } from '@/lib-client/helpers';
import { useSiteStore } from '@/context/site-store';
import { AppmintForm } from 'appmint-form';

interface NodeData {
  id: string;
  type: string;
  label: string;
  icon?: React.ReactNode | string;
  inputData?: any;
  outputData?: any;
  formData?: any;
  disabled?: boolean;
  isRunning?: boolean;
  runStatus?: 'idle' | 'success' | 'error';
  data?: {
    nodeInfo?: {
      name?: string;
      type?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

interface DataFlowViewProps {
  isVisible: boolean;
  onClose: () => void;
}

const DataFlowView: React.FC<DataFlowViewProps> = ({ isVisible, onClose }) => {
  const reactFlowInstance = useReactFlow();
  const [flowPath, setFlowPath] = useState<NodeData[]>([]);
  const [branches, setBranches] = useState<{ id: string; label: string }[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [runningNodes, setRunningNodes] = useState<Record<string, boolean>>({});
  const [nodeStatus, setNodeStatus] = useState<
    Record<string, 'idle' | 'success' | 'error'>
  >({});
  const [viewMode, setViewMode] = useState<'expanded' | 'mini'>('expanded');
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);

  // Calculate flow paths when the view is opened
  useEffect(() => {
    if (isVisible) {
      const nodes = reactFlowInstance.getNodes();
      const edges = reactFlowInstance.getEdges();

      // If there's only a single node, create a path with just that node
      if (nodes.length === 1) {
        const node = nodes[0];
        const nodeData: NodeData = {
          id: node.id,
          type: node.type || '',
          label: node.data?.label || '',
          icon: node.data?.icon || '',
          inputData: node.data?.inputData || {},
          outputData: node.data?.outputData || null,
          formData: node.data?.formData || {},
          disabled: node.data?.disabled || false,
          data: node.data || {}
        };
        setFlowPath([nodeData]);
        setBranches([]);
        setSelectedBranch(null);
      } else {
        // Find all paths in the flow
        const paths = findAllPaths(nodes, edges);

        // If there's only one path, set it as the flow path
        if (paths.length === 1) {
          setFlowPath(paths[0]);
          setBranches([]);
          setSelectedBranch(null);
        }
        // If there are multiple paths, set them as branches and ask user to select one
        else if (paths.length > 1) {
          setBranches(
            paths.map((path, index) => ({
              id: `path-${index}`,
              label: `Path ${index + 1}: ${path[0]?.label || 'Start'} → ${path[path.length - 1]?.label || 'End'}`
            }))
          );
          setSelectedBranch(null);
          setFlowPath([]);
        } else {
          // No valid paths found but we have nodes, so create a simple path with all nodes
          if (nodes.length > 0) {
            const simplePath = nodes.map((node) => ({
              id: node.id,
              type: node.type || '',
              label: node.data?.label || '',
              icon: node.data?.icon || '',
              inputData: node.data?.inputData || {},
              outputData: node.data?.outputData || null,
              formData: node.data?.formData || {},
              disabled: node.data?.disabled || false,
              data: node.data || {}
            }));
            setFlowPath(simplePath);
            setBranches([]);
            setSelectedBranch(null);
          } else {
            // Really no nodes at all
            setFlowPath([]);
            setBranches([]);
            setSelectedBranch(null);
          }
        }
      }

      // Reset current step
      setCurrentStep(0);
    }
  }, [isVisible, reactFlowInstance]);

  // When a branch is selected, set the flow path to that branch
  useEffect(() => {
    if (selectedBranch) {
      const branchIndex = parseInt(selectedBranch.split('-')[1]);
      const nodes = reactFlowInstance.getNodes();
      const edges = reactFlowInstance.getEdges();
      const paths = findAllPaths(nodes, edges);

      if (paths[branchIndex]) {
        setFlowPath(paths[branchIndex]);
        setCurrentStep(0);
      }
    }
  }, [selectedBranch, reactFlowInstance]);

  // Find all possible paths in the workflow
  const findAllPaths = (nodes: Node[], edges: Edge[]) => {
    // Find start nodes (nodes with no incoming edges)
    const startNodeIds = nodes
      .filter((node) => !edges.some((edge) => edge.target === node.id))
      .map((node) => node.id);

    // Find all paths from each start node
    const allPaths: NodeData[][] = [];

    startNodeIds.forEach((startId) => {
      const paths = tracePathsFromNode(startId, nodes, edges);
      allPaths.push(...paths);
    });

    return allPaths;
  };

  // Trace all possible paths from a given node
  const tracePathsFromNode = (
    nodeId: string,
    nodes: Node[],
    edges: Edge[]
  ): NodeData[][] => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return [];

    // Get outgoing edges from this node
    const outgoingEdges = edges.filter((edge) => edge.source === nodeId);

    // If no outgoing edges, this is an end node
    if (outgoingEdges.length === 0) {
      const nodeData: NodeData = {
        id: node.id,
        type: node.type || '',
        label: node.data?.label || '',
        icon: node.data?.icon || '',
        inputData: node.data?.inputData || {},
        outputData: node.data?.outputData || null,
        formData: node.data?.formData || {},
        disabled: node.data?.disabled || false,
        data: node.data || {}
      };
      return [[nodeData]];
    }

    // Otherwise, trace paths from each outgoing edge
    const paths: NodeData[][] = [];

    outgoingEdges.forEach((edge) => {
      const targetPaths = tracePathsFromNode(edge.target, nodes, edges);

      targetPaths.forEach((path) => {
        const nodeData: NodeData = {
          id: node.id,
          type: node.type || '',
          label: node.data?.label || '',
          icon: node.data?.icon || '',
          inputData: node.data?.inputData || {},
          outputData: node.data?.outputData || null,
          formData: node.data?.formData || {},
          disabled: node.data?.disabled || false,
          data: node.data || {}
        };

        paths.push([nodeData, ...path]);
      });
    });

    return paths;
  };

  // Render the branch selection UI
  const renderBranchSelection = () => {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-lg font-medium mb-4">Select Flow Path</h2>
          <p className="text-sm text-gray-600 mb-4">
            This workflow has multiple paths. Please select which path you want
            to view:
          </p>
          <div className="space-y-2">
            {branches.map((branch) => (
              <button
                key={branch.id}
                className={classNames(
                  'w-full text-left px-4 py-3 rounded-md border',
                  selectedBranch === branch.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
                onClick={() => setSelectedBranch(branch.id)}
              >
                <div className="flex items-center">
                  <IconRenderer
                    icon="GitBranch"
                    className="mr-2 h-4 w-4 text-gray-600"
                  />
                  <span>{branch.label}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
              disabled={!selectedBranch}
              onClick={() => setCurrentStep(0)}
            >
              View Selected Path
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle disabling/enabling a node
  const toggleNodeDisabled = (nodeId: string) => {
    // Update the node in the ReactFlow instance
    const node = reactFlowInstance.getNode(nodeId);
    if (node) {
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          disabled: !node.data?.disabled
        }
      };
      reactFlowInstance.setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? updatedNode : n))
      );

      // Update the node in the current flow path
      setFlowPath((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, disabled: !n.disabled } : n))
      );
    }
  };

  // Handle running a single node
  const runNode = (nodeId: string, inputData: any) => {
    // Mark the node as running
    setRunningNodes((prev) => ({ ...prev, [nodeId]: true }));
    setNodeStatus((prev) => ({ ...prev, [nodeId]: 'idle' }));

    // Get the actual node from ReactFlow
    const node = reactFlowInstance.getNode(nodeId);
    if (!node) {
      setRunningNodes((prev) => ({ ...prev, [nodeId]: false }));
      setNodeStatus((prev) => ({ ...prev, [nodeId]: 'error' }));
      return;
    }

    // Simulate node execution with a timeout
    setTimeout(() => {
      try {
        // In a real implementation, this would call the actual node execution logic
        // For now, we'll simulate a successful execution with a mock output
        const mockOutput = {
          success: true,
          data: {
            result: `Output from ${node.data?.label || 'node'} execution`,
            timestamp: new Date().toISOString(),
            inputData
          }
        };

        // Update the node in ReactFlow with the new data
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            outputData: mockOutput,
            inputData
          }
        };

        reactFlowInstance.setNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? updatedNode : n))
        );

        // Update the node in our flow path
        setFlowPath((prev) =>
          prev.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  outputData: mockOutput,
                  inputData
                }
              : n
          )
        );

        // Mark the node as done running with success status
        setRunningNodes((prev) => ({ ...prev, [nodeId]: false }));
        setNodeStatus((prev) => ({ ...prev, [nodeId]: 'success' }));
      } catch (error) {
        console.error('Error running node:', error);
        setRunningNodes((prev) => ({ ...prev, [nodeId]: false }));
        setNodeStatus((prev) => ({ ...prev, [nodeId]: 'error' }));
      }
    }, 1500); // Simulate processing time
  };

  // Run all nodes in the current flow path
  const runAllNodes = () => {
    if (flowPath.length === 0) return;

    // Start with the first node
    let currentInputData = flowPath[0].inputData || {};

    // Run each node in sequence
    flowPath.forEach((node, index) => {
      if (node.disabled) return; // Skip disabled nodes

      setTimeout(() => {
        runNode(node.id, currentInputData);
        // Use the output of this node as input to the next node
        if (index < flowPath.length - 1) {
          currentInputData = node.outputData?.data || {};
        }
      }, index * 2000); // Stagger the execution
    });
  };

  // Update input data for a node
  const updateNodeInputData = (nodeId: string, newInputData: any) => {
    // Update the flow path
    setFlowPath((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, inputData: newInputData } : n))
    );
  };

  // Create an actual component for the input form to properly handle hooks
  const InputForm: React.FC<{
    node: NodeData;
    updateNodeInput: (nodeId: string, data: any) => void;
  }> = ({ node, updateNodeInput }) => {
    const [formData, setFormData] = useState(node.inputData || {});

    const handleInputChange = (key: string, value: any) => {
      const newFormData = { ...formData, [key]: value };
      setFormData(newFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateNodeInput(node.id, formData);
    };

    // Don't use React hooks in this nested function
    const renderFormFields = () => {
      if (!formData || typeof formData !== 'object') {
        return (
          <div className="text-sm text-gray-500 italic">
            No editable input data available
          </div>
        );
      }

      return Object.entries(formData).map(([key, value]) => (
        <div key={key} className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {key}
          </label>
          <input
            type={typeof value === 'number' ? 'number' : 'text'}
            value={value as any}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      ));
    };

    return (
      <form onSubmit={handleSubmit} className="h-full overflow-auto p-2">
        {renderFormFields()}
        <button
          type="submit"
          className="mt-2 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Update Input
        </button>
      </form>
    );
  };

  // Create a separate component for each step
  const StepCard: React.FC<{
    node: NodeData;
    index: number;
    currentStep: number;
    runningNodes: Record<string, boolean>;
    nodeStatus: Record<string, 'idle' | 'success' | 'error'>;
    toggleNodeDisabled: (nodeId: string) => void;
    runNode: (nodeId: string, inputData: any) => void;
    reactFlowInstance: any;
    viewMode: 'expanded' | 'mini';
    configDrawerOpen: boolean;
    setConfigDrawerOpen: (open: boolean) => void;
  }> = ({
    node,
    index,
    currentStep,
    runningNodes,
    nodeStatus,
    toggleNodeDisabled,
    runNode,
    reactFlowInstance,
    viewMode,
    configDrawerOpen,
    setConfigDrawerOpen
  }) => {
    const isPrevious = index < currentStep;
    const isCurrent = index === currentStep;
    const isNext = index > currentStep;
    const isRunning = runningNodes[node.id] || false;
    const status = nodeStatus[node.id] || 'idle';
    const [localFormData, setLocalFormData] = useState<any>(
      node?.data?.formData || {}
    );
    const [activeTab, setActiveTab] = useState<'config' | 'output'>('config');

    const updateFormData = useCallback(
      (
        path: string,
        value: any,
        newFormData: Record<string, any>,
        files: any,
        error: any
      ) => {
        setLocalFormData(newFormData);

        // Update the node data in the React Flow instance
        const storeNode = reactFlowInstance.getNode(node?.id);
        if (storeNode) {
          const updatedNode = {
            ...storeNode,
            data: {
              ...storeNode.data,
              formData: newFormData
            }
          };
          reactFlowInstance.setNodes((nodes: Node[]) =>
            nodes.map((n) => (n.id === storeNode?.id ? updatedNode : n))
          );
        }
      },
      [node?.id, reactFlowInstance]
    );

    let nodeInfo =
      useSiteStore()
        .ui.getState()
        .getNodeInfo(node?.data?.nodeId as string) || node?.data?.schema;
    const schema = nodeInfo?.inputSchema || node?.data?.schema;

    const nodeIcon = nodeInfo?.icon || node?.data?.icon;
    const nodeLabel = nodeInfo?.name || node?.data?.label;

    // Render content based on view mode
    const renderContent = () => {
      if (viewMode === 'expanded') {
        return (
          <div className="flex-1 flex flex-row overflow-hidden">
            {/* Left column - Node Form */}
            <div className="w-1/2 border-r p-3 overflow-auto">
              <div className="text-xs font-medium text-gray-500 mb-2">
                NODE CONFIGURATION
              </div>
              <div className="h-full">
                <AppmintForm
                  schema={schema}
                  data={localFormData}
                  rules={[]}
                  datatype={'node-form'}
                  id={`form-${node?.data?.nodeId || node?.id || 'default'}`}
                  theme={'settings'}
                  onChange={updateFormData}
                />
              </div>
            </div>

            {/* Right column - Output Data */}
            <div className="w-1/2 p-3 overflow-auto">
              <div className="text-xs font-medium text-gray-500 mb-2">
                OUTPUT DATA
              </div>
              <div className="h-full">
                <DataViewer
                  data={node.outputData || {}}
                  showViewerSelector={false}
                  showRawToggle={false}
                />
              </div>
            </div>
          </div>
        );
      } else {
        // Mini view with tabs
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                className={classNames(
                  'px-4 py-2 text-sm font-medium',
                  activeTab === 'config'
                    ? 'border-b-2 border-purple-500 text-purple-700'
                    : 'text-gray-600 hover:text-gray-800'
                )}
                onClick={() => setActiveTab('config')}
              >
                Configuration
              </button>
              <button
                className={classNames(
                  'px-4 py-2 text-sm font-medium',
                  activeTab === 'output'
                    ? 'border-b-2 border-purple-500 text-purple-700'
                    : 'text-gray-600 hover:text-gray-800'
                )}
                onClick={() => setActiveTab('output')}
              >
                Output Data
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto p-3">
              {activeTab === 'config' ? (
                <AppmintForm
                  schema={schema}
                  data={localFormData}
                  rules={[]}
                  datatype={'node-form'}
                  id={`form-mini-${node?.data?.nodeId || node?.id || 'default'}`}
                  theme={'settings'}
                  onChange={updateFormData}
                />
              ) : (
                <DataViewer
                  data={node.outputData || {}}
                  showViewerSelector={false}
                  showRawToggle={false}
                />
              )}
            </div>
          </div>
        );
      }
    };

    return (
      <div
        className={classNames(
          'flex flex-col h-full border rounded-md flex-shrink-0',
          viewMode === 'expanded'
            ? 'min-w-[400px] max-w-[850px] w-full'
            : 'w-[500px]',
          node.disabled ? 'opacity-50' : '',
          isPrevious ? 'opacity-70' : '',
          isCurrent ? 'ring-2 ring-purple-500' : '',
          isNext ? 'opacity-60' : ''
        )}
      >
        <div
          className={classNames(
            'p-3 border-b flex items-center',
            isCurrent ? 'bg-purple-50' : 'bg-gray-50',
            node.disabled ? 'bg-gray-200' : ''
          )}
        >
          <div className="flex-shrink-0 mr-3">
            {typeof nodeIcon === 'string' ? (
              <IconRenderer icon={nodeIcon} className="h-5 w-5" />
            ) : (
              node.icon || <IconRenderer icon="Circle" className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{nodeLabel}</div>
            <div className="text-xs text-gray-500">{node.id}</div>
          </div>
          <div className="flex items-center gap-2">
            <NodeControl
              node={node}
              isRunning={runningNodes[node.id] || false}
              toggleNodeDisabled={toggleNodeDisabled}
              runNode={runNode}
            />
            {status === 'success' && (
              <span className="text-green-500">
                <IconRenderer icon="CheckCircle" className="h-4 w-4" />
              </span>
            )}
            {status === 'error' && (
              <span className="text-red-500">
                <IconRenderer icon="XCircle" className="h-4 w-4" />
              </span>
            )}

            <div className="flex-shrink-0">
              <span
                className={classNames(
                  'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs',
                  isCurrent
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {index + 1}
              </span>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    );
  };

  // Component for node controls (disable/enable and run)
  const NodeControls: React.FC<{
    flowPath: NodeData[];
    runningNodes: Record<string, boolean>;
    nodeStatus: Record<string, 'idle' | 'success' | 'error'>;
    toggleNodeDisabled: (nodeId: string) => void;
    runNode: (nodeId: string, inputData: any) => void;
  }> = ({
    flowPath,
    runningNodes,
    nodeStatus,
    toggleNodeDisabled,
    runNode
  }) => {
    return (
      <div className="flex flex-wrap gap-2 items-center mb-3 p-2 bg-gray-50 rounded-md border">
        <div className="text-xs font-medium text-gray-500 mr-2">
          Node Controls:
        </div>
        {flowPath.map((node, index) => (
          <NodeControl
            key={node.id}
            node={node}
            index={index}
            toggleNodeDisabled={toggleNodeDisabled}
            runNode={runNode}
            isRunning={runningNodes[node.id] || false}
          />
        ))}
      </div>
    );
  };

  // Component for node controls (disable/enable and run)
  const NodeControl: React.FC<{
    node: NodeData;
    index?: number;
    isRunning: boolean;
    toggleNodeDisabled: (nodeId: string) => void;
    runNode: (nodeId: string, inputData: any) => void;
  }> = ({ node, index, isRunning, toggleNodeDisabled, runNode }) => {
    return (
      <div
        key={node.id}
        className="flex items-center gap-1 bg-white border rounded-md px-2 py-1 shadow-sm"
      >
        {typeof index === 'number' && (
          <span className="text-xs font-medium">{index + 1}.</span>
        )}
        <span className="text-xs truncate max-w-[100px]">
          {node.data?.nodeInfo?.name || node.label}
        </span>

        {/* Status indicator */}
        {status === 'success' && (
          <span className="text-green-500">
            <IconRenderer icon="CheckCircle" className="h-3.5 w-3.5" />
          </span>
        )}
        {status === 'error' && (
          <span className="text-red-500">
            <IconRenderer icon="XCircle" className="h-3.5 w-3.5" />
          </span>
        )}

        {/* Toggle disable button */}
        <button
          onClick={() => toggleNodeDisabled(node.id)}
          className={classNames(
            'p-1 rounded-md text-xs',
            node.disabled
              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          )}
          title={node.disabled ? 'Enable node' : 'Disable node'}
        >
          <IconRenderer
            icon={node.disabled ? 'Eye' : 'EyeOff'}
            className="h-3 w-3"
          />
        </button>

        {/* Run button */}
        <button
          onClick={() => runNode(node.id, node.inputData)}
          disabled={isRunning || node.disabled}
          className={classNames(
            'p-1 rounded-md text-xs',
            isRunning
              ? 'bg-blue-100 text-blue-700'
              : node.disabled
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
          )}
          title="Run this node"
        >
          {isRunning ? (
            <IconRenderer icon="Loader" className="h-3 w-3 animate-spin" />
          ) : (
            <IconRenderer icon="Play" className="h-3 w-3" />
          )}
        </button>
      </div>
    );
  };

  // Simple wrapper function to render step
  const renderStep = (node: NodeData, index: number) => {
    return (
      <StepCard
        node={node}
        index={index}
        currentStep={currentStep}
        runningNodes={runningNodes}
        nodeStatus={nodeStatus}
        toggleNodeDisabled={toggleNodeDisabled}
        runNode={runNode}
        reactFlowInstance={reactFlowInstance}
        viewMode={viewMode}
        configDrawerOpen={configDrawerOpen}
        setConfigDrawerOpen={setConfigDrawerOpen}
      />
    );
  };

  // Render the data flow view
  const renderDataFlow = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Navigation Controls */}
        <div className="p-3 border-b bg-gray-50 flex flex-col">
          {/* Upper part - main navigation */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <button
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(0)}
                title="Go to first step"
              >
                <IconRenderer icon="ChevronsLeft" className="h-5 w-5" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((curr) => Math.max(0, curr - 1))}
                title="Previous step"
              >
                <IconRenderer icon="ChevronLeft" className="h-5 w-5" />
              </button>
              <div className="text-sm font-medium">
                Step {currentStep + 1} of {flowPath.length}
              </div>
              <button
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                disabled={currentStep === flowPath.length - 1}
                onClick={() =>
                  setCurrentStep((curr) =>
                    Math.min(flowPath.length - 1, curr + 1)
                  )
                }
                title="Next step"
              >
                <IconRenderer icon="ChevronRight" className="h-5 w-5" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                disabled={currentStep === flowPath.length - 1}
                onClick={() => setCurrentStep(flowPath.length - 1)}
                title="Go to last step"
              >
                <IconRenderer icon="ChevronsRight" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="border rounded-md overflow-hidden flex">
                <button
                  className={classNames(
                    'px-3 py-1 text-xs font-medium',
                    viewMode === 'expanded'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  )}
                  onClick={() => setViewMode('expanded')}
                >
                  Expanded
                </button>
                <button
                  className={classNames(
                    'px-3 py-1 text-xs font-medium',
                    viewMode === 'mini'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  )}
                  onClick={() => setViewMode('mini')}
                >
                  Mini
                </button>
              </div>

              {/* Run All Nodes button */}
              <button
                className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded flex items-center gap-1 shadow-sm"
                onClick={runAllNodes}
                title="Run all enabled nodes in sequence"
              >
                <IconRenderer icon="Play" className="h-4 w-4" />
                <span>Run Flow</span>
              </button>

              {branches.length > 0 && (
                <button
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                  onClick={() => setSelectedBranch(null)}
                >
                  <IconRenderer icon="GitBranch" className="h-4 w-4" />
                  <span>Change Path</span>
                </button>
              )}
            </div>
          </div>

          {/* Node Controls */}
          {flowPath.length > 0 && (
            <NodeControls
              flowPath={flowPath}
              runningNodes={runningNodes}
              nodeStatus={nodeStatus}
              toggleNodeDisabled={toggleNodeDisabled}
              runNode={runNode}
            />
          )}
        </div>

        {/* Data Flow Content - Horizontal Scrollable */}
        <div className="flex-1 overflow-auto">
          <div className="flex p-4 h-full overflow-x-auto">
            {/* All Steps in Flow with spacers between them */}
            {flowPath.map((node, index) => (
              <React.Fragment key={node.id}>
                {renderStep(node, index)}

                {/* Add spacer with "+" button between nodes */}
                {index < flowPath.length - 1 && (
                  <div className="flex flex-col justify-center mx-4 relative">
                    <div className="h-px w-16 bg-gray-300"></div>
                    <button
                      className="absolute -top-4 left-5 w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center shadow-sm"
                      onClick={() => {
                        // Add a placeholder for adding a node between existing ones
                        alert(
                          `Add node between ${node.label || node.id} and ${flowPath[index + 1].label || flowPath[index + 1].id}`
                        );
                      }}
                      title="Add node here"
                    >
                      <IconRenderer icon="Plus" className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ViewManager
      id="data-flow-view"
      title="Data Flow View"
      defaultSize={{ width: 1200, height: 700 }}
      isResizable={true}
      onClose={onClose}
      usePortal={true}
    >
      {branches.length > 0 && !selectedBranch ? (
        renderBranchSelection()
      ) : flowPath.length > 0 ? (
        renderDataFlow()
      ) : (
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <IconRenderer
              icon="AlertCircle"
              className="h-12 w-12 text-gray-300 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Valid Flow Found
            </h3>
            <p className="text-sm text-gray-500">
              Could not detect a complete workflow path. Please ensure your
              workflow has properly connected nodes.
            </p>
          </div>
        </div>
      )}
    </ViewManager>
  );
};

export default DataFlowView;
