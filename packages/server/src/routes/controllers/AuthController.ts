import { Request, Response } from 'express';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { logger } from '@mintflow/common';
import { ENV } from '../../config/env.js';
import { UserService } from '../../services/UserService.js';

const userService = new UserService();

/**
 * Login a user with email and password.
 */
export async function login(req: Request, res: Response): Promise<any> {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // In a real implementation, you would validate the user's credentials
        // against your database and check the password hash
        // For now, we'll just create a token for any valid email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Find user by email
        let user;
        try {
            // This is a simplified example - in a real app, you would query your database
            const users = await userService.getAllUsers();
            user = users.find((u: any) => u.email === email);

            if (!user) {
                // For demo purposes, create a new user if not found
                user = await userService.createUser({
                    userId: generateUserId(),
                    email,
                    name: email.split('@')[0],
                    role: 'user',
                    createdAt: new Date().toISOString()
                });
                logger.info(`[AuthController] Created new user: ${user.userId}`);
            }
        } catch (error) {
            logger.error(`[AuthController] Error finding/creating user: ${(error as Error).message}`);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Return user info and token
        return res.status(200).json({
            user: {
                id: user.userId,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    } catch (err: any) {
        logger.error(`[AuthController] Login error: ${err.message}`);
        return res.status(500).json({ error: 'Failed to login' });
    }
}

/**
 * Register a new user.
 */
export async function register(req: Request, res: Response): Promise<any> {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user already exists
        try {
            const users = await userService.getAllUsers();
            const existingUser = users.find((u: any) => u.email === email);

            if (existingUser) {
                return res.status(409).json({ error: 'User with this email already exists' });
            }
        } catch (error) {
            logger.error(`[AuthController] Error checking existing user: ${(error as Error).message}`);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Create new user
        const newUser = await userService.createUser({
            userId: generateUserId(),
            email,
            name: name || email.split('@')[0],
            role: 'user',
            createdAt: new Date().toISOString()
        });

        // Generate JWT token
        const token = generateToken(newUser);

        // Return user info and token
        return res.status(201).json({
            user: {
                id: newUser.userId,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            },
            token
        });
    } catch (err: any) {
        logger.error(`[AuthController] Registration error: ${err.message}`);
        return res.status(500).json({ error: 'Failed to register user' });
    }
}

/**
 * Refresh an authentication token.
 */
export async function refreshToken(req: Request, res: Response): Promise<any> {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        try {
            // Verify the token
            const jwtSecret = ENV.JWT_SECRET || 'default-secret-key-for-development';
            const decoded = jwt.verify(token, jwtSecret as Secret) as any;

            // Check if token is about to expire (less than 5 minutes remaining)
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp - now > 300) {
                // Token is still valid for more than 5 minutes, return the same token
                return res.status(200).json({ token });
            }

            // Find the user
            let user;
            try {
                user = await userService.getUserById(decoded.id);
            } catch (error) {
                logger.error(`[AuthController] Error finding user for token refresh: ${(error as Error).message}`);
                return res.status(404).json({ error: 'User not found' });
            }

            // Generate a new token
            const newToken = generateToken(user);

            // Return the new token
            return res.status(200).json({ token: newToken });
        } catch (error) {
            logger.error(`[AuthController] Token refresh error: ${(error as Error).message}`);
            return res.status(403).json({ error: 'Invalid token' });
        }
    } catch (err: any) {
        logger.error(`[AuthController] Token refresh error: ${err.message}`);
        return res.status(500).json({ error: 'Failed to refresh token' });
    }
}

/**
 * Verify a token and return the user info.
 */
export async function verifyToken(req: Request, res: Response): Promise<any> {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        try {
            // Verify the token
            const jwtSecret = ENV.JWT_SECRET || 'default-secret-key-for-development';
            const decoded = jwt.verify(token, jwtSecret as Secret) as any;

            // Find the user
            let user;
            try {
                user = await userService.getUserById(decoded.id);
            } catch (error) {
                logger.error(`[AuthController] Error finding user for token verification: ${(error as Error).message}`);
                return res.status(404).json({ error: 'User not found' });
            }

            // Return the user info
            return res.status(200).json({
                user: {
                    id: user.userId,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        } catch (error) {
            logger.error(`[AuthController] Token verification error: ${(error as Error).message}`);
            return res.status(403).json({ error: 'Invalid token' });
        }
    } catch (err: any) {
        logger.error(`[AuthController] Token verification error: ${err.message}`);
        return res.status(500).json({ error: 'Failed to verify token' });
    }
}

/**
 * Generate a JWT token for a user.
 */
function generateToken(user: any): string {
    // Ensure JWT_SECRET is a string
    const jwtSecret = ENV.JWT_SECRET || 'default-secret-key-for-development';

    // Create the payload
    const payload = {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        // Add expiration directly in the payload
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
    };

    // Use a simpler approach without options
    return jwt.sign(payload, jwtSecret as Secret);
}

/**
 * Generate a unique user ID.
 */
function generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate email format.
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
