import { actions } from './actions/index.js';
import { triggers } from './triggers/index.js';
import { SurveyMonkeyAuth } from './utils/index.js';

const surveymonkeyPlugin = {
    name: "SurveyMonkey",
    icon: "https://cdn.activepieces.com/pieces/surveymonkey.png",
    description: "Receive survey responses from SurveyMonkey",
    id: "surveymonkey",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            access_token: {
                type: "string",
                description: "SurveyMonkey OAuth Access Token"
            }
        },
        required: ["access_token"]
    },
    outputSchema: {
        type: "object",
        properties: {
            access_token: {
                type: "string",
                description: "SurveyMonkey OAuth Access Token"
            }
        }
    },
    exampleInput: {
        access_token: "your-access-token"
    },
    exampleOutput: {
        access_token: "your-access-token"
    },
    documentation: "https://developer.surveymonkey.com/api/v3/",
    method: "exec",
    actions: actions,
    triggers: triggers
};

export default surveymonkeyPlugin;
