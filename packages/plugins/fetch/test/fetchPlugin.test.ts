import fetchPlugin from '../src/index';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('fetchPlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeFetch: any;

    beforeEach(() => {
        axiosInstance = axios.create();
        mock = new MockAdapter(axiosInstance, { onNoMatch: 'throwException' });
        executeFetch = fetchPlugin.actions[0].execute.bind({ axiosInstance });
    });

    afterEach(() => {
        mock.reset();
        mock.restore();
    });

    it('should fetch data successfully with GET method', async () => {
        const responseData = { data: 'test data' };
        mock.onGet('https://api.example.com/data').reply(200, responseData);

        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'json',
        };

        const result = await executeFetch(input, { axiosInstance });
        expect(result).toEqual(responseData);
    });

    it('should handle POST method with body', async () => {
        const requestBody = { key: 'value' };
        const responseData = { success: true };

        mock.onPost('https://api.example.com/data', requestBody).reply(200, responseData);

        const input = {
            method: 'post',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'json',
            body: JSON.stringify(requestBody),
        };

        const result = await executeFetch(input, { axiosInstance });
        expect(result).toEqual(responseData);
    });

    it('should handle axios errors', async () => {
        mock.onGet('https://api.example.com/data').networkError();

        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'json',
        };

        await expect(executeFetch(input, { axiosInstance })).rejects.toThrow(/Axios error/);
    });

    it('should handle unexpected errors', async () => {
        mock.onGet('https://api.example.com/data').reply(() => {
            throw new Error('Unexpected error');
        });

        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'json',
        };

        await expect(executeFetch(input, { axiosInstance })).rejects.toThrow(/Unexpected error/);
    });

    it('should handle different response formats', async () => {
        const responseData = 'plain text response';
        mock.onGet('https://api.example.com/data').reply(200, responseData);

        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [],
            format: 'text',
        };

        const result = await executeFetch(input, { axiosInstance });
        expect(result).toBe(responseData);
    });

    it('should handle headers correctly', async () => {
        const responseData = { data: 'test data' };
        mock.onGet('https://api.example.com/data').reply(config => {
            expect(config.headers).toHaveProperty('Authorization', 'Bearer token');
            return [200, responseData];
        });

        const input = {
            method: 'get',
            url: 'https://api.example.com/data',
            headers: [{ key: 'Authorization', value: 'Bearer token' }],
            format: 'json',
        };

        const result = await executeFetch(input, { axiosInstance });
        expect(result).toEqual(responseData);
    });
});