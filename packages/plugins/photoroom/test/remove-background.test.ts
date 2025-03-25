import { removeBackground } from '../src/actions/remove-background';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('remove-background action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if API key is not provided', async () => {
    const input = {
      image_file: {
        data: Buffer.from('test-image-data'),
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
      },
      output_filename: 'output.png',
    };
    const config = { auth: {} };

    try {
      await removeBackground.execute(input, config);
      fail('Expected an error to be thrown');
    } catch (error: any) {
      expect(error.message).toBe('API key is required for PhotoRoom');
    }
  });

  it('should make a request to the PhotoRoom API with correct parameters', async () => {
    // Mock successful response
    const mockResponse = {
      data: {
        result_b64: 'base64_image_data',
      },
    };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const input = {
      image_file: {
        data: Buffer.from('test-image-data'),
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
      },
      output_filename: 'output.png',
    };
    const config = { auth: { api_key: 'test-api-key' } };

    const result = await removeBackground.execute(input, config);

    // Verify axios was called with correct parameters
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://sdk.photoroom.com/v1/segment',
      expect.anything(),
      {
        headers: {
          'x-api-key': 'test-api-key',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Verify the result
    expect(result).toEqual({
      fileName: 'output.png',
      url: 'data:image/png;base64,base64_image_data',
      base64: 'base64_image_data',
    });
  });

  it('should handle API errors correctly', async () => {
    // Mock error response
    const mockError = {
      response: {
        data: 'Invalid API key',
        status: 401,
      },
    };
    mockedAxios.post.mockRejectedValue(mockError);

    const input = {
      image_file: {
        data: Buffer.from('test-image-data'),
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
      },
      output_filename: 'output.png',
    };
    const config = { auth: { api_key: 'invalid-api-key' } };

    try {
      await removeBackground.execute(input, config);
      fail('Expected an error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});
