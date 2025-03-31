import { addContact } from '../src/actions/add-contact.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('add-contact action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if API key is not provided', async () => {
    await expect(
      addContact.execute(
        {
          name: 'John Doe',
          number: 1234567890,
          email: 'john.doe@example.com',
        },
        { auth: {} }
      )
    ).rejects.toThrow('API key is required for KrispCall');
  });

  it('should make a request to the KrispCall API with correct parameters', async () => {
    const mockResponse = {
      data: {
        id: '12345',
        name: 'John Doe',
        number: '1234567890',
        email: 'john.doe@example.com',
        company: 'Example Inc',
        address: '123 Main St',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await addContact.execute(
      {
        name: 'John Doe',
        number: 1234567890,
        email: 'john.doe@example.com',
        company: 'Example Inc',
        address: '123 Main St',
      },
      { auth: { api_key: 'test-api-key' } }
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://automationapi.krispcall.com/api/v1/platform/activepiece/add-contact',
      {
        name: 'John Doe',
        number: 1234567890,
        email: 'john.doe@example.com',
        company: 'Example Inc',
        address: '123 Main St',
      },
      {
        headers: {
          'X-API-KEY': 'test-api-key',
        },
      }
    );

    expect(result).toEqual(mockResponse.data);
  });

  it('should handle API errors correctly', async () => {
    const errorMessage = 'API Error';
    mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

    await expect(
      addContact.execute(
        {
          name: 'John Doe',
          number: 1234567890,
        },
        { auth: { api_key: 'test-api-key' } }
      )
    ).rejects.toThrow(errorMessage);
  });
});
