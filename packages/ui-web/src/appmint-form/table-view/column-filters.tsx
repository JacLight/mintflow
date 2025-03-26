import React, { useEffect } from 'react';
import { classNames } from '../utils';
import { IconRenderer } from '../common/icons/icon-renderer';
import { buttonClass, buttonHoverClass } from '../utils/constants';
import { DebouncedInput } from '../common/debounced-input';
import { Popover } from '../common/popover';

export const ColumnFilters: React.FC<any> = ({ table }) => {
  const [filter, setFilter] = React.useState<any>({});

  useEffect(() => {
    const _filter = table.getAllLeafColumns().map(column => {
      return {
        [column.id]: column.filterValue,
      };
    });
  }, [table]);

  const clearAllFilters = () => {
    table.getAllLeafColumns().map(column => {
      column.setFilterValue('');
    });
    setFilter({});
  };

  const setColumnFilter = (column, value) => {
    column.setFilterValue(value);
    setFilter({ ...filter, [column.id]: value });
  };

  const content = (
    // <div className="inline-block border border-gray-100 shadow rounded text-xs text-gray-600">
    <div className="inline-block dark:bg-gray-800">
      <div className="px-2 py-1 mb-2">
        <button
          className={classNames(
            buttonClass,
            buttonHoverClass,
            'dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600'
          )}
          onClick={clearAllFilters}
        >
          <IconRenderer icon="X" /> <span>Clear All</span>
        </button>
      </div>
      {table.getAllLeafColumns().map(column => {
        return (
          <div key={column.id} className="px-2 py-1 even:bg-slate-100 dark:even:bg-gray-700">
            <label className="text-gray-600 dark:text-gray-300 text-xs flex items-center gap-2">
              <span className="text-ellipsis w-24 whitespace-nowrap">{column.id}:</span>
              <DebouncedInput
                className="filter-input border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1"
                onChange={value => setColumnFilter(column, value)}
                placeholder={`Search...`}
                type="text"
                value={filter[column.id] || ''}
              />
            </label>
          </div>
        );
      })}
    </div>
  );

  return (
    <Popover content={content} position="context" offsetX={-20} offsetY={15}>
      <button className="dark:text-gray-200">
        <IconRenderer icon="Filter" />
      </button>
    </Popover>
  );
};
