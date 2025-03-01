import { PluginDescriptor } from "@mintflow/common";
import * as actions from "./actions/index.js";

const googleWorkspacePlugin: PluginDescriptor = {
    name: "Google Workspace",
    icon: "TbBrandGoogle",
    description: "Integration with Google Workspace services including Calendar, Contacts, Docs, Forms, Tasks, and more",
    id: "google-workspace",
    runner: "node",
    type: 'node',
    documentation: "https://docs.mintflow.com/plugins/google-workspace",
    actions: [
        // Calendar actions
        actions.createEvent,
        actions.getEvents,
        actions.updateEvent,
        actions.deleteEvent,
        actions.addAttendees,

        // Contacts actions
        actions.createContact,

        // Docs actions
        actions.createDocument,
        actions.appendText,
        actions.readDocument,

        // Forms actions
        actions.getFormResponses,

        // Tasks actions
        actions.createTask
    ]
};

export default googleWorkspacePlugin;
