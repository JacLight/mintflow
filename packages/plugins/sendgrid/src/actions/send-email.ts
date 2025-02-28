import axios from 'axios';
import { sendgridCommon } from '../common/index.js';

export const sendEmail = {
    name: "send_email",
    displayName: "Send Email",
    description: "Send a text or HTML email",
    inputSchema: {
        type: "object",
        properties: {
            to: {
                type: "array",
                description: "Emails of the recipients",
                items: {
                    type: "string"
                }
            },
            from: {
                type: "string",
                description: "Sender email, must be on your SendGrid"
            },
            from_name: {
                type: "string",
                description: "Sender name"
            },
            reply_to: {
                type: "string",
                description: "Email to receive replies on (defaults to sender)"
            },
            subject: {
                type: "string",
                description: "Email subject"
            },
            content_type: {
                type: "string",
                description: "Content type (text or html)",
                enum: ["text", "html"]
            },
            content: {
                type: "string",
                description: "Email content (HTML is only allowed if you selected HTML as type)"
            }
        },
        required: ["to", "from", "subject", "content_type", "content"]
    },
    outputSchema: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                description: "Whether the email was sent successfully"
            }
        }
    },
    exampleInput: {
        to: ["recipient@example.com"],
        from: "sender@yourdomain.com",
        from_name: "Your Name",
        subject: "Hello from MintFlow",
        content_type: "text",
        content: "This is a test email from MintFlow SendGrid plugin."
    },
    exampleOutput: {
        success: true
    },
    execute: async (input: any, auth: any) => {
        try {
            const { to, from, from_name, reply_to, subject, content_type, content } = input.data || {};

            // Validate required fields
            if (!to || !Array.isArray(to) || to.length === 0) {
                return { error: "Recipients (to) is required and must be an array" };
            }
            if (!from) {
                return { error: "Sender email (from) is required" };
            }
            if (!subject) {
                return { error: "Subject is required" };
            }
            if (!content_type || !["text", "html"].includes(content_type)) {
                return { error: "Content type must be either 'text' or 'html'" };
            }
            if (!content) {
                return { error: "Content is required" };
            }

            // Prepare request body
            const requestBody = {
                personalizations: to.map((email) => ({
                    to: [{ email: email.trim() }]
                })),
                from: {
                    email: from,
                    name: from_name
                },
                reply_to: {
                    email: reply_to || from
                },
                subject: subject,
                content: [
                    {
                        type: content_type === "text" ? "text/plain" : "text/html",
                        value: content
                    }
                ]
            };

            // Send request to SendGrid API
            await axios.post(
                `${sendgridCommon.baseUrl}/mail/send`,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return { success: true };
        } catch (error: any) {
            return {
                error: `Error sending email: ${error.message || 'Unknown error'}`,
                details: error.response?.data || {}
            };
        }
    }
};
