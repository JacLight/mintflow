import { textToImage } from './actions/text-to-image.js';

const stableDiffusionPlugin = {
  name: "stable-diffusion",
  icon: "",
  description: "A web interface for Stable Diffusion, an AI image generation model",
    groups: ["ai"],
    tags: ["ai","nlp","ml","gpt","chatbot","image","text","embedding"],
    version: '1.0.0',
  id: "stable-diffusion",
  runner: "node",
  auth: {
    required: true,
    schema: {
      type: "object",
      properties: {
        base_url: {
          type: "string",
          description: "Stable Diffusion web UI API base URL",
          required: true,
        },
      },
    },
  },
  inputSchema: {
    type: "object",
    properties: {},
  },
  outputSchema: {
    type: "object",
    properties: {},
  },
  exampleInput: {},
  exampleOutput: {},
  documentation: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
  method: "exec",
  actions: [
    textToImage,
  ],
};

export default stableDiffusionPlugin;
