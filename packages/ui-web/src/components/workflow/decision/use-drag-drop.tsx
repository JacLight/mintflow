import { useState } from 'react';
import { Node, DragItem } from './types';

export const useDragAndDrop = (nodes: Node[], setNodes: (nodes: Node[]) => void) => {
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
    const [dragOverItem, setDragOverItem] = useState<DragItem | null>(null);
    const [dragType, setDragType] = useState<string | null>(null);

    const handleDragStart = (type: 'node' | 'node-option', nodeId: string, optionId: number | null = null, order: number) => {
        setDragType(type);
        setDraggedItem({ type, nodeId, optionId, order });
    };

    const handleDragOver = (e: React.DragEvent, type: 'node' | 'node-option', nodeId: string, optionId: number | null = null, order: number) => {
        e.preventDefault();
        if (dragType === type) {
            setDragOverItem({ type, nodeId, optionId, order });
        }
    };

    const handleDragEnd = (type) => {
        if (!draggedItem || !dragOverItem || draggedItem.type !== dragOverItem.type || type !== draggedItem.type) {
            resetDragState();
            return;
        }

        if (dragType === 'node') {
            setNodes(prevNodes => {
                const newNodes = [...prevNodes];
                const draggedNode = newNodes.find(n => n.id === draggedItem.nodeId);
                const dropNode = newNodes.find(n => n.id === dragOverItem.nodeId);

                if (draggedNode && dropNode) {
                    newNodes.splice(newNodes.findIndex(n => n.id === draggedItem.nodeId), 1);
                    newNodes.splice(newNodes.findIndex(n => n.id === dragOverItem.nodeId), 0, draggedNode);
                    newNodes.forEach((node, index) => {
                        node.order = index;
                    });
                }
                return newNodes;
            });
        } else {
            setNodes(prevNodes => {
                return prevNodes.map(node => {
                    if (node.id === draggedItem.nodeId) {
                        const newOptions = [...node.options];
                        const draggedOption = newOptions.find(opt => opt.id === draggedItem.optionId);
                        const dropIndex = newOptions.findIndex(opt => opt.id === dragOverItem.optionId);

                        if (draggedOption && dropIndex !== -1) {
                            newOptions.splice(newOptions.findIndex(opt => opt.id === draggedItem.optionId), 1);
                            newOptions.splice(dropIndex, 0, draggedOption);
                            newOptions.forEach((opt, index) => {
                                opt.order = index;
                            });
                        }
                        return { ...node, options: newOptions };
                    }
                    return node;
                });
            });
        }

        resetDragState();
    };

    const resetDragState = () => {
        setDraggedItem(null);
        setDragOverItem(null);
        setDragType(null);
    };

    return {
        draggedItem,
        dragOverItem,
        handleDragStart,
        handleDragOver,
        handleDragEnd
    };
};