// mailPluginExec.ts

import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { ImapFlow } from 'imapflow';

interface ServerConfig {
    id: string;
    type: string;
    host: string;
    port: string;
    user: string;
    pass: string;
    ssl: string;
    tls: string;
}

interface MailInput {
    server: ServerConfig;
    template?: string;
    subject: string;
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    body: string;
    attach?: string;
    options?: string;
}

interface ReadMailInput {
    server: ServerConfig;
    folder?: string;
    filter?: string;
}

interface ChangeMailStatusInput {
    server: ServerConfig;
    messageId: string;
    status: 'read' | 'unread';
}

//smtp, imap, pop3
const mailPlugin = {
    id: "mail",
    name: "Mail Plugin",
    icon: "GrMail",
    description: "A plugin to process emails using a local Python script",
    documentation: "https://docs.example.com/mailPluginExec",
    inputSchema: {
        server: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                host: { type: 'string' },
                port: { type: 'string' },
                user: { type: 'string' },
                pass: { type: 'string' },
                ssl: { type: 'string' },
                tls: { type: 'string' },
            }
        },
        template: { type: 'string' },
        subject: { type: 'string' },
        from: { type: 'string' },
        to: { type: 'string' },
        cc: { type: 'string' },
        bcc: { type: 'string' },
        body: { type: 'string' },
        attach: { type: 'string' },
        options: { type: 'string' },
    },
    actions: [
        {
            name: 'sendMail',
            execute: async (input: MailInput) => {
                const { server, template, subject, from, to, cc, bcc, body, attach, options } = input;

                let transporterConfig = {
                    host: server.host,
                    port: parseInt(server.port),
                    secure: server.ssl === 'true', // true for 465, false for other ports
                    auth: {
                        user: server.user,
                        pass: server.pass,
                    },
                    tls: { rejectUnauthorized: false },
                };

                if (server.tls === 'true') {
                    transporterConfig.tls = {
                        rejectUnauthorized: false,
                    };
                }

                let transporter = nodemailer.createTransport(transporterConfig);

                let mailOptions = {
                    from: from,
                    to: to,
                    cc: cc,
                    bcc: bcc,
                    subject: subject,
                    text: body,
                    html: template,
                    attachments: attach ? [{ path: attach }] : [],
                };

                try {
                    let info = await transporter.sendMail(mailOptions);
                    console.log('Message sent: %s', info.messageId);
                    return { success: true, messageId: info.messageId };
                } catch (error) {
                    console.error('Error sending mail: %s', error);
                    return { success: false, error: (error as any).message };
                }
            }
        },
        {
            name: 'readMail',
            execute: async (input: ReadMailInput) => {
                const { server, folder, filter } = input;

                const client = new ImapFlow({
                    host: server.host,
                    port: parseInt(server.port),
                    secure: server.ssl === 'true',
                    auth: {
                        user: server.user,
                        pass: server.pass,
                    },
                    tls: server.tls === 'true' ? { rejectUnauthorized: false } : undefined,
                });

                try {
                    await client.connect();
                    await client.mailboxOpen(folder || 'INBOX');

                    let searchCriteria: any = '1:*';
                    if (filter === 'unread') {
                        searchCriteria = ['UNSEEN'];
                    } else if (filter === 'sent') {
                        await client.mailboxOpen('Sent');
                    } else if (filter === 'draft') {
                        await client.mailboxOpen('Drafts');
                    }

                    let messages = [];
                    for await (let message of client.fetch(searchCriteria, { envelope: true, source: true })) {
                        let parsed = await simpleParser(message.source);
                        messages.push(parsed);
                    }

                    await client.logout();
                    return { success: true, messages: messages };
                } catch (error) {
                    console.error('Error reading mail: %s', error);
                    return { success: false, error: (error as Error).message };
                }
            }
        },
        {
            name: 'changeMailStatus',
            execute: async (input: ChangeMailStatusInput) => {
                const { server, messageId, status } = input;

                const client = new ImapFlow({
                    host: server.host,
                    port: parseInt(server.port),
                    secure: server.ssl === 'true',
                    auth: {
                        user: server.user,
                        pass: server.pass,
                    },
                    tls: server.tls === 'true' ? { rejectUnauthorized: false } : undefined,
                });

                try {
                    await client.connect();
                    await client.mailboxOpen('INBOX');

                    let result;
                    if (status === 'read') {
                        result = await client.messageFlagsAdd(messageId, ['\\Seen']);
                    } else if (status === 'unread') {
                        result = await client.messageFlagsRemove(messageId, ['\\Seen']);
                    }

                    await client.logout();
                    return { success: true, result: result };
                } catch (error) {
                    console.error('Error changing mail status: %s', error);
                    return { success: false, error: (error as Error).message };
                }
            }
        }
    ],
};

export default mailPlugin;
