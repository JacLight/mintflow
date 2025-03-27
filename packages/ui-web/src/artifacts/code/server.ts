import { ArtifactKind } from '@/components/chat/artifact';
import { createDocumentHandler } from '@/lib/artifacts/server';

// Mock implementation of code document handler
export const codeDocumentHandler = createDocumentHandler<ArtifactKind.CODE>({
  kind: ArtifactKind.CODE,
  onCreateDocument: async ({ title }) => {
    // Return a simple code snippet
    return `console.log("Hello, ${title}!");`;
  },
  onUpdateDocument: async ({ id, content }) => {
    // Return the updated content with a comment
    return `${content}\n// Updated at ${new Date().toISOString()}`;
  },
});
