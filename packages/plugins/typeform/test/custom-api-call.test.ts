import axios from 'axios';
import { customApiCall } from '../src/actions/custom-api-call.js';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('customApiCall action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a GET request successfully', async () => {
    // Mock response
    const mockResponse = {
      data: { items: [{ id: 'form1', title: 'Test Form' }] },
      status: 200,
    };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    // Input
    const input = {
      method: 'GET',
      path: '/forms',
      queryParams: { page: '1', page_size: '10' },
    };

    // Auth
    const auth = { access_token: 'test-token' };

    // Execute
    const result = await customApiCall.execute(input, auth);

    // Assertions
    expect(mockedAxios).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://api.typeform.com/forms',
      params: { page: '1', page_size: '10' },
      data: undefined,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
    });
    expect(result).toEqual({
      data: { items: [{ id: 'form1', title: 'Test Form' }] },
      status: 200,
    });
  });

  it('should make a POST request successfully', async () => {
    // Mock response
    const mockResponse = {
      data: { id: 'webhook1', enabled: true },
      status: 201,
    };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    // Input
    const input = {
      method: 'POST',
      path: '/forms/form1/webhooks',
      body: {
        url: 'https://example.com/webhook',
        enabled: true,
      },
    };

    // Auth
    const auth = { access_token: 'test-token' };

    // Execute
    const result = await customApiCall.execute(input, auth);

    // Assertions
    expect(mockedAxios).toHaveBeenCalledWith({
      method: 'post',
      url: 'https://api.typeform.com/forms/form1/webhooks',
      params: undefined,
      data: {
        url: 'https://example.com/webhook',
        enabled: true,
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
    });
    expect(result).toEqual({
      data: { id: 'webhook1', enabled: true },
      status: 201,
    });
  });

  it('should handle errors properly', async () => {
    // Mock error
    const mockError = {
      response: {
        status: 404,
        data: { code: 'NOT_FOUND', description: 'Form not found' },
      },
      message: 'Request failed with status code 404',
    };
    mockedAxios.mockRejectedValueOnce(mockError);

    // Input
    const input = {
      method: 'GET',
      path: '/forms/nonexistent',
    };

    // Auth
    const auth = { access_token: 'test-token' };

    // Execute
    const result = await customApiCall.execute(input, auth);

    // Assertions
    expect(result).toEqual({
      error: 'Error making request: Request failed with status code 404',
      status: 404,
      details: { code: 'NOT_FOUND', description: 'Form not found' },
    });
  });

  it('should handle unexpected errors', async () => {
    // Mock error
    const mockError = new Error('Network error');
    mockedAxios.mockRejectedValueOnce(mockError);

    // Input
    const input = {
      method: 'GET',
      path: '/forms',
    };

    // Auth
    const auth = { access_token: 'test-token' };

    // Execute
    const result = await customApiCall.execute(input, auth);

    // Assertions
    expect(result).toEqual({
      error: 'Unexpected error: Network error',
    });
  });
});
