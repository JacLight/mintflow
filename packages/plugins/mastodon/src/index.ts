import { actions } from './actions/index.js';

const mastodonPlugin = {
  name: "Mastodon",
  icon: "https://cdn.activepieces.com/pieces/mastodon.png",
  description: "Open-source decentralized social network",
  id: "mastodon",
  runner: "node",
  type: "node",
  inputSchema: {
    type: "object",
    properties: {
      baseUrl: {
        type: "string",
        description: "The base URL of your Mastodon instance (e.g., 'https://mastodon.social')"
      },
      accessToken: {
        type: "string",
        description: "Your Mastodon access token"
      }
    },
    required: ["baseUrl", "accessToken"]
  },
  outputSchema: {
    type: "object",
    properties: {
      baseUrl: {
        type: "string",
        description: "The base URL of your Mastodon instance"
      },
      accessToken: {
        type: "string",
        description: "Your Mastodon access token"
      }
    }
  },
  exampleInput: {
    baseUrl: "https://mastodon.social",
    accessToken: "your-access-token"
  },
  exampleOutput: {
    baseUrl: "https://mastodon.social",
    accessToken: "your-access-token"
  },
  documentation: "https://docs.joinmastodon.org/api/",
  method: "exec",
  actions: actions
};

export default mastodonPlugin;
