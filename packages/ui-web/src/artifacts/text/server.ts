import { myProvider } from '@/lib/ai/models';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';
import { smoothStream, streamText } from '@/lib/ai/text';
import { ArtifactKind } from '@/components/chat/artifact';

// Mock implementation of text document handler
export const textDocumentHandler = createDocumentHandler<ArtifactKind.TEXT>({
  kind: ArtifactKind.TEXT,
  onCreateDocument: async ({ title }) => {
    // Return a simple text document
    return `# ${title}\n\nThis is a sample document about ${title}. It contains some markdown formatting.\n\n## Introduction\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.`;
  },
  onUpdateDocument: async ({ id, content }) => {
    // Return the updated content with a timestamp
    return `${content}\n\n_Updated at ${new Date().toISOString()}_`;
  },
});
