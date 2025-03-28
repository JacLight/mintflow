'use client';

import React, { useState } from 'react';
import { ButtonDelete } from '@/components/ui/button-delete';
import { useReactFlow } from '@xyflow/react';
import { IconRenderer } from '@/components/ui/icon-renderer';



export const NodeMenu: React.FC<any> = (props: { id }) => {
    const [showMenu, setShowMenu] = useState(false);
    const reactFlowInstance = useReactFlow();

    // Handle node settings
    const handleSettings = () => {
        alert('Settings dialog would appear here');
        setShowMenu(false);
    };

    // Handle node deletion
    const handleDelete = () => {
        reactFlowInstance.deleteElements({ nodes: [{ id: props.id }] });
    };

    const handleClone = () => {
        const currentNode = reactFlowInstance.getNode(props.id);
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <button
                className="p-1 hover:bg-gray-100 rounded-full"
                aria-label="More options"
                title="More options"
                onClick={() => setShowMenu(!showMenu)}
            >
                <span className="h-3.5 w-3.5 text-gray-500">
                    <IconRenderer icon='MoreHorizontal' className="h-3.5 w-3.5" />
                </span>
            </button>

            {showMenu && (
                <div
                    className="absolute top-6 right-0 z-10 bg-white rounded-md shadow-lg border p-2 min-w-48"
                >
                    <div className="text-xs font-medium px-2 py-1 text-gray-500 mb-2 border-b pb-2">Node Options</div>
                    <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                        onClick={handleSettings}
                    >
                        <span className="mr-3 h-4 w-4 text-gray-600"><IconRenderer icon='Settings' className="h-4 w-4" /></span>
                        Settings
                    </button>
                    <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                        onClick={handleClone}
                    >
                        <span className="mr-3 h-4 w-4 text-gray-600"><IconRenderer icon='Copy' className="h-4 w-4" /></span>
                        Duplicate
                    </button>
                    <ButtonDelete onDelete={handleDelete} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center" />
                </div>
            )}
        </div>
    );
};
