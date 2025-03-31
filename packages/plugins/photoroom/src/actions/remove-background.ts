import axios from 'axios';
import FormData from 'form-data';

export interface RemoveBackgroundProps {
  image_file: {
    data: Buffer;
    filename: string;
    mimetype: string;
  };
  output_filename: string;
}

export const removeBackground = {
  name: 'remove-background',
  displayName: 'Remove Background',
  description: 'Remove the background from an image',
  inputSchema: {
    type: 'object',
    properties: {
      image_file: {
        type: 'object',
        description: 'The image file to remove the background from',
        required: true,
      },
      output_filename: {
        type: 'string',
        description: 'The filename for the output image',
        required: true,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      fileName: { type: 'string' },
      url: { type: 'string' },
      base64: { type: 'string' },
    },
  },
  async execute(input: RemoveBackgroundProps, config: any) {
    const { image_file, output_filename } = input;
    const apiKey = config.auth?.api_key;

    if (!apiKey) {
      throw new Error('API key is required for PhotoRoom');
    }

    try {
      const formData = new FormData();
      formData.append('image_file', image_file.data, {
        filename: image_file.filename,
        contentType: image_file.mimetype,
      });

      const response = await axios.post('https://sdk.photoroom.com/v1/segment', formData, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data as { result_b64: string };
      const imageBuffer = Buffer.from(data.result_b64, 'base64');

      return {
        fileName: output_filename,
        url: `data:image/png;base64,${data.result_b64}`,
        base64: data.result_b64,
      };
    } catch (error) {
      console.log("Error removing background");
      throw error;
    }
  },
};
