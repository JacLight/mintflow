import React, { useEffect, useState } from 'react';
import { MdAdd, MdDragIndicator, MdDragHandle, MdClose, MdKeyboardArrowDown, MdCode } from 'react-icons/md';
import { INPUT_TYPES, NODE_TYPES } from './types';
import { useNodeOperations } from './use-node-operations';
import { useOptionOperations } from './use-option-operations';
import { useDragAndDrop } from './use-drag-drop';
import { QuestionNode } from './question-node';
import { EditableText } from '@/components/common/editable-tex';


const DecisionTreeBuilder = (props: { data, onUpdate }) => {
    const {
        nodes,
        setNodes,
        addNode,
        updateNodeId,
        updateNodeText,
        updateProcessorLogic,
        removeNode
    } = useNodeOperations(props.data, props.onUpdate);

    const {
        addOption,
        removeOption,
        updateOptionText,
        updateOptionInputType,
        updateOptionNextId
    } = useOptionOperations(nodes, setNodes);

    const {
        draggedItem,
        dragOverItem,
        handleDragStart,
        handleDragOver,
        handleDragEnd
    } = useDragAndDrop(nodes, setNodes);

    const [name, setName] = useState<string>('New Decision Tree');

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 h-full">
            <div className="flex justify-between items-center gap-5">
                <h2 className="text-lg font-bold whitespace-nowrap">Decision Tree Builder</h2>
                <EditableText value={name} buttonClassName={'w-fit px-2 py-1 bg-purple-100 rounded-lg text-sm cursor-pointer'} update={value => setName(value)} singleClick={true} />
            </div>
            <div className="flex justify-between items-center ">
                <div className=" text-sm font-semibold">{nodes?.length} Nodes</div>
                <div className="flex gap-2">
                    <button
                        onClick={() => addNode(NODE_TYPES.PROMPT)}
                        className="flex text-sm whitespace-nowrap items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        <MdAdd size={20} />
                        Add Prompt
                    </button>
                    <button
                        onClick={() => addNode(NODE_TYPES.PROCESSOR)}
                        className="flex  text-sm whitespace-nowrap items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <MdCode size={20} />
                        Add Processor
                    </button>
                </div>
            </div>
            <div className=' overflow-auto h-[calc(100%-200px)] '>
                {nodes
                    ?.sort((a, b) => a.order - b.order)
                    .map((node, index) => {
                        return (
                            <QuestionNode key={node.id}
                                node={node}
                                nodes={nodes}
                                isLast={index === nodes.length - 1}
                                dragOverItem={dragOverItem}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDragEnd={handleDragEnd}
                                onQuestionIdChange={updateNodeId}
                                onQuestionTextChange={updateNodeText}
                                onOptionTextChange={updateOptionText}
                                onOptionNextIdChange={updateOptionNextId}
                                onOptionInputTypeChange={updateOptionInputType}
                                onRemoveOption={removeOption}
                                onRemoveNode={removeNode}
                                onAddOption={addOption}
                            />
                        )
                    })}
            </div>

        </div>
    );
};

export default DecisionTreeBuilder;





/*

<div className="space-y-8">
                {nodes
                    .sort((a, b) => a.order - b.order)
                    .map((node, index) => (
                        <div
                            key={node.id}
                            className={`relative ${dragOverItem?.type === 'question' &&
                                dragOverItem?.nodeId === node.id ?
                                'opacity-70' : ''
                                }`}
                            draggable
                            onDragStart={() => handleDragStart('question', node.id, null, node.order)}
                            onDragOver={(e) => handleDragOver(e, 'question', node.id, null, node.order)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className={`rounded-lg shadow-md p-6 space-y-4 
              ${node.type === NODE_TYPES.PROCESSOR ? 'bg-blue-50' : 'bg-white'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="cursor-move text-gray-400">
                                            <MdDragHandle size={20} />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={node.id}
                                                    onChange={(e) => updateNodeId(node.id, e.target.value)}
                                                    className="w-24 p-2 border rounded-md text-sm font-medium text-gray-700"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={node.question}
                                                onChange={(e) => updateNodeText(node.id, e.target.value)}
                                                className="w-full p-2 border rounded-md"
                                                placeholder={node.type === NODE_TYPES.PROMPT ? "Enter prompt" : "Enter processor name"}
                                            />
                                            {node.type === NODE_TYPES.PROCESSOR && (
                                                <textarea
                                                    value={node.processorLogic}
                                                    onChange={(e) => updateProcessorLogic(node.id, e.target.value)}
                                                    placeholder="Add processing logic..."
                                                    className="w-full h-32 p-2 border rounded-md font-mono text-sm mt-2"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeNode(node.id)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                        <MdClose size={20} />
                                    </button>
                                </div>

                                {node.type === NODE_TYPES.PROMPT && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-gray-700">Options:</label>
                                            <button
                                                onClick={() => addOption(node.id)}
                                                className="text-purple-600 hover:text-purple-700"
                                            >
                                                <MdAdd size={20} />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {node.options
                                                .sort((a, b) => a.order - b.order)
                                                .map(option => (
                                                    <div
                                                        key={option.id}
                                                        className={`flex items-center gap-2 p-2 rounded-md ${dragOverItem?.type === 'option' &&
                                                            dragOverItem?.optionId === option.id ?
                                                            'bg-purple-50' : ''
                                                            }`}
                                                        draggable
                                                        onDragStart={() => handleDragStart('option', node.id, option.id, option.order)}
                                                        onDragOver={(e) => handleDragOver(e, 'option', node.id, option.id, option.order)}
                                                        onDragEnd={handleDragEnd}
                                                    >
                                                        <div className="cursor-move text-gray-400">
                                                            <MdDragIndicator size={20} />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) => updateOptionText(node.id, option.id, e.target.value)}
                                                            className="flex-1 p-2 border rounded-md"
                                                        />
                                                        <select
                                                            value={option.inputType}
                                                            onChange={(e) => updateOptionInputType(node.id, option.id, e.target.value as any)}
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
                                                            onChange={(e) => updateOptionNextId(node.id, option.id, e.target.value)}
                                                            className="p-2 border rounded-md bg-white"
                                                        >
                                                            <option value="">No connection</option>
                                                            {nodes
                                                                .filter(n => n.id !== node.id)
                                                                .map(n => (
                                                                    <option key={n.id} value={n.id}>
                                                                        {n.id}: {n.question}
                                                                    </option>
                                                                ))}
                                                        </select>
                                                        <button
                                                            onClick={() => removeOption(node.id, option.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <MdClose size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {node.type === NODE_TYPES.PROMPT && node.options.map(option => option.nextId && (
                                    <div
                                        key={`${node.id}-${option.id}`}
                                        className="mt-2 p-2 bg-purple-50 rounded-md text-sm text-purple-700"
                                    >
                                        {option.inputType === INPUT_TYPES.FIXED ? (
                                            <>Option "{option.text}" → {option.nextId}</>
                                        ) : (
                                            <>
                                                {option.inputType} input "{option.text}" → {option.nextId}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {index < nodes.length - 1 && (
                                <div className="flex justify-center my-4">
                                    <MdKeyboardArrowDown size={24} className="text-gray-400" />
                                </div>
                            )}
                        </div>
                    ))}
            </div>
*/