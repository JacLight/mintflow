// Mock implementation of database schema

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
