import * as twilio from 'twilio';

export class TwiMLTemplates {
    static getBasicVoiceResponse(message: string): string {
        const response = new twilio.twiml.VoiceResponse();
        response.say(message);
        return response.toString();
    }

    static getGatherInputResponse(options: {
        message: string;
        action: string;
        method?: string;
        timeout?: number;
        numDigits?: number;
        input?: string[];
    }): string {
        const response = new twilio.twiml.VoiceResponse();
        const input: any = options.input || ['dtmf', 'speech'];
        const gather = response.gather({
            input,
            timeout: options.timeout || 5,
            numDigits: options.numDigits,
            action: options.action,
            method: options.method || 'POST'
        });

        gather.say(options.message);
        return response.toString();
    }

    static getMenuResponse(options: {
        greeting: string;
        menuOptions: { digit: string; description: string }[];
        action: string;
    }): string {
        const response = new twilio.twiml.VoiceResponse();
        const input: any = 'dtmf';//['dtmf', 'speech'];
        const gather = response.gather({
            input,
            timeout: 5,
            action: options.action
        });

        gather.say(options.greeting);

        options.menuOptions.forEach(option => {
            gather.say(`Press ${option.digit} for ${option.description}`);
        });

        // If no input received
        response.say('We did not receive any input. Goodbye.');
        response.hangup();

        return response.toString();
    }

    static getConferenceResponse(options: {
        roomName: string;
        waitUrl?: string;
        startOnEnter?: boolean;
        endOnExit?: boolean;
    }): string {
        const response = new twilio.twiml.VoiceResponse();
        const dial = response.dial();
        dial.conference(options.roomName as any);
        // dial.conference(options.roomName as any, {
        //     waitUrl: options.waitUrl,
        //     startConferenceOnEnter: options.startOnEnter,
        //     endConferenceOnExit: options.endOnExit
        // });

        return response.toString();
    }
}