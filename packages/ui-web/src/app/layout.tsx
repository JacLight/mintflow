import './globals.css';
import "@/styles/style.css";
import 'animate.css/animate.css'
import { Analytics } from '@vercel/analytics/react';
import BackgroundImage from '@/assets/background-image';

export const metadata = {
  title: 'Next.js App Router + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen w-screen">
        {children}
        <BackgroundImage />
        <Analytics />
      </body>
    </html>
  )
}
