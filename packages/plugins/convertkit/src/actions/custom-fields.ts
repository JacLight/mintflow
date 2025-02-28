import { createClient } from '../common/index.js';

export const listFieldsAction = {
    name: 'list_fields',
    description: 'Returns a list of all custom fields',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
        },
        required: ['apiSecret'],
    },
    outputSchema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                key: { type: 'string' },
                name: { type: 'string' },
            },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
    },
    exampleOutput: [
        {
            id: '123',
            label: 'Field Label',
            key: 'field_key',
            name: 'Field Name',
        },
    ],
    execute: async (input: any) => {
        const { apiSecret } = input;
        const client = createClient(apiSecret);

        try {
            const fields = await client.fetchCustomFields();
            return fields;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list custom fields: ${error.message}`);
            }
            throw new Error('Failed to list custom fields: Unknown error');
        }
    },
};

export const createFieldAction = {
    name: 'create_field',
    description: 'Creates a new custom field',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            label: {
                type: 'string',
                description: 'Label of the custom field',
            },
        },
        required: ['apiSecret', 'label'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            key: { type: 'string' },
            name: { type: 'string' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        label: 'New Field',
    },
    exampleOutput: {
        id: '123',
        label: 'New Field',
        key: 'new_field',
        name: 'New Field',
    },
    execute: async (input: any) => {
        const { apiSecret, label } = input;
        const client = createClient(apiSecret);

        try {
            const field = await client.createField({ label });
            return field;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create custom field: ${error.message}`);
            }
            throw new Error('Failed to create custom field: Unknown error');
        }
    },
};

export const updateFieldAction = {
    name: 'update_field',
    description: 'Updates an existing custom field',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            fieldId: {
                type: 'string',
                description: 'ID of the custom field',
            },
            label: {
                type: 'string',
                description: 'New label for the custom field',
            },
        },
        required: ['apiSecret', 'fieldId', 'label'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            key: { type: 'string' },
            name: { type: 'string' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        fieldId: '123',
        label: 'Updated Field',
    },
    exampleOutput: {
        id: '123',
        label: 'Updated Field',
        key: 'updated_field',
        name: 'Updated Field',
    },
    execute: async (input: any) => {
        const { apiSecret, fieldId, label } = input;
        const client = createClient(apiSecret);

        try {
            const field = await client.updateField(fieldId, { label });
            return field;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update custom field: ${error.message}`);
            }
            throw new Error('Failed to update custom field: Unknown error');
        }
    },
};

export const deleteFieldAction = {
    name: 'delete_field',
    description: 'Deletes a custom field',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            fieldId: {
                type: 'string',
                description: 'ID of the custom field',
            },
        },
        required: ['apiSecret', 'fieldId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            key: { type: 'string' },
            name: { type: 'string' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        fieldId: '123',
    },
    exampleOutput: {
        id: '123',
        label: 'Deleted Field',
        key: 'deleted_field',
        name: 'Deleted Field',
    },
    execute: async (input: any) => {
        const { apiSecret, fieldId } = input;
        const client = createClient(apiSecret);

        try {
            const field = await client.deleteField(fieldId);
            return field;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to delete custom field: ${error.message}`);
            }
            throw new Error('Failed to delete custom field: Unknown error');
        }
    },
};
