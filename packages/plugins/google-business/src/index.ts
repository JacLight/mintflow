import { PluginDescriptor } from "@mintflow/common";
import * as actions from "./actions/index.js";

const googleBusinessPlugin: PluginDescriptor = {
    name: "Google My Business",
    icon: "TbBrandGoogle",
    description: "Manage your business on Google with Google My Business (now Google Business Profile)",
    id: "google-business",
    runner: "node",
    type: 'node',
    documentation: "https://docs.mintflow.com/plugins/google-business",
    actions: [
        actions.createReply,
        actions.listAccounts,
        actions.listLocations,
        actions.listReviews
    ]
};

export default googleBusinessPlugin;
