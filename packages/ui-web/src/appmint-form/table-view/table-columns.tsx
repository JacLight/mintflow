import React from 'react';
import { IconRenderer } from '../common/icons/icon-renderer';
import { Popover } from '../common/popover';

export const TableColumns: React.FC<any> = ({ table }) => {
    const content = (
        // <div className="inline-block border border-gray-100 shadow rounded text-xs text-gray-600">
        <div className="inline-block dark:bg-gray-800">
            <div className="px-2 py-1 border-b border-gray-200 dark:border-gray-700">
                <label className="text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center">
                    <input
                        {...{
                            type: 'checkbox',
                            checked: table.getIsAllColumnsVisible(),
                            onChange: table.getToggleAllColumnsVisibilityHandler(),
                            className: 'text-gray-600 dark:text-gray-300 rounded-lg border border-gray-400 dark:border-gray-600 mr-2 dark:bg-gray-700',
                        }}
                    />
                    <span>Toggle All</span>
                </label>
            </div>
            {table.getAllLeafColumns().map(column => {
                return (
                    <div key={column.id} className="px-2 py-1 even:bg-slate-100 dark:even:bg-gray-700">
                        <label className="text-gray-600 dark:text-gray-300 text-xs flex items-center">
                            <input
                                {...{
                                    type: 'checkbox',
                                    className: 'text-gray-600 dark:text-gray-300 rounded-lg border border-gray-400 dark:border-gray-600 mr-2 dark:bg-gray-700',
                                    checked: column.getIsVisible(),
                                    onChange: column.getToggleVisibilityHandler(),
                                }}
                            />
                            <span>{column.id}</span>
                        </label>
                    </div>
                );
            })}
        </div>
    );

    return (
        <Popover content={content} position="context" offsetX={-20} offsetY={15}>
            <button className="dark:text-white">
                <IconRenderer icon="Columns3" />
            </button>
        </Popover>
    );
};
