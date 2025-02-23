import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';


let _dirname;
if (typeof __dirname !== 'undefined') {
    _dirname = __dirname;
} else {
    const __filename = fileURLToPath(import.meta.url);
    _dirname = path.dirname(__filename);
}
const logDirectory = path.join(_dirname, '../logs');

// Ensure the logs directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

/**
 * Winston logger with structured JSON logs for production
 * and colorful, human-readable logs for development.
 */
export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        // format.errors({ stack: true }),
        format.json() // Structured JSON logs for production
    ),
    defaultMeta: { service: 'phd-level-runner' },
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logDirectory, 'activity.log') })
    ]
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

