const fs = require('fs');
const path = require('path');

// Function to create the missing artifact component
function createArtifactComponent() {
  const artifactDir = path.join(__dirname, 'packages', 'ui-web', 'src', 'components');
  
  // Create the components directory if it doesn't exist
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }
  
  // Create the create-artifact.tsx file
  const artifactFilePath = path.join(artifactDir, 'create-artifact.tsx');
  
  const artifactContent = `'use client';

import { ReactNode } from 'react';

export interface UIArtifact {
  documentId: string;
  content: string;
  kind: string;
  title: string;
  status: 'idle' | 'streaming' | 'complete' | 'error';
  isVisible: boolean;
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface ArtifactProps {
  content: string;
  mode?: 'edit' | 'view' | 'diff';
  status: 'idle' | 'streaming' | 'complete' | 'error';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  onSaveContent: (content: string) => void;
  getDocumentContentById: (id: number) => string;
  isLoading: boolean;
  metadata?: any;
  setMetadata?: (metadata: any) => void;
  handleVersionChange?: (direction: 'prev' | 'next') => void;
  appendMessage?: (message: { role: string; content: string }) => void;
}

export interface ArtifactConfig<K extends string, M = any> {
  kind: K;
  description: string;
  initialize?: (props: { documentId: string; setMetadata: (metadata: M) => void }) => Promise<void>;
  onStreamPart?: (props: {
    streamPart: any;
    setArtifact: (updater: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => void;
    setMetadata?: (updater: M | ((currentMetadata: M) => M)) => void;
  }) => void;
  content: (props: ArtifactProps & { metadata?: M; setMetadata?: (metadata: M) => void }) => ReactNode;
  actions?: Array<{
    icon: ReactNode;
    label?: string;
    description: string;
    onClick: (props: ArtifactProps & {
      metadata?: M;
      setMetadata?: (metadata: M) => void;
    }) => void;
    isDisabled?: (props: ArtifactProps & {
      metadata?: M;
      setMetadata?: (metadata: M) => void;
    }) => boolean;
  }>;
  toolbar?: Array<{
    icon: ReactNode;
    description: string;
    onClick: (props: {
      appendMessage: (message: { role: string; content: string }) => void;
    }) => void;
  }>;
}

export class Artifact<K extends string, M = any> {
  private config: ArtifactConfig<K, M>;

  constructor(config: ArtifactConfig<K, M>) {
    this.config = config;
  }

  getConfig(): ArtifactConfig<K, M> {
    return this.config;
  }
}

// Export the artifact definitions
export const artifactDefinitions = [];
`;
  
  fs.writeFileSync(artifactFilePath, artifactContent, 'utf8');
  console.log(`Created ${artifactFilePath}`);
}

// Function to create the missing chat components
function createChatComponents() {
  const chatDir = path.join(__dirname, 'packages', 'ui-web', 'src', 'components', 'chat');
  
  // Create the chat directory if it doesn't exist
  if (!fs.existsSync(chatDir)) {
    fs.mkdirSync(chatDir, { recursive: true });
  }
  
  // Create the code-editor.tsx file
  const codeEditorPath = path.join(chatDir, 'code-editor.tsx');
  const codeEditorContent = `'use client';

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
  const editorRef = useRef<HTMLDivElement>(null);

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
`;
  fs.writeFileSync(codeEditorPath, codeEditorContent, 'utf8');
  console.log(`Created ${codeEditorPath}`);
  
  // Create the icons.tsx file
  const iconsPath = path.join(chatDir, 'icons.tsx');
  const iconsContent = `'use client';

import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function CopyIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 4H8C7.44772 4 7 4.44772 7 5V19C7 19.5523 7.44772 20 8 20H16C16.5523 20 17 19.5523 17 19V5C17 4.44772 16.5523 4 16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 7H7M4 11H7M4 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function LogsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MessageIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PlayIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function RedoIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21 7V3H17M21 3L13 11M3 17C3 14.8783 3.84285 12.8434 5.34315 11.3431C6.84344 9.84285 8.87827 9 11 9C13.1217 9 15.1566 9.84285 16.6569 11.3431C18.1571 12.8434 19 14.8783 19 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function UndoIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 7V3H7M3 3L11 11M21 17C21 14.8783 20.1571 12.8434 18.6569 11.3431C17.1566 9.84285 15.1217 9 13 9C10.8783 9 8.84344 9.84285 7.34315 11.3431C5.84285 12.8434 5 14.8783 5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
`;
  fs.writeFileSync(iconsPath, iconsContent, 'utf8');
  console.log(`Created ${iconsPath}`);
  
  // Create the console.tsx file
  const consolePath = path.join(chatDir, 'console.tsx');
  const consoleContent = `'use client';

import { ReactNode } from 'react';

export interface ConsoleOutputContent {
  type: 'text' | 'image';
  value: string;
}

export interface ConsoleOutput {
  id: string;
  contents: ConsoleOutputContent[];
  status: 'in_progress' | 'loading_packages' | 'completed' | 'failed';
}

export interface ConsoleProps {
  consoleOutputs: ConsoleOutput[];
  setConsoleOutputs: (outputs: ConsoleOutput[]) => void;
}

export function Console({ consoleOutputs, setConsoleOutputs }: ConsoleProps) {
  if (consoleOutputs.length === 0) {
    return null;
  }

  return (
    <div className="console-container">
      <div className="console-header">
        <h3>Console Output</h3>
        <button onClick={() => setConsoleOutputs([])}>Clear</button>
      </div>
      <div className="console-output">
        {consoleOutputs.map((output) => (
          <div key={output.id} className="output-item">
            <div className="output-status">
              {output.status === 'in_progress' && 'Running...'}
              {output.status === 'loading_packages' && 'Loading packages...'}
              {output.status === 'completed' && 'Completed'}
              {output.status === 'failed' && 'Failed'}
            </div>
            <div className="output-content">
              {output.contents.map((content, index) => (
                <div key={index}>
                  {content.type === 'text' ? (
                    <pre>{content.value}</pre>
                  ) : (
                    <img src={content.value} alt="Output" style={{ maxWidth: '100%' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(consolePath, consoleContent, 'utf8');
  console.log(`Created ${consolePath}`);
  
  // Create the image-editor.tsx file
  const imageEditorPath = path.join(chatDir, 'image-editor.tsx');
  const imageEditorContent = `'use client';

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
          src={content.startsWith('data:') ? content : \`data:image/png;base64,\${content}\`} 
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
`;
  fs.writeFileSync(imageEditorPath, imageEditorContent, 'utf8');
  console.log(`Created ${imageEditorPath}`);
}

// Function to fix the artifact imports in client.tsx files
function fixArtifactImports() {
  const artifactFiles = [
    'packages/ui-web/src/artifacts/code/client.tsx',
    'packages/ui-web/src/artifacts/image/client.tsx',
    'packages/ui-web/src/artifacts/text/client.tsx',
    'packages/ui-web/src/artifacts/sheet/client.tsx'
  ];
  
  artifactFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace the import from chat/create-artifact with create-artifact
      content = content.replace(
        /import\s*\{\s*Artifact\s*\}\s*from\s*['"]@\/components\/chat\/create-artifact['"];/,
        `import { Artifact } from '@/components/create-artifact';`
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${filePath}`);
    }
  });
}

// Function to fix the hooks/use-artifact.ts file
function fixUseArtifact() {
  const filePath = 'packages/ui-web/src/hooks/use-artifact.ts';
  
  if (fs.existsSync(filePath)) {
    console.log(`Fixing ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the import from chat/artifact with create-artifact
    content = content.replace(
      /import\s*\{\s*UIArtifact\s*\}\s*from\s*['"]@\/components\/chat\/artifact['"];/,
      `import { UIArtifact } from '@/components/create-artifact';`
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  }
}

// Main function
function main() {
  createArtifactComponent();
  createChatComponents();
  fixArtifactImports();
  fixUseArtifact();
  
  console.log('Done fixing ui-web plugin');
}

main();
