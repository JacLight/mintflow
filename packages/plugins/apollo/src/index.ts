import { matchPerson } from './actions/match-person.js';
import { enrichCompany } from './actions/enrich-company.js';

const apolloPlugin = {
    name: "Apollo",
    icon: "🚀",
    description: "Sales intelligence and engagement platform for finding contact information and enriching company data",
    id: "apollo",
    runner: "node",
    auth: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "Apollo API Key",
                secret: true
            }
        },
        required: ["apiKey"]
    },
    documentation: "https://mintflow.com/docs/plugins/apollo",
    actions: [
        matchPerson,
        enrichCompany
    ]
};

export default apolloPlugin;
