import * as actions from "./actions/index.js";
import { PluginDescriptor } from "@mintflow/common";

const mattermostPlugin: PluginDescriptor = {
    name: "Mattermost",
    icon: "TbBrandMattermost",
    description: "Open-source, self-hosted messaging platform for team communication",
    id: "mattermost",
    runner: "node",
    type: 'node',
    documentation: "https://docs.mattermost.com/developer/api.html",
    actions: [
        actions.sendMessage,
        actions.customApiCall
    ]
};

export default mattermostPlugin;
