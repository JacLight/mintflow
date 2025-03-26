import React, { useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import { classNames } from '../../utils';
import { IconRenderer } from '../../common/icons/icon-renderer';

export const CardCourseRenderer = ({ row, selected, onSelect, slimRow }) => {
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
  
  // Find a number that could represent duration or lessons
  const findNumberValue = () => {
    for (const cell of cells) {
      const value = cell.getValue();
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseInt(value)))) {
        return typeof value === 'number' ? value : parseInt(value);
      }
    }
    return null;
  };
  
  // Get the first cell value as a potential title
  const getFirstCellValue = () => {
    if (cells.length > 0) {
      const value = cells[0].getValue();
      return value !== null && value !== undefined ? String(value) : 'Course';
    }
    return 'Course';
  };
  
  // Get potential image and number value
  const imageUrl = findImageUrl();
  const numberValue = findNumberValue();
  const firstValue = getFirstCellValue();
  
  // Get a random rating value based on the row id (just for visual variety)
  const getRating = () => {
    const id = parseInt(row.id) || 0;
    return (id % 5) + 1; // 1-5
  };
  
  const rating = getRating();
  
  return (
    <div
      key={row.id}
      id={row.id}
      className={classNames(
        selected ? 'ring-2 ring-orange-500 ring-offset-2' : '',
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
      aria-label={`Course card for ${firstValue || 'N/A'}`}
    >
      {/* Card Image with Overlay */}
      <div className="relative">
        {imageUrl ? (
          <div className="h-48 w-full overflow-hidden">
            <img 
              src={imageUrl} 
              alt={firstValue} 
              className="w-full h-full object-cover object-center" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-orange-400 to-pink-500 dark:from-orange-600 dark:to-pink-700"></div>
        )}
        
        {/* Course Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <IconRenderer 
                key={i} 
                icon="Star" 
                className={classNames(
                  "h-4 w-4", 
                  i < rating ? "text-yellow-400" : "text-gray-400"
                )} 
              />
            ))}
            <span className="ml-1 text-xs">{rating}.0</span>
          </div>
          <h3 className="text-lg font-medium truncate">{firstValue}</h3>
          {numberValue !== null && (
            <div className="flex items-center mt-1 text-xs text-white/80">
              <IconRenderer icon="Clock" className="h-3 w-3 mr-1" />
              <span>{numberValue} {numberValue === 1 ? 'lesson' : 'lessons'}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-5">
        {cells.length > 1 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {cells[1].getValue()}
          </p>
        )}
        
        {/* Course Features */}
        <div className="mt-4 space-y-3">
          {cells.slice(2, 5).map((cell, index) => {
            const header = flexRender(cell.column.columnDef.header, cell.getContext());
            const value = cell.getValue();
            
            // Skip empty values and already displayed fields
            if (value === null || value === undefined || value === '') return null;
            if (value === imageUrl || value === firstValue) return null;
            if (typeof value === 'number' && value === numberValue) return null;
            
            // Use different icons based on index
            const icons = ['BookOpen', 'Users', 'Award', 'Calendar', 'Tag'];
            const icon = icons[index % icons.length];
            
            return (
              <div key={cell.id} className="flex items-center">
                <IconRenderer icon={icon} className="h-4 w-4 text-orange-500 dark:text-orange-400 mr-2" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{header}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    <RecursiveRenderer value={value} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Price or CTA */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {cells.length > 5 ? cells[5].getValue() || 'Free' : 'Free'}
          </div>
          <button 
            className="inline-flex items-center rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
            onClick={(e) => {
              e.stopPropagation();
              // Handle enroll action
              console.log(`Enroll in course ${row.id}`);
            }}
          >
            Enroll Now
          </button>
        </div>
      </div>
      
      {/* Expandable Section */}
      <button
        className="w-full text-center py-2 border-t border-gray-200 dark:border-gray-700 text-sm text-orange-500 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={e => {
          e.stopPropagation(); // Prevent card click
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Additional Fields */}
          {cells.length > 6 && (
            <div className="mb-4 grid grid-cols-1 gap-3">
              {cells.slice(6).map(cell => {
                const header = flexRender(cell.column.columnDef.header, cell.getContext());
                const value = cell.getValue();
                
                // Skip empty values and already displayed fields
                if (value === null || value === undefined || value === '') return null;
                if (value === imageUrl || value === firstValue) return null;
                if (typeof value === 'number' && value === numberValue) return null;
                if (cells.slice(2, 6).some(c => c.getValue() === value)) return null;
                
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
          )}
          
          <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
            {JSON.stringify(row.original, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <IconRenderer icon="User" className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="ml-2">
            <div className="text-xs font-medium text-gray-900 dark:text-white">Instructor</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {cells.length > 6 && cells[6].getValue() ? cells[6].getValue() : 'Unknown'}
            </div>
          </div>
        </div>
        <button 
          className="inline-flex items-center text-xs text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300"
          onClick={(e) => {
            e.stopPropagation();
            // Handle preview action
            console.log(`Preview course ${row.id}`);
          }}
        >
          <IconRenderer icon="Play" className="h-3 w-3 mr-1" />
          Preview
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
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-orange-500 dark:text-orange-400 hover:underline">
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

export default CardCourseRenderer;
