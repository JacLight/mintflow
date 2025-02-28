import { textToQrcode } from './actions/text-to-qrcode.js';

const qrcodePlugin = {
    name: "qrcode",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1xcmNvZGUiPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjUiIHg9IjMiIHk9IjMiIHJ4PSIxIi8+PHJlY3Qgd2lkdGg9IjUiIGhlaWdodD0iNSIgeD0iMTYiIHk9IjMiIHJ4PSIxIi8+PHJlY3Qgd2lkdGg9IjUiIGhlaWdodD0iNSIgeD0iMyIgeT0iMTYiIHJ4PSIxIi8+PHBhdGggZD0iTTIxIDE2aC0zYTIgMiAwIDAgMC0yIDJ2MyIvPjxwYXRoIGQ9Ik0yMSAyMXYuMDEiLz48cGF0aCBkPSJNMTIgN3YzYTIgMiAwIDAgMCAyIDJoMyIvPjxwYXRoIGQ9Ik0xMiAxMnYuMDEiLz48cGF0aCBkPSJNMTIgMTZ2LjAxIi8+PHBhdGggZD0iTTE2IDEyaC4wMSIvPjxwYXRoIGQ9Ik0yMSAxMnYuMDEiLz48cGF0aCBkPSJNNyAxMmguMDEiLz48cGF0aCBkPSJNNyAxNnYuMDEiLz48L3N2Zz4=",
    description: "Generate QR codes from text or URLs",
    id: "qrcode",
    runner: "node",
    inputSchema: {
        type: "object",
        required: ["action", "input"],
        properties: {
            action: {
                type: "string",
                enum: ["text_to_qrcode"],
                description: "The action to perform"
            },
            input: {
                type: "object",
                description: "The input for the action"
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            qrcode: {
                type: "string",
                description: "The generated QR code as a base64 string or binary data"
            },
            error: {
                type: "string",
                description: "Error message if the operation failed"
            }
        }
    },
    exampleInput: {
        action: "text_to_qrcode",
        input: {
            text: "https://mintflow.com",
            outputFormat: "base64"
        }
    },
    exampleOutput: {
        qrcode: "data:image/png;base64,ABC123..."
    },
    documentation: "https://github.com/soldair/node-qrcode",
    method: "exec",
    actions: [
        textToQrcode
    ]
};

export default qrcodePlugin;
