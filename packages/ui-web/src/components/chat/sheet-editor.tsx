'use client';

import { useEffect, useRef } from 'react';

export interface SpreadsheetEditorProps {
  content: string;
  saveContent?: (content: string) => void;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: 'idle' | 'streaming' | 'complete' | 'error';
  isLoading?: boolean;
  mode?: 'edit' | 'view' | 'diff';
}

export function SpreadsheetEditor({
  content,
  saveContent,
  isCurrentVersion,
  currentVersionIndex,
  status,
  isLoading = false,
  mode = 'view'
}: SpreadsheetEditorProps) {
  const editorRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    // This is a placeholder for a real spreadsheet editor
    if (editorRef.current) {
      try {
        const data = JSON.parse(content);
        editorRef.current.textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        editorRef.current.textContent = content;
      }
    }
  }, [content]);

  return (
    <div className="spreadsheet-editor-container">
      <pre 
        ref={editorRef} 
        className="spreadsheet-editor" 
        style={{ 
          minHeight: '100px', 
          padding: '1rem', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          opacity: isLoading ? 0.5 : 1
        }}
      >
        {content}
      </pre>
    </div>
  );
}
