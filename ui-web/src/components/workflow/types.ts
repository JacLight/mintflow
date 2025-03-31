import { HandleType, Position, Node, Edge, Connection, NodeProps, EdgeProps, NodeChange, EdgeChange, XYPosition } from '@xyflow/react';

// Custom node positioning
export type NodePosition = {
    position?: Position;  // Custom position for the node handle
    relativeElementId?: string;  // ID of element to position relative to
    relativePosition?: 'top' | 'right' | 'bottom' | 'left' | 'center';  // Position relative to element
    offsetX?: number;  // Fine-tuning offsets
    offsetY?: number;
    // Dynamic positioning
    dynamicStrategy?: 'distribute' | 'align' | 'auto';
    containerSelector?: string; // CSS selector for container to distribute within
};

// Context for connection state
export interface ConnectionState {
    connectionStartNode: string | null;
    connectionStartHandle: string | null;
    connectionStartType: string | null;
}
// Define common types for workflow components
export interface HandleData {
    id: string;
    type: HandleType;
    position?: string;
    isConnectable?: boolean;
    nodeType?: string;
    isVisible?: boolean;
    compatibleWith?: string[];
}

export interface NodeData {
    title?: string;
    handles?: HandleData[];
    className?: string;
    fields?: FieldData[];
    content?: string;
    activeTab?: number;
    tabs?: TabData[];
    showRunButton?: boolean;
}

export interface FieldData {
    type: string;
    label?: string;
    placeholder?: string;
    showGlobeIcon?: boolean;
    value?: any;
    onChange?: (value: any) => void;
    options?: Array<{ label: string; value: string }>;
    min?: number;
    max?: number;
    step?: number;
    leftLabel?: string;
    rightLabel?: string;
}

export interface TabData {
    label: string;
    content: string;
    icon?: any;
}

// Path calculation interface
export interface PathCalculationProps {
    sourceX: number;
    sourceY: number;
    sourcePosition: Position;
    targetX: number;
    targetY: number;
    targetPosition: Position;
}
