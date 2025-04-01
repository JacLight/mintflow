import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { logger } from '@mintflow/common';

// Extend the Express Request type to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

/**
 * Middleware to protect routes requiring authentication.
 * Handles both JWT tokens from the server and tokens from social logins.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): any {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        // Verify the token using the JWT secret
        const decoded = jwt.verify(token, ENV.JWT_SECRET);

        // Attach decoded user info to the request
        req.user = decoded;

        // Log successful authentication (debug level to avoid cluttering logs)
        logger.debug(`[AuthMiddleware] User authenticated: ${req.user.email || req.user.id || 'Unknown'}`);

        next();
    } catch (error) {
        // Log the error for debugging
        logger.error(`[AuthMiddleware] Token verification failed: ${(error as Error).message}`);

        // Try to extract more information about the token for debugging
        try {
            const decodedWithoutVerification = jwt.decode(token);
            logger.debug(`[AuthMiddleware] Token payload (without verification): ${JSON.stringify(decodedWithoutVerification)}`);
        } catch (decodeError) {
            logger.debug(`[AuthMiddleware] Could not decode token: ${(decodeError as Error).message}`);
        }

        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
}

/**
 * Middleware to check if the user has admin role.
 * This should be used after the authMiddleware.
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction): any {
    // Check if user exists and has admin role
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
}
