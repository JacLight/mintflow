// Mock implementation of AI functions

export function streamObject(options: any) {
  return {
    fullStream: [
      {
        type: 'object',
        object: {
          code: 'console.log("Hello, world!");',
        },
      },
    ],
  };
}
