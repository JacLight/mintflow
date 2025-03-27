'use client';

import { useEffect, useRef } from 'react';

export interface DiffViewProps {
  oldContent: string;
  newContent: string;
}

export function DiffView({ oldContent, newContent }: DiffViewProps) {
  const diffRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (diffRef.current) {
      // This is a placeholder for a real diff view
      diffRef.current.innerHTML = `
        <div class="diff-container">
          <div class="diff-old">
            <h3>Old Version</h3>
            <pre>${oldContent}</pre>
          </div>
          <div class="diff-new">
            <h3>New Version</h3>
            <pre>${newContent}</pre>
          </div>
        </div>
      `;
    }
  }, [oldContent, newContent]);

  return (
    <div 
      ref={diffRef} 
      className="diff-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}
    />
  );
}
