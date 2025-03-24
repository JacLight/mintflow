# Stability AI Plugin for MintFlow

This plugin provides integration with Stability AI's image generation API, allowing you to generate images from text prompts using Stable Diffusion models.

## Features

- Generate images from text prompts using various Stable Diffusion models
- Customize image generation parameters (size, samples, steps, style presets, etc.)
- Make custom API calls to the Stability AI API

## Authentication

To use this plugin, you need a Stability AI API key. You can get one by:

1. Creating an account at [platform.stability.ai](https://platform.stability.ai/)
2. Navigating to your account settings
3. Generating an API key

## Actions

### Text to Image

Generate an image from a text prompt.

**Input Parameters:**

- `prompt` (required): The text to transform into an image
- `engine_id` (required): The Stable Diffusion model to use
  - Options include: stable-diffusion-xl-1024-v1-0, stable-diffusion-768-v2-1, stable-diffusion-512-v2-1, etc.
- `cfg_scale` (optional): How strictly the diffusion process adheres to the prompt text (higher values keep your image closer to your prompt) (MIN:0; MAX:35)
- `height` (optional): Height of the image in pixels. Must be in increments of 64 and >= 128
- `width` (optional): Width of the image in pixels. Must be in increments of 64 and >= 128
- `samples` (optional): Number of images to generate (MAX:10)
- `steps` (optional): Number of diffusion steps to run (MIN:10; MAX:150)
- `weight` (optional): Weight of the prompt
- `clip_guidance_preset` (optional): Guidance preset to use
- `style_preset` (optional): Style preset to guide the image model towards a particular style

**Output:**

- `images`: An array of generated images with base64-encoded data and finish reason

### Custom API Call

Make a custom API call to the Stability AI API.

**Input Parameters:**

- `method` (required): HTTP method (GET, POST, PUT, DELETE)
- `path` (required): The path to append to the base URL (https://api.stability.ai/v1)
- `body` (optional): The request body for POST and PUT requests
- `queryParams` (optional): Query parameters to include in the request

**Output:**

- The raw response from the Stability AI API

## Example Usage

### Text to Image

```javascript
// Generate an image from a text prompt
const result = await mintflow.execute('stability-ai', 'text-to-image', {
  prompt: 'A beautiful sunset over a mountain landscape, digital art',
  engine_id: 'stable-diffusion-xl-1024-v1-0',
  cfg_scale: 7,
  height: 1024,
  width: 1024,
  samples: 1,
  steps: 50,
  style_preset: 'digital-art'
}, {
  auth: {
    api_key: 'your-stability-ai-api-key'
  }
});

// The result contains an array of generated images with base64-encoded data
console.log(result.images[0].base64);
```

### Custom API Call

```javascript
// Make a custom API call to list available engines
const engines = await mintflow.execute('stability-ai', 'custom-api-call', {
  method: 'GET',
  path: '/engines/list'
}, {
  auth: {
    api_key: 'your-stability-ai-api-key'
  }
});

console.log(engines);
```

## API Documentation

For more information about the Stability AI API, refer to the [official documentation](https://platform.stability.ai/docs/api-reference).
