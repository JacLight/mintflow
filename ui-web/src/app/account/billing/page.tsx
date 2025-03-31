import { Metadata } from 'next';
import Billing from '@/components/screens/billing';
import { getBillingInfo, getInvoices } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Billing | MintFlow',
    description: 'Manage billing and payment information for your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function BillingPage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    // Example of how we could fetch data server-side:
    // const billingInfo = await getBillingInfo();
    // const invoices = await getInvoices();
    // return <Billing billingInfo={billingInfo} invoices={invoices} />;

    return <Billing />;
}
