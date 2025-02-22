import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';

const logDirectory = path.join(__dirname, '../logs');

// Ensure the logs directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Configure logger
export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logDirectory, 'activity.log') })
    ]
});
