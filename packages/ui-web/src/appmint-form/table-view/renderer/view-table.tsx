import React from 'react';
import { ColumnHead } from '../column-head';
import { RowHandler } from '../row-handler';
import { flexRender } from '@tanstack/react-table';
import { TableColumns } from '../table-columns';
import { ColumnFilters } from '../column-filters';
import { IndeterminateCheckbox } from '../../common/indeterminate-checkbox';
import { classNames } from '../../utils';

export const CollectionTableView = (props: { table; selectRow; selectedRows; slimRow; onRowEvent; options; onRowDataEvent; datatype }) => {
  const { table, selectedRows, slimRow, selectRow } = props;

  return (
    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead className="sticky top-0 z-10 bg-white dark:bg-gray-800 w-full">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 flex gap-2 items-center">
                <IndeterminateCheckbox
                  {...{
                    checked: table.getIsAllPageRowsSelected(),
                    indeterminate: table.getIsSomePageRowsSelected(),
                    onChange: table.getToggleAllPageRowsSelectedHandler(),
                    className: 'w-4 h-4 mb-[5px] dark:bg-gray-700 dark:border-gray-400',
                  }}
                />
                <TableColumns table={table} />
                <ColumnFilters table={table} />
              </th>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-1 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <ColumnHead header={header} />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {table?.getRowModel().rows.map(row => {
            return (
              <tr
                key={row.id}
                id={row.id}
                className={classNames(
                  (selectedRows.includes(row.id) || row.getIsSelected()) && 'bg-cyan-100 dark:bg-cyan-900',
                  'cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-800'
                )}
                onClick={selectRow}
              >
                <td className={classNames(slimRow ? 'py-1' : 'py-2', 'relative whitespace-nowrap pl-2 pr-4 text-right text-sm font-medium sm:pr-0')}>
                  <RowHandler row={row} onRowEvent={props.onRowEvent} options={props.options} onRowDataEvent={props.onRowDataEvent} datatype={props.datatype} />
                </td>
                {row.getVisibleCells().map(cell => {
                  const render = flexRender(cell.column.columnDef.cell, cell.getContext());
                  return (
                    <td key={cell.id} className={classNames(slimRow ? 'py-1' : 'py-2', 'px-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 truncate')}>
                      {render}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="dark:bg-gray-800">
            <td className="p-1 px-3">
              <IndeterminateCheckbox
                {...{
                  checked: table.getIsAllPageRowsSelected(),
                  indeterminate: table.getIsSomePageRowsSelected(),
                  onChange: table.getToggleAllPageRowsSelectedHandler(),
                  className: 'dark:bg-gray-700 dark:border-gray-400',
                }}
              />
            </td>
            <td colSpan={20} className="dark:text-gray-100">Page Rows ({table.getRowModel().rows.length})</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
