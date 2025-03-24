# Stable Diffusion Plugin for MintFlow

This plugin provides integration with Stable Diffusion Web UI, an AI image generation model that can create images from text prompts.

## Features

- Generate images from text prompts using Stable Diffusion models
- Support for different Stable Diffusion models
- Advanced parameter customization for fine-tuning image generation

## Authentication

To use this plugin, you need a running instance of Stable Diffusion Web UI with the API enabled. You can:

1. Set up Stable Diffusion Web UI locally by following the instructions at [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
2. Start the Web UI with the `--api` flag to enable the API
3. Use the base URL of your Stable Diffusion Web UI instance (e.g., `http://localhost:7860`) for authentication

## Actions

### Text to Image

Generate an image from a text prompt using Stable Diffusion.

**Input Parameters:**

- `prompt` (required): The text prompt to generate an image from
- `model` (required): The Stable Diffusion model to use
- `advancedParameters` (optional): Advanced parameters for the image generation (refer to API documentation)

**Output:**

- `images`: An array of generated images with:
  - `fileName`: The generated file name
  - `url`: The data URL of the image
  - `base64`: The base64-encoded image data

## Example Usage

```javascript
// Generate an image from a text prompt
const result = await mintflow.execute('stable-diffusion', 'text-to-image', {
  prompt: 'A beautiful sunset over a mountain landscape, photorealistic',
  model: 'v1-5-pruned-emaonly',
  advancedParameters: {
    negative_prompt: 'blurry, low quality',
    steps: 30,
    width: 512,
    height: 512,
    cfg_scale: 7.5
  }
}, {
  auth: {
    base_url: 'http://localhost:7860'
  }
});

// The result contains the generated images
console.log(result.images[0].url); // Data URL of the first generated image
```

## Advanced Parameters

The `advancedParameters` object can include various settings to customize the image generation process. Some common parameters include:

- `negative_prompt`: Text prompt for elements to avoid in the image
- `steps`: Number of sampling steps (higher values = more detail but slower)
- `width`: Width of the generated image in pixels
- `height`: Height of the generated image in pixels
- `cfg_scale`: Classifier-free guidance scale (how closely to follow the prompt)
- `sampler_name`: The sampling method to use
- `batch_size`: Number of images to generate in one batch

For a complete list of parameters, refer to the [Stable Diffusion Web UI API documentation](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API).

## API Documentation

For more information about the Stable Diffusion Web UI API, refer to the [official documentation](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API).
