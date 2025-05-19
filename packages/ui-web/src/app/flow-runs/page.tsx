import { redirect } from 'next/navigation';


// This is a server component in Next.js App Router
export default async function FlowRunsPage() {
    redirect('/flow-runs/executions');
}
