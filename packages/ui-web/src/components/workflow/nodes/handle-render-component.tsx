import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Connection, Handle, Position, useReactFlow } from '@xyflow/react';
import { isValidConnection, scapedJSONStringfy } from '@/lib/reactflowUtils';
import { ConnectionState } from '../types';
import { classNames } from '@/lib-client/helpers';

// Define the ConnectionState type
export interface ConnectionState {
  connectionStartNode: string | null;
  connectionStartHandle: string | null;
  connectionStartType: string | null;
}

interface HandleRenderComponentProps {
  left: boolean;
  nodes: any[];
  tooltipTitle: string;
  id: {
    input_types?: string[];
    output_types?: string[];
    id: string;
    fieldName: string;
  };
  title: string;
  edges: any[];
  nodeId: string;
  colorName: string[];
  connectionState: ConnectionState;
}

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
}) => {
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

  return (
    <div
      className={`handle ${left ? 'handle-left' : 'handle-right'}`}
      style={handleStyle}
      title={tooltipTitle}
      data-id={`${id.id}-${id.fieldName}`}
      data-nodeid={nodeId}
    />
  );
};

export default HandleRenderComponent;
