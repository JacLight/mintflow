import React from 'react';
import { flexRender } from '@tanstack/react-table';

export const TableRows: React.FC<any> = ({ rowModel }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {rowModel.rows.map(row => (
        <tr key={row.id}>
          {row.getVisibleCells().map(cell => (
            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-ellipsis">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};
