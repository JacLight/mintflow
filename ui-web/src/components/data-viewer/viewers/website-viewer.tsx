'use client';

import React, { useState } from 'react';
import { extractContent } from '../utils/type-detector';
import { IconRenderer } from '@/components/ui/icon-renderer';

interface WebsiteViewerProps {
  data: any;
  onError?: () => void;
}

const WebsiteViewer: React.FC<WebsiteViewerProps> = ({ data, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Extract HTML content or URL
  const extractHtmlContent = (content: any): { html: string; isUrl: boolean } => {
    if (content === null || content === undefined) {
      return { html: '', isUrl: false };
    }
    
    if (typeof content === 'string') {
      // If it's a URL, return it
      if (content.startsWith('http') || content.startsWith('https')) {
        return { html: content, isUrl: true };
      }
      
      // If it looks like HTML, return it
      if ((content.trim().startsWith('<') && content.includes('</')) ||
          (content.includes('<html') && content.includes('</html>'))) {
        return { html: content, isUrl: false };
      }
    }
    
    // If it's an object, look for common HTML properties
    if (typeof content === 'object' && content !== null) {
      if (content.url) return { html: content.url, isUrl: true };
      if (content.src) return { html: content.src, isUrl: true };
      if (content.html) return { html: content.html, isUrl: false };
      if (content.content && typeof content.content === 'string') {
        if ((content.content.trim().startsWith('<') && content.content.includes('</')) ||
            (content.content.includes('<html') && content.content.includes('</html>'))) {
          return { html: content.content, isUrl: false };
        }
      }
    }
    
    return { html: '', isUrl: false };
  };
  
  const content = extractContent(data);
  const { html, isUrl } = extractHtmlContent(content);
  
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };
  
  if (!html) {
    return (
      <div className="p-4 text-red-500">
        Unable to extract HTML content
      </div>
    );
  }
  
  // Create a data URL for HTML content
  const htmlDataUrl = isUrl ? html : `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {isUrl ? (
            <span>Website URL: {html.substring(0, 50)}{html.length > 50 ? '...' : ''}</span>
          ) : (
            <span>HTML Content ({html.length} characters)</span>
          )}
        </div>
        
        {!isUrl && (
          <button 
            onClick={() => {
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.write(html);
                newWindow.document.close();
              }
            }}
            className="px-3 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200 flex items-center"
          >
            <IconRenderer icon="ExternalLink" className="h-4 w-4 mr-1" />
            Open in New Tab
          </button>
        )}
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {/* HTML preview */}
        <div className="flex-1 border rounded overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-3 py-1 text-sm font-medium border-b flex items-center">
            <IconRenderer icon="Globe" className="h-4 w-4 mr-2" />
            Preview
          </div>
          
          <div className="flex-1 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <IconRenderer icon="Loader" className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
            
            {error ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500">
                <IconRenderer icon="AlertCircle" className="h-8 w-8 mb-2" />
                <span>Failed to load content</span>
              </div>
            ) : (
              <iframe 
                src={htmlDataUrl}
                className="w-full h-full border-0"
                onLoad={handleLoad}
                onError={handleError}
                sandbox="allow-scripts"
              />
            )}
          </div>
        </div>
        
        {/* HTML source */}
        <div className="flex-1 border rounded overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-3 py-1 text-sm font-medium border-b flex items-center">
            <IconRenderer icon="Code" className="h-4 w-4 mr-2" />
            Source
          </div>
          
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
              {html}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteViewer;
