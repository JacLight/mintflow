import modifyPlugin from '../src/index';

describe('modifyPlugin', () => {
    const flowContext = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should set a number value', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testNumber', to: 'number', value: '123' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(result.testNumber).toBe(123);
    });

    it('should set a boolean true value', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testTrue', to: 'true' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(result.testTrue).toBe(true);
    });

    it('should set a boolean false value', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testFalse', to: 'false' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(result.testFalse).toBe(false);
    });

    it('should set a timestamp value', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testTimestamp', to: 'timestamp' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(typeof result.testTimestamp).toBe('number');
    });

    it('should evaluate an expression', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testExpression', to: 'expression', value: '1 + 1' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(result.testExpression).toBe(2);
    });

    it('should move a value from data to flow', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'move', target: 'data', name: 'testMove', to: 'flow', value: 'movedValue' }
                ]
            },
            flowContext
        };
        const initialData = { testMove: 'valueToMove' };
        flowContext.get.mockResolvedValueOnce('valueToMove');
        const result: any = await modifyPlugin.actions[0].execute(initialData, config);
        expect(flowContext.set).toHaveBeenCalledWith('movedValue', 'valueToMove');
        expect(result.testMove).toBeUndefined();
    });

    it('should delete a value from data', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'delete', target: 'data', name: 'testDelete' }
                ]
            },
            flowContext
        };
        const initialData = { testDelete: 'valueToDelete' };
        const result: any = await modifyPlugin.actions[0].execute(initialData, config);
        expect(result.testDelete).toBeUndefined();
    });

    it('should delete a value from flow', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'delete', target: 'flow', name: 'testDeleteFlow' }
                ]
            },
            flowContext
        };
        await modifyPlugin.actions[0].execute({}, config);
        expect(flowContext.delete).toHaveBeenCalledWith('testDeleteFlow');
    });

    test('set operation with number', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testNumber', to: 'number', value: '42' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(result.testNumber).toBe(42);
    });

    test('set operation with boolean true', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testTrue', to: 'true' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(result.testTrue).toBe(true);
    });

    test('set operation with boolean false', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testFalse', to: 'false' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(result.testFalse).toBe(false);
    });

    test('set operation with timestamp', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testTimestamp', to: 'timestamp' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(typeof result.testTimestamp).toBe('number');
    });

    test('set operation with expression', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'set', target: 'data', name: 'testExpression', to: 'expression', value: '1 + 1' }
                ]
            },
            flowContext
        };
        const result: any = await modifyPlugin.actions[0].execute({}, config);
        expect(result.testExpression).toBe(2);
    });

    test('move operation from data to flow', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'move', target: 'data', name: 'testMove', to: 'flow', value: 'newFlowKey' }
                ]
            },
            flowContext
        };
        const input = { testMove: 'moveValue' };
        flowContext.get.mockResolvedValueOnce('moveValue');
        const result: any = await modifyPlugin.actions[0].execute(input, config);
        expect(flowContext.set).toHaveBeenCalledWith('newFlowKey', 'moveValue');
        expect(result.testMove).toBeUndefined();
    });

    test('delete operation from data', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'delete', target: 'data', name: 'testDelete' }
                ]
            },
            flowContext
        };
        const input = { testDelete: 'deleteValue' };
        const result: any = await modifyPlugin.actions[0].execute(input, config);
        expect(result.testDelete).toBeUndefined();
    });

    test('delete operation from flow', async () => {
        const config = {
            data: {
                values: [
                    { operation: 'delete', target: 'flow', name: 'testDeleteFlow' }
                ]
            },
            flowContext
        };
        await modifyPlugin.actions[0].execute({}, config);
        expect(flowContext.delete).toHaveBeenCalledWith('testDeleteFlow');
    });
});
