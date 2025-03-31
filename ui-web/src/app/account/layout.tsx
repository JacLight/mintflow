import MainLayout from '@/components/layout/main-layout';
import { ReactNode } from 'react';

export default function AccountLayout({ children }: { children: ReactNode }) {
    return (
        <MainLayout>{children}</MainLayout>
    );
}
