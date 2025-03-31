import { logger } from '@mintflow/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handler middleware.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error(`[ErrorHandler] ${err.message}`, { stack: err.stack });

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
}
