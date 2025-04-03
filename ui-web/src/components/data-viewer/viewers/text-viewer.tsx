'use client';

import React from 'react';
import { extractContent } from '../utils/type-detector';

interface TextViewerProps {
  data: any;
}

const TextViewer: React.FC<TextViewerProps> = ({ data }) => {
  // Extract and format the content
  const formatContent = (content: any): string => {
    if (content === null || content === undefined) {
      return 'No content';
    }
    
    if (typeof content === 'string') {
      return content;
    }
    
    try {
      return JSON.stringify(content, null, 2);
    } catch (error) {
      return String(content);
    }
  };
  
  const content = extractContent(data);
  const formattedContent = formatContent(content);
  
  return (
    <div className="p-4 h-full overflow-auto">
      <pre className="whitespace-pre-wrap break-words text-sm font-mono bg-gray-50 p-4 rounded border">
        {formattedContent}
      </pre>
    </div>
  );
};

export default TextViewer;
