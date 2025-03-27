import React, { useCallback, useState } from 'react';
import {
    ReactFlow,
    addEdge,
    Background,
    Controls,
    Panel,
    useNodesState,
    useEdgesState,
    useReactFlow,
    MarkerType,
    Node,
    Edge,
    Connection,
    HandleType,
    ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeData } from './types';
import { getNodeTypes, getEdgeTypes, getNodeDefaultData } from './node-registry';
import NodeConfigModal from './modals/node-config-modal';

const CustomFlow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="custom-flow-container" style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
};

export default CustomFlow;
