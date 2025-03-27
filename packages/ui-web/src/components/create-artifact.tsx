'use client';

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
  handleVersionChange?: (direction: 'prev' | 'next' | 'toggle') => void;
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
