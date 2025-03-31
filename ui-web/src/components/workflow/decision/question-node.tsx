// QuestionNode.tsx
import React from 'react';
import { Node, DragItem, INPUT_TYPES } from './types';
import { classNames } from '@/lib-client/helpers';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { EditableText } from '@/components/common/editable-tex';

interface QuestionNodeProps {
    node: Node;
    nodes: Node[];
    isLast: boolean;
    dragOverItem: DragItem | null;
    onDragStart: (type: 'node' | 'node-option', nodeId: string, optionId?: number, order?: number) => void;
    onDragOver: (e: React.DragEvent, type: 'node' | 'node-option', nodeId: string, optionId?: number, order?: number) => void;
    onDragEnd: (string) => void;
    onQuestionIdChange: (oldId: string, newId: string) => void;
    onQuestionTextChange: (nodeId: string, text: string) => void;
    onOptionTextChange: (nodeId: string, optionId: number, text: string) => void;
    onOptionInputTypeChange: (nodeId: string, optionId: number, inputType: string) => void;
    onOptionNextIdChange: (nodeId: string, optionId: number, nextId: string) => void;
    onSettingsClick: (nodeId: string, optionId: number) => void;
    onRemoveOption: (nodeId: string, optionId: number) => void;
    onRemoveNode: (nodeId: string) => void;
    onAddOption: (nodeId: string) => void;
}

const iconSize = 15

export const QuestionNode: React.FC<QuestionNodeProps> = ({
    node,
    nodes,
    isLast,
    dragOverItem,
    onDragStart,
    onDragOver,
    onDragEnd,
    onQuestionIdChange,
    onQuestionTextChange,
    onOptionTextChange,
    onOptionNextIdChange,
    onOptionInputTypeChange,
    onRemoveOption,
    onRemoveNode,
    onAddOption
}) => {
    const [isOpen, setIsOpen] = React.useState(false);


    return (
        <div
            className={classNames('relative ', dragOverItem?.type === 'node' && dragOverItem?.nodeId === node.id ? 'opacity-50' : '')}
            draggable
            onDragStart={(e) => { e.stopPropagation(); onDragStart('node', node.id, undefined, node.order) }}
            onDragOver={(e) => { e.stopPropagation(); onDragOver(e, 'node', node.id, undefined, node.order) }}
            onDragEnd={e => { e.stopPropagation(); onDragEnd('node') }}
        >
            <div className={classNames(isOpen ? 'h-10' : '', "bg-white rounded-lg shadow-md  border-gray-100 border text-sm space-y-4 duration-200 transition-all overflow-hidden")}>
                <div className='flex justify-between gap-2 items-center  px-2 py-2 group group-hover:bg-gray-100'>
                    <button onClick={() => setIsOpen(!isOpen)} className=" hover:bg-gray-100" title='Toggle Node'>
                        <IconRenderer icon={isOpen ? 'ChevronRight' : 'ChevronDown'} size={iconSize} />
                    </button>
                    <div className="cursor-move text-gray-400">
                        <IconRenderer icon='GrDrag' size={iconSize} />
                    </div>
                    <EditableText value={node.id} update={(value) => onQuestionIdChange(node.id, value)} />
                    <button title='Settings'
                        onClick={() => onRemoveNode(node.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <IconRenderer icon='FaXmark' size={iconSize} />
                    </button>
                </div>
                <div className={classNames(' p-2 ')}>
                    {/* Question Header */}
                    <div className="flex justify-between items-start mb-3">
                        <input
                            type="text"
                            value={node.question}
                            onChange={(e) => onQuestionTextChange(node.id, e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder='Prompt'
                        />
                    </div>
                    {/* Options Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">Options:</label>
                            <button title='Add Option'
                                onClick={() => onAddOption(node.id)}
                                className="text-purple-600 hover:text-purple-700"
                            >
                                <IconRenderer icon='FaPlus' size={20} />
                            </button>
                        </div>

                        {/* Options List */}
                        <div className="space-y-2">
                            {node.options
                                // .sort((a, b) => a.order - b.order)
                                .map(option => (
                                    <div
                                        key={option.id}
                                        className={classNames('flex items-center gap-2 p-2 rounded-md', dragOverItem?.type === 'node-option' && dragOverItem?.nodeId === node.id && dragOverItem?.optionId === option.id ? 'bg-purple-50' : '')}
                                        draggable
                                        onDragStart={(e) => { e.stopPropagation(); onDragStart('node-option', node.id, option.id, option.order) }}
                                        onDragOver={(e) => { e.stopPropagation(); onDragOver(e, 'node-option', node.id, option.id, option.order) }}
                                        onDragEnd={e => { e.stopPropagation(); onDragEnd('node-option') }}
                                    >
                                        <div className="cursor-move text-gray-400">
                                            <IconRenderer icon='GrDrag' size={iconSize} />
                                        </div>
                                        <input
                                            placeholder="Option text"
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => onOptionTextChange(node.id, option.id, e.target.value)}
                                            className="flex-1 p-2 border rounded-md"
                                        />
                                        <select
                                            value={option.inputType}
                                            onChange={(e) => onOptionInputTypeChange(node.id, option.id, e.target.value as any)}
                                            className="p-2 border rounded-md bg-white"
                                        >
                                            {Object.entries(INPUT_TYPES).map(([key, value]) => (
                                                <option key={value} value={value}>
                                                    {key.toLowerCase().replace(/_/g, ' ')}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={option.nextId || ""}
                                            onChange={(e) => onOptionNextIdChange(node.id, option.id, e.target.value)}
                                            className="p-2 border rounded-md bg-white"
                                        >
                                            <option value="">No connection</option>
                                            {nodes
                                                .filter(n => n.id !== node.id)
                                                .map(n => (
                                                    <option key={n.id} value={n.id}>{n.id}</option>
                                                ))
                                            }
                                        </select>
                                        <button
                                            onClick={() => onRemoveOption(node.id, option.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <IconRenderer icon='FaXmark' size={iconSize} />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Option Connections Display */}
                    {node.options.map((option: any) => option.nextId && (
                        <div
                            key={`${node.id}-${option.id}`}
                            className="mt-2 p-2 bg-purple-50 rounded-md text-sm text-purple-700"
                        >
                            {option.inputType === 'fixed' ? (
                                <>Option "{option.text}" → {option.nextId}</>
                            ) : (
                                <>
                                    {option.inputType} input "{option.text}" → {option.nextId}
                                    {option.aiFunction && (
                                        <div className="text-xs mt-1 text-gray-600">
                                            AI Function: {option.aiFunction}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {!isLast && (
                <div className="flex justify-center mt-2 mb-4">
                    <IconRenderer icon='FaChevronDown' size={20} className="text-gray-400" />
                </div>
            )}
        </div>
    );
};