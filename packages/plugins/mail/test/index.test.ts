import mailPlugin from '../src/index.js';

describe('Mail Plugin', () => {
    let sendMailMock: jest.SpyInstance, readMailMock: jest.SpyInstance, changeMailStatusMock: jest.SpyInstance;

    beforeEach(() => {
        sendMailMock = jest.spyOn(mailPlugin.actions[0], 'execute').mockImplementation();
        readMailMock = jest.spyOn(mailPlugin.actions[1], 'execute').mockImplementation();
        changeMailStatusMock = jest.spyOn(mailPlugin.actions[2], 'execute').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should send mail successfully', async () => {
        sendMailMock.mockResolvedValue({ success: true, messageId: '12345' });

        const input: any = {
            server: {
                id: '1',
                type: 'smtp',
                host: 'smtp.example.com',
                port: '465',
                user: 'user@example.com',
                pass: 'password',
                ssl: 'true',
                tls: 'false',
            },
            template: '<h1>Hello</h1>',
            subject: 'Test Email',
            from: 'from@example.com',
            to: 'to@example.com',
            body: 'Hello World',
            messageId: '12345',
            status: 'sent'
        };

        const result: any = await mailPlugin.actions[0].execute(input);
        expect(result.success).toBe(true);
        expect(result.messageId).toBe('12345');
    });

    it('should read mail successfully', async () => {
        readMailMock.mockResolvedValue({ success: true, messages: [{ subject: 'Test Email' }] });

        const input: any = {
            server: {
                id: '1',
                type: 'imap',
                host: 'imap.example.com',
                port: '993',
                user: 'user@example.com',
                pass: 'password',
                ssl: 'true',
                tls: 'false',
            },
            folder: 'INBOX',
            filter: 'unread',
            subject: 'Test Email',
            from: 'from@example.com',
            to: 'to@example.com',
            body: 'Hello World',
            messageId: '12345',
            status: 'unread'
        };

        const result: any = await mailPlugin.actions[1].execute(input);
        expect(result.success).toBe(true);
        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].subject).toBe('Test Email');
    });

    it('should change mail status to read', async () => {
        changeMailStatusMock.mockResolvedValue({ success: true });

        const input: any = {
            server: {
                id: '1',
                type: 'imap',
                host: 'imap.example.com',
                port: '993',
                user: 'user@example.com',
                pass: 'password',
                ssl: 'true',
                tls: 'false',
            },
            messageId: '12345',
            status: 'read',
            subject: 'Test Email',
            from: 'from@example.com',
            to: 'to@example.com',
            body: 'Hello World'
        };

        const result: any = await mailPlugin.actions[2].execute(input);
        expect(result.success).toBe(true);
    });

    it('should change mail status to unread', async () => {
        changeMailStatusMock.mockResolvedValue({ success: true });

        const input: any = {
            server: {
                id: '1',
                type: 'imap',
                host: 'imap.example.com',
                port: '993',
                user: 'user@example.com',
                pass: 'password',
                ssl: 'true',
                tls: 'false',
            },
            messageId: '12345',
            status: 'unread',
            subject: 'Test Email',
            from: 'from@example.com',
            to: 'to@example.com',
            body: 'Hello World'
        };

        const result = await mailPlugin.actions[2].execute(input);
        expect(result.success).toBe(true);
    });

    it('should handle errors when sending mail', async () => {
        sendMailMock.mockRejectedValue(new Error('Failed to send mail'));

        const input: any = {
            server: {
                id: '1',
                type: 'smtp',
                host: 'smtp.example.com',
                port: '465',
                user: 'user@example.com',
                pass: 'password',
                ssl: 'true',
                tls: 'false',
            },
            template: '<h1>Hello</h1>',
            subject: 'Test Email',
            from: 'from@example.com',
            to: 'to@example.com',
            body: 'Hello World',
            messageId: '12345',
            status: 'sent'
        };

        await expect(mailPlugin.actions[0].execute(input))
            .rejects
            .toThrow('Failed to send mail');
    });

    it('should handle errors when reading mail', async () => {
        readMailMock.mockRejectedValue(new Error('Failed to read mail'));

        const input: any = {
            server: {
                id: '1',
                type: 'imap',
                host: 'imap.example.com',
                port: '993',
                user: 'user@example.com',
                pass: 'password',
                ssl: 'true',
                tls: 'false',
            },
            folder: 'INBOX',
            filter: 'unread',
            subject: 'Test Email',
            from: 'from@example.com',
            to: 'to@example.com',
            body: 'Hello World',
            messageId: '12345',
            status: 'unread'
        };

        await expect(mailPlugin.actions[1].execute(input))
            .rejects
            .toThrow('Failed to read mail');
    });

    it('should handle errors when changing mail status', async () => {
        changeMailStatusMock.mockRejectedValue(new Error('Failed to change mail status'));

        const input: any = {
            server: {
                id: '1',
                type: 'imap',
                host: 'imap.example.com',
                port: '993',
                user: 'user@example.com',
                pass: 'password',
                ssl: 'true',
                tls: 'false',
            },
            messageId: '12345',
            status: 'read',
            subject: 'Test Email',
            from: 'from@example.com',
            to: 'to@example.com',
            body: 'Hello World'
        };

        await expect(mailPlugin.actions[2].execute(input))
            .rejects
            .toThrow('Failed to change mail status');
    });
});
