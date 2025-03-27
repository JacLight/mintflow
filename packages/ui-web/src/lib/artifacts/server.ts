import { ArtifactKind } from '@/components/chat/artifact';

// Export the artifact kinds as an array of strings for use in zod enums
export const artifactKinds = Object.values(ArtifactKind);

// Mock document handlers
export const documentHandlersByArtifactKind = [
  {
    kind: ArtifactKind.TEXT,
    onCreateDocument: async ({ id, title, dataStream, session }: any) => {
      console.log(`Creating text document: ${title} (${id})`);
      return { id, title };
    },
    onUpdateDocument: async ({ id, content }: any) => {
      console.log(`Updating text document: ${id}`);
      return { id };
    },
    onDeleteDocument: async ({ id }: any) => {
      console.log(`Deleting text document: ${id}`);
      return { id };
    }
  },
  {
    kind: ArtifactKind.CODE,
    onCreateDocument: async ({ id, title, dataStream, session }: any) => {
      console.log(`Creating code document: ${title} (${id})`);
      return { id, title };
    },
    onUpdateDocument: async ({ id, content }: any) => {
      console.log(`Updating code document: ${id}`);
      return { id };
    },
    onDeleteDocument: async ({ id }: any) => {
      console.log(`Deleting code document: ${id}`);
      return { id };
    }
  }
];

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
