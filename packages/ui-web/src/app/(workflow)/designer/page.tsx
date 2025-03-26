import { getNodesWithGroups } from '@/lib/node-service';
import { WorkflowDesigner } from '@/components/workflow/workflow-designer';

// This is a server component in Next.js App Router
export default async function DesignerPage() {
    // Fetch nodes with their groups using default fields
    const { componentTypes, componentGroups } = await getNodesWithGroups();

    // Pass the data to the WorkflowDesigner component
    return (
        <WorkflowDesigner
            componentTypes={componentTypes}
            componentGroups={componentGroups}
        />
    );
}
