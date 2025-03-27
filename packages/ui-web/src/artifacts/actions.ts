'use server';

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
