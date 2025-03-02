import { deleteContacts } from '../src/actions/delete-contacts';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('delete-contacts action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if API key is not provided', async () => {
    await expect(
      deleteContacts.execute(
        {
          contactIds: ['12345', '67890'],
        },
        { auth: {} }
      )
    ).rejects.toThrow('API key is required for KrispCall');
  });

  it('should make a request to the KrispCall API with correct parameters', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Contacts deleted successfully',
        deletedIds: ['12345', '67890'],
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await deleteContacts.execute(
      {
        contactIds: ['12345', '67890'],
      },
      { auth: { api_key: 'test-api-key' } }
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://automationapi.krispcall.com/api/v1/platform/activepiece/delete-contacts',
      {
        contactIds: ['12345', '67890'],
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
      deleteContacts.execute(
        {
          contactIds: ['12345', '67890'],
        },
        { auth: { api_key: 'test-api-key' } }
      )
    ).rejects.toThrow(errorMessage);
  });
});
