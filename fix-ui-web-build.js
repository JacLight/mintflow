#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Create mock files
function createMockFiles() {
  // Create mock-xyflow.ts
  const mockXyflowPath = path.join(__dirname, 'packages/ui-web/src/components/workflow/mock-xyflow.ts');
  ensureDirectoryExists(path.dirname(mockXyflowPath));
  fs.writeFileSync(
    mockXyflowPath,
    `// Mock implementation of @xyflow/react module

export enum Position {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left'
}

export interface NodeProps {
  id: string;
  data: any;
  selected?: boolean;
}

export interface EdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: string;
  targetPosition: string;
  style?: React.CSSProperties;
  markerEnd?: string;
}

interface BezierPathParams {
  sourceX: number;
  sourceY: number;
  sourcePosition: string;
  targetX: number;
  targetY: number;
  targetPosition: string;
}

export function getBezierPath(params: BezierPathParams): [string, number, number] {
  // This is a simplified implementation that just returns a straight line path
  const { sourceX, sourceY, targetX, targetY } = params;
  const path = \`M\${sourceX},\${sourceY} L\${targetX},\${targetY}\`;
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;
  return [path, labelX, labelY];
}

export function useReactFlow() {
  return {
    getNodes: () => [],
    getEdges: () => [],
    getNode: (id: string) => ({ id, position: { x: 0, y: 0 }, type: 'default' }),
    addNodes: (node: any) => {},
    deleteElements: (elements: { nodes: Array<{ id: string }> }) => {},
    setEdges: (callback: (edges: any[]) => any[]) => {},
  };
}
`
  );

  // Create mock-lucide.tsx
  const mockLucidePath = path.join(__dirname, 'packages/ui-web/src/components/workflow/mock-lucide.tsx');
  ensureDirectoryExists(path.dirname(mockLucidePath));
  fs.writeFileSync(
    mockLucidePath,
    `import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const createIcon = (path: React.ReactNode) => {
  const Icon: React.FC<IconProps> = ({ size = 24, ...props }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {path}
      </svg>
    );
  };
  return Icon;
};

export const Box = createIcon(<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />);

export const Info = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>
);

export const Zap = createIcon(
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
);

export const Settings = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>
);

export const Copy = createIcon(
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>
);

export const MoreHorizontal = createIcon(
  <>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </>
);

export const Play = createIcon(<polygon points="5 3 19 12 5 21 5 3" />);

export const Plus = createIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>
);

export const Trash = createIcon(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </>
);

export const Trash2 = createIcon(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </>
);

export const ChevronUp = createIcon(
  <polyline points="18 15 12 9 6 15" />
);

export const ChevronDown = createIcon(
  <polyline points="6 9 12 15 18 9" />
);
`
  );

  // Create icon-renderer.tsx
  const iconRendererPath = path.join(__dirname, 'packages/ui-web/src/components/ui/icon-renderer.tsx');
  ensureDirectoryExists(path.dirname(iconRendererPath));
  fs.writeFileSync(
    iconRendererPath,
    `import React from 'react';

interface IconRendererProps {
  icon: React.ReactNode | string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ icon, className = '', size = 24 }) => {
  // This is a simplified implementation
  if (React.isValidElement(icon)) {
    return <span className={className}>{icon}</span>;
  }
  
  return (
    <span className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Default icon is a circle */}
        <circle cx="12" cy="12" r="10" />
      </svg>
    </span>
  );
};
`
  );

  // Create button-delete.tsx
  const buttonDeletePath = path.join(__dirname, 'packages/ui-web/src/components/ui/button-delete.tsx');
  ensureDirectoryExists(path.dirname(buttonDeletePath));
  fs.writeFileSync(
    buttonDeletePath,
    `import React from 'react';

interface ButtonDeleteProps {
  onDelete: (event?: React.MouseEvent) => void;
  className?: string;
}

export const ButtonDelete: React.FC<ButtonDeleteProps> = ({ onDelete, className = '' }) => {
  return (
    <button
      className={\`w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded flex items-center \${className}\`}
      onClick={onDelete}
    >
      <span className="mr-3 h-4 w-4 text-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </span>
      Delete
    </button>
  );
};
`
  );

  // Create base-node.tsx
  const baseNodePath = path.join(__dirname, 'packages/ui-web/src/components/workflow/nodes/base-node.tsx');
  ensureDirectoryExists(path.dirname(baseNodePath));
  fs.writeFileSync(
    baseNodePath,
    `import React from 'react';

export interface ImprovedNodeData {
  label: string;
  icon?: React.ReactNode | string;
  description?: string;
  inputs?: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean;
    description?: string;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
    label: string;
    description?: string;
  }>;
  connectionState?: any;
}

export type BaseNodeData = ImprovedNodeData;

interface BaseNodeProps {
  id?: string;
  data: BaseNodeData;
  children: React.ReactNode;
  sourcePosition?: string;
  targetPosition?: string;
}

export const BaseNode: React.FC<BaseNodeProps> = ({ data, children, sourcePosition, targetPosition }) => {
  return (
    <div className="base-node">
      {children}
    </div>
  );
};
`
  );

  // Create artifact.ts
  const artifactPath = path.join(__dirname, 'packages/ui-web/src/components/chat/artifact.ts');
  ensureDirectoryExists(path.dirname(artifactPath));
  fs.writeFileSync(
    artifactPath,
    `// Mock implementation of artifact types

export enum ArtifactKind {
  TEXT = 'text',
  CODE = 'code',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  PDF = 'pdf',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  WORKFLOW = 'workflow',
}
`
  );

  // Create server.ts
  const serverPath = path.join(__dirname, 'packages/ui-web/src/lib/artifacts/server.ts');
  ensureDirectoryExists(path.dirname(serverPath));
  fs.writeFileSync(
    serverPath,
    `import { ArtifactKind } from '@/components/chat/artifact';

interface DocumentHandlerOptions<T extends ArtifactKind> {
  kind: T;
  onCreateDocument: (params: { title: string; dataStream?: ReadableStream }) => Promise<any>;
  onUpdateDocument?: (params: { id: string; content: string }) => Promise<any>;
  onDeleteDocument?: (params: { id: string }) => Promise<any>;
}

export function createDocumentHandler<T extends ArtifactKind>(options: DocumentHandlerOptions<T>) {
  return {
    kind: options.kind,
    onCreateDocument: options.onCreateDocument,
    onUpdateDocument: options.onUpdateDocument || (async () => {}),
    onDeleteDocument: options.onDeleteDocument || (async () => {}),
  };
}
`
  );

  // Create schema.ts
  const schemaPath = path.join(__dirname, 'packages/ui-web/src/lib/db/schema.ts');
  ensureDirectoryExists(path.dirname(schemaPath));
  fs.writeFileSync(
    schemaPath,
    `// Mock implementation of database schema

export interface Chat {
  id: string;
  title: string;
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Suggestion {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  chatId: string;
}
`
  );

  // Create actions.ts for chat
  const chatActionsPath = path.join(__dirname, 'packages/ui-web/src/app/(chat)/actions.ts');
  ensureDirectoryExists(path.dirname(chatActionsPath));
  fs.writeFileSync(
    chatActionsPath,
    `'use server';

// Mock implementation of chat actions
export async function updateChatVisibility({ chatId, visibility }: { chatId: string, visibility: string }) {
  // This is a mock implementation
  console.log(\`Updating chat \${chatId} visibility to \${visibility}\`);
  return { success: true };
}
`
  );

  // Create actions.ts for artifacts
  const artifactsActionsPath = path.join(__dirname, 'packages/ui-web/src/artifacts/actions.ts');
  ensureDirectoryExists(path.dirname(artifactsActionsPath));
  fs.writeFileSync(
    artifactsActionsPath,
    `'use server';

import { Suggestion } from '@/lib/db/schema';

// Mock implementation of getSuggestions
export async function getSuggestions({ documentId }: { documentId: string }): Promise<Suggestion[]> {
  const chatId = documentId; // Use documentId as chatId
  // This is a mock implementation
  return [
    {
      id: '1',
      text: 'This is a suggestion',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      chatId,
    },
    {
      id: '2',
      text: 'This is another suggestion',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      chatId,
    },
  ];
}
`
  );

  // Create visibility-selector.tsx
  const visibilitySelectorPath = path.join(__dirname, 'packages/ui-web/src/components/chat/visibility-selector.tsx');
  ensureDirectoryExists(path.dirname(visibilitySelectorPath));
  fs.writeFileSync(
    visibilitySelectorPath,
    `'use client';

import React from 'react';

export enum VisibilityType {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public',
}

interface VisibilitySelectorProps {
  value: VisibilityType;
  onChange: (value: VisibilityType) => void;
}

export const VisibilitySelector: React.FC<VisibilitySelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex space-x-2">
      <button
        className={\`px-3 py-1 rounded \${value === VisibilityType.PRIVATE ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
        onClick={() => onChange(VisibilityType.PRIVATE)}
      >
        Private
      </button>
      <button
        className={\`px-3 py-1 rounded \${value === VisibilityType.TEAM ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
        onClick={() => onChange(VisibilityType.TEAM)}
      >
        Team
      </button>
      <button
        className={\`px-3 py-1 rounded \${value === VisibilityType.PUBLIC ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
        onClick={() => onChange(VisibilityType.PUBLIC)}
      >
        Public
      </button>
    </div>
  );
};
`
  );

  console.log('Mock files created successfully!');
}

// Run the script
createMockFiles();
