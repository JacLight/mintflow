import { sendSms } from '../src/actions/send-sms';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('send-sms action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if API key is not provided', async () => {
    await expect(
      sendSms.execute(
        {
          from_number: '+1987654321',
          to_number: 1234567890,
          content: 'Test message',
        },
        { auth: {} }
      )
    ).rejects.toThrow('API key is required for KrispCall');
  });

  it('should make a request to the KrispCall API with correct parameters', async () => {
    const mockResponse = {
      data: {
        id: '12345',
        status: 'sent',
        message: 'SMS sent successfully',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await sendSms.execute(
      {
        from_number: '+1987654321',
        to_number: 1234567890,
        content: 'Test message',
      },
      { auth: { api_key: 'test-api-key' } }
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://automationapi.krispcall.com/api/v1/platform/activepiece/send-sms',
      {
        from_number: '+1987654321',
        to_number: 1234567890,
        content: 'Test message',
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
      sendSms.execute(
        {
          from_number: '+1987654321',
          to_number: 1234567890,
          content: 'Test message',
        },
        { auth: { api_key: 'test-api-key' } }
      )
    ).rejects.toThrow(errorMessage);
  });
});
