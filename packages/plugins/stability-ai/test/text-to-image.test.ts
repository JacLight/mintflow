import { textToImage } from '../src/actions/text-to-image';
import fetch from 'node-fetch';

// Mock node-fetch
jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('text-to-image action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if API key is not provided', async () => {
    const input = {
      prompt: 'A beautiful sunset',
      engine_id: 'stable-diffusion-v1-5',
    };
    const config = { auth: {} };

    await expect(textToImage.execute(input, config)).rejects.toThrow(
      'API key is required for Stability AI'
    );
  });

  it('should make a request to the Stability AI API with correct parameters', async () => {
    // Mock successful response
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        artifacts: [
          {
            base64: 'base64_image_data',
            finishReason: 'SUCCESS',
          },
        ],
      }),
      text: jest.fn().mockResolvedValue(''),
    };
    mockedFetch.mockResolvedValue(mockResponse as any);

    const input = {
      prompt: 'A beautiful sunset',
      engine_id: 'stable-diffusion-v1-5',
      cfg_scale: 7,
      height: 512,
      width: 512,
      samples: 1,
      steps: 50,
      clip_guidance_preset: 'NONE',
      style_preset: 'digital-art',
      weight: 1,
    };
    const config = { auth: { api_key: 'test-api-key' } };

    const result = await textToImage.execute(input, config);

    // Verify fetch was called with correct parameters
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer test-api-key',
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: 'A beautiful sunset',
              weight: 1,
            },
          ],
          cfg_scale: 7,
          clip_guidance_preset: 'NONE',
          height: 512,
          width: 512,
          samples: 1,
          steps: 50,
          style_preset: 'digital-art',
        }),
      }
    );

    // Verify the result
    expect(result).toEqual({
      images: [
        {
          base64: 'base64_image_data',
          finishReason: 'SUCCESS',
        },
      ],
    });
  });

  it('should use default values when optional parameters are not provided', async () => {
    // Mock successful response
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        artifacts: [
          {
            base64: 'base64_image_data',
            finishReason: 'SUCCESS',
          },
        ],
      }),
      text: jest.fn().mockResolvedValue(''),
    };
    mockedFetch.mockResolvedValue(mockResponse as any);

    const input = {
      prompt: 'A beautiful sunset',
      engine_id: 'stable-diffusion-v1-5',
    };
    const config = { auth: { api_key: 'test-api-key' } };

    await textToImage.execute(input, config);

    // Verify fetch was called with default parameters
    const fetchCall = mockedFetch.mock.calls[0][1];
    const body = JSON.parse(fetchCall?.body as string);
    
    expect(body.cfg_scale).toBe(7);
    expect(body.clip_guidance_preset).toBe('NONE');
    expect(body.height).toBe(512); // Default for stable-diffusion-v1-5
    expect(body.width).toBe(512); // Default for stable-diffusion-v1-5
    expect(body.samples).toBe(1);
    expect(body.steps).toBe(50);
    expect(body.text_prompts[0].weight).toBe(1);
  });

  it('should handle API errors correctly', async () => {
    // Mock error response
    const mockResponse = {
      ok: false,
      text: jest.fn().mockResolvedValue('Invalid API key'),
    };
    mockedFetch.mockResolvedValue(mockResponse as any);

    const input = {
      prompt: 'A beautiful sunset',
      engine_id: 'stable-diffusion-v1-5',
    };
    const config = { auth: { api_key: 'invalid-api-key' } };

    await expect(textToImage.execute(input, config)).rejects.toThrow(
      'Stability AI API error: Invalid API key'
    );
  });
});
