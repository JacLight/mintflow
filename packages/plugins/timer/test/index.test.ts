import { scheduleTask, getTasks, removeTask } from '../src/scheduler';
import timerPlugin from '../src/index';
import cron from 'node-cron';

jest.mock('../src/scheduler.ts');
jest.mock('node-cron');

describe('timerPlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('cron action', () => {
        it('should schedule a cron job with a valid expression', async () => {
            jest.spyOn(cron, 'validate').mockReturnValue(true);
            const input = { cron: '*/5 * * * *' };
            const result = await timerPlugin.actions[0].execute(input, {});
            expect(cron.validate).toHaveBeenCalledWith(input.cron);
            expect(scheduleTask).toHaveBeenCalled();
            expect(result).toContain('Cron job scheduled');
        });

        it('should throw an error for an invalid cron expression', async () => {
            jest.spyOn(cron, 'validate').mockReturnValue(false);
            const input = { cron: 'invalid-cron' };
            await expect(timerPlugin.actions[0].execute(input, {})).rejects.toThrow('Invalid cron expression');
        });
    });

    describe('interval action', () => {
        it('should schedule an interval task if none exists', async () => {
            (getTasks as jest.Mock).mockReturnValue([]);
            const input = { interval: 10 };
            const result = await timerPlugin.actions[1].execute(input, {});
            expect(getTasks).toHaveBeenCalled();
            expect(scheduleTask).toHaveBeenCalled();
            expect(result).toContain('Interval set for every 10 seconds');
        });

        it('should throw an error if an interval task already exists', async () => {
            (getTasks as jest.Mock).mockReturnValue([{ id: '1', type: 'interval' }]);
            const input = { interval: 10 };
            await expect(timerPlugin.actions[1].execute(input, {})).rejects.toThrow('An interval task is already scheduled');
        });
    });

    describe('timeout action', () => {
        it('should schedule a timeout task', async () => {
            const input = { timeout: 15 };
            const result = await timerPlugin.actions[2].execute(input, {});
            expect(scheduleTask).toHaveBeenCalled();
            expect(result).toContain('Timeout set for 15 seconds');
        });
    });

    describe('multiple workflows', () => {
        it('should handle multiple workflows running at the same time', async () => {
            (getTasks as jest.Mock).mockReturnValue([]);
            jest.spyOn(cron, 'validate').mockReturnValue(true);

            const cronInput = { cron: '*/5 * * * *' };
            const intervalInput = { interval: 10 };
            const timeoutInput = { timeout: 15 };

            const cronResult = await timerPlugin.actions[0].execute(cronInput, {});
            const intervalResult = await timerPlugin.actions[1].execute(intervalInput, {});
            const timeoutResult = await timerPlugin.actions[2].execute(timeoutInput, {});

            expect(cronResult).toContain('Cron job scheduled');
            expect(intervalResult).toContain('Interval set for every 10 seconds');
            expect(timeoutResult).toContain('Timeout set for 15 seconds');
        });
    });
});
