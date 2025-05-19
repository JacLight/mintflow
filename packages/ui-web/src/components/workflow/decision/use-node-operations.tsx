import { useEffect, useState } from 'react';
import { Node, NODE_TYPES, INPUT_TYPES } from './types';
import { on } from 'events';
import { getRandomString, isNotEmpty } from '@jaclight/dbsdk';

const demo: Node[] = [
    {
        id: "P1",
        type: NODE_TYPES.PROMPT,
        question: "What can I help you with?",
        order: 0,
        processorLogic: "",
        options: [
            { id: 1, text: "Track a package", nextId: null, order: 0, inputType: INPUT_TYPES.FIXED },
            { id: 2, text: "Change delivery", nextId: "P2", order: 1, inputType: INPUT_TYPES.FIXED },
        ]
    },
    {
        id: "P2",
        type: NODE_TYPES.PROCESSOR,
        question: "Process delivery change request",
        order: 1,
        processorLogic: "// Process the user's input\nreturn { nextStep: 'P3' };",
        options: [
            { id: 1, text: "Process input", nextId: "P3", order: 0, inputType: INPUT_TYPES.FREE_TEXT },
        ]
    },
    {
        id: "P3",
        type: NODE_TYPES.PROMPT,
        question: "What can I help you with?",
        order: 0,
        options: [
            { id: 1, text: "Track a package", nextId: null, order: 0, inputType: INPUT_TYPES.FIXED },
            { id: 2, text: "Change delivery", nextId: "P2", order: 1, inputType: INPUT_TYPES.FIXED },
        ]
    },
    {
        id: "P4",
        type: NODE_TYPES.PROMPT,
        question: "Are you the person shipping or receiving the package?",
        order: 1,
        options: [
            { id: 1, text: "Shipping", nextId: null, order: 0, inputType: INPUT_TYPES.FIXED },
            { id: 2, text: "Receiving", nextId: null, order: 1, inputType: INPUT_TYPES.FIXED },
        ]
    }
]

export const useNodeOperations = (initialNodes: Node[] = demo, onUpdate?) => {
    const [nodes, setNodes] = useState<any[]>(initialNodes);

    useEffect(() => {
        if (onUpdate) {
            onUpdate(nodes)
        }
    }, [nodes]);

    const addNode = (type: any) => {
        const prefix = type === NODE_TYPES.PROMPT ? 'P' : 'PR';
        const newId = `${prefix}-${getRandomString(4)}`;
        const newOrder = isNotEmpty(nodes) ? Math.max(...nodes?.map(n => n.order)) + 1 : 1;

        const newNode = {
            id: newId,
            type: type,
            question: type === NODE_TYPES.PROMPT ? "New Prompt" : "New Processor",
            order: newOrder,
            options: type === NODE_TYPES.PROMPT ? [
                { id: 1, text: "Option 1", nextId: null, order: 0, inputType: INPUT_TYPES.FIXED },
                { id: 2, text: "Option 2", nextId: null, order: 1, inputType: INPUT_TYPES.FIXED },
            ] : [],
            processorLogic: type === NODE_TYPES.PROCESSOR ? "// Add your processing logic here" : undefined
        };

        setNodes([...(nodes || []), newNode]);
    };

    const updateNodeId = (oldId: string, newId: string) => {
        if (!newId.trim() || nodes.some(node => node.id === newId && node.id !== oldId)) return;

        setNodes(prevNodes => {
            return prevNodes.map(node => {
                if (node.id === oldId) {
                    return { ...node, id: newId };
                }
                return {
                    ...node,
                    options: node.options.map(opt => ({
                        ...opt,
                        nextId: opt.nextId === oldId ? newId : opt.nextId
                    }))
                };
            });
        });
    };

    const updateNodeText = (nodeId: string, text: string) => {
        setNodes(nodes.map(node =>
            node.id === nodeId ? { ...node, question: text } : node
        ));
    };

    const updateProcessorLogic = (nodeId: string, logic: string) => {
        setNodes(nodes.map(node =>
            node.id === nodeId ? { ...node, processorLogic: logic } : node
        ));
    };

    const removeNode = (nodeId: string) => {
        const newNodes = nodes.filter(node => node.id !== nodeId);
        const updatedNodes = newNodes.map((node, index) => ({
            ...node,
            order: index,
            options: node.options.map(opt => ({
                ...opt,
                nextId: opt.nextId === nodeId ? null : opt.nextId
            }))
        }));
        setNodes(updatedNodes);
    };

    return {
        nodes,
        setNodes,
        addNode,
        updateNodeId,
        updateNodeText,
        updateProcessorLogic,
        removeNode
    };
};