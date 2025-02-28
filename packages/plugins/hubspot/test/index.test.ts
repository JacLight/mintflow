import { describe, it, expect, vi, beforeEach } from 'vitest';
import hubspotPlugin from '../src/index.js';
import * as actions from '../src/actions/index.js';

// Mock the actions
vi.mock('../src/actions/index.js', () => ({
  createContact: vi.fn(),
  getContact: vi.fn(),
  updateContact: vi.fn(),
  findContact: vi.fn(),
}));

describe('HubSpot Plugin', () => {
  const mockAuth = {
    access_token: 'test-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have the correct plugin structure', () => {
    expect(hubspotPlugin).toHaveProperty('name', 'hubspot');
    expect(hubspotPlugin).toHaveProperty('id', 'hubspot');
    expect(hubspotPlugin).toHaveProperty('runner', 'node');
    expect(hubspotPlugin).toHaveProperty('method', 'exec');
    expect(hubspotPlugin).toHaveProperty('inputSchema');
    expect(hubspotPlugin).toHaveProperty('outputSchema');
    expect(hubspotPlugin).toHaveProperty('exec');
  });

  it('should call createContact action with correct parameters', async () => {
    const mockParams = {
      properties: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
      },
    };

    const mockResult = {
      id: '12345',
      properties: mockParams.properties,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      archived: false,
    };

    (actions.createContact as any).mockResolvedValue(mockResult);

    const result = await hubspotPlugin.exec({
      action: 'createContact',
      auth: mockAuth,
      params: mockParams,
    });

    expect(actions.createContact).toHaveBeenCalledWith({
      auth: mockAuth,
      ...mockParams,
    });
    expect(result).toEqual({ result: mockResult });
  });

  it('should call getContact action with correct parameters', async () => {
    const mockParams = {
      contactId: '12345',
      additionalPropertiesToRetrieve: ['website', 'address'],
    };

    const mockResult = {
      id: '12345',
      properties: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        website: 'example.com',
        address: '123 Main St',
      },
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      archived: false,
    };

    (actions.getContact as any).mockResolvedValue(mockResult);

    const result = await hubspotPlugin.exec({
      action: 'getContact',
      auth: mockAuth,
      params: mockParams,
    });

    expect(actions.getContact).toHaveBeenCalledWith({
      auth: mockAuth,
      ...mockParams,
    });
    expect(result).toEqual({ result: mockResult });
  });

  it('should call updateContact action with correct parameters', async () => {
    const mockParams = {
      contactId: '12345',
      properties: {
        email: 'john.updated@example.com',
        phone: '987-654-3210',
      },
    };

    const mockResult = {
      id: '12345',
      properties: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.updated@example.com',
        phone: '987-654-3210',
      },
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
      archived: false,
    };

    (actions.updateContact as any).mockResolvedValue(mockResult);

    const result = await hubspotPlugin.exec({
      action: 'updateContact',
      auth: mockAuth,
      params: mockParams,
    });

    expect(actions.updateContact).toHaveBeenCalledWith({
      auth: mockAuth,
      ...mockParams,
    });
    expect(result).toEqual({ result: mockResult });
  });

  it('should call findContact action with correct parameters', async () => {
    const mockParams = {
      searchQuery: 'john',
      limit: 10,
      properties: ['firstname', 'lastname', 'email'],
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'company',
              operator: 'EQ',
              value: 'Acme Inc.',
            },
          ],
        },
      ],
    };

    const mockResult = {
      results: [
        {
          id: '12345',
          properties: {
            firstname: 'John',
            lastname: 'Doe',
            email: 'john.doe@example.com',
            company: 'Acme Inc.',
          },
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          archived: false,
        },
      ],
      paging: {
        next: {
          after: 'next-page-token',
        },
      },
    };

    (actions.findContact as any).mockResolvedValue(mockResult);

    const result = await hubspotPlugin.exec({
      action: 'findContact',
      auth: mockAuth,
      params: mockParams,
    });

    expect(actions.findContact).toHaveBeenCalledWith({
      auth: mockAuth,
      ...mockParams,
    });
    expect(result).toEqual({ result: mockResult });
  });

  it('should throw an error for unsupported actions', async () => {
    await expect(
      hubspotPlugin.exec({
        action: 'unsupportedAction',
        auth: mockAuth,
        params: {},
      })
    ).rejects.toThrow('Unsupported action: unsupportedAction');
  });
});
