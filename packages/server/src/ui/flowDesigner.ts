/**
 * A dummy in-memory store for flow designs.
 * In real usage, you might store these in DB or version-control them.
 */

interface FlowData {
    tenantId: string;
    flowId: string;
    definition: any;
}

const flowStore: FlowData[] = [];

/**
 * saveFlowDesign: Persists a user-designed flow for a given tenant/flowId.
 */
export async function saveFlowDesign(tenantId: string, flowId: string, definition: any): Promise<void> {
    // Check if already exists
    const index = flowStore.findIndex(f => f.tenantId === tenantId && f.flowId === flowId);
    if (index >= 0) {
        flowStore[index].definition = definition;
    } else {
        flowStore.push({ tenantId, flowId, definition });
    }
}

/**
 * loadFlowDesign: Retrieves the user-designed flow data if present.
 */
export async function loadFlowDesign(tenantId: string, flowId: string): Promise<any> {
    const item = flowStore.find(f => f.tenantId === tenantId && f.flowId === flowId);
    return item?.definition || null;
}
