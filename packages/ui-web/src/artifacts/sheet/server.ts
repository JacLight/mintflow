import { myProvider } from '@/lib/ai/models';
import { sheetPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from '@/lib/ai/ai';
import { ArtifactKind } from '@/components/chat/artifact';

// Mock implementation of sheet document handler
export const sheetDocumentHandler = createDocumentHandler<ArtifactKind.SPREADSHEET>({
  kind: ArtifactKind.SPREADSHEET,
  onCreateDocument: async ({ title }) => {
    // Return a simple CSV
    return `name,age,email
John Doe,30,john@example.com
Jane Smith,25,jane@example.com
Bob Johnson,40,bob@example.com`;
  },
  onUpdateDocument: async ({ id, content }) => {
    // Return the same content with an additional row
    return `${content}
New Person,35,new@example.com`;
  },
});
