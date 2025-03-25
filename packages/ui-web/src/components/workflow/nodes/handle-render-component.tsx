import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Connection, Handle, Position, useReactFlow } from '@xyflow/react';
import { classNames } from '@/lib/utils';
import { isValidConnection, scapedJSONStringfy } from '@/lib/utils/reactflowUtils';
import { ConnectionState } from '../types';

// Base styles for the handle
const BASE_HANDLE_STYLES = {
    width: '32px',
    height: '32px',
    top: '50%',
    position: 'absolute' as const,
    zIndex: 30,
    background: 'transparent',
    border: 'none',
};

// Component for the handle content (the visual part of the handle)
const HandleContent = memo(function HandleContent({
    isNullHandle,
    handleColor,
    accentForegroundColorName,
    isHovered,
    openHandle,
    title,
    showNode,
    left,
    nodeId,
}: {
    isNullHandle: boolean;
    handleColor: string;
    accentForegroundColorName: string;
    isHovered: boolean;
    openHandle: boolean;
    title: string;
    showNode: boolean;
    left: boolean;
    nodeId: string;
}) {
    // Create animation effect for the handle
    useEffect(() => {
        if ((isHovered || openHandle) && !isNullHandle) {
            const styleSheet = document.createElement('style');
            styleSheet.id = `pulse-${nodeId}`;
            styleSheet.textContent = `
                @keyframes pulseNeon-${nodeId} {
                    0% {
                        box-shadow: 0 0 0 3px hsl(var(--node-ring)),
                                    0 0 2px ${handleColor},
                                    0 0 4px ${handleColor},
                                    0 0 6px ${handleColor},
                                    0 0 8px ${handleColor},
                                    0 0 10px ${handleColor},
                                    0 0 15px ${handleColor},
                                    0 0 20px ${handleColor};
                    }
                    50% {
                        box-shadow: 0 0 0 3px hsl(var(--node-ring)),
                                    0 0 4px ${handleColor},
                                    0 0 8px ${handleColor},
                                    0 0 12px ${handleColor},
                                    0 0 16px ${handleColor},
                                    0 0 20px ${handleColor},
                                    0 0 25px ${handleColor},
                                    0 0 30px ${handleColor};
                    }
                    100% {
                        box-shadow: 0 0 0 3px hsl(var(--node-ring)),
                                    0 0 2px ${handleColor},
                                    0 0 4px ${handleColor},
                                    0 0 6px ${handleColor},
                                    0 0 8px ${handleColor},
                                    0 0 10px ${handleColor},
                                    0 0 15px ${handleColor},
                                    0 0 20px ${handleColor};
                    }
                }
            `;
            document.head.appendChild(styleSheet);

            return () => {
                const existingStyle = document.getElementById(`pulse-${nodeId}`);
                if (existingStyle) {
                    existingStyle.remove();
                }
            };
        }
    }, [isHovered, openHandle, isNullHandle, nodeId, handleColor]);

    // Function to get the neon shadow effect
    const getNeonShadow = useCallback(
        (color: string, isActive: boolean) => {
            if (isNullHandle) return 'none';
            if (!isActive) return `0 0 0 3px ${color}`;
            return [
                '0 0 0 1px hsl(var(--border))',
                `0 0 2px ${color}`,
                `0 0 4px ${color}`,
                `0 0 6px ${color}`,
                `0 0 8px ${color}`,
                `0 0 10px ${color}`,
                `0 0 15px ${color}`,
                `0 0 20px ${color}`,
            ].join(', ');
        },
        [isNullHandle],
    );

    // Style for the handle content
    const contentStyle = useMemo(
        () => ({
            background: isNullHandle ? 'hsl(var(--border))' : handleColor,
            width: '10px',
            height: '10px',
            transition: 'all 0.2s',
            boxShadow: getNeonShadow(
                accentForegroundColorName,
                isHovered || openHandle,
            ),
            animation:
                (isHovered || openHandle) && !isNullHandle
                    ? `pulseNeon-${nodeId} 1.1s ease-in-out infinite`
                    : 'none',
            border: isNullHandle ? '2px solid hsl(var(--muted))' : 'none',
        }),
        [
            isNullHandle,
            handleColor,
            getNeonShadow,
            accentForegroundColorName,
            isHovered,
            openHandle,
            nodeId,
        ],
    );

    return (
        <div
            className="noflow nowheel nopan noselect pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-crosshair rounded-full"
            style={contentStyle}
        />
    );
});



// Main component for rendering handles
const HandleRenderComponent = memo(function HandleRenderComponent({
    left,
    tooltipTitle = '',
    id,
    title,
    nodeId,
    colorName = ['primary'],
    connectionState,
}: {
    left: boolean;
    tooltipTitle?: string;
    id: any;
    title: string;
    nodeId: string;
    colorName?: string[];
    connectionState?: ConnectionState;
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [openTooltip, setOpenTooltip] = useState(false);
    const { getEdges } = useReactFlow();

    // Get the current edges from the flow
    const flowEdges = getEdges();

    // Get connection state from props or use defaults
    const handleDragging = connectionState?.connectionStartNode !== undefined && connectionState?.connectionStartNode !== null;
    const connectionStartNode = connectionState?.connectionStartNode;
    const connectionStartHandle = connectionState?.connectionStartHandle;
    const connectionStartType = connectionState?.connectionStartType;

    const nodes: any = [];
    const edges: any = [];

    // Stringify the ID for the handle
    const myId = useMemo(
        () => scapedJSONStringfy(id),
        [id],
    );

    // Check if this handle is compatible with the current dragging connection
    const isCompatibleWithDragging = useMemo(() => {
        if (!handleDragging || !connectionStartNode || !connectionStartHandle) {
            return true; // Not dragging, so show all handles
        }

        // If this is the same node as the connection start, hide this handle
        if (connectionStartNode === nodeId) {
            return false;
        }

        // If this is a source handle and we're dragging from a source, or
        // if this is a target handle and we're dragging from a target,
        // then this handle is not compatible
        if ((left && connectionStartType === 'target') || (!left && connectionStartType === 'source')) {
            return false;
        }

        // Create a test connection to check compatibility
        const testConnection: Connection = connectionStartType === 'source'
            ? {
                source: connectionStartNode,
                sourceHandle: connectionStartHandle,
                target: nodeId,
                targetHandle: myId
            }
            : {
                source: nodeId,
                sourceHandle: myId,
                target: connectionStartNode,
                targetHandle: connectionStartHandle
            };

        // Only show this handle if it's compatible with the current dragging connection
        return isValidConnection(testConnection, nodes, flowEdges);
    }, [handleDragging, connectionStartNode, connectionStartHandle, connectionStartType, nodeId, myId, nodes, flowEdges, left]);

    // Determine if this handle should be visible
    const isVisible = useMemo(() => {
        // If we're dragging and this handle is not compatible, hide it
        if (handleDragging && !isCompatibleWithDragging) {
            return false;
        }
        return true;
    }, [handleDragging, isCompatibleWithDragging]);


    // Determine handle color based on type
    const handleColor = useMemo(() => {
        return colorName.length > 1
            ? 'hsl(var(--secondary-foreground))'
            : `hsl(var(--${colorName[0]}))`;
    }, [colorName]);

    // Determine accent color for the handle
    const accentForegroundColorName = useMemo(() => {
        return colorName.length > 1
            ? 'hsl(var(--input))'
            : `hsl(var(--${colorName[0]}-foreground))`;
    }, [colorName]);

    // Event handlers
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);
    const handleMouseUp = useCallback(() => setOpenTooltip(false), []);
    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => e.preventDefault(),
        [],
    );

    // Memoize the validation function
    const validateConnection = useCallback(
        (connection: any) => isValidConnection(connection, nodes, edges),
        [nodes, edges],
    );


    return (
        <div>
            <Handle
                type={left ? 'target' : 'source'}
                position={left ? Position.Left : Position.Right}
                id={myId}
                isValidConnection={(connection) =>
                    isValidConnection(connection as Connection, nodes, edges)
                }
                className={classNames(
                    `group/handle z-50 transition-all`,
                    handleDragging && isCompatibleWithDragging ? 'opacity-100' : '',
                    handleDragging && !isCompatibleWithDragging ? 'opacity-30' : ''
                )}
                style={BASE_HANDLE_STYLES}
                onMouseUp={handleMouseUp}
                onContextMenu={handleContextMenu}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <HandleContent
                    isNullHandle={false}
                    handleColor={handleColor}
                    accentForegroundColorName={accentForegroundColorName}
                    isHovered={isHovered}
                    openHandle={isHovered || (handleDragging && isCompatibleWithDragging)}
                    title={title}
                    showNode={true}
                    left={left}
                    nodeId={nodeId}
                />
            </Handle>
        </div>
    );
});

export default HandleRenderComponent;
