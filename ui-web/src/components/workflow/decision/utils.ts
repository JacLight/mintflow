
import { Option } from "./types";

export const generateNewId = (nodes: Node[]): string => {
    const existingIds = nodes.map(n => n.id.replace('Q', ''));
    const maxId = Math.max(...existingIds.map(id => parseInt(id) || 0));
    return `Q${maxId + 1}`;
};

export const createNewOption = (options: Option[]): Option => {
    return {
        id: Math.max(...options.map(o => o.id)) + 1,
        text: "New Option",
        nextId: null,
        order: options.length,
        inputType: 'fixed',
        aiFunction: null
    };
};

export const createNewNode = (id: string, order: number): Node => {
    return {
        id,
        question: "New Question",
        order,
        options: [
            { id: 1, text: "Option 1", nextId: null, order: 0, inputType: 'fixed', aiFunction: null },
            { id: 2, text: "Option 2", nextId: null, order: 1, inputType: 'fixed', aiFunction: null }
        ]
    };
};
