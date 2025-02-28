import execPlugin from '../src/index';

describe('Exec Plugin', () => {
    it('should execute a shell command successfully', async () => {
        const input = { command: 'echo Hello, World!' };
        const result = await execPlugin.actions[0].execute(input, {}) as { success: boolean, message: string };
        expect(result).toEqual({ success: true, message: 'Hello, World!\n' });
    });

    it('should handle command execution errors', async () => {
        const input = { command: 'invalidcommand' };
        const result = await execPlugin.actions[0].execute(input, {}) as { success: boolean, message: string };
        expect(result.success).toBe(false);
        expect(result.message).toContain('not found');
    });
});
