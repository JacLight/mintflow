import { BaseTwilioService } from './base.js';
import { TwilioSetupConfig } from '../types/config.js';
import { configSchema } from '../schemas/config.js';
import { CallInstance } from 'twilio/lib/rest/insights/v1/call.js';
import { logger } from '@mintflow/common';
import axios from 'axios';

export class ConfigurationService extends BaseTwilioService {
    async configureService(config: TwilioSetupConfig) {
        try {
            // Validate config
            await configSchema.setup.parseAsync(config);

            const setupResults = {
                application: null as any,
                phoneNumber: null as any,
                configured: false
            };

            // Check existing setup
            const apps = await this.client.applications.list({
                friendlyName: config.friendlyName
            });

            if (apps.length > 0) {
                setupResults.application = apps[0];
                setupResults.configured = true;
                return setupResults;
            }

            if (!config.autoSetup) {
                return setupResults;
            }

            // Create new application
            setupResults.application = await this.client.applications.create({
                friendlyName: config.friendlyName,
                voiceUrl: `${config.baseUrl}/voice`,
                voiceMethod: 'POST',
                statusCallback: `${config.baseUrl}/status`,
                statusCallbackMethod: 'POST'
            });

            if (config.phoneConfig) {
                // Check for existing numbers
                const numbers = await this.client.incomingPhoneNumbers.list();

                if (numbers.length > 0) {
                    // Update existing number
                    setupResults.phoneNumber = await this.client.incomingPhoneNumbers(numbers[0].sid)
                        .update({
                            voiceApplicationSid: setupResults.application.sid,
                            voiceUrl: `${config.baseUrl}/voice`,
                            statusCallback: `${config.baseUrl}/status`
                        });
                } else {
                    // Purchase new number
                    const availableNumbers = await this.client.availablePhoneNumbers('US')
                        .local
                        .list({
                            areaCode: parseInt(config.phoneConfig.areaCode || '0'),
                            // capabilities: config.phoneConfig.capabilities
                        });

                    if (availableNumbers.length > 0) {
                        setupResults.phoneNumber = await this.client.incomingPhoneNumbers
                            .create({
                                phoneNumber: availableNumbers[0].phoneNumber,
                                voiceApplicationSid: setupResults.application.sid,
                                voiceUrl: `${config.baseUrl}/voice`,
                                statusCallback: `${config.baseUrl}/status`
                            });
                    }
                }
            }

            setupResults.configured = true;
            return setupResults;

        } catch (error: any) {
            this.logError(error, { config });
            throw new Error(`Configuration failed: ${error.message}`);
        }
    }

    async validateSetup(config: TwilioSetupConfig): Promise<{
        isValid: boolean;
        issues: string[];
    }> {
        const issues: string[] = [];
        let isValid = true;

        try {
            // Check application
            const apps = await this.client.applications.list({
                friendlyName: config.friendlyName
            });

            if (apps.length === 0) {
                issues.push('TwiML application not found');
                isValid = false;
            }

            // Check phone numbers
            const numbers = await this.client.incomingPhoneNumbers.list();
            if (numbers.length === 0) {
                issues.push('No phone numbers configured');
                isValid = false;
            } else {
                // Verify number configuration
                const number = numbers[0];
                if (!number.voiceUrl) {
                    issues.push('Voice URL not configured on phone number');
                    isValid = false;
                }
                if (!number.statusCallback) {
                    issues.push('Status callback not configured on phone number');
                    isValid = false;
                }
            }

            // Verify webhook accessibility
            try {
                const webhookTest = await axios.head(`${config.baseUrl}/voice`);
                if (webhookTest.status !== 200) {
                    issues.push('Webhook endpoint not accessible');
                    isValid = false;
                }
            } catch {
                issues.push('Failed to verify webhook accessibility');
                isValid = false;
            }

        } catch (error: any) {
            this.logError(error, { config });
            issues.push(`Validation failed: ${error.message}`);
            isValid = false;
        }

        return { isValid, issues };
    }

    async cleanup(config: TwilioSetupConfig): Promise<void> {
        try {
            // Remove application
            const apps = await this.client.applications.list({
                friendlyName: config.friendlyName
            });

            for (const app of apps) {
                await this.client.applications(app.sid).remove();
            }

            // Reset phone numbers
            const numbers = await this.client.incomingPhoneNumbers.list();
            for (const number of numbers) {
                const updatedNumber: any = {
                    voiceApplicationSid: null,
                    voiceUrl: null,
                    statusCallback: null
                }
                await this.client.incomingPhoneNumbers(number.sid)
                    .update(updatedNumber);
            }

            logger.info('Cleanup completed successfully', {
                friendlyName: config.friendlyName
            });

        } catch (error: any) {
            this.logError(error, { config });
            throw new Error(`Cleanup failed: ${error.message}`);
        }
    }

    async listNumbers(): Promise<any[]> {
        try {
            const numbers = await this.client.incomingPhoneNumbers.list();
            return numbers;
        } catch (error: any) {
            this.logError(error);
            throw new Error(`Failed to list phone numbers: ${error.message}`);
        }
    }
}
