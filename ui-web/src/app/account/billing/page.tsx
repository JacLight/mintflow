import { Metadata } from 'next';
import Billing from '@/components/screens/billing';
import { getBillingInfo, getInvoices } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Billing | MintFlow',
    description: 'Manage billing and payment information for your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function BillingPage() {
    try {
        // Fetch billing data from the server
        const billingInfo = await getBillingInfo();
        const invoices = await getInvoices();

        return <Billing initialBillingInfo={billingInfo} initialInvoices={invoices} />;
    } catch (error) {
        console.error('Error fetching billing data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state
        return <Billing />;
    }
}
