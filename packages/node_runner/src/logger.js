/**
 * Simple logger module for the node runner
 */
const logger = {
    info: (message, data = {}) => {
        console.log(`[INFO] ${message}`, data);
    },
    error: (message, data = {}) => {
        console.error(`[ERROR] ${message}`, data);
    },
    warn: (message, data = {}) => {
        console.warn(`[WARN] ${message}`, data);
    },
    debug: (message, data = {}) => {
        if (process.env.DEBUG) {
            console.debug(`[DEBUG] ${message}`, data);
        }
    }
};

module.exports = {
    logger
};
