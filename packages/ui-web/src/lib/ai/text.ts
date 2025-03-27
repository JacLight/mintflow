// Mock implementation of text generation functions

export function streamText(options: any) {
  return {
    fullStream: [
      {
        type: 'text-delta',
        textDelta: 'This is a mock text response. ',
      },
      {
        type: 'text-delta',
        textDelta: 'It simulates streaming text generation. ',
      },
      {
        type: 'text-delta',
        textDelta: 'The content is based on the prompt: ' + options.prompt,
      },
    ],
  };
}

export function smoothStream(options: any) {
  return (text: string) => text;
}
