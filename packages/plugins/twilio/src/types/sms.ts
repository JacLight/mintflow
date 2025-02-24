export interface SMSMessage {
    to: string;
    from?: string;
    body: string;
    mediaUrl?: string[];
    priority?: 'high' | 'normal' | 'low';
    tags?: string[];
}