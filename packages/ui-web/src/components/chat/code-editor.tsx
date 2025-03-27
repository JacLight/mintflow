'use client';

import { useEffect, useRef } from 'react';

export interface CodeEditorProps {
  content: string;
  onSaveContent?: (content: string) => void;
  isCurrentVersion: boolean;
  isLoading?: boolean;
  mode?: 'edit' | 'view' | 'diff';
}

export function CodeEditor({
  content,
  onSaveContent,
  isCurrentVersion,
  isLoading = false,
  mode = 'view'
}: CodeEditorProps) {
  const editorRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    // This is a placeholder for a real code editor
    if (editorRef.current) {
      editorRef.current.textContent = content;
    }
  }, [content]);

  return (
    <div className="code-editor-container">
      <pre 
        ref={editorRef} 
        className="code-editor" 
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
