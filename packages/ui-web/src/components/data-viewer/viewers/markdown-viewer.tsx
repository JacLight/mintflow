'use client';

import React, { useState } from 'react';
import { extractContent } from '../utils/type-detector';
import { IconRenderer } from '@/components/ui/icon-renderer';

interface MarkdownViewerProps {
  data: any;
  onError?: () => void;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ data, onError }) => {
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered');
  
  // Extract markdown content
  const extractMarkdownContent = (content: any): string => {
    if (content === null || content === undefined) {
      return '';
    }
    
    if (typeof content === 'string') {
      return content;
    }
    
    // If it's an object, look for common markdown properties
    if (typeof content === 'object' && content !== null) {
      if (content.markdown) return content.markdown;
      if (content.md) return content.md;
      if (content.text) return content.text;
      if (content.content && typeof content.content === 'string') {
        return content.content;
      }
    }
    
    try {
      return JSON.stringify(content, null, 2);
    } catch (error) {
      return String(content);
    }
  };
  
  const content = extractContent(data);
  const markdownContent = extractMarkdownContent(content);
  
  if (!markdownContent) {
    onError?.();
    return (
      <div className="p-4 text-red-500">
        Unable to extract markdown content
      </div>
    );
  }
  
  // Simple markdown renderer
  // In a real implementation, you would use a library like react-markdown
  const renderMarkdown = (markdown: string): React.ReactNode => {
    // This is a very basic implementation
    // In a real app, use a proper markdown library
    
    // Split into lines
    const lines = markdown.split('\n');
    
    return (
      <div className="prose prose-sm max-w-none">
        {lines.map((line, index) => {
          // Headers
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold mt-3 mb-2">{line.substring(4)}</h3>;
          }
          
          // Lists
          if (line.startsWith('- ')) {
            return <li key={index} className="ml-4">{line.substring(2)}</li>;
          }
          
          // Code blocks (very basic)
          if (line.startsWith('```')) {
            return <pre key={index} className="bg-gray-100 p-2 rounded my-2 font-mono text-sm">{line}</pre>;
          }
          
          // Blockquotes
          if (line.startsWith('> ')) {
            return <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-2">{line.substring(2)}</blockquote>;
          }
          
          // Regular paragraph
          return line.trim() === '' ? <br key={index} /> : <p key={index} className="my-2">{line}</p>;
        })}
      </div>
    );
  };
  
  return (
    <div className="p-4 h-full flex flex-col">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('rendered')}
            className={`px-3 py-1 rounded text-sm flex items-center ${
              viewMode === 'rendered' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <IconRenderer icon="Eye" className="h-4 w-4 mr-1" />
            Rendered
          </button>
          <button
            onClick={() => setViewMode('source')}
            className={`px-3 py-1 rounded text-sm flex items-center ${
              viewMode === 'source' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <IconRenderer icon="Code" className="h-4 w-4 mr-1" />
            Source
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          <span>Markdown ({markdownContent.length} characters)</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto border rounded p-4 bg-white">
        {viewMode === 'rendered' ? (
          renderMarkdown(markdownContent)
        ) : (
          <pre className="text-sm font-mono whitespace-pre-wrap break-words">
            {markdownContent}
          </pre>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Note: This is a basic markdown renderer. For a full-featured markdown experience, consider installing a library like react-markdown.</p>
      </div>
    </div>
  );
};

export default MarkdownViewer;
