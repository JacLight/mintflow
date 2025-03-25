# PhotoRoom Plugin for MintFlow

This plugin provides integration with PhotoRoom's API for background removal and image editing.

## Features

- Remove backgrounds from images with a single API call
- Get back the processed image in base64 format

## Authentication

To use this plugin, you need a PhotoRoom API key. You can get one by:

1. Creating an account at [photoroom.com](https://www.photoroom.com/)
2. Navigating to the API section in your account settings
3. Generating an API key

## Actions

### Remove Background

Remove the background from an image.

**Input Parameters:**

- `image_file` (required): The image file to remove the background from
  - `data`: The binary data of the image file
  - `filename`: The name of the image file
  - `mimetype`: The MIME type of the image file
- `output_filename` (required): The filename for the output image

**Output:**

- `fileName`: The filename of the processed image
- `url`: A data URL containing the processed image
- `base64`: The base64-encoded processed image

## Example Usage

```javascript
// Remove background from an image
const result = await mintflow.execute('photoroom', 'remove-background', {
  image_file: {
    data: imageBuffer, // Buffer containing the image data
    filename: 'input.jpg',
    mimetype: 'image/jpeg'
  },
  output_filename: 'output.png'
}, {
  auth: {
    api_key: 'your-photoroom-api-key'
  }
});

// The result contains the processed image
console.log(result.fileName); // 'output.png'
console.log(result.url); // 'data:image/png;base64,...'
console.log(result.base64); // Base64-encoded image data
```

## API Documentation

For more information about the PhotoRoom API, refer to the [official documentation](https://www.photoroom.com/api).
