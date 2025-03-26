import React, { useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import { classNames } from '../../utils';
import { IconRenderer } from '../../common/icons/icon-renderer';

export const CardProjectRenderer = ({ row, selected, onSelect, slimRow }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get all cells
  const cells = row.getVisibleCells();
  
  // Find the first image URL in the data if any exists
  const findImageUrl = () => {
    for (const cell of cells) {
      const value = cell.getValue();
      if (typeof value === 'string' && isImageUrl(value)) {
        return value;
      }
    }
    return null;
  };
  
  // Find a date in the data if any exists
  const findDate = () => {
    for (const cell of cells) {
      const value = cell.getValue();
      if (typeof value === 'string' && isDateString(value)) {
        return value;
      }
    }
    return null;
  };
  
  // Get the first cell value as a potential title
  const getFirstCellValue = () => {
    if (cells.length > 0) {
      const value = cells[0].getValue();
      return value !== null && value !== undefined ? String(value) : 'Project';
    }
    return 'Project';
  };
  
  // Get potential image and date
  const imageUrl = findImageUrl();
  const dateStr = findDate();
  const firstValue = getFirstCellValue();
  
  // Get a random progress value based on the row id (just for visual variety)
  const getProgress = () => {
    const id = parseInt(row.id) || 0;
    return (id % 10) * 10; // 0, 10, 20, ..., 90
  };
  
  const progress = getProgress();
  
  // Format date if it exists
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };
  
  const formattedDate = formatDate(dateStr);
  
  return (
    <div
      key={row.id}
      id={row.id}
      className={classNames(
        selected ? 'ring-2 ring-blue-500 ring-offset-2' : '',
        'rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden bg-white dark:bg-gray-800'
      )}
      onClick={() => onSelect(row)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(row);
        }
      }}
      aria-pressed={selected}
      aria-label={`Project card for ${firstValue || 'N/A'}`}
    >
      {/* Card Image */}
      {imageUrl && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={imageUrl} 
            alt={firstValue} 
            className="w-full h-full object-cover object-center" 
          />
        </div>
      )}
      
      {/* Card Body */}
      <div className={`p-5 ${!imageUrl ? 'pt-6' : ''}`}>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate flex-1">{firstValue}</h3>
          
          {formattedDate && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
              {formattedDate}
            </span>
          )}
        </div>
        
        {cells.length > 1 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {cells[1].getValue()}
          </p>
        )}
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
          <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={classNames(
                "h-2 rounded-full",
                progress < 30 ? "bg-red-500" : 
                progress < 70 ? "bg-yellow-500" : 
                "bg-green-500"
              )} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Tags/Categories */}
        <div className="mt-4 flex flex-wrap gap-2">
          {cells.slice(2, 5).map((cell, index) => {
            const value = cell.getValue();
            if (!value) return null;
            
            // Skip if it's a URL or a date
            if (typeof value === 'string' && (isValidUrl(value) || isDateString(value))) return null;
            
            // Use different colors for tags
            const colors = ['blue', 'green', 'purple', 'indigo', 'pink'];
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];
            
            return (
              <span 
                key={cell.id}
                className={classNames(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  color === 'blue' ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
                  color === 'green' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                  color === 'purple' ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" :
                  color === 'indigo' ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" :
                  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
                )}
              >
                {String(value).length > 20 ? String(value).substring(0, 20) + '...' : String(value)}
              </span>
            );
          })}
        </div>
        
        {/* Additional Fields */}
        {cells.length > 5 && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 gap-3">
              {cells.slice(5).map(cell => {
                const header = flexRender(cell.column.columnDef.header, cell.getContext());
                const value = cell.getValue();
                
                // Skip empty values and already displayed fields
                if (value === null || value === undefined || value === '') return null;
                if (value === imageUrl || value === dateStr || value === firstValue) return null;
                if (cells[1] && value === cells[1].getValue()) return null;
                if (cells.slice(2, 5).some(c => c.getValue() === value)) return null;
                
                return (
                  <div key={cell.id} className="flex items-start">
                    <div className="font-medium text-xs text-gray-500 dark:text-gray-400 w-1/3">{header}:</div>
                    <div className="w-2/3 text-sm">
                      <RecursiveRenderer value={value} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Expandable Section */}
      <button
        className="w-full text-center py-2 border-t border-gray-200 dark:border-gray-700 text-sm text-blue-500 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={e => {
          e.stopPropagation(); // Prevent card click
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
            {JSON.stringify(row.original, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 flex justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          ID: {row.id}
        </div>
        <div className="flex space-x-2">
          <button 
            className="inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit action
              console.log(`Edit project ${row.id}`);
            }}
          >
            <IconRenderer icon="Edit" className="h-3 w-3 mr-1" />
            Edit
          </button>
          <button 
            className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-100 shadow-sm hover:bg-blue-100 dark:hover:bg-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              // Handle view action
              console.log(`View project ${row.id}`);
            }}
          >
            <IconRenderer icon="Eye" className="h-3 w-3 mr-1" />
            View
          </button>
        </div>
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
        <IconRenderer icon='CheckCircle' className="text-green-500 dark:text-green-400 inline-block" /> :
        <IconRenderer icon='XCircle' className="text-red-500 dark:text-red-400 inline-block" />;
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
  if (typeof string !== 'string') return false;
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const isImageUrl = url => {
  if (typeof url !== 'string') return false;
  return /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(url);
};

const isDateString = string => {
  if (typeof string !== 'string') return false;
  // Check for common date formats
  return /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{2}\.\d{2}\.\d{4}/.test(string) && !isNaN(Date.parse(string));
};

export default CardProjectRenderer;
