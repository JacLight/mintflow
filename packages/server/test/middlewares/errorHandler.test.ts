import { errorHandler } from '../../src/middlewares/errorHandler';
import { logger } from '@mintflow/common';

jest.mock('@mintflow/common');

describe('errorHandler', () => {
    it('should handle errors and respond with status 500', () => {
        const err = new Error('Test error');
        const req = {} as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(logger.error).toHaveBeenCalledWith('[ErrorHandler] Test error', { stack: err.stack });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });

    // Add more tests for different error scenarios...
});
