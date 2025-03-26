// GenericCardRenderer.jsx
import React, { useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import { classNames } from '@ui/utils/helpers';
import { IconRenderer } from '@ui/ui/icons/icon-renderer';

export const TableCardRenderer = ({ row, selected, onSelect, slimRow }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      key={row.id}
      id={row.id}
      className={classNames(
        selected ? 'bg-cyan-100 dark:bg-cyan-900' : '',
        'p-6 border rounded-lg shadow-md cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-800 transition-colors duration-200',
        'dark:bg-gray-800 dark:border-gray-700 dark:text-white'
      )}
      onClick={() => onSelect(row)}
      role="button"
      tabIndex={0}
      onKeyPress={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(row);
        }
      }}
      aria-pressed={selected}
      aria-label={`Card for ${row.original.name || 'N/A'}`}
    >
      <div className="flex justify-between items-center mb-4">{/* Optional: Add RowHandler or other controls here */}</div>
      <div className="space-y-3">
        {row.getVisibleCells().map(cell => {
          const header = flexRender(cell.column.columnDef.header, cell.getContext());
          const value = cell.getValue(); // Get raw data

          // Handle specific cases if needed, e.g., file attachments
          const headerStr = String(header);
          if (headerStr.toLowerCase().includes('file') || headerStr.toLowerCase().includes('attachment')) {
            return (
              <div key={cell.id} className="flex">
                <div className="font-semibold w-1/3 dark:text-gray-200">{header}:</div>
                <div className="w-2/3">
                  {/* Assuming files are URLs */}
                  {isValidUrl(value) ? (
                    <div className="flex items-center">
                      <a href={value} download className="text-blue-500 dark:text-blue-400 hover:underline flex items-center">
                        Download
                        <IconRenderer icon='Download' className="ml-1" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Invalid File</span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={cell.id} className="flex">
              <div className="font-semibold w-1/3 dark:text-gray-200">{header}:</div>
              <div className="w-2/3">
                <RecursiveRenderer value={value} />
              </div>
            </div>
          );
        })}
      </div>
      {/* Expandable Section */}
      <button
        className="mt-4 text-blue-500 dark:text-blue-400 hover:underline"
        onClick={e => {
          e.stopPropagation(); // Prevent card click
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
      {isExpanded && (
        <div className="mt-2">
          {/* Render additional details here */}
          <pre className="text-sm text-gray-700 dark:text-gray-300">{JSON.stringify(row.original, null, 2)}</pre>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          onClick={e => {
            e.stopPropagation();
            // Handle Edit action
            console.log(`Edit row ${row.id}`);
          }}
          aria-label={`Edit ${row.original.name || 'N/A'}`}
        >
          <IconRenderer icon='Edit' />
        </button>
        <button
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          onClick={e => {
            e.stopPropagation();
            // Handle Delete action
            console.log(`Delete row ${row.id}`);
          }}
          aria-label={`Delete ${row.original.name || 'N/A'}`}
        >
          <IconRenderer icon='Trash' />
        </button>
      </div>
    </div>
  );
};

/**
 * RecursiveRenderer Component
 *
 * Props:
 * - value: The data to render, which can be a primitive, array, or object.
 */
const RecursiveRenderer = ({ value }) => {
  // Utility function to capitalize the first letter
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Utility function to check if a string is a valid URL
  const isValidUrl = string => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Utility function to check if a URL points to an image
  const isImageUrl = url => {
    return /\.(jpeg|jpg|gif|png|svg)$/.test(url);
  };

  // Recursive rendering based on the type of value
  if (React.isValidElement(value)) {
    // If it's a React element, render it directly
    return value;
  }

  if (value === null || value === undefined) {
    return <span className="text-gray-500 dark:text-gray-400">N/A</span>;
  }

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside">
        {value.map((item, index) => (
          <li key={index}>
            <RecursiveRenderer value={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="mb-1">
            <strong>{capitalizeFirstLetter(key)}:</strong> <RecursiveRenderer value={val} />
          </div>
        ))}
      </div>
    );
  }

  // Handle primitive types
  switch (typeof value) {
    case 'boolean':
      return value ?
        <IconRenderer icon='CircleCheck' className="text-green-500 dark:text-green-400 inline-block" /> :
        <IconRenderer icon='CircleX' className="text-red-500 dark:text-red-400 inline-block" />;
    case 'number':
      return <span className="text-right">{value}</span>;

    case 'string':
      if (isValidUrl(value)) {
        if (isImageUrl(value)) {
          return <img src={value} alt="Image" className="w-16 h-16 object-cover rounded" />;
        }
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">
            Link
          </a>
        );
      }
      return <span>{value}</span>;

    default:
      return <span>{String(value)}</span>;
  }
};

// Utility functions
const isValidUrl = string => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const isImageUrl = url => {
  return /\.(jpeg|jpg|gif|png|svg)$/.test(url);
};
