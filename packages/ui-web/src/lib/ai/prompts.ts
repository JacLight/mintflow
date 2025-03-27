import { ArtifactKind } from '@/components/chat/artifact';

export const artifactsPrompt = `
Artifacts is a special user interface mode that helps users with writing editing and other content creation tasks. When artifact is open it is on the right side of the screen while the conversation is on the left side. When creating or updating documents changes are reflected in real-time on the artifacts and visible to the user.
`;

export const codePrompt = `
You are a helpful coding assistant. Generate code based on the user's request.
`;

export const sheetPrompt = `
You are a helpful spreadsheet assistant. Generate spreadsheet data based on the user's request.
`;

export function updateDocumentPrompt(content: string, kind: string) {
  return `
Update the following ${kind} document based on the user's request:

${content}
`;
}
