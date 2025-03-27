'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { Check, Box, Info, Zap, Settings, Copy, MoreHorizontal, Play, Plus, Trash } from 'lucide-react';
import { ButtonDelete } from '@/components/ui/button-delete';
import HandleRenderComponent from './handle-render-component';
import { ConnectionState } from '../types';
import GlowingHandle from './glowing-handle';

// Base node properties
export type BaseNodeData = {
  label: string;
  icon?: React.ReactNode | string;
  description?: string;
  inputs?: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean;
    description?: string;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
    label: string;
    description?: string;
  }>;
};

// Available node types for the add menu
const availableNodeTypes = [
  { id: 'dynamic', label: 'Dynamic Node', icon: <Box className="h-4 w-4" /> },
  { id: 'info', label: 'Info Node', icon: <Info className="h-4 w-4" /> },
  { id: 'app-view', label: 'App View', icon: <Zap className="h-4 w-4" /> },
  { id: 'form', label: 'Form View', icon: <IconRenderer icon='FormInput' className="h-4 w-4" /> }
];

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Box': return <Box className="h-4 w-4" />;
    case 'Info': return <Info className="h-4 w-4" />;
    case 'Zap': return <Zap className="h-4 w-4" />;
    case 'Settings': return <Settings className="h-4 w-4" />;
    case 'Copy': return <Copy className="h-4 w-4" />;
    case 'MoreHorizontal': return <MoreHorizontal className="h-4 w-4" />;
    case 'Play': return <Play className="h-4 w-4" />;
    case 'Plus': return <Plus className="h-4 w-4" />;
    case 'Trash': return <Trash className="h-4 w-4" />;
    default: return null;
  }
};

// Base node component with common styling and functionality
export const BaseNode = memo(({
  id,
  data,
  selected,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
  children
}: NodeProps & {
  data: BaseNodeData & { connectionState?: ConnectionState };
  sourcePosition?: Position;
  targetPosition?: Position;
  children?: React.ReactNode;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [deleteState, setDeleteState] = useState<'normal' | 'confirm'>('normal');
  const menuRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();


  // Extract connection state from data prop
  const connectionState: ConnectionState = data.connectionState || {
    connectionStartNode: null,
    connectionStartHandle: null,
    connectionStartType: null
  };
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle node cloning
  const handleClone = () => {
    const currentNode = reactFlowInstance.getNode(id);
    if (currentNode) {
      const newNode = {
        ...currentNode,
        id: `${currentNode.type}-${Date.now()}`,
        position: {
          x: currentNode.position.x + 50,
          y: currentNode.position.y + 50
        }
      };
      reactFlowInstance.addNodes(newNode);
    }
    setShowMenu(false);
  };

  // Handle node settings
  const handleSettings = () => {
    alert('Settings dialog would appear here');
    setShowMenu(false);
  };

  // Handle node deletion
  const handleDelete = () => {
    reactFlowInstance.deleteElements({ nodes: [{ id }] });
  };

  // Handle play button
  const handlePlay = () => {
    console.log(`Running node ${id}`);
    // Stub for play functionality
  };

  // Handle adding a new connected node
  const handleAddNode = (nodeType: string, nodeLabel: string, nodeIcon: React.ReactNode) => {
    const currentNode = reactFlowInstance.getNode(id);
    if (currentNode) {
      // Calculate position for new node
      const newNodePosition = {
        x: currentNode.position.x,
        y: currentNode.position.y + 150
      };

      // Create new node
      const newNodeId = `${nodeType}-${Date.now()}`;
      const newNode = {
        id: newNodeId,
        type: nodeType,
        position: newNodePosition,
        data: {
          label: nodeLabel,
          icon: nodeIcon
        }
      };

      // Check if current node is already connected to another node
      const currentNodeConnections = reactFlowInstance.getEdges().filter(
        edge => edge.source === id
      );

      if (currentNodeConnections.length > 0) {
        // Get the target of the existing connection
        const existingTargetId = currentNodeConnections[0].target;
        const existingTarget = reactFlowInstance.getNode(existingTargetId);

        if (existingTarget) {
          // Position the new node between current and existing target
          newNode.position = {
            x: currentNode.position.x,
            y: (currentNode.position.y + existingTarget.position.y) / 2
          };

          // Remove existing edge
          reactFlowInstance.deleteElements({
            edges: [{ id: currentNodeConnections[0].id }]
          });

          // Add new node
          reactFlowInstance.addNodes(newNode);

          // Add edges to connect current -> new -> existing
          reactFlowInstance.addEdges([
            { id: `e-${id}-${newNodeId}`, source: id, target: newNodeId },
            { id: `e-${newNodeId}-${existingTargetId}`, source: newNodeId, target: existingTargetId }
          ]);
        }
      } else {
        // Just add the new node and connect it
        reactFlowInstance.addNodes(newNode);
        reactFlowInstance.addEdges([
          { id: `e-${id}-${newNodeId}`, source: id, target: newNodeId }
        ]);
      }

      setShowAddMenu(false);
    }
  };
  return (
    <div
      className={`rounded-md border bg-background p-3 shadow-md transition-all min-w-[180px] ${selected ? 'ring-2 ring-primary' : ''
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
        {/* Top right icons - with responsive sizing */}
        <div className="absolute top-0 right-0 flex space-x-1 scale-[0.85] origin-top-right">
          <button
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Settings"
            title="Settings"
            onClick={handleSettings}
          >
            <span className="h-3.5 w-3.5 text-gray-500">
              <Settings className="h-3.5 w-3.5" />
            </span>
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Duplicate"
            title="Duplicate"
            onClick={handleClone}
          >
            <span className="h-3.5 w-3.5 text-gray-500">
              <Copy className="h-3.5 w-3.5" />
            </span>
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="More options"
            title="More options"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span className="h-3.5 w-3.5 text-gray-500">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>

        {/* Context menu */}
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute top-6 right-0 z-10 bg-white rounded-md shadow-lg border p-2 min-w-48"
          >
            <div className="text-xs font-medium px-2 py-1 text-gray-500 mb-2 border-b pb-2">Node Options</div>
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
              onClick={handleSettings}
            >
              <span className="mr-3 h-4 w-4 text-gray-600"><Settings className="h-4 w-4" /></span>
              Settings
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
              onClick={handleClone}
            >
              <span className="mr-3 h-4 w-4 text-gray-600"><Copy className="h-4 w-4" /></span>
              Duplicate
            </button>
            <ButtonDelete onDelete={handleDelete} />
          </div>
        )}

        {/* Node label with icon - ensure icon doesn't overlap when node is small */}
        <div className="text-sm font-medium flex items-center min-h-[24px] overflow-hidden mt-1">
          {data.icon && (
            <span className="mr-2 flex-shrink-0">
              {typeof data.icon === 'string' ? getIconComponent(data.icon) : data.icon}
            </span>
          )}
          <span className="truncate">{data.label}</span>
        </div>

        {children}

        {/* Bottom icons - only shown when selected */}
        {selected && (
          <div className="flex justify-center space-x-3 mt-2 pt-2 border-t">
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Run"
              title="Run"
              onClick={handlePlay}
            >
              <span className="h-3.5 w-3.5 text-gray-500">
                <Play className="h-3.5 w-3.5" />
              </span>
            </button>
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Add"
              title="Add node"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              <span className="h-3.5 w-3.5 text-gray-500">
                <Plus className="h-3.5 w-3.5" />
              </span>
            </button>
            <ButtonDelete onDelete={handleDelete} />
          </div>
        )}

        {/* Add node menu */}
        {showAddMenu && (
          <div
            ref={addMenuRef}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full z-10 bg-white rounded-md shadow-lg border p-2 min-w-48"
          >
            <div className="text-xs font-medium px-2 py-1 text-gray-500 mb-2 border-b pb-2">Add Node</div>
            {availableNodeTypes.map((nodeType) => (
              <button
                key={nodeType.id}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                onClick={() => handleAddNode(nodeType.id, nodeType.label, nodeType.icon)}
              >
                <span className="mr-3 h-4 w-4 text-gray-600">
                  {nodeType.icon}
                </span>
                {nodeType.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Output handle (source) */}
      <GlowingHandle
        type="source"
        position={sourcePosition}
        isConnectable={true}
        id={id}
      // className="!h-3 !w-3 !bg-primary"
      />

      {data.inputs && data.inputs.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <div className="text-xs font-medium text-gray-500 mb-1">Inputs</div>
          {data.inputs.map((input, index) => (
            <div key={input.name} className="flex items-center justify-between py-1">
              <div className="flex items-center">
                <HandleRenderComponent
                  left={true}
                  tooltipTitle={input.type}
                  id={{
                    input_types: [input.type],
                    id: id,
                    fieldName: input.name
                  }}
                  title={input.label}
                  nodeId={id}
                  colorName={['primary']}
                  connectionState={connectionState}
                />
                <span className="text-xs ml-4">{input.label}</span>
                {input.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              <span className="text-xs text-gray-400">{input.type}</span>
            </div>
          ))}
        </div>
      )}

      {/* Output handles */}
      {data.outputs && data.outputs.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <div className="text-xs font-medium text-gray-500 mb-1">Outputs</div>
          {data.outputs.map((output, index) => (
            <div key={output.name} className="flex items-center justify-between py-1">
              <span className="text-xs">{output.label}</span>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-4">{output.type}</span>
                <HandleRenderComponent
                  left={false}
                  tooltipTitle={output.type}
                  id={{
                    output_types: [output.type],
                    id: id,
                    fieldName: output.name
                  }}
                  title={output.label}
                  nodeId={id}
                  colorName={['secondary']}
                  connectionState={connectionState}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

BaseNode.displayName = 'BaseNode';