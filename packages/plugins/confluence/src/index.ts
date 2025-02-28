import { getPageContent } from './actions/get-page-content.js';
import { createPageFromTemplate } from './actions/create-page-from-template.js';
import { newPage } from './triggers/new-page.js';

const confluencePlugin = {
    name: "confluence",
    icon: "https://cdn.activepieces.com/pieces/confluence.png",
    description: "Create, read, and manage content in Atlassian Confluence",
    id: "confluence",
    runner: "node",
    documentation: "https://developer.atlassian.com/cloud/confluence/rest/v2/intro/",
    actions: [
        getPageContent,
        createPageFromTemplate
    ],
    triggers: [
        newPage
    ]
};

export default confluencePlugin;
