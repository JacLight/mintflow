import React from 'react';
import Link from 'next/link';
import { IconRenderer } from '@/components/ui/icon-renderer';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
                        <IconRenderer icon="AlertTriangle" size={48} className="text-purple-600 dark:text-purple-300" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404 - Page Not Found</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    href="/welcome"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    <IconRenderer icon="Home" size={20} className="mr-2" />
                    Go to Home
                </Link>
            </div>
        </div>
    );
}
