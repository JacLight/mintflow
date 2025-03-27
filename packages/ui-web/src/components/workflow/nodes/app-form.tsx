'use client';

import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { useState } from 'react';
import { BaseNode, BaseNodeData } from './base-node';
import { AppmintForm } from '@appmint/form';

// Extended data type for app view nodes
export type FormNodeData = BaseNodeData & {
    componentType?: string;
    componentProps?: Record<string, any>;
    inputSchema?: any;
    id?: string;
};

// App View node component
export const FormNode = memo((props: NodeProps) => {
    const { data, ...rest } = props;
    // Add default values for required BaseNodeData properties
    const nodeData: FormNodeData = {
        label: data?.label || 'Form Node',
        ...(data as Record<string, unknown>)
    };
    const [expanded, setExpanded] = useState(false);

    // Toggle expansion
    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    // Use the inputSchema from the node data if available, otherwise use the default schema
    const formSchema = nodeData.inputSchema || schema;

    return (
        <BaseNode
            {...rest}
            data={nodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
        >
            <div className={`flex flex-col gap-2 rounded-md border bg-purple-500/10 p-3 ${expanded ? 'w-96 h-64' : ''}`}>
                <AppmintForm
                    schema={formSchema}
                    data={{}}
                    datatype={'node-form'}
                    id={`form-${nodeData.id || 'default'}`}
                    theme='setting'
                />
            </div>
        </BaseNode>
    );
});

FormNode.displayName = 'FormNode';

const schema = {
    type: 'object',
    title: 'Form Library Components Demo',
    'x-layout': {
        main: {
            type: 'tab',
            id: 'main',
            items: [
                { id: 'text-inputs', title: 'Text Inputs' },
                { id: 'number-inputs', title: 'Number Inputs' },
                { id: 'selection-inputs', title: 'Selection Inputs' },
                { id: 'date-time-inputs', title: 'Date & Time' },
                { id: 'special-inputs', title: 'Special Inputs' },
                { id: 'layout-elements', title: 'Layout Elements' },
                { id: 'advanced-elements', title: 'Advanced Elements' }
            ]
        }
    },
    properties: {
        // Text Inputs
        textField: {
            type: 'string',
            title: 'Text Field',
            description: 'Basic text input field',
            default: 'Sample text',
            layoutGroup: 'x-layout.main.items.0'
        },
        email: {
            type: 'string',
            title: 'Email Field',
            description: 'Email input with validation',
            format: 'email',
            'x-control': 'email',
            layoutGroup: 'x-layout.main.items.0'
        },
        richtext: {
            type: 'string',
            title: 'Rich Text Editor',
            description: 'Rich text editor with formatting options',
            'x-control': 'richtext',
            default: '<p>This is a <strong>rich text</strong> editor with <em>formatting</em> options.</p>',
            layoutGroup: 'x-layout.main.items.0'
        },

        // Number Inputs
        number: {
            type: 'number',
            title: 'Number Field',
            description: 'Basic number input',
            default: 42,
            layoutGroup: 'x-layout.main.items.1'
        },
        slider: {
            type: 'number',
            title: 'Slider',
            description: 'Slider input for selecting a number',
            'x-control-variant': 'slider',
            minimum: 0,
            maximum: 100,
            default: 50,
            layoutGroup: 'x-layout.main.items.1'
        },

        // Selection Inputs
        selectSingle: {
            type: 'string',
            title: 'Select Single (Dropdown)',
            description: 'Single selection dropdown',
            enum: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            default: 'Option 1',
            layoutGroup: 'x-layout.main.items.2'
        },
        selectMany: {
            type: 'array',
            title: 'Select Many (Multi-select)',
            description: 'Multiple selection control',
            items: {
                type: 'string',
                enum: ['Option A', 'Option B', 'Option C', 'Option D', 'Option E']
            },
            default: ['Option A', 'Option C'],
            'x-control': 'selectmany',
            layoutGroup: 'x-layout.main.items.2'
        },

        // Date & Time Inputs
        date: {
            type: 'string',
            title: 'Date Picker',
            description: 'Date selection input',
            format: 'date',
            'x-control': 'date',
            default: '2025-02-26',
            layoutGroup: 'x-layout.main.items.3'
        },
        dateRange: {
            type: 'object',
            title: 'Date Range',
            description: 'Date range selection input',
            'x-control': 'daterange',
            properties: {
                start: {
                    type: 'string',
                    format: 'date',
                    title: 'Start Date',
                    default: '2025-02-20'
                },
                end: {
                    type: 'string',
                    format: 'date',
                    title: 'End Date',
                    default: '2025-03-05'
                }
            },
            layoutGroup: 'x-layout.main.items.3'
        },

        // Special Inputs
        color: {
            type: 'string',
            title: 'Color Picker',
            description: 'Color selection input',
            'x-control': 'color',
            default: '#3b82f6',
            layoutGroup: 'x-layout.main.items.4'
        },
        map: {
            type: 'object',
            title: 'Map Location',
            description: 'Map location picker',
            'x-control': 'map',
            properties: {
                lat: {
                    type: 'number',
                    title: 'Latitude',
                    default: 40.7128
                },
                lng: {
                    type: 'number',
                    title: 'Longitude',
                    default: -74.0060
                }
            },
            layoutGroup: 'x-layout.main.items.4'
        },

        // Layout Elements
        paragraph: {
            type: 'null',
            title: 'Paragraph',
            description: 'Static paragraph text element',
            'x-control': 'paragraph',
            'x-content': 'This is a static paragraph element that displays text without any input controls.',
            layoutGroup: 'x-layout.main.items.5'
        },
        notice: {
            type: 'null',
            title: 'Notice',
            description: 'Notification or alert element',
            'x-control': 'notice',
            'x-content': 'This is an important notice that stands out to the user.',
            'x-notice-type': 'info', // Can be info, warning, error, success
            layoutGroup: 'x-layout.main.items.5'
        },

        // Advanced Elements
        nestedObject: {
            type: 'object',
            title: 'Nested Object',
            description: 'Object with nested properties',
            properties: {
                name: {
                    type: 'string',
                    title: 'Name',
                    default: 'John Doe'
                },
                contact: {
                    type: 'object',
                    title: 'Contact Information',
                    properties: {
                        email: {
                            type: 'string',
                            title: 'Email',
                            format: 'email',
                            default: 'john.doe@example.com'
                        }
                    }
                }
            },
            layoutGroup: 'x-layout.main.items.6'
        }
    }
};
