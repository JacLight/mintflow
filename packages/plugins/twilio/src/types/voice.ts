export interface VoiceCallOptions {
    to: string;
    from?: string;
    twiml?: string;
    record?: boolean;
    timeout?: number;
    machineDetection?: 'Enable' | 'DetectMessageEnd';
}