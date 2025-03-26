import { actions } from './actions/index.js';
import { RazorpayCredentials } from './utils/index.js';

const razorpayPlugin = {
    name: "Razorpay",
    icon: "https://cdn.activepieces.com/pieces/razorpay.png",
    description: "Payment gateway for businesses in India",
    groups: ["payment"],
    tags: ["payment","finance","money","transaction","billing"],
    version: '1.0.0',
    id: "razorpay",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            keyID: {
                type: "string",
                description: "Razorpay Key ID"
            },
            keySecret: {
                type: "string",
                description: "Razorpay Key Secret"
            }
        },
        required: ["keyID", "keySecret"]
    },
    outputSchema: {
        type: "object",
        properties: {
            keyID: {
                type: "string",
                description: "Razorpay Key ID"
            },
            keySecret: {
                type: "string",
                description: "Razorpay Key Secret"
            }
        }
    },
    exampleInput: {
        keyID: "rzp_test_1234567890",
        keySecret: "abcdefghijklmnopqrstuvwxyz"
    },
    exampleOutput: {
        keyID: "rzp_test_1234567890",
        keySecret: "abcdefghijklmnopqrstuvwxyz"
    },
    documentation: "https://razorpay.com/docs/api/",
    method: "exec",
    actions: actions
};

export default razorpayPlugin;
