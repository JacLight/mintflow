import { actions } from './actions/index.js';

const mediumPlugin = {
  name: "Medium",
  icon: "https://cdn.activepieces.com/pieces/medium.png",
  description: "Online publishing platform",
    groups: ["social"],
    tags: ["social","media","platform","network","sharing"],
    version: '1.0.0',
  id: "medium",
  runner: "node",
  type: "node",
  inputSchema: {
    type: "object",
    properties: {
      integrationToken: {
        type: "string",
        description: "Your Medium integration token"
      }
    },
    required: ["integrationToken"]
  },
  outputSchema: {
    type: "object",
    properties: {
      integrationToken: {
        type: "string",
        description: "Your Medium integration token"
      }
    }
  },
  exampleInput: {
    integrationToken: "your-integration-token"
  },
  exampleOutput: {
    integrationToken: "your-integration-token"
  },
  documentation: "https://github.com/Medium/medium-api-docs",
  method: "exec",
  actions: actions
};

export default mediumPlugin;
