import { ActionDescriptor, PluginDescriptor } from "../types/noteTypes"
import mailPlugin from "./demo"

export const getNode = async (nodeId: string): Promise<PluginDescriptor> => {
    return mailPlugin
}

export const getNodeAction = async (nodeId: string, action: string): Promise<ActionDescriptor | undefined> => {
    const node = await getNode(nodeId)
    return node.actions.find(a => a.name === action)
}