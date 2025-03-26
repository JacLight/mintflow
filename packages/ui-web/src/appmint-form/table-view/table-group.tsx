import React, { useState } from 'react';
import { IconButtonDelete } from '../common/icon-button-delete';
import { isEmpty } from '../utils';
import { useTheme } from '../../../../../contexts/theme-context';

export const TableGroup: React.FC<any> = props => {
    const [columns, setColumns] = useState<any>([]);

    const addToTextInput = item => {
        setColumns(Array.from(new Set([...columns, item])));
    };

    const deleteHandler = item => {
        setColumns(columns.filter(column => column !== item));
    };

    const onDrop = e => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text');
        console.log('onDrop', data);
        addToTextInput(data);
    };

    const onDragOver = e => {
        e.preventDefault();
    };

    return (
        <div
            onDragEnter={onDragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragOver}
            onDragEnd={onDragOver}
            onDrop={onDrop}
            className="shadow p-2 w-full h-10 items-center rounded-lg border border-gray-200 dark:border-gray-700 flex gap-2 flex-wrap my-4 dark:bg-gray-800"
        >
            {Array.isArray(columns) &&
                columns.map((item, i) => (
                    <div key={i} className="cursor-pointer px-2 py-[1.5px] text-sm rounded-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-2">
                        {item} <IconButtonDelete controlRef={item} deleteHandler={deleteHandler} className='dark:stroke-sky-500 stroke-sky-500' iconClass={'w-3 h-3'} />
                    </div>
                ))}
            {isEmpty(columns) && <div className="text-gray-400 dark:text-gray-500 text-xs">Drag and drop columns here to group</div>}
        </div>
    );
};
