import axios from 'axios';
import { randomBytes } from 'crypto';

export interface TextToImageProps {
  prompt: string;
  model: string;
  advancedParameters?: Record<string, any>;
}

export const textToImage = {
  name: 'text-to-image',
  displayName: 'Text to Image',
  description: 'Generate an image from a text prompt using Stable Diffusion',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The text prompt to generate an image from',
        required: true,
      },
      model: {
        type: 'string',
        description: 'The Stable Diffusion model to use',
        required: true,
      },
      advancedParameters: {
        type: 'object',
        description: 'Advanced parameters for the image generation (refer to API documentation)',
        required: false,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      images: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            fileName: { type: 'string' },
            url: { type: 'string' },
          },
        },
      },
    },
  },
  async execute(input: TextToImageProps, config: any) {
    const baseUrl = config.auth?.base_url;

    if (!baseUrl) {
      throw new Error('Base URL is required for Stable Diffusion Web UI');
    }

    try {
      // First, check if the model exists
      const modelsResponse = await axios.get(`${baseUrl}/sdapi/v1/sd-models`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const models = modelsResponse.data;
      const modelExists = models.some((model: { model_name: string }) => model.model_name === input.model);

      if (!modelExists) {
        throw new Error(`Model "${input.model}" not found. Please choose a valid model.`);
      }

      // Generate the image
      const response = await axios.post(
        `${baseUrl}/sdapi/v1/txt2img`,
        {
          ...input.advancedParameters,
          prompt: input.prompt,
          override_settings: {
            sd_model_checkpoint: input.model,
          },
          override_settings_restore_afterwards: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Process the images
      const images = response.data.images?.map((imageBase64: string) => {
        const fileName = `${randomBytes(16).toString('hex')}-${input.prompt.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 42)}.png`;
        
        return {
          fileName,
          url: `data:image/png;base64,${imageBase64}`,
          base64: imageBase64,
        };
      });

      return {
        images,
      };
    } catch (error) {
      console.error('Error generating image with Stable Diffusion:', error);
      throw error;
    }
  },
};
