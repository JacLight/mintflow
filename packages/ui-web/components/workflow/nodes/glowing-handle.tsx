import React from 'react';
import { Handle, HandleType, Position } from '@xyflow/react';

/**
 * Generic handle component with glow effect
 */
export const GlowingHandle = ({
    id,
    type,
    position,
    isConnectable,
    nodeType = 'default',
    style = {}
}: {
    id: string;
    type: HandleType;
    position: Position;
    isConnectable?: boolean;
    nodeType?: string;
    style?: React.CSSProperties;
}) => {
    const handleClasses = `w-3 h-3 bg-purple-500 rounded-full border-2 border-purple-300 shadow-[0_0_10px_2px_rgba(139,92,246,0.6)]`;

    return (
        <Handle
            id={id}
            type={type}
            position={position}
            isConnectable={isConnectable !== false}
            className={handleClasses}
            style={{
                ...style,
                opacity: 1,
            }}
            data-nodetype={nodeType}
        />
    );
};

export default GlowingHandle;
