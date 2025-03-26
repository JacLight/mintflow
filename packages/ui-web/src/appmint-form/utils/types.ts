export enum DataType {
    form = 'form',
    collection = 'collection',
    post = 'post',
    // Add other data types as needed
}

export interface FileInfoSchema {
    type: string;
    format?: string;
    title?: string;
    description?: string;
}

export function FileInfoSchema(): FileInfoSchema {
    return {
        type: 'object',
        title: 'File',
        description: 'File information'
    };
}

export interface BaseModelDTO<T> {
    data: T;
    total: number;
    // Add other properties as needed
}

export interface BaseModel<T> {
    data: T;
    // Add other properties as needed
}

export const themeSettingsList = [
    { name: 'light', description: 'Light theme' },
    { name: 'dark', description: 'Dark theme' },
    { name: 'system', description: 'System theme' },
];
