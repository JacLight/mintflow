import { describe, it, expect, vi, beforeEach } from 'vitest';
import webhookPlugin from '../src/index.js';
import * as actions from '../src/actions/index.js';
import * as triggers from '../src/triggers/index.js';
import { AuthType, ResponseType } from '../src/common.js';

// Mock the actions and triggers
vi.mock('../src/actions/index.js', () => ({
  returnResponse: vi.fn(),
}));

vi.mock('../src/triggers/index.js', () => ({
  catchHook: vi.fn(),
}));

describe('Webhook Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have the correct plugin structure', () => {
    expect(webhookPlugin).toHaveProperty('name', 'webhook');
    expect(webhookPlugin).toHaveProperty('id', 'webhook');
    expect(webhookPlugin).toHaveProperty('runner', 'node');
    expect(webhookPlugin).toHaveProperty('method', 'exec');
    expect(webhookPlugin).toHaveProperty('inputSchema');
    expect(webhookPlugin).toHaveProperty('outputSchema');
    expect(webhookPlugin).toHaveProperty('exec');
  });

  it('should call returnResponse action with correct parameters', async () => {
    const mockParams = {
      responseType: ResponseType.JSON,
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        message: 'Success',
      },
    };

    const mockResult = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        message: 'Success',
      },
    };

    (actions.returnResponse as any).mockResolvedValue(mockResult);

    const result = await webhookPlugin.exec({
      action: 'returnResponse',
      params: mockParams,
    });

    expect(actions.returnResponse).toHaveBeenCalledWith(mockParams);
    expect(result).toEqual({ result: mockResult });
  });

  it('should call catchHook action with correct parameters', async () => {
    const mockParams = {
      authType: AuthType.BASIC,
      username: 'user123',
      password: 'securepass',
    };

    const mockPayload = {
      headers: {
        authorization: 'Basic dXNlcjEyMzpzZWN1cmVwYXNz',
      },
      body: {
        data: 'test',
      },
    };

    const mockResult = {
      ...mockPayload,
    };

    (triggers.catchHook as any).mockResolvedValue(mockResult);

    const result = await webhookPlugin.exec({
      action: 'catchHook',
      params: mockParams,
      payload: mockPayload,
    });

    expect(triggers.catchHook).toHaveBeenCalledWith(mockParams, mockPayload);
    expect(result).toEqual({ result: mockResult });
  });

  it('should throw an error for unsupported actions', async () => {
    await expect(
      webhookPlugin.exec({
        action: 'unsupportedAction',
        params: {},
      })
    ).rejects.toThrow('Unsupported action: unsupportedAction');
  });
});
