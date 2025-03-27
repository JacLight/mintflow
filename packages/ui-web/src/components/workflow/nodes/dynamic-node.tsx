'use client';

import { memo, useState, useCallback } from 'react';
import { NodeProps, Position, useReactFlow } from '@xyflow/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BaseNode, BaseNodeData } from './base-node';
import { AppmintForm } from 'appmint-form';
import { deepCopy, isEmpty, isNotEmpty } from '@/lib-client/helpers';

// Extended data type for dynamic nodes
export type DynamicNodeData = BaseNodeData & {
    schema?: Record<string, any>;
    formData?: Record<string, any>;
    nodeId?: string;
    nodeInfo?: any
};

// Dynamic node component with form based on schema
export const DynamicNode = memo((props: NodeProps) => {
    const { data: nodeData, id, ...rest } = props;
    const [expanded, setExpanded] = useState(false);
    const [localFormData, setLocalFormData] = useState<any>(nodeData || {});
    const reactFlowInstance = useReactFlow();

    console.log('DynamicNode', nodeData);

    // Toggle form expansion
    const toggleExpand = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setExpanded(!expanded);
    };

    // Update form data in the node data
    const updateFormData = useCallback((path: string, value: any, newFormData: Record<string, any>, files: any, error: any) => {
        setLocalFormData(newFormData);

        // Update the node data in the React Flow instance
        const node = reactFlowInstance.getNode(id);
        if (node) {
            const updatedNode = {
                ...node,
                data: {
                    ...node.data,
                    formData: newFormData
                }
            };
            reactFlowInstance.setNodes((nodes) =>
                nodes.map((n) => (n.id === id ? updatedNode : n))
            );
        }
    }, [id, reactFlowInstance]);

    let schema = deepCopy(nodeData?.nodeInfo?.inputSchema || nodeData.schema)
    cleanSchema(schema);
    schema = (isEmpty(schema.properties)) ? null : schema;
    return (
        <BaseNode
            {...rest}
            id={id}
            data={nodeData}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
            isExpanded={expanded}
            toggleExpand={toggleExpand}
        >
            <div className="flex flex-col">


                {/* Form content (expanded) */}
                {expanded && (schema) && (
                    <div className="mt-2 space-y-2 border-t pt-2">
                        <div className="text-xs text-muted-foreground">
                            <AppmintForm
                                schema={schema}
                                data={localFormData}
                                rules={[]}
                                datatype={'node-form'}
                                id={`form-${nodeData.nodeId || id || 'default'}`}
                                theme={theme}
                                onChange={updateFormData}
                            />

                            {/* <div className="mt-2 rounded bg-muted p-2">
                                <div className="text-xs font-medium mb-1">Current Form Data:</div>
                                <pre className="text-[10px] overflow-auto max-h-32">
                                    {JSON.stringify(localFormData, null, 2)}
                                </pre>
                            </div> */}
                        </div>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});


const cleanSchema = (schema: any) => {
    if (isNotEmpty(schema?.properties)) {
        Object.keys(schema?.properties).forEach((key) => {
            if (schema?.properties[key]?.type === 'object') {
                if (!Object.keys(schema?.properties[key]?.properties).length) {
                    delete schema?.properties[key];
                } else {
                    cleanSchema(schema?.properties[key]);
                }
            }
        });
    }
    if (isNotEmpty(schema?.items?.properties)) {
        Object.keys(schema?.items?.properties).forEach((key) => {
            if (schema?.items?.properties[key]?.type === 'object') {
                if (!Object.keys(schema?.items?.properties[key]?.properties).length) {
                    delete schema?.items?.properties[key];
                } else {
                    cleanSchema(schema?.items?.properties[key]);
                }
            }
        });
    }
}

DynamicNode.displayName = 'DynamicNode';


const theme = {
    // Layout components
    'appmint-form': {
        root: 'relative dark:bg-gray-900 bg-white/80',
        container: 'relative my-2',
        title: 'block text-sm font-medium text-gray-700 mb-1',
        description: 'mt-1 text-xs text-gray-500',
        error: 'mt-1 text-xs text-red-500',
    },
    tab: {
        container: 'w-full border-b border-gray-200 dark:border-gray-700',
        button: 'text-sm flex gap-2 items-center whitespace-nowrap border-b hover:border-b-blue-400 dark:hover:border-b-blue-300 border-b-gray-200 dark:border-b-gray-700 p-1 text-gray-600 dark:text-gray-300',
        buttonActive: 'border-b-orange-400 dark:border-b-orange-300 text-gray-800 dark:text-gray-100',
        content: 'p-4 dark:bg-gray-800',
    },
    accordion: {
        container: 'w-full',
        header: 'px-4 py-2 mb-px items-center border border-gray-100 dark:border-gray-700 flex justify-between bg-white dark:bg-gray-800 gap-4 text-xs shadow cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900',
        headerActive: 'bg-cyan-100 dark:bg-cyan-800',
        content: 'p-4 dark:bg-gray-800',
    },
    slider: {
        container: 'w-full',
        content: 'dark:bg-gray-800',
        button: 'h-5 w-5 flex items-center justify-center border-cyan-400 dark:border-cyan-600 border rounded p-0 hover:bg-cyan-300 dark:hover:bg-cyan-700',
        buttonActive: 'bg-yellow-200 dark:bg-yellow-700',
    },
    collapsible: {
        container: 'w-full',
        header: 'p-2 flex justify-between items-center cursor-pointer border-b-1 border-gray-300 dark:border-gray-600 gap-2 bg-gray-50 dark:bg-gray-700',
        content: 'p-2 dark:bg-gray-800',
    },
    // Common styling for all components
    common: {
        container: 'relative my-0',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        'label-inner': 'text-sm font-medium text-gray-700 dark:text-gray-300',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        helpContainer: 'ml-8',
        icon: 'h-5 w-5 text-gray-400 dark:text-gray-500',
        iconContainer: 'flex items-center justify-center',
        'input-container': 'w-full my-1', // Added 'my-1' from element-style-class.ts
    },
    // Icon and image components
    'control-icon': {
        icon: 'h-5 w-5 text-gray-400 dark:text-gray-500',
    },
    'control-image': {
        image: 'w-10 h-10 object-cover rounded dark:border-gray-700',
    },
    // Layout components
    layout: {
        container: 'w-full mx-auto my-2',
        'container-array': 'w-full mx-auto my-0',
        section: 'mb-4',
        row: 'flex flex-wrap -mx-2',
        column: 'px-2',
        divider: 'border-t border-gray-200 dark:border-gray-700 my-4',
        'control-input': 'w-full',
    },
    // Form components
    form: {
        container: 'space-y-2',
        section: 'bg-white dark:bg-gray-800  rounded-lg p-4',
        header: 'text-lg font-medium text-gray-900 dark:text-gray-100 mb-4',
        footer: 'mt-4 flex justify-end space-x-3',
        group: 'gap-3',
    },
    'form-array': {
        container: 'w-full',
        'array-item': 'relative mb-0 even:bg-gray-50  dark:even:bg-gray-600  dark:bg-gray-700 flex gap-2 items-center',
        'array-item-horizontal': 'bg-white dark:bg-gray-800 rounded-lg p-4',
    },
    'social-textarea': {
        container: 'relative my-0 w-full',
        'container-array': 'relative my-0 w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        textarea: 'block w-full p-2 dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        icon: 'h-5 w-5 text-gray-400 dark:text-gray-500',
        iconContainer: 'absolute inset-y-0 right-0 flex items-center pr-3',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
    },

    // Text input styling
    text: {
        container: 'relative my-0 w-full',
        'container-array': 'relative my-0 w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        input: 'block w-full text-sm rounded border-gray-300 dark:border-gray-600 border focus:border-indigo-500 dark:focus:border-indigo-400 px-2 py-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        icon: 'h-5 w-5 text-gray-400 dark:text-gray-500',
        iconContainer: 'absolute inset-y-0 right-0 flex items-center pr-3',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
    },
    // Number input styling
    number: {
        container: 'relative my-0 w-full',
        'container-array': 'relative my-0 w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        input: 'block w-full  text-sm rounded border-gray-300 dark:border-gray-600  border py-2 px-2 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        stepper: 'absolute inset-y-0 right-0 flex flex-col',
        stepperUp: 'flex-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
        stepperDown: 'flex-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
    },
    'number-range': {
        container: 'relative my-0  w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        maxInput: 'block w-full  text-sm  rounded border-gray-300 dark:border-gray-600  border py-2 px-2 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        minInput: 'block w-full  text-sm  rounded border-gray-300 dark:border-gray-600  border py-2 px-2 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        stepper: 'absolute inset-y-0 right-0 flex flex-col',
        stepperUp: 'flex-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
        stepperDown: 'flex-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
    },
    // Textarea styling
    textarea: {
        container: 'relative my-0  w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        textarea: 'block w-full  text-sm  rounded border-gray-300 dark:border-gray-600  focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Date range styling
    'date-range': {
        container: 'relative my-0  w-full',
        input: 'block w-full  text-sm  rounded border-gray-300 dark:border-gray-600  focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        prefix: 'flex select-none items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        suffix: 'flex select-none items-center pr-3 text-gray-500 dark:text-gray-400 sm:text-sm',
        calendar: 'bg-white dark:bg-gray-800 shadow-lg rounded p-2 mt-1',
        calendarHeader: 'flex justify-between items-center mb-2',
        calendarDay: 'w-8 h-8 flex items-center justify-center rounded-full',
        calendarDaySelected: 'bg-indigo-600 text-white',
        calendarDayInRange: 'bg-indigo-100 dark:bg-indigo-800',
        calendarDayDisabled: 'text-gray-300 dark:text-gray-600',
        calendarNavButton: 'p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700',
    },
    // Select styling
    select: {
        container: 'relative my-0  w-full',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        dropdown: 'block w-full rounded border-gray-300 dark:border-gray-600  focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        option: 'py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
        placeholder: 'text-gray-400 dark:text-gray-500',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Select single styling (from element-style-class.ts)
    selectsingle: {
        container: 'items-center justify-center ',
    },
    // Select many styling
    selectmany: {
        container: 'items-center justify-center  w-full',
    },
    // Listbox styling
    listbox: {
        container: 'relative w-full',
        button: 'relative w-full cursor-default rounded bg-white dark:bg-gray-700 pl-2 py-2 pr-8 text-left text-gray-900 dark:text-white  ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm',
        options: 'mt-1 max-h96 min-w-48 overflow-auto rounded bg-white dark:bg-gray-700 py-2 text-base shadow-lg ring-1 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none sm:text-sm',
        option: 'relative cursor-default select-none py-2 pl-3 pr-9',
        optionActive: 'bg-indigo-200',
        optionInactive: 'text-gray-900 dark:text-gray-100',
        icon: 'h-5 w-5 flex-shrink-0 rounded-full',
        selectedIcon: 'h-5 w-5',
        selectedIconActive: 'text-white absolute top-2 inset-y-0 right-2 flex items-center',
        selectedIconInactive: 'text-indigo-600 dark:text-indigo-400 absolute top-2 inset-y-0 right-2 flex items-center',
        label: 'ml-3 block truncate',
        labelSelected: 'font-semibold',
        labelUnselected: 'font-normal',
        placeholder: 'block truncate text-gray-400 dark:text-gray-500',
        chevron: 'h-5 w-5 text-gray-400 dark:text-gray-500',
    },
    // Checkbox styling
    checkbox: {
        container: 'relative flex items-start my-0',
        input: 'h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700',
        label: 'ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Radio styling
    radio: {
        container: 'relative my-0',
        group: 'space-y-2',
        option: 'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
        optionSelected: 'bg-indigo-50 dark:bg-indigo-900 border-indigo-200 dark:border-indigo-700',
        optionUnselected: 'border-gray-200 dark:border-gray-700',
        input: 'h-4 w-4 border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700',
        label: 'ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300',
        labelSelected: 'text-indigo-900 dark:text-indigo-100 font-semibold',
        labelUnselected: 'text-gray-900 dark:text-gray-100',
        icon: 'h-5 w-5 flex-shrink-0 rounded-full',
        checkmark: 'h-5 w-5 text-indigo-600 dark:text-indigo-400',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400 ml-7',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Switch styling
    switch: {
        container: 'relative flex items-center my-0',
        track: 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:ring-offset-2',
        trackOn: 'bg-indigo-600 dark:bg-indigo-500',
        trackOff: 'bg-gray-200 dark:bg-gray-600',
        thumb: 'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out',
        thumbOn: 'translate-x-5',
        thumbOff: 'translate-x-0',
        icon: 'h-3 w-3',
        iconOn: 'text-indigo-600 dark:text-indigo-400',
        iconOff: 'text-gray-400 dark:text-gray-500',
        label: 'ml-3 text-sm font-medium text-gray-700 dark:text-gray-300',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Array styling
    array: {
        container: 'relative my-0 space-y-2',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        item: 'relative border border-gray-200 dark:border-gray-700 rounded p-3 dark:bg-gray-800',
        addButton: 'mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded  text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400',
        removeButton: 'absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Color picker styling
    color: {
        container: 'relative my-0',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        input: 'block w-full rounded border-gray-300 dark:border-gray-600  focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        preview: 'w-8 h-8 rounded border border-gray-300 dark:border-gray-600 overflow-hidden',
        palette: 'grid grid-cols-8 gap-1 p-2 dark:bg-gray-800',
        paletteItem: 'w-6 h-6 rounded cursor-pointer',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Button styling (added flex from element-style-class.ts)
    button: {
        container: 'relative my-0 flex',
        button: 'block w-full rounded border-gray-300 dark:border-gray-600  focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        description: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
        error: 'mt-1 text-xs text-red-500 dark:text-red-400',
    },
    // Map styling (from element-style-class.ts)
    map: {
        container: 'h-96 w-full dark:bg-gray-800 dark:text-gray-200',
    },
    // Data gallery view styling
    'data-gallery-view': {
        container: 'h-full w-full relative',
        tabs: 'flex gap-1 w-full bg-gray-100 dark:bg-gray-700 px-3',
        tab: 'text-sm px-6 py-2 bg-gray-50 dark:bg-gray-600 dark:text-gray-200',
        tabActive: 'bg-cyan-100 dark:bg-cyan-800',
        header: 'bg-purple-700 h-full text-white px-2 py-1',
        content: 'h-[calc(100%-100px)] w-full mt-4 dark:bg-gray-800',
        footer: 'flex items-center gap-4 justify-between absolute bottom-1 w-full px-5 bg-white dark:bg-gray-800 py-2',
        button: 'text-sm hover:bg-cyan-100 dark:hover:bg-cyan-900 pl-2 pr-3 py-1 rounded-full flex items-center gap-2 border border-gray-200 dark:border-gray-700 dark:text-gray-200',
        icon: 'w-5 h-5 rounded-full shadow bg-white dark:bg-gray-700 p-1',
    },
};