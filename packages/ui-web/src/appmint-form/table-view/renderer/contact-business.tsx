import React, { useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import { classNames } from '../../utils';
import { IconRenderer } from '../../common/icons/icon-renderer';

export const ContactBusinessRenderer = ({ row, selected, onSelect, slimRow }) => {
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
  
  return (
    <div
      key={row.id}
      id={row.id}
      className={classNames(
        selected ? 'bg-blue-50 border-blue-300 dark:bg-blue-900 dark:border-blue-700' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
        'border rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden'
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
      aria-label={`Contact card for ${firstValue || 'N/A'}`}
    >
      <div className="p-6">
        <div className="flex items-center space-x-4">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Contact" 
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" 
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-semibold border-2 border-gray-200 dark:border-gray-600">
              {firstValue ? firstValue.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{firstValue}</h3>
            
            {/* Display the first 2 cells after the first one */}
            {cells.length > 1 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                {cells[1].getValue()}
              </p>
            )}
            
            {cells.length > 2 && (
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 truncate">
                {cells[2].getValue()}
              </p>
            )}
          </div>
          <div className="inline-flex items-center text-sm font-semibold text-gray-900 dark:text-white">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              selected ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
            }`}>
              Business
            </span>
          </div>
        </div>
        
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {email && (
            <div className="flex items-center">
              <IconRenderer icon="Mail" className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <a href={`mailto:${email}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 truncate" onClick={(e) => e.stopPropagation()}>
                {email}
              </a>
            </div>
          )}
          
          {phone && (
            <div className="flex items-center">
              <IconRenderer icon="Phone" className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <a href={`tel:${phone}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 truncate" onClick={(e) => e.stopPropagation()}>
                {phone}
              </a>
            </div>
          )}
          
          {/* Display remaining fields in a grid */}
          <div className="mt-4 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cells.slice(3).map(cell => {
              const header = flexRender(cell.column.columnDef.header, cell.getContext());
              const value = cell.getValue();
              
              // Skip empty values and already displayed fields
              if (value === null || value === undefined || value === '') return null;
              if (value === email || value === phone || value === imageUrl || value === firstValue) return null;
              if (cells[1] && value === cells[1].getValue()) return null;
              if (cells[2] && value === cells[2].getValue()) return null;
              
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
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ID: {row.id}
          </div>
          <div className="flex space-x-2">
            {email && (
              <button 
                className="inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`mailto:${email}`, '_blank');
                }}
              >
                <IconRenderer icon="Mail" className="h-4 w-4 mr-1" />
                Email
              </button>
            )}
            {phone && (
              <button 
                className="inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${phone}`, '_blank');
                }}
              >
                <IconRenderer icon="Phone" className="h-4 w-4 mr-1" />
                Call
              </button>
            )}
          </div>
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

export default ContactBusinessRenderer;
