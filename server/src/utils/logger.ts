import { createLogger, format, transports } from 'winston';

/**
 * Winston logger with structured JSON logs for production
 * and colorful, human-readable logs for development.
 */
export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json() // Structured JSON logs for production
    ),
    defaultMeta: { service: 'phd-level-runner' },
    transports: [new transports.Console()]
});

// If in development mode, use a prettier console format
if (process.env.NODE_ENV !== 'production') {
    logger.clear(); // Remove default JSON transport
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(), // Add colors based on log level
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ level, message, timestamp, service, ...meta }) => {
                let metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                return `[${timestamp}] ${level}: ${message} (${service}) ${metaString}`;
            })
        )
    }));
}
