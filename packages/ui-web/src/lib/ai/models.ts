// Mock implementation of AI models

export const myProvider = {
  languageModel: (modelName: string) => {
    return {
      name: modelName,
      // Add any other properties needed
    };
  },
  imageModel: (modelName: string) => {
    return {
      name: modelName,
      // Add any other properties needed
    };
  },
};
