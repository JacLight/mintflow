import { enrichCompany } from '../src/actions/enrich-company.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('enrich_company action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return company data when domain is provided', async () => {
        // Mock store
        const mockStore = {
            get: jest.fn().mockResolvedValue(null),
            put: jest.fn().mockResolvedValue(undefined)
        };

        // Mock auth
        const auth = { apiKey: 'test-api-key' };

        // Mock API response
        const mockCompanyData = {
            id: '123456',
            name: 'Example Inc.',
            website_url: 'https://example.com',
            domain: 'example.com',
            industry: 'Software',
            linkedin_url: 'https://www.linkedin.com/company/example-inc',
            description: 'Example Inc. is a software company',
            employee_count: 500,
            annual_revenue: 10000000,
            location: {
                country: 'United States',
                city: 'San Francisco',
                state: 'CA'
            }
        };

        // Setup axios mock
        mockedAxios.create.mockReturnValue({
            request: jest.fn().mockResolvedValue({
                data: { organization: mockCompanyData }
            })
        } as any);

        // Execute the action
        const input = { data: { domain: 'example.com' } };
        const result = await enrichCompany.execute(input, auth, mockStore);

        // Assertions
        expect(result).toEqual(mockCompanyData);
        expect(mockStore.get).toHaveBeenCalledWith('_apollo_org_example.com');
        expect(mockStore.put).toHaveBeenCalledWith('_apollo_org_example.com', mockCompanyData);
    });

    it('should return cached data when available', async () => {
        // Mock cached data
        const cachedData = {
            id: '123456',
            name: 'Example Inc.',
            domain: 'example.com'
        };

        // Mock store
        const mockStore = {
            get: jest.fn().mockResolvedValue(cachedData),
            put: jest.fn()
        };

        // Mock auth
        const auth = { apiKey: 'test-api-key' };

        // Execute the action
        const input = { data: { domain: 'example.com' } };
        const result = await enrichCompany.execute(input, auth, mockStore);

        // Assertions
        expect(result).toEqual(cachedData);
        expect(mockStore.get).toHaveBeenCalledWith('_apollo_org_example.com');
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
        const mockCompanyData = {
            id: '123456',
            name: 'Example Inc.',
            domain: 'example.com'
        };

        // Setup axios mock
        mockedAxios.create.mockReturnValue({
            request: jest.fn().mockResolvedValue({
                data: { organization: mockCompanyData }
            })
        } as any);

        // Execute the action
        const input = { data: { domain: 'example.com', cacheResponse: false } };
        const result = await enrichCompany.execute(input, auth, mockStore);

        // Assertions
        expect(result).toEqual(mockCompanyData);
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
        const input = { data: { domain: 'example.com' } };
        const result = await enrichCompany.execute(input, auth, mockStore);

        // Assertions
        expect(result).toHaveProperty('error');
        expect(result.error).toContain('Error enriching company');
    });

    it('should handle missing domain parameter', async () => {
        // Mock auth
        const auth = { apiKey: 'test-api-key' };

        // Execute the action with missing domain
        const input = { data: {} };
        const result = await enrichCompany.execute(input, auth);

        // Assertions
        expect(result).toHaveProperty('error');
        expect(result.error).toEqual('Domain is required');
    });
});
