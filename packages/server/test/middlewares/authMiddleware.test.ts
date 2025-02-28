import { authMiddleware } from '../../src/middlewares/authMiddleware';
import jwt from 'jsonwebtoken';
import { ENV } from '../../src/config/env';

jest.mock('jsonwebtoken');
jest.mock('../../src/config/env');

describe('authMiddleware', () => {
    it('should authenticate valid token', () => {
        const req = { headers: { authorization: 'Bearer valid_token' }, user: null } as any;
        const res = {} as any;
        const next = jest.fn();

        (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });

        authMiddleware(req, res, next);

        expect(req.user).toEqual({ userId: '1' });
        expect(next).toHaveBeenCalled();
    });

    // Add more tests for invalid token scenarios...
});
