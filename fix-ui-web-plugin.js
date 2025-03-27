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
  fixArtifactImports();
  fixUseArtifact();
  
  console.log('Done fixing ui-web plugin');
}

main();
