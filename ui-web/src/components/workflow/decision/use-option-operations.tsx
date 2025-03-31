import { Node, INPUT_TYPES, PROMPT_TYPES } from './types';

export const useOptionOperations = (nodes: Node[], setNodes: (nodes: Node[]) => void) => {
    const addOption = (nodeId: string) => {
        setNodes(nodes.map((node: any) => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    options: [...node.options, {
                        id: Math.max(...node.options.map(o => o.id)) + 1,
                        text: "New Option",
                        nextId: null,
                        order: node.options.length,
                        inputType: INPUT_TYPES.FIXED
                    }]
                };
            }
            return node;
        }));
    };

    const removeOption = (nodeId: string, optionId: number) => {
        setNodes(nodes.map(node =>
            node.id === nodeId ? {
                ...node,
                options: node.options
                    .filter(opt => opt.id !== optionId)
                    .map((opt, index) => ({ ...opt, order: index }))
            } : node
        ));
    };

    const updateOptionText = (nodeId: string, optionId: number, text: string) => {
        setNodes(nodes.map(node =>
            node.id === nodeId ? {
                ...node,
                options: node.options.map(opt =>
                    opt.id === optionId ? { ...opt, text } : opt
                )
            } : node
        ));
    };

    const updateOptionInputType = (nodeId: string, optionId: number, inputType: INPUT_TYPES) => {
        setNodes(nodes.map(node =>
            node.id === nodeId ? {
                ...node,
                options: node.options.map(opt =>
                    opt.id === optionId ? { ...opt, inputType } : opt
                )
            } : node
        ));
    };

    const updateOptionNextId = (nodeId: string, optionId: number, nextId: string) => {
        setNodes(nodes.map(node =>
            node.id === nodeId ? {
                ...node,
                options: node.options.map(opt =>
                    opt.id === optionId ? { ...opt, nextId: nextId || null } : opt
                )
            } : node
        ));
    };

    return {
        addOption,
        removeOption,
        updateOptionText,
        updateOptionInputType,
        updateOptionNextId
    };
};