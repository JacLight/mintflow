import { Socket } from 'socket.io';
import { logger } from '@mintflow/common';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';

/**
 * Socket.IO authentication middleware
 * Verifies the JWT token in the handshake query or headers
 * 
 * @param socket The Socket.IO socket
 * @param next Callback function
 */
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
        // In development mode, skip authentication for easier debugging
        if (ENV.NODE_ENV === 'development') {
            logger.debug('[Socket] Development mode - skipping authentication');
            // Set a demo user for development
            (socket as any).user = { 
                id: 'dev-user-1',
                userId: 'dev-user-1',
                name: 'Development User',
                tenants: ['default']
            };
            return next();
        }
        
        // Get token from handshake query or headers
        const token =
            socket.handshake.auth.token ||
            socket.handshake.query.token as string ||
            socket.handshake.headers.authorization?.split(' ')[1];

        // If no token is provided and authentication is not required, allow connection
        if (!token && !ENV.SOCKET_AUTH_REQUIRED) {
            logger.debug('[Socket] No auth token provided, but auth is not required');
            // Set a guest user
            (socket as any).user = { 
                id: `guest-${socket.id}`,
                userId: `guest-${socket.id}`,
                name: 'Guest User',
                tenants: ['default']
            };
            return next();
        }

        // If no token is provided and authentication is required, reject connection
        if (!token && ENV.SOCKET_AUTH_REQUIRED) {
            logger.warn('[Socket] Authentication required but no token provided');
            return next(new Error('Authentication required'));
        }

        // Verify token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);

        // Attach user data to socket
        (socket as any).user = decoded;

        logger.debug(`[Socket] Authenticated user: ${(decoded as any).userId || 'unknown'}`);
        next();
    } catch (error: any) {
        logger.warn('[Socket] Authentication failed', { error: error.message });
        
        // In development or if auth is not required, allow connection with a warning
        if (ENV.NODE_ENV === 'development' || !ENV.SOCKET_AUTH_REQUIRED) {
            logger.warn('[Socket] Continuing without authentication in development mode');
            (socket as any).user = { 
                id: `guest-${socket.id}`,
                userId: `guest-${socket.id}`,
                name: 'Guest User (Auth Failed)',
                tenants: ['default']
            };
            return next();
        }
        
        next(new Error(`Authentication failed: ${error.message}`));
    }
};

/**
 * Socket.IO tenant authorization middleware
 * Ensures the user has access to the requested tenant
 * 
 * @param socket The Socket.IO socket
 * @param next Callback function
 */
export const socketTenantMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
        // In development mode, skip tenant verification for easier debugging
        if (ENV.NODE_ENV === 'development') {
            logger.debug('[Socket] Development mode - skipping tenant verification');
            return next();
        }
        
        const user = (socket as any).user;

        // If no user data is attached, authentication was not required
        if (!user && !ENV.SOCKET_AUTH_REQUIRED) {
            return next();
        }

        // Get tenant ID from handshake query
        const tenantId = socket.handshake.query.tenantId as string;

        // If no tenant ID is provided, allow connection
        if (!tenantId) {
            return next();
        }

        // Check if user has access to tenant
        // This is a simplified check - in a real implementation, you would check against a database
        const userTenants = user.tenants || [];
        if (!userTenants.includes(tenantId)) {
            logger.warn(`[Socket] User ${user.userId} does not have access to tenant ${tenantId}`);
            
            // In non-production, we'll be more lenient for testing
            if (ENV.NODE_ENV !== 'production') {
                logger.warn(`[Socket] Allowing access despite tenant mismatch in ${ENV.NODE_ENV} mode`);
                return next();
            }
            
            return next(new Error('Tenant access denied'));
        }

        logger.debug(`[Socket] User ${user.userId} authorized for tenant ${tenantId}`);
        next();
    } catch (error: any) {
        logger.warn('[Socket] Tenant authorization failed', { error: error.message });
        
        // Be more lenient in development mode
        if (ENV.NODE_ENV === 'development' || !ENV.SOCKET_AUTH_REQUIRED) {
            logger.warn('[Socket] Continuing despite tenant authorization failure in development mode');
            return next();
        }
        
        next(new Error(`Tenant authorization failed: ${error.message}`));
    }
};
