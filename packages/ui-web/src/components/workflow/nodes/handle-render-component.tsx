import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Connection, Handle, Position, useReactFlow } from '@xyflow/react';
import { isValidConnection, scapedJSONStringfy } from '@/lib/reactflowUtils';
import { ConnectionState, NodePosition } from '../types';
import { classNames } from '@/lib-client/helpers';

interface HandleRenderComponentProps {
  left: boolean;
  nodes?: any[];
  tooltipTitle: string;
  id: {
    input_types?: string[];
    output_types?: string[];
    id: string;
    fieldName: string;
  };
  title: string;
  edges?: any[];
  nodeId: string;
  colorName: string[];
  connectionState: ConnectionState;
  position?: NodePosition;  // Add support for custom positioning
}

// Calculate actual position for handles based on custom settings
const calculateHandlePosition = (
  nodeId: string,
  handleData: NodePosition | undefined,
  defaultPosition: Position
): Position => {
  if (!handleData || typeof handleData === 'string') {
    return defaultPosition;
  }

  if (handleData.position) {
    return handleData.position;
  }

  // For future implementation: position relative to another element
  if (handleData.relativeElementId) {
    // Logic to position relative to another element
    console.log(`Positioning relative to ${handleData.relativeElementId} not yet implemented`);
  }

  return defaultPosition;
};

const HandleRenderComponent: React.FC<HandleRenderComponentProps> = ({
  left,
  nodes,
  tooltipTitle,
  id,
  title,
  edges,
  nodeId,
  colorName,
  connectionState,
  position,
}) => {
  // Calculate position based on custom settings or use default
  const handlePosition = useMemo(() =>
    calculateHandlePosition(nodeId, position, left ? Position.Left : Position.Right),
    [nodeId, position, left]
  );

  // This is a simplified implementation
  const handleStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: colorName[0] === 'primary' ? '#4caf50' : '#ff5722',
    border: '2px solid #ddd',
    cursor: 'pointer',
    position: 'relative',
  };

  // Apply custom offsets if provided
  if (position?.offsetX) {
    handleStyle.left = `${position.offsetX}px`;
  }

  if (position?.offsetY) {
    handleStyle.top = `${position.offsetY}px`;
  }

  return (
    <Handle
      type={left ? "target" : "source"}
      position={handlePosition}
      style={handleStyle}
      id={`${id.id}-${id.fieldName}`}
      data-nodeid={nodeId}
    />
  );
};

export default HandleRenderComponent;
