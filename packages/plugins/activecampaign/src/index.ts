import { PluginDescriptor } from '@mintflow/common';
import * as actions from './actions/index.js';

const activecampaignPlugin: PluginDescriptor = {
    name: "ActiveCampaign",
    icon: "TbBrandCampaignmonitor",
    description: "Email marketing, marketing automation, and CRM tools for creating incredible customer experiences",
    id: "activecampaign",
    runner: "node",
    type: "node",
    documentation: "https://www.activecampaign.com/api/",
    actions: [
        actions.createContactAction,
        actions.updateContactAction,
        actions.addTagToContactAction,
        actions.subscribeUnsubscribeContactAction,
        actions.addContactToAccountAction,
        actions.createAccountAction,
        actions.updateAccountAction,
    ]
};

export default activecampaignPlugin;
