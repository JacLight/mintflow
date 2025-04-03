'use client';

import React, { useState, ReactElement } from 'react';
import { extractContent } from '../utils/type-detector';

interface JSONViewerProps {
  data: any;
  onError?: () => void;
}

const JSONViewer: React.FC<JSONViewerProps> = ({ data, onError }) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['']));
  
  // Extract and parse the content
  const parseContent = (content: any): any => {
    if (content === null || content === undefined) {
      return null;
    }
    
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch (error) {
        onError?.();
        return null;
      }
    }
    
    return content;
  };
  
  const content = extractContent(data);
  const parsedContent = parseContent(content);
  
  if (parsedContent === null) {
    return (
      <div className="p-4 text-red-500">
        Invalid JSON data
      </div>
    );
  }
  
  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };
  
  const renderValue = (value: any, path: string, depth: number = 0): ReactElement => {
    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }
    
    if (value === undefined) {
      return <span className="text-gray-500">undefined</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-purple-600">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      const isExpanded = expandedPaths.has(path);
      
      return (
        <div>
          <span 
            className="cursor-pointer hover:bg-gray-100 px-1 rounded"
            onClick={() => togglePath(path)}
          >
            {isExpanded ? '▼' : '▶'} Array[{value.length}]
          </span>
          
          {isExpanded && (
            <div className="pl-4 border-l border-gray-300 ml-2">
              {value.map((item, index) => (
                <div key={`${path}.${index}`} className="my-1">
                  <span className="text-gray-500">{index}: </span>
                  {renderValue(item, `${path}.${index}`, depth + 1)}
                </div>
              ))}
              {value.length === 0 && <span className="text-gray-500">Empty Array</span>}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const isExpanded = expandedPaths.has(path);
      const keys = Object.keys(value);
      
      return (
        <div>
          <span 
            className="cursor-pointer hover:bg-gray-100 px-1 rounded"
            onClick={() => togglePath(path)}
          >
            {isExpanded ? '▼' : '▶'} Object{keys.length > 0 ? ` {${keys.length} keys}` : ''}
          </span>
          
          {isExpanded && (
            <div className="pl-4 border-l border-gray-300 ml-2">
              {keys.map(key => (
                <div key={`${path}.${key}`} className="my-1">
                  <span className="text-gray-800 font-medium">{key}: </span>
                  {renderValue(value[key], `${path}.${key}`, depth + 1)}
                </div>
              ))}
              {keys.length === 0 && <span className="text-gray-500">Empty Object</span>}
            </div>
          )}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };
  
  return (
    <div className="p-4 h-full overflow-auto font-mono text-sm">
      {renderValue(parsedContent, '', 0)}
    </div>
  );
};

export default JSONViewer;
