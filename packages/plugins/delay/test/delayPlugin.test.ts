import delayPlugin from '../src/index';

describe('delayPlugin', () => {
    const mockInput = {
        delay: 1,
        delayIn: 'second',
        strategy: 'collate',
        data: { message: 'test' }
    };

    it('should collate data correctly', async () => {
        const result = await delayPlugin.actions[0].execute(mockInput, {});
        expect(result).toEqual([{ message: 'test' }]);
    });

    it('should delay each data correctly', async () => {
        const input = { ...mockInput, strategy: 'delay-each' };
        const start = Date.now();
        const result = await delayPlugin.actions[0].execute(input, {});
        const end = Date.now();
        expect(result).toEqual([{ message: 'test', delayed: true }]);
        expect(end - start).toBeGreaterThanOrEqual(1000);
    });

    it('should send the last data correctly', async () => {
        const input = { ...mockInput, strategy: 'send-last' };
        await delayPlugin.actions[0].execute(mockInput, {});
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([{ message: 'test' }]);
    });

    it('should send the first data correctly', async () => {
        const input = { ...mockInput, strategy: 'send-first' };
        await delayPlugin.actions[0].execute(mockInput, {});
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([{ message: 'test' }]);
    });

    it('should handle empty data store', async () => {
        const input = { ...mockInput, strategy: 'collate' };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([]);
    });

    it('should handle invalid delayIn value', async () => {
        const input = { ...mockInput, delayIn: 'invalid' };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([{ message: 'test' }]);
    });

    it('should handle missing delay value', async () => {
        const input = { ...mockInput, delay: undefined };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([{ message: 'test' }]);
    });

    it('should handle missing strategy value', async () => {
        const input = { ...mockInput, strategy: undefined };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([{ message: 'test' }]);
    });
});
