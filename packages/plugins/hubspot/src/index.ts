import * as actions from './actions/index.js';
import { HubSpotAuthData } from './common.js';

const hubspotPlugin = {
  name: "hubspot",
  icon: "https://developers.hubspot.com/hubfs/assets/hubspot.com/web-team/WBZ/Brand/Logos/hubspot-logo-web.svg",
  description: "Powerful CRM that offers tools for sales, customer service, and marketing automation.",
  id: "hubspot",
  runner: "node",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["createContact", "getContact", "updateContact", "findContact"],
        description: "The action to perform"
      },
      auth: {
        type: "object",
        properties: {
          access_token: {
            type: "string",
            description: "HubSpot OAuth access token"
          }
        },
        required: ["access_token"]
      },
      // Action-specific parameters will be validated by the action functions
      params: {
        type: "object",
        description: "Parameters for the selected action"
      }
    },
    required: ["action", "auth", "params"]
  },
  outputSchema: {
    type: "object",
    properties: {
      result: {
        type: "object",
        description: "The result of the action"
      }
    }
  },
  exampleInput: {
    action: "createContact",
    auth: {
      access_token: "HUBSPOT_OAUTH_ACCESS_TOKEN"
    },
    params: {
      properties: {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890"
      }
    }
  },
  exampleOutput: {
    result: {
      id: "12345",
      properties: {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        hs_object_id: "12345",
        createdate: "2023-01-01T00:00:00.000Z",
        lastmodifieddate: "2023-01-01T00:00:00.000Z"
      },
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
      archived: false
    }
  },
  documentation: "https://developers.hubspot.com/docs/api/overview",
  method: "exec",
  async exec(input: { action: string; auth: HubSpotAuthData; params: any }) {
    const { action, auth, params } = input;
    
    switch (action) {
      case "createContact":
        return { result: await actions.createContact({ auth, ...params }) };
      
      case "getContact":
        return { result: await actions.getContact({ auth, ...params }) };
      
      case "updateContact":
        return { result: await actions.updateContact({ auth, ...params }) };
      
      case "findContact":
        return { result: await actions.findContact({ auth, ...params }) };
      
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }
};

export default hubspotPlugin;
