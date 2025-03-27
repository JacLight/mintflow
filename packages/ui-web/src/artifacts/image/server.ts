import { myProvider } from '@/lib/ai/models';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from '@/lib/ai/image';
import { ArtifactKind } from '@/components/chat/artifact';

// Mock implementation of image document handler
export const imageDocumentHandler = createDocumentHandler<ArtifactKind.IMAGE>({
  kind: ArtifactKind.IMAGE,
  onCreateDocument: async ({ title }) => {
    // Generate a mock image
    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: title,
      n: 1,
    });

    return image.base64;
  },
  onUpdateDocument: async ({ id, content }) => {
    // Return the same content (in a real implementation, this would generate a new image)
    return content;
  },
});
