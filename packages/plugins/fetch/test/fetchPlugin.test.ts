import fetchPlugin from '../src/index';
import axios from 'axios';

jest.mock('axios');

describe('fetchPlugin', () => {
    const executeFetch = fetchPlugin.actions[0].execute;

    it('should fetch data successfully with GET method', async () => {
        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'json',
        };
        const responseData = { data: 'test data' };
        (axios as jest.Mocked<typeof axios>).mockResolvedValue({ data: responseData });

        const result = await executeFetch(input, {});
        expect(result).toEqual(responseData);
    });

    it('should handle POST method with body', async () => {
        const input = {
            method: 'post',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'json',
            body: JSON.stringify({ key: 'value' }),
        };
        const responseData = { success: true };
        (axios as jest.Mocked<typeof axios>).mockResolvedValue({ data: responseData });

        const result = await executeFetch(input, {});
        expect(result).toEqual(responseData);
    });

    it('should handle axios errors', async () => {
        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'json',
        };
        (axios as jest.Mocked<typeof axios>).mockRejectedValue(new Error('Network Error'));

        await expect(executeFetch(input, {})).rejects.toThrow('Axios error: Network Error');
    });

    it('should handle unexpected errors', async () => {
        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'json',
        };
        (axios as jest.Mocked<typeof axios>).mockImplementation(() => {
            throw 'Unexpected error';
        });

        await expect(executeFetch(input, {})).rejects.toThrow('Unexpected error');
    });

    it('should handle different response formats', async () => {
        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'text',
        };
        const responseData = 'plain text response';
        (axios as jest.Mocked<typeof axios>).mockResolvedValue({ data: responseData });

        const result = await executeFetch(input, {});
        expect(result).toEqual(responseData);
    });

    it('should handle headers correctly', async () => {
        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [{ key: 'Authorization', value: 'Bearer token' }],
            format: 'json',
        };
        const responseData = { data: 'test data' };
        (axios as jest.Mocked<typeof axios>).mockResolvedValue({ data: responseData });

        const result = await executeFetch(input, {});
        expect(result).toEqual(responseData);
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            headers: { Authorization: 'Bearer token' }
        }));
    });
});
