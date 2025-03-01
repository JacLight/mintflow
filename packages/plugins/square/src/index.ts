import { triggers } from './triggers/index.js';

const squarePlugin = {
    name: "Square",
    icon: "https://cdn.activepieces.com/pieces/square.png",
    description: "Payment solutions for every business",
    id: "square",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            clientId: {
                type: "string",
                description: "Square OAuth client ID"
            },
            clientSecret: {
                type: "string",
                description: "Square OAuth client secret"
            },
            redirectUri: {
                type: "string",
                description: "OAuth redirect URI"
            }
        },
        required: ["clientId", "clientSecret", "redirectUri"]
    },
    outputSchema: {
        type: "object",
        properties: {
            accessToken: {
                type: "string",
                description: "Square OAuth access token"
            },
            refreshToken: {
                type: "string",
                description: "Square OAuth refresh token"
            },
            merchantId: {
                type: "string",
                description: "Square merchant ID"
            },
            expiresAt: {
                type: "string",
                description: "Token expiration timestamp"
            }
        }
    },
    exampleInput: {
        clientId: "your-client-id",
        clientSecret: "your-client-secret",
        redirectUri: "https://your-redirect-uri.com/callback"
    },
    exampleOutput: {
        accessToken: "EAAAEOuLa-Fir2jWXwGWm4UQl0U1FV4AQy6Lq_uJEokRvCR-XuEJoQ5R9U41",
        refreshToken: "EAAAEO4IQIvoc4Ff9hQFHJGQs9q5IKqvL4_uJEokRvCR-XuEJoQ5R9U41",
        merchantId: "MLTZ79VE64YTN",
        expiresAt: "2023-03-14T02:00:56.000119371Z"
    },
    documentation: "https://developer.squareup.com/docs",
    method: "exec",
    triggers: triggers,
    actions: []
};

export default squarePlugin;
