import MainLayout from '@/components/layout/main-layout';
import WelcomeMintflow from '@/components/screens/welcome-build-studio';
import { ReactNode } from 'react';

export default function WorkflowLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      <WelcomeMintflow />
    </MainLayout>
  );
}
