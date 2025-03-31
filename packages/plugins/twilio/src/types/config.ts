import { TwilioBaseConfig } from './common.js';

export interface TwilioSetupConfig extends TwilioBaseConfig {
    friendlyName: string;
    autoSetup: boolean;
    phoneConfig?: PhoneNumberConfig;
}

export interface PhoneNumberConfig {
    areaCode?: string;
    capabilities: {
        voice: boolean;
        sms: boolean;
        mms: boolean;
    };
}
