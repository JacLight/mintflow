import { actions } from './actions/index.js';

const redditPlugin = {
  name: "Reddit",
  icon: "https://cdn.activepieces.com/pieces/reddit.png",
  description: "Social news and discussion platform",
    groups: ["social"],
    tags: ["social","media","platform","network","sharing"],
    version: '1.0.0',
  id: "reddit",
  runner: "node",
  type: "node",
  inputSchema: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        description: "Your Reddit API client ID"
      },
      clientSecret: {
        type: "string",
        description: "Your Reddit API client secret"
      },
      username: {
        type: "string",
        description: "Your Reddit username"
      },
      password: {
        type: "string",
        description: "Your Reddit password"
      },
      userAgent: {
        type: "string",
        description: "User agent string for API requests (e.g., 'MintFlow:v1.0.0 (by /u/username)')"
      }
    },
    required: ["clientId", "clientSecret", "username", "password", "userAgent"]
  },
  outputSchema: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        description: "Your Reddit API client ID"
      },
      clientSecret: {
        type: "string",
        description: "Your Reddit API client secret"
      },
      username: {
        type: "string",
        description: "Your Reddit username"
      },
      password: {
        type: "string",
        description: "Your Reddit password"
      },
      userAgent: {
        type: "string",
        description: "User agent string for API requests"
      }
    }
  },
  exampleInput: {
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    username: "your-username",
    password: "your-password",
    userAgent: "MintFlow:v1.0.0 (by /u/username)"
  },
  exampleOutput: {
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    username: "your-username",
    password: "your-password",
    userAgent: "MintFlow:v1.0.0 (by /u/username)"
  },
  documentation: "https://www.reddit.com/dev/api/",
  method: "exec",
  actions: actions
};

export default redditPlugin;
