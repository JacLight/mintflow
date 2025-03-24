import { matchPerson } from '../src/actions/match-person.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('match_person action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return person data when email is provided', async () => {
        // Mock store
        const mockStore = {
            get: jest.fn().mockResolvedValue(null),
            put: jest.fn().mockResolvedValue(undefined)
        };

        // Mock auth
        const auth = { apiKey: 'test-api-key' };

        // Mock API response
        const mockPersonData = {
            id: '123456',
            first_name: 'John',
            last_name: 'Doe',
            name: 'John Doe',
            linkedin_url: 'https://www.linkedin.com/in/johndoe',
            title: 'Software Engineer',
            email: 'john.doe@example.com',
            organization: {
                name: 'Example Inc.'
            }
        };

        // Setup axios mock
        mockedAxios.create.mockReturnValue({
            request: jest.fn().mockResolvedValue({
                data: { person: mockPersonData }
            })
        } as any);

        // Execute the action
        const input = { data: { email: 'john.doe@example.com' } };
        const result = await matchPerson.execute(input, auth, mockStore);

        // Assertions
        expect(result).toEqual(mockPersonData);
        expect(mockStore.get).toHaveBeenCalledWith('_apollo_person_john.doe@example.com');
        expect(mockStore.put).toHaveBeenCalledWith('_apollo_person_john.doe@example.com', mockPersonData);
    });

    it('should return cached data when available', async () => {
        // Mock cached data
        const cachedData = {
            id: '123456',
            name: 'John Doe',
            email: 'john.doe@example.com'
        };

        // Mock store
        const mockStore = {
            get: jest.fn().mockResolvedValue(cachedData),
            put: jest.fn()
        };

        // Mock auth
        const auth = { apiKey: 'test-api-key' };

        // Execute the action
        const input = { data: { email: 'john.doe@example.com' } };
        const result = await matchPerson.execute(input, auth, mockStore);

        // Assertions
        expect(result).toEqual(cachedData);
        expect(mockStore.get).toHaveBeenCalledWith('_apollo_person_john.doe@example.com');
        expect(mockStore.put).not.toHaveBeenCalled();
        expect(mockedAxios.create).not.toHaveBeenCalled();
    });

    it('should not cache when cacheResponse is false', async () => {
        // Mock store
        const mockStore = {
            get: jest.fn().mockResolvedValue(null),
            put: jest.fn()
        };

        // Mock auth
        const auth = { apiKey: 'test-api-key' };

        // Mock API response
        const mockPersonData = {
            id: '123456',
            name: 'John Doe',
            email: 'john.doe@example.com'
        };

        // Setup axios mock
        mockedAxios.create.mockReturnValue({
            request: jest.fn().mockResolvedValue({
                data: { person: mockPersonData }
            })
        } as any);

        // Execute the action
        const input = { data: { email: 'john.doe@example.com', cacheResponse: false } };
        const result = await matchPerson.execute(input, auth, mockStore);

        // Assertions
        expect(result).toEqual(mockPersonData);
        expect(mockStore.get).not.toHaveBeenCalled();
        expect(mockStore.put).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
        // Mock store
        const mockStore = {
            get: jest.fn().mockResolvedValue(null),
            put: jest.fn()
        };

        // Mock auth
        const auth = { apiKey: 'test-api-key' };

        // Setup axios mock to throw an error
        mockedAxios.create.mockReturnValue({
            request: jest.fn().mockRejectedValue(new Error('API Error'))
        } as any);

        // Execute the action
        const input = { data: { email: 'john.doe@example.com' } };
        const result = await matchPerson.execute(input, auth, mockStore);

        // Assertions
        expect(result).toHaveProperty('error');
        expect(result.error).toContain('Error matching person');
    });

    it('should handle missing email parameter', async () => {
        // Mock auth
        const auth = { apiKey: 'test-api-key' };

        // Execute the action with missing email
        const input = { data: {} };
        const result = await matchPerson.execute(input, auth);

        // Assertions
        expect(result).toHaveProperty('error');
        expect(result.error).toEqual('Email is required');
    });
});
