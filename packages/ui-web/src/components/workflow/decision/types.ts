export enum INPUT_TYPES {
    FIXED = 'fixed',
    FREE_TEXT = 'free_text',
    NUMBER = 'number',
    DATE = 'date',
    EMAIL = 'email',
    PHONE = 'phone',
    IMAGE = 'image'
};

export enum NODE_TYPES {
    PROMPT = 'prompt',
    PROCESSOR = 'processor'
}

export interface Option {
    id: number;
    text: string;
    nextId: string | null;
    order: number;
    inputType: INPUT_TYPES;
}

export interface Node {
    id: string;
    type: NODE_TYPES;
    question: string;
    order: number;
    options: Option[];
    processorLogic?: string;
}

export const PROMPT_TYPES = {
    CHOICE: 'choice',
    PROCESSOR: 'processor'
} as const;


export interface Option {
    id: number;
    text: string;
    nextId: string | null;
    order: number;
    inputType: INPUT_TYPES;
}

export interface Node {
    id: string;
    type: NODE_TYPES;
    question: string;
    order: number;
    options: Option[];
    processorLogic?: string;
}

export interface DragItem {
    type: 'node' | 'node-option';
    nodeId: string;
    optionId?: number | null;
    order: number;
}