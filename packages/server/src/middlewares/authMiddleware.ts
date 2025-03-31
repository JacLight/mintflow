import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * Middleware to protect routes requiring authentication.
 */
export function authMiddleware(req: Request & { user: any }, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        req.user = decoded; // Attach decoded user info to the request
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
}
