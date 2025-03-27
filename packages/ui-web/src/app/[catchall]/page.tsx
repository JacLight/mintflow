import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default function CatchAllPage() {
  return redirect('/welcome');
}
