import React from 'react';
import { IconRenderer } from '../ui/icon-renderer';

const dataImportSteps = [
  { id: 'source', name: 'Select Data source', href: '#' },
  { id: 'validate', name: 'Validate & Import', href: '#' },
];

export const ImportProgress = ({ activeStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="divide-y divide-gray-300 border border-gray-300 md:flex md:divide-y-0">
        {dataImportSteps.map((step, stepIdx) => (
          <li key={step.name} className="relative md:flex md:flex-1">
            {activeStep > stepIdx ? (
              <a href={step.href} className="group flex w-full items-center">
                <span className="flex items-center px-3 py-2 text-sm font-medium">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                    <IconRenderer icon="Check" aria-hidden="true" className="h-6 w-6 text-white" />
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                </span>
              </a>
            ) : stepIdx === activeStep ? (
              <a href={step.href} aria-current="step" className="flex items-center  px-3 py-2  text-sm font-medium">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                  <IconRenderer icon="List" aria-hidden="true" className="h-6 w-6 text-white" />
                </span>
                <span className="ml-4 text-sm font-medium text-indigo-600">{step.name}</span>
              </a>
            ) : (
              <a href={step.href} className="group flex items-center">
                <span className="flex items-center px-3 py-2  text-sm font-medium">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                    <IconRenderer icon="ArrowLeftRight" aria-hidden="true" className="h-6 w-6 text-white" />
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">{step.name}</span>
                </span>
              </a>
            )}
            {stepIdx !== dataImportSteps.length - 1 ? (
              <>
                {/* Arrow separator for lg screens and up */}
                <div aria-hidden="true" className="absolute right-0 top-0 hidden h-full w-5 md:block">
                  <svg fill="none" viewBox="0 0 22 80" preserveAspectRatio="none" className="h-full w-full text-gray-300">
                    <path d="M0 -2L20 40L0 82" stroke="currentcolor" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  </svg>
                </div>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
};
