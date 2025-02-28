import { PluginDescriptor } from "@mintflow/common";
import * as actions from "./actions/index.js";

const googleSearchPlugin: PluginDescriptor = {
    name: "Google Search Console",
    icon: "TbBrandGoogle",
    description: "Integration with Google Search Console for website search performance analysis and management",
    id: "google-search",
    runner: "node",
    type: 'node',
    documentation: "https://docs.mintflow.com/plugins/google-search",
    actions: [
        actions.searchAnalytics,
        actions.listSites,
        actions.urlInspection,
        actions.listSitemaps,
        actions.submitSitemap
    ]
};

export default googleSearchPlugin;
