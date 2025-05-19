"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Generate breadcrumbs
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return { href, label };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Home
            </Link>
          </li>
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link 
                href={crumb.href}
                className={`ml-4 ${
                  index === breadcrumbs.length - 1
                    ? 'text-purple-600 dark:text-purple-400 font-medium'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {crumb.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{description}</p>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Current path: {pathname}</p>
        </div>
      </div>

      {/* Demo Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Features</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>Comprehensive business management solution</li>
          <li>Intuitive user interface with responsive design</li>
          <li>Seamless integration with third-party services</li>
          <li>Real-time data synchronization across devices</li>
          <li>Advanced reporting and analytics capabilities</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Benefits</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>Streamline your business operations</li>
          <li>Reduce administrative overhead</li>
          <li>Improve decision-making with data-driven insights</li>
          <li>Enhance customer and employee satisfaction</li>
          <li>Scale your business efficiently</li>
        </ul>
      </div>
    </div>
  );
};

export default PlaceholderPage;
