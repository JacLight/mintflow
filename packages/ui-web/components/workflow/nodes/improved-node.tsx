import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { Box, Info, Zap, Settings, Copy, MoreHorizontal, Play, Plus, Trash } from 'lucide-react';
import { ButtonDelete } from '@/components/ui/button-delete';
import { cn } from '@/lib/utils';
import HandleRenderComponent, { ConnectionState } from './handle-render-component';
import { BaseNode } from './base-node';

// Base node properties
export type ImprovedNodeData = {
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
};

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
    switch (iconName) {
        case 'Box': return <Box className="h-4 w-4" />;
        case 'Info': return <Info className="h-4 w-4" />;
        case 'Zap': return <Zap className="h-4 w-4" />;
        case 'Settings': return <Settings className="h-4 w-4" />;
        case 'Copy': return <Copy className="h-4 w-4" />;
        case 'MoreHorizontal': return <MoreHorizontal className="h-4 w-4" />;
        case 'Play': return <Play className="h-4 w-4" />;
        case 'Plus': return <Plus className="h-4 w-4" />;
        case 'Trash': return <Trash className="h-4 w-4" />;
        default: return null;
    }
};

// Improved node component with better handle rendering
export const ImprovedNode = memo(({
    id,
    data,
    selected,
    children
}: NodeProps & {
    data: ImprovedNodeData & { connectionState?: ConnectionState };
    children?: React.ReactNode;
}) => {

    const [expanded, setExpanded] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const addMenuRef = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useReactFlow();
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();

    // Extract connection state from data prop
    const connectionState: ConnectionState = data.connectionState || {
        connectionStartNode: null,
        connectionStartHandle: null,
        connectionStartType: null
    };

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
            if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
                setShowAddMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle node cloning
    const handleClone = () => {
        const currentNode = reactFlowInstance.getNode(id);
        if (currentNode) {
            const newNode = {
                ...currentNode,
                id: `${currentNode.type}-${Date.now()}`,
                position: {
                    x: currentNode.position.x + 50,
                    y: currentNode.position.y + 50
                }
            };
            reactFlowInstance.addNodes(newNode);
        }
        setShowMenu(false);
    };

    // Handle node settings
    const handleSettings = () => {
        alert('Settings dialog would appear here');
        setShowMenu(false);
    };

    // Handle node deletion
    const handleDelete = () => {
        reactFlowInstance.deleteElements({ nodes: [{ id }] });
    };

    // Handle play button
    const handlePlay = () => {
        console.log(`Running node ${id}`);
        // Stub for play functionality
    };

    return (
        <BaseNode
            data={data}
        >
            <div
                className={cn(
                    "rounded-md border bg-background p-3 shadow-md transition-all min-w-[180px]",
                    selected ? "ring-2 ring-primary" : ""
                )}
            >
                {/* Node content */}
                <div className="flex flex-col gap-2 relative">
                    {/* Top right icons - with responsive sizing */}
                    <div className="absolute top-0 right-0 flex space-x-1 scale-[0.85] origin-top-right">
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Settings"
                            title="Settings"
                            onClick={handleSettings}
                        >
                            <span className="h-3.5 w-3.5 text-gray-500">
                                <Settings className="h-3.5 w-3.5" />
                            </span>
                        </button>
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Duplicate"
                            title="Duplicate"
                            onClick={handleClone}
                        >
                            <span className="h-3.5 w-3.5 text-gray-500">
                                <Copy className="h-3.5 w-3.5" />
                            </span>
                        </button>
                        <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="More options"
                            title="More options"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <span className="h-3.5 w-3.5 text-gray-500">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </span>
                        </button>
                    </div>

                    {/* Context menu */}
                    {showMenu && (
                        <div
                            ref={menuRef}
                            className="absolute top-6 right-0 z-10 bg-white rounded-md shadow-lg border p-2 min-w-48"
                        >
                            <div className="text-xs font-medium px-2 py-1 text-gray-500 mb-2 border-b pb-2">Node Options</div>
                            <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                onClick={handleSettings}
                            >
                                <span className="mr-3 h-4 w-4 text-gray-600"><Settings className="h-4 w-4" /></span>
                                Settings
                            </button>
                            <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                onClick={handleClone}
                            >
                                <span className="mr-3 h-4 w-4 text-gray-600"><Copy className="h-4 w-4" /></span>
                                Duplicate
                            </button>
                            <ButtonDelete onDelete={handleDelete} />
                        </div>
                    )}

                    {/* Node label with icon */}
                    <div className="text-sm font-medium flex items-center min-h-[24px] overflow-hidden mt-1">
                        {data.icon && (
                            <span className="mr-2 flex-shrink-0">
                                {typeof data.icon === 'string' ? getIconComponent(data.icon) : data.icon}
                            </span>
                        )}
                        <span className="truncate">{data.label}</span>
                    </div>

                    {/* Node description */}
                    {data.description && (
                        <div className="text-xs text-gray-500 mt-1">
                            {data.description}
                        </div>
                    )}

                    {children}

                    {/* Input handles */}
                    {data.inputs && data.inputs.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                            <div className="text-xs font-medium text-gray-500 mb-1">Inputs</div>
                            {data.inputs.map((input, index) => (
                                <div key={input.name} className="flex items-center justify-between py-1">
                                    <div className="flex items-center">
                                        <HandleRenderComponent
                                            left={true}
                                            nodes={nodes}
                                            tooltipTitle={input.type}
                                            id={{
                                                input_types: [input.type],
                                                id: id,
                                                fieldName: input.name
                                            }}
                                            title={input.label}
                                            edges={edges}
                                            nodeId={id}
                                            colorName={['primary']}
                                            connectionState={connectionState}
                                        />
                                        <span className="text-xs ml-4">{input.label}</span>
                                        {input.required && <span className="text-red-500 ml-1">*</span>}
                                    </div>
                                    <span className="text-xs text-gray-400">{input.type}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Output handles */}
                    {data.outputs && data.outputs.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                            <div className="text-xs font-medium text-gray-500 mb-1">Outputs</div>
                            {data.outputs.map((output, index) => (
                                <div key={output.name} className="flex items-center justify-between py-1">
                                    <span className="text-xs">{output.label}</span>
                                    <div className="flex items-center">
                                        <span className="text-xs text-gray-400 mr-4">{output.type}</span>
                                        <HandleRenderComponent
                                            left={false}
                                            nodes={nodes}
                                            tooltipTitle={output.type}
                                            id={{
                                                output_types: [output.type],
                                                id: id,
                                                fieldName: output.name
                                            }}
                                            title={output.label}
                                            edges={edges}
                                            nodeId={id}
                                            colorName={['secondary']}
                                            connectionState={connectionState}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Bottom icons - only shown when selected */}
                    {selected && (
                        <div className="flex justify-center space-x-3 mt-2 pt-2 border-t">
                            <button
                                className="p-1 hover:bg-gray-100 rounded-full"
                                aria-label="Run"
                                title="Run"
                                onClick={handlePlay}
                            >
                                <span className="h-3.5 w-3.5 text-gray-500">
                                    <Play className="h-3.5 w-3.5" />
                                </span>
                            </button>
                            <ButtonDelete onDelete={handleDelete} />
                        </div>
                    )}
                </div>
            </div>
        </BaseNode>
    );
});

ImprovedNode.displayName = 'ImprovedNode';
