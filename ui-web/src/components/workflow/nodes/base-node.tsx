'use client';

import { memo, useState, useRef, useEffect, useMemo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { ConnectionState, NodePosition } from '../types';
import { classNames } from '@/lib-client/helpers';
import { NodeEdges } from './node-edges';
import { NodeControl } from './node-control';
import { NodeRun } from './node-run';
import { NodeMenu } from './node-menu';

// Base node properties
export type BaseNodeData = {
  label: string;
  icon?: React.ReactNode | string;
  description?: string;
  // Custom positioning for the main node handles
  sourcePosition?: Position | NodePosition;
  targetPosition?: Position | NodePosition;
  inputs?: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean;
    description?: string;
    position?: NodePosition;  // Position for this specific input
  }>;
  outputs?: Array<{
    name: string;
    type: string;
    label: string;
    description?: string;
    position?: NodePosition;  // Position for this specific output
  }>;
  // For dynamic handle positioning
  dynamicHandlePositions?: Array<{
    id: string;
    calculatedPosition: Position;
    offsetX?: number;
    offsetY?: number;
  }>;
};


export const BaseNode = memo(({
  id,
  data,
  selected,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
  isExpanded = false,
  className = '',
  children,
  nodeInfo,
  toggleExpand
}: NodeProps & { toggleExpand: any, isExpanded?: boolean, className?: string } & {
  data: BaseNodeData & { connectionState?: ConnectionState }
  sourcePosition?: Position;
  targetPosition?: Position;
  children?: React.ReactNode;
  nodeInfo: any
  className?: string;
  toggleExpand: any;
  isExpanded?: boolean;
}) => {
  const [, setShowMenu] = useState(false);
  const [, setShowAddMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  // State for node running and status
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [runTimestamp, setRunTimestamp] = useState<number | null>(null);


  // Extract connection state from data prop
  const connectionState: ConnectionState = data.connectionState || {
    connectionStartNode: null,
    connectionStartHandle: null,
    connectionStartType: null
  };

  // Calculate positions for main handles
  const calculatedSourcePosition = useMemo(() => {
    if (typeof data.sourcePosition === 'object' && data.sourcePosition !== null) {
      return data.sourcePosition;
    }
    return sourcePosition;
  }, [data.sourcePosition, sourcePosition]);

  const calculatedTargetPosition = useMemo(() => {
    if (typeof data.targetPosition === 'object' && data.targetPosition !== null) {
      return data.targetPosition;
    }
    return targetPosition;
  }, [data.targetPosition, targetPosition]);

  // Process dynamic handle positions if provided
  const processedInputs = useMemo(() => {
    if (!data.inputs) return [];

    // If dynamicHandlePositions is provided, apply them to the inputs
    if (data.dynamicHandlePositions) {
      return data.inputs.map(input => {
        const dynamicPosition = data.dynamicHandlePositions?.find(
          pos => pos.id === `${id}-${input.name}`
        );

        if (dynamicPosition) {
          return {
            ...input,
            position: {
              position: dynamicPosition.calculatedPosition,
              offsetX: dynamicPosition.offsetX,
              offsetY: dynamicPosition.offsetY
            }
          };
        }

        return input;
      });
    }

    return data.inputs;
  }, [data.inputs, data.dynamicHandlePositions, id]);

  // Process dynamic handle positions for outputs
  const processedOutputs = useMemo(() => {
    if (!data.outputs) return [];

    // If dynamicHandlePositions is provided, apply them to the outputs
    if (data.dynamicHandlePositions) {
      return data.outputs.map(output => {
        const dynamicPosition = data.dynamicHandlePositions?.find(
          pos => pos.id === `${id}-${output.name}`
        );

        if (dynamicPosition) {
          return {
            ...output,
            position: {
              position: dynamicPosition.calculatedPosition,
              offsetX: dynamicPosition.offsetX,
              offsetY: dynamicPosition.offsetY
            }
          };
        }

        return output;
      });
    }

    return data.outputs;
  }, [data.outputs, data.dynamicHandlePositions, id]);
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
  // const handleSettings = () => {
  //   alert('Settings dialog would appear here');
  //   setShowMenu(false);
  // };


  const icon = nodeInfo?.icon || data?.icon;
  const label = nodeInfo?.name || data?.label;

  return (
    <div
      className={classNames(`rounded-md border border-gray-200 bg-background shadow-md transition-all`, selected ? 'ring-2 ring-purple-700' : '', className)}
    ><div
      className={classNames(`p-3`)}
    >
        {/* Input handle (target) */}
        <Handle
          type="target"
          position={calculatedTargetPosition as Position}
          className="!h-3 !w-3 !bg-primary"
        />

        {/* Node content */}
        <div className="flex flex-col gap-2 relative">
          {/* Top right icons - with responsive sizing */}
          <div className="absolute z-10 top-0 right-0 flex items-center gap-2 origin-top-right">
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Settings"
              title="Settings"
              onClick={toggleExpand}
            >
              <span className="h-3.5 w-3.5 text-gray-500">
                <IconRenderer icon={isExpanded ? 'ChevronUp' : 'ChevronDown'} className="h-3.5 w-3.5" />
              </span>
            </button>
            {/* <button
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Settings"
              title="Settings"
              onClick={handleSettings}
            >
              <span className="h-3.5 w-3.5 text-gray-500">
                <Settings className="h-3.5 w-3.5" />
              </span>
            </button> */}
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Duplicate"
              title="Duplicate"
              onClick={handleClone}
            >
              <span className="h-3.5 w-3.5 text-gray-500">
                <IconRenderer icon='Copy' className="h-3.5 w-3.5" />
              </span>
            </button>
            {/* Status indicator */}
            <NodeRun id={id} input={data?.formData} runStatus={runStatus} nodeInfo={nodeInfo} runTimestamp={runTimestamp} setIsRunning={setIsRunning} setRunStatus={setRunStatus} />
            <NodeMenu id={id} />
          </div>


          {/* Node label with icon and status indicator */}
          <div className="text-sm font-medium flex items-center min-h-[24px] overflow-hidden mt-1">
            {icon && (
              <span className="mr-2 flex-shrink-0">
                 <IconRenderer icon={icon} />
              </span>
            )}
            <span className="truncate">{label}</span>
          </div>

          <div className={classNames(isExpanded ? 'w-[350px]' : 'w-64', 'max-h-[800px] overflow-auto')}>
            {children}
          </div>
          <NodeControl selected={selected} onRunNode={() => setRunTimestamp(Date.now())}  id={id} />
        </div>

        {/* Output handle (source) */}
        <Handle
          type="source"
          position={calculatedSourcePosition as Position}
          className="!h-3 !w-3 !bg-primary"
        />

        {/* <GlowingHandle
          type="source"
          position={calculatedSourcePosition}
          isConnectable={true}
          id={id}
        /> */}

        <NodeEdges processedInputs={processedInputs} processedOutputs={processedOutputs} id={id} connectionState={connectionState} data={data} />

        {/* Run button with loading state */}
        {isRunning && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
            <IconRenderer icon='Loader' className="h-6 w-6 text-purple-600 animate-spin" />
          </div>
        )}
      </div>
      <div className=' bg-gray-100 w-full h-4  dark:bg-gray-700 rounded-b-lg '></div>
    </div>
  );
});

BaseNode.displayName = 'BaseNode';
