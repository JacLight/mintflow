import React, { useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import { classNames } from '../../utils';
import { IconRenderer } from '../../common/icons/icon-renderer';

export const ContactProfileRenderer = ({ row, selected, onSelect, slimRow }) => {
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
  
  // Find the first email in the data if any exists
  const findEmail = () => {
    for (const cell of cells) {
      const value = cell.getValue();
      if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
        return value;
      }
    }
    return null;
  };
  
  // Find a phone number in the data if any exists
  const findPhone = () => {
    for (const cell of cells) {
      const value = cell.getValue();
      if (typeof value === 'string' && /^[+\d\s()-]{7,}$/.test(value)) {
        return value;
      }
    }
    return null;
  };
  
  // Get the first cell value as a potential name
  const getFirstCellValue = () => {
    if (cells.length > 0) {
      const value = cells[0].getValue();
      return value !== null && value !== undefined ? String(value) : 'Contact';
    }
    return 'Contact';
  };
  
  // Get potential image, email and phone
  const imageUrl = findImageUrl();
  const email = findEmail();
  const phone = findPhone();
  const firstValue = getFirstCellValue();
  
  // Get a status color based on the row index (just for visual variety)
  const getStatusColor = () => {
    const colors = ['green', 'blue', 'yellow', 'red', 'purple', 'pink', 'indigo'];
    const index = parseInt(row.id) % colors.length;
    return colors[index];
  };
  
  const statusColor = getStatusColor();
  
  return (
    <div
      key={row.id}
      id={row.id}
      className={classNames(
        selected ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
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
      aria-label={`Profile card for ${firstValue || 'N/A'}`}
    >
      {/* Card Header with Image */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800"></div>
        <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 flex justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Contact" 
              className="h-20 w-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md" 
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center text-white text-2xl font-semibold border-4 border-white dark:border-gray-800 shadow-md">
              {firstValue ? firstValue.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="pt-12 p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{firstValue}</h3>
          
          {cells.length > 1 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {cells[1].getValue()}
            </p>
          )}
          
          {/* Status Badge */}
          <div className="mt-2 flex justify-center">
            <span className={classNames(
              `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`,
              statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
              statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
              statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
              statusColor === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
              statusColor === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' :
              statusColor === 'pink' ? 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100' :
              'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100'
            )}>
              Profile
            </span>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="mt-6 space-y-3">
          {email && (
            <div className="flex items-center justify-center">
              <IconRenderer icon="Mail" className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <a href={`mailto:${email}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 truncate" onClick={(e) => e.stopPropagation()}>
                {email}
              </a>
            </div>
          )}
          
          {phone && (
            <div className="flex items-center justify-center">
              <IconRenderer icon="Phone" className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <a href={`tel:${phone}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 truncate" onClick={(e) => e.stopPropagation()}>
                {phone}
              </a>
            </div>
          )}
        </div>
        
        {/* Additional Fields */}
        {cells.length > 2 && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 gap-3">
              {cells.slice(2).map(cell => {
                const header = flexRender(cell.column.columnDef.header, cell.getContext());
                const value = cell.getValue();
                
                // Skip empty values and already displayed fields
                if (value === null || value === undefined || value === '') return null;
                if (value === email || value === phone || value === imageUrl || value === firstValue) return null;
                if (cells[1] && value === cells[1].getValue()) return null;
                
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
        className="w-full text-center py-2 border-t border-gray-200 dark:border-gray-700 text-sm text-indigo-500 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
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
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 flex justify-center space-x-3">
        {email && (
          <button 
            className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900 p-2 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`mailto:${email}`, '_blank');
            }}
            aria-label="Email"
          >
            <IconRenderer icon="Mail" className="h-5 w-5" />
          </button>
        )}
        {phone && (
          <button 
            className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900 p-2 text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${phone}`, '_blank');
            }}
            aria-label="Call"
          >
            <IconRenderer icon="Phone" className="h-5 w-5" />
          </button>
        )}
        <button 
          className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900 p-2 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800"
          onClick={(e) => {
            e.stopPropagation();
            // Handle message action
            console.log(`Message to ${firstValue}`);
          }}
          aria-label="Message"
        >
          <IconRenderer icon="MessageCircle" className="h-5 w-5" />
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
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-500 dark:text-indigo-400 hover:underline">
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

export default ContactProfileRenderer;
