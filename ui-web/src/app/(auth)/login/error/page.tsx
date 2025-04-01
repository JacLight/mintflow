'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    // Decode the error message if it exists
    const errorMessage = error ? decodeURIComponent(error) : 'An error occurred during authentication';

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
                <CardDescription className="text-center">
                    There was a problem signing you in
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Authentication failed</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{errorMessage}</p>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-gray-600">
                    <p>
                        This could be due to:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Invalid credentials</li>
                        <li>Account not found</li>
                        <li>Authentication service unavailable</li>
                        <li>Social provider configuration issues</li>
                    </ul>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <Link href="/login" className="w-full">
                    <Button className="w-full">
                        Try Again
                    </Button>
                </Link>
                <div className="text-sm text-center w-full text-muted-foreground">
                    Need help?{' '}
                    <a href="/contact" className="text-primary hover:underline font-medium">
                        Contact Support
                    </a>
                </div>
            </CardFooter>
        </Card>
    );
}
