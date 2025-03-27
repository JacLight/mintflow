'use client';

import { useEffect, useRef } from 'react';

export interface ImageEditorProps {
  content: string;
  onSaveContent?: (content: string) => void;
  isCurrentVersion: boolean;
  isLoading?: boolean;
  mode?: 'edit' | 'view' | 'diff';
}

export function ImageEditor({
  content,
  isLoading = false,
  mode = 'view'
}: ImageEditorProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <div className="image-editor-container">
      {content ? (
        <img 
          ref={imageRef} 
          src={content.startsWith('data:') ? content : `data:image/png;base64,${content}`} 
          alt="Generated image" 
          style={{ 
            maxWidth: '100%', 
            opacity: isLoading ? 0.5 : 1
          }}
        />
      ) : (
        <div className="empty-image">No image content</div>
      )}
    </div>
  );
}
