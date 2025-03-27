import React from 'react';

export interface ImprovedNodeData {
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
  connectionState?: any;
}

export type BaseNodeData = ImprovedNodeData;

interface BaseNodeProps {
  id?: string;
  data: BaseNodeData;
  children: React.ReactNode;
  sourcePosition?: string;
  targetPosition?: string;
}

export const BaseNode: React.FC<BaseNodeProps> = ({ data, children, sourcePosition, targetPosition }) => {
  return (
    <div className="base-node">
      {children}
    </div>
  );
};
