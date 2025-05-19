import MainLayout from '@/components/layout/main-layout';
import { ReactNode } from 'react';

export default function PageLayout({ children }: { children: ReactNode }) {
    return (
        <MainLayout>{children}</MainLayout>
    );
}
