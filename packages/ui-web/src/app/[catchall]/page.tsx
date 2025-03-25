import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default function IndexPage({ children }: { children: ReactNode }) {
  return redirect('/welcome');
}
