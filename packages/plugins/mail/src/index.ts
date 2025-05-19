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
  ssl: string | boolean;
  tls: string | boolean;
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

const getServerConfig = (serverConfig: ServerConfig) => {
  const { host, port, user, pass, ssl, tls } = serverConfig || {};
  const secure = ssl === 'true' || ssl === true;
  const tlsConfig =
    tls === 'true' || tls === true ? { rejectUnauthorized: false } : undefined;
  const config = {
    host: host,
    port: parseInt(port),
    secure: secure,
    auth: {
      user: user,
      pass: pass,
    },
    tls: tlsConfig,
  };

  return config;
};

//smtp, imap, pop3
const mailPlugin = {
  id: 'mail',
  name: 'Mail',
  icon: 'GrMail',
  description: 'A plugin to process emails using a local Python script',
  groups: ['communication'],
  tags: ['email', 'messaging', 'communication', 'notification'],
  version: '1.0.0',
  documentation: 'https://docs.example.com/mailPluginExec',
  inputSchema: {
    type: 'object',
    properties: {
      server: {
        type: 'object',
        collapsible: true,
        properties: {
          type: { type: 'string', enum: ['smtp', 'imap', 'pop3'] },
          host: { type: 'string', group: 'host' },
          port: { type: 'string', group: 'host' },
          user: { type: 'string', group: 'user' },
          pass: { type: 'string', group: 'user' },
          ssl: { type: 'boolean', group: 'ssl' },
          tls: { type: 'boolean', group: 'ssl' },
        },
      },
      subject: { type: 'string' },
      from: { type: 'string' },
      to: { type: 'string' },
      cc: { type: 'string', group: 'bcc' },
      bcc: { type: 'string', group: 'bcc' },
      body: { type: 'string', 'x-control': 'richtext' },
      attachment: { type: 'string', 'x-control': 'file', collapsible: true },
      options: { type: 'string' },
    },
  },
  actions: [
    {
      name: 'connect',
      description: 'Connect to the mail server',
      execute: async (input: MailInput) => {
        const client = new ImapFlow(getServerConfig(input.server));
        try {
          await client.connect();
          console.log('Connected to mail server');
          await client.logout();
          return { success: true };
        } catch (error) {
          console.error('Error connecting to mail server: %s', error);
          return { success: false, error: (error as Error).message };
        }
      },
    },
    {
      name: 'sendMail',
      execute: async (input: MailInput) => {
        const {
          server,
          template,
          subject,
          from,
          to,
          cc,
          bcc,
          body,
          attach,
          options,
        } = input;
        let transporter = nodemailer.createTransport(getServerConfig(server));
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
      },
    },
    {
      name: 'readMail',
      execute: async (input: ReadMailInput) => {
        const { server, folder, filter } = input;
        const client = new ImapFlow(getServerConfig(server));
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
          for await (let message of client.fetch(searchCriteria, {
            envelope: true,
            source: true,
          })) {
            let parsed = await simpleParser(message.source);
            messages.push(parsed);
          }

          await client.logout();
          return { success: true, messages: messages };
        } catch (error) {
          console.error('Error reading mail: %s', error);
          return { success: false, error: (error as Error).message };
        }
      },
    },
    {
      name: 'changeMailStatus',
      execute: async (input: ChangeMailStatusInput) => {
        const { server, messageId, status } = input;
        const client = new ImapFlow(getServerConfig(server));
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
      },
    },
  ],
};

export default mailPlugin;
