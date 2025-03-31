import delayPlugin from '../src/index';

const mockInput = {
    type: 'wait',
    strategy: 'collate',
    delay: 1,
    delayIn: 'second',
    data: { message: 'test' }
};

describe('delayPlugin', () => {
    it('should collate data correctly', async () => {
        const result = await delayPlugin.actions[0].execute(mockInput, {});
        expect(result).toEqual([mockInput.data]);
    });

    it('should delay each data correctly', async () => {
        const input = { ...mockInput, strategy: 'delay-each' };
        const start = Date.now();
        const result = await delayPlugin.actions[0].execute(input, {});
        const end = Date.now();
        expect(result).toEqual([{ ...mockInput.data, delayed: true }]);
        expect(end - start).toBeGreaterThanOrEqual(1000);
    });

    it('should send the last data correctly', async () => {
        await delayPlugin.actions[0].execute(mockInput, {});
        const input = { ...mockInput, strategy: 'send-last' };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([mockInput.data]);
    });

    it('should send the first data correctly', async () => {
        await delayPlugin.actions[0].execute(mockInput, {});
        const input = { ...mockInput, strategy: 'send-first' };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([mockInput.data]);
    });

    it('should handle empty data store', async () => {
        const input = { ...mockInput, data: null };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([]);
    });

    it('should handle invalid delayIn value', async () => {
        const input = { ...mockInput, delayIn: 'invalid' };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([mockInput.data]);
    });

    it('should handle missing delay value', async () => {
        const input = { ...mockInput, delay: undefined };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([mockInput.data]);
    });

    it('should handle missing strategy value', async () => {
        const input = { ...mockInput, strategy: undefined };
        const result = await delayPlugin.actions[0].execute(input, {});
        expect(result).toEqual([mockInput.data]);
    });
});
