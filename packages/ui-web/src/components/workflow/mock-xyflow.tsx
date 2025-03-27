import React from 'react';

// Mock implementation of @xyflow/react module

export enum Position {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left'
}

export interface NodeProps {
  id: string;
  data: any;
  selected?: boolean;
}

export interface EdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: string;
  targetPosition: string;
  style?: React.CSSProperties;
  markerEnd?: string;
}

interface BezierPathParams {
  sourceX: number;
  sourceY: number;
  sourcePosition: string;
  targetX: number;
  targetY: number;
  targetPosition: string;
}

export function getBezierPath(params: BezierPathParams): [string, number, number] {
  // This is a simplified implementation that just returns a straight line path
  const { sourceX, sourceY, targetX, targetY } = params;
  const path = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;
  return [path, labelX, labelY];
}

export function useReactFlow() {
  return {
    getNodes: () => [],
    getEdges: () => [],
    getNode: (id: string) => ({ id, position: { x: 0, y: 0 }, type: 'default' }),
    addNodes: (node: any) => {},
    deleteElements: (elements: { nodes: Array<{ id: string }> }) => {},
    setEdges: (callback: (edges: any[]) => any[]) => {},
  };
}

// Mock Handle component
export const Handle: React.FC<{
  type: 'source' | 'target';
  position: Position;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ type, position, id, className, style }) => {
  return (
    <div
      className={`handle ${className || ''}`}
      style={{
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: '#555',
        borderRadius: '50%',
        ...style,
      }}
    />
  );
};
