import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default function IndexPage() {
  return redirect('/welcome');
}
