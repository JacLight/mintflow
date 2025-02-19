import { exec } from "child_process";
import * as actions from "./actions/index.js";
import { PluginDescriptor } from "@mintflow/common";

export const commonSchema = {
    exampleInput: {
        array: [1, 2, 3, 4, 5],
    },
    description: "Calculates the sum of all elements in an array",
    documentation: "https://docs.example.com/arrayPluginExec",
    method: 'exec',
}

const arrayPlugin: PluginDescriptor = {
    name: "Array Plugin",
    id: "array",
    runner: "node",
    icon: "TbMathFunction",
    description: "A plugin to perform array operations",
    documentation: "https://docs.example.com/arrayPlugin",
    actions: [
        actions.filter,
        actions.map,
        actions.reduce,
        actions.sort,
        actions.aggregate,
    ]
};

export default arrayPlugin;


