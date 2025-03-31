import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// List of system files to ignore
const SYSTEM_FILES = ['sw.js', 'favicon.ico', 'manifest.json', 'robots.txt'];

// Dynamic import with proper error handling
const DynamicScreenComponent = async (path: string) => {
    try {
        // Dynamically import the component
        const Component = (await import('@/components/screens/' + path)).default;
        return Component;
    } catch (error) {
        // If the component doesn't exist, try to load just the last segment
        // This handles cases like "api/usage" where the file is just "usage.tsx"
        if (path.includes('/')) {
            const lastSegment = path.split('/').pop();
            try {
                const Component = (await import('@/components/screens/' + lastSegment)).default;
                return Component;
            } catch (innerError) {
                console.error(`Failed to load component for path: ${path} or ${lastSegment}`, innerError);
                return null;
            }
        }

        // Return null if component doesn't exist or fails to load
        console.error(`Failed to load component for path: ${path}`, error);
        return null;
    }
};

export default async function CatchAllPage({ params }: { params: { catchall: string[] } }) {
    // Get the path from the catchall parameter

    if (typeof params === 'undefined' || !Array.isArray(params.catchall)) {
        notFound();
    }
    const path = params?.catchall.join('/') || '';

    // Check if this is a system file request that should be ignored
    if (SYSTEM_FILES.includes(path) || path.endsWith('.js.map') || path.endsWith('.css.map')) {
        notFound();
    }

    // Try to get the screen component
    const ScreenComponent = await DynamicScreenComponent(path);

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
