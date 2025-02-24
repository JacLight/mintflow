
export class TwilioValidation {
    static isRetryableError(error: any): boolean {
        const retryableCodes = [
            429, // Too Many Requests
            503, // Service Unavailable
            408  // Request Timeout
        ];
        return retryableCodes.includes(error.status) || error.code === 'ECONNRESET';
    }
}