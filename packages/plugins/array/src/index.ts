import * as actions from "./actions/index.js";
import { PluginDescriptor } from "@mintflow/common";

const arrayPlugin: PluginDescriptor = {
    name: "Array Plugin",
    id: "array",
    runner: "node",
    icon: "TbMathFunction",
    description: "A plugin to perform array operations",
    documentation: "https://docs.example.com/arrayPlugin",
    type: 'node',
    actions: [
        actions.filter,
        actions.map,
        actions.reduce,
        actions.sort,
        actions.aggregate,
    ]
};

export default arrayPlugin;


