import React, { useMemo } from 'react';
import { Position } from '@xyflow/react';
import { NodePosition } from '../types';

interface GlowingHandleProps {
  type: 'source' | 'target';
  position: Position | NodePosition;
  id?: string;
  style?: React.CSSProperties;
  className?: string;
  isConnectable?: boolean;
}

// Calculate actual position for handles based on custom settings
const calculateHandlePosition = (
  handleData: Position | NodePosition,
  defaultPosition: Position
): Position => {
  if (typeof handleData === 'string') {
    return handleData as Position;
  }

  if ((handleData as NodePosition).position) {
    return (handleData as NodePosition).position as Position;
  }

  return defaultPosition;
};

const GlowingHandle: React.FC<GlowingHandleProps> = ({
  type,
  position,
  id,
  style,
  className,
  isConnectable = true,
}) => {
  // Calculate the actual position to use
  const actualPosition = useMemo(() =>
    calculateHandlePosition(position, Position.Bottom),
    [position]
  );

  // Apply custom offsets if provided
  const customStyle: React.CSSProperties = { ...style };

  if (typeof position !== 'string' && (position as NodePosition).offsetX) {
    customStyle.left = `${(position as NodePosition).offsetX}px`;
  }

  if (typeof position !== 'string' && (position as NodePosition).offsetY) {
    customStyle.top = `${(position as NodePosition).offsetY}px`;
  }

  const baseStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#1a192b',
    border: '2px solid #ddd',
    cursor: 'pointer',
    ...customStyle,
  };

  if (type === 'source') {
    baseStyle.background = '#4caf50';
  } else {
    baseStyle.background = '#ff5722';
  }

  return (
    <div
      id={id}
      className={`react-flow__handle react-flow__handle-${actualPosition} ${className || ''}`}
      style={baseStyle}
      data-type={type}
      data-isconnectable={isConnectable}
    />
  );
};

export default GlowingHandle;
