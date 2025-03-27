import React from 'react';

interface GlowingHandleProps {
  type: 'source' | 'target';
  position: string;
  id?: string;
  style?: React.CSSProperties;
  className?: string;
  isConnectable?: boolean;
}

const GlowingHandle: React.FC<GlowingHandleProps> = ({
  type,
  position,
  id,
  style,
  className,
  isConnectable = true,
}) => {
  const baseStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#1a192b',
    border: '2px solid #ddd',
    cursor: 'pointer',
    ...style,
  };

  if (type === 'source') {
    baseStyle.background = '#4caf50';
  } else {
    baseStyle.background = '#ff5722';
  }

  return (
    <div
      id={id}
      className={`react-flow__handle react-flow__handle-${position} ${className || ''}`}
      style={baseStyle}
      data-type={type}
      data-isconnectable={isConnectable}
    />
  );
};

export default GlowingHandle;
