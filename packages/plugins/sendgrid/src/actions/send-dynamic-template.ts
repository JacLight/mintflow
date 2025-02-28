import axios from 'axios';
import { sendgridCommon } from '../common/index.js';

export const sendDynamicTemplate = {
    name: "send_dynamic_template",
    displayName: "Send Dynamic Template",
    description: "Send an email using a dynamic template",
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
            template_id: {
                type: "string",
                description: "Dynamic template ID"
            },
            template_data: {
                type: "object",
                description: "Dynamic template data"
            }
        },
        required: ["to", "from", "template_id", "template_data"]
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
        template_id: "d-f3ecde774b7143e6b3f3ec514608253d",
        template_data: {
            name: "John Doe",
            company: "Acme Inc.",
            verification_link: "https://example.com/verify"
        }
    },
    exampleOutput: {
        success: true
    },
    execute: async (input: any, auth: any) => {
        try {
            const { to, from, from_name, reply_to, template_id, template_data } = input.data || {};

            // Validate required fields
            if (!to || !Array.isArray(to) || to.length === 0) {
                return { error: "Recipients (to) is required and must be an array" };
            }
            if (!from) {
                return { error: "Sender email (from) is required" };
            }
            if (!template_id) {
                return { error: "Template ID is required" };
            }
            if (!template_data || typeof template_data !== 'object') {
                return { error: "Template data is required and must be an object" };
            }

            // Prepare request body
            const requestBody = {
                personalizations: to.map((email) => ({
                    to: [{ email: email.trim() }],
                    dynamic_template_data: template_data
                })),
                from: {
                    email: from,
                    name: from_name
                },
                reply_to: {
                    email: reply_to || from
                },
                template_id
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
                error: `Error sending template email: ${error.message || 'Unknown error'}`,
                details: error.response?.data || {}
            };
        }
    }
};
