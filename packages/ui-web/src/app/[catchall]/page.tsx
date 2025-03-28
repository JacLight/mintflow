'use client';

import { notFound, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// This function gets the screen component dynamically based on the path
const getScreenComponent = (path: string) => {
  try {
    // Try to dynamically import the screen component
    return dynamic(() => import(`@/components/screens/${path}`), {
      loading: () => <div className="p-6">Loading...</div>,
      ssr: false,
    });
  } catch (error) {
    // If the component doesn't exist, return null
    return null;
  }
};

export default function CatchAllPage() {
  const params = useParams();
  const catchall = params?.catchall as string;

  // Get the path from the catchall parameter
  const path = Array.isArray(catchall) ? catchall.join('/') : catchall;
  console.log('params:', params);
  console.log('params:', catchall);

  // Try to get the screen component
  const ScreenComponent = getScreenComponent(path);

  // If the component doesn't exist, show the 404 page
  if (!ScreenComponent) {
    notFound();
  }

  // Render the screen component
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ScreenComponent />
    </Suspense>
  );
}
