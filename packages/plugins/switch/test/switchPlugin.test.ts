import switchPlugin from '../src/index';
import * as objectPath from 'object-path';

describe('switchPlugin', () => {
    const mockFlowContext = {
        get: jest.fn()
    };

    const mockCallback = jest.fn();

    const config = {
        data: {
            source: 'data',
            key: 'testKey',
            options: [
                { label: 'Option 1', operation: 'equals', value: 'testValue1' },
                { label: 'Option 2', operation: 'not-equals', value: 'testValue2' },
                { label: 'Option 3', operation: 'in', value: 'testValue3' },
            ]
        },
        flowContext: mockFlowContext,
        callback: mockCallback,
        nodeMessage: {
            message: {}
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle source as data', async () => {
        const input = {};
        const data = { testKey: 'testValue1' };
        objectPath.get = jest.fn().mockReturnValue(data.testKey);

        const result = await switchPlugin.actions[0].execute(input, config);

        expect(result).toEqual({});
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.objectContaining({
                handle: 0
            })
        }));
    });

    it('should handle source as flow', async () => {
        const input = {};
        const data = { testKey: 'testValue1' };
        config.data.source = 'flow';
        mockFlowContext.get.mockResolvedValue(data.testKey);

        const result = await switchPlugin.actions[0].execute(input, config);

        expect(result).toEqual({});
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.objectContaining({
                handle: 0
            })
        }));
    });

    it('should handle multiple valid options', async () => {
        const input = {};
        const data = { testKey: 'testValue1' };
        objectPath.get = jest.fn().mockReturnValue(data.testKey);

        config.data.options.push({ label: 'Option 4', operation: 'equals', value: 'testValue1' });

        const result = await switchPlugin.actions[0].execute(input, config);

        expect(result).toEqual({});
        expect(mockCallback).toHaveBeenCalledTimes(2);
        expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.objectContaining({
                handle: 0
            })
        }));
        expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.objectContaining({
                handle: 3
            })
        }));
    });

    it('should handle no valid options', async () => {
        const input = {};
        const data = { testKey: 'invalidValue' };
        objectPath.get = jest.fn().mockReturnValue(data.testKey);

        const result = await switchPlugin.actions[0].execute(input, config);

        expect(result).toEqual({});
        expect(mockCallback).not.toHaveBeenCalled();
    });
});
