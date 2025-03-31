import fetch from 'node-fetch';

export interface TextToImageProps {
  prompt: string;
  cfg_scale?: number;
  clip_guidance_preset?: string;
  height?: number;
  width?: number;
  samples?: number;
  steps?: number;
  style_preset?: string;
  engine_id: string;
  weight?: number;
}

function getDefaultSize(engineId: string): number {
  switch (engineId) {
    case 'stable-diffusion-xl-1024-v1-0':
      return 1024;
    case 'stable-diffusion-768-v2-1':
      return 768;
    case 'stable-diffusion-512-v2-1':
      return 512;
    case 'stable-diffusion-768-v2-0':
      return 768;
    case 'stable-diffusion-512-v2-0':
      return 512;
    case 'stable-diffusion-v1-5':
      return 512;
    case 'stable-diffusion-v1':
      return 512;
    default:
      return 512;
  }
}

export const textToImage = {
  name: 'text-to-image',
  displayName: 'Text to Image',
  description: 'Generate an image using a text prompt',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The text to transform into an image',
        required: true,
      },
      cfg_scale: {
        type: 'number',
        description: 'How strictly the diffusion process adheres to the prompt text (higher values keep your image closer to your prompt) (MIN:0; MAX:35)',
        default: 7,
      },
      height: {
        type: 'number',
        description: 'Height of the image in pixels. Must be in increments of 64 and >= 128',
      },
      width: {
        type: 'number',
        description: 'Width of the image in pixels. Must be in increments of 64 and >= 128',
      },
      samples: {
        type: 'number',
        description: 'Number of images to generate (MAX:10)',
        default: 1,
      },
      steps: {
        type: 'number',
        description: 'Number of diffusion steps to run (MIN:10; MAX:150)',
        default: 50,
      },
      weight: {
        type: 'number',
        description: 'Weight of the prompt',
        default: 1,
      },
      clip_guidance_preset: {
        type: 'string',
        enum: ['NONE', 'FAST_BLUE', 'FAST_GREEN', 'SIMPLE', 'SLOW', 'SLOWER', 'SLOWEST'],
        default: 'NONE',
      },
      style_preset: {
        type: 'string',
        enum: [
          'enhance',
          'anime',
          'photographic',
          'digital-art',
          'comic-book',
          'fantasy-art',
          'line-art',
          'analog-film',
          'neon-punk',
          'isometric',
          'low-poly',
          'origami',
          'modeling-compound',
          'cinematic',
          '3d-model',
          'pixel-art',
          'tile-texture',
        ],
      },
      engine_id: {
        type: 'string',
        enum: [
          'stable-diffusion-xl-1024-v1-0',
          'stable-diffusion-768-v2-1',
          'stable-diffusion-512-v2-1',
          'stable-diffusion-768-v2-0',
          'stable-diffusion-512-v2-0',
          'stable-diffusion-v1-5',
          'stable-diffusion-v1',
        ],
        default: 'stable-diffusion-v1-5',
        required: true,
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
            base64: { type: 'string' },
            finishReason: { type: 'string' },
          },
        },
      },
    },
  },
  async execute(input: TextToImageProps, config: any) {
    const {
      prompt,
      cfg_scale = 7,
      clip_guidance_preset = 'NONE',
      height,
      width,
      samples = 1,
      steps = 50,
      style_preset,
      engine_id = 'stable-diffusion-v1-5',
      weight = 1,
    } = input;

    const apiHost = 'https://api.stability.ai';
    const apiKey = config.auth?.api_key;

    if (!apiKey) {
      throw new Error('API key is required for Stability AI');
    }

    const requestBody = {
      text_prompts: [
        {
          text: prompt,
          weight: Number(weight),
        },
      ],
      cfg_scale: Number(cfg_scale),
      clip_guidance_preset,
      height: Number(height) || getDefaultSize(engine_id),
      width: Number(width) || getDefaultSize(engine_id),
      samples: Number(samples),
      steps: Number(steps),
      style_preset,
    };

    try {
      const response = await fetch(
        `${apiHost}/v1/generation/${engine_id}/text-to-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Stability AI API error: ${errorData}`);
      }

      const data = await response.json() as { artifacts: Array<{ base64: string, finishReason: string }> };
      return {
        images: data.artifacts.map((artifact) => ({
          base64: artifact.base64,
          finishReason: artifact.finishReason,
        })),
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  },
};
