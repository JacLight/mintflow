import React from 'react';
import { Position } from '@xyflow/react';

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
