// app/auth/register/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerUser } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SocialLogins } from '../social-logins';

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (formData: FormData) => {
        try {
            const result = await registerUser(formData);

            if (result && result.success && result.redirectUrl) {
                // Registration successful, redirect to the specified URL
                router.push(result.redirectUrl);
                return;
            }

            if (result && result.error) {
                setError(result.error);
            }
        } catch (err: any) {
            // Handle any unexpected errors
            console.error('Registration error:', err);
            setError('An error occurred during registration. Please try again.');
        }
    };

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                <CardDescription className="text-center">
                    Enter your information to get started
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <form action={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            required
                            className="h-11"
                        />
                        <p className="text-xs text-gray-500">
                            Must be at least 8 characters long
                        </p>
                    </div>

                    <Button className="w-full h-11" type="submit">
                        Create account
                    </Button>
                </form>

                <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="mt-6">
                    <SocialLogins />
                </div>
            </CardContent>

            <CardFooter>
                <div className="text-sm text-center w-full text-muted-foreground">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary hover:underline font-medium">
                        Sign in
                    </a>
                </div>
            </CardFooter>
        </Card>
    );
}
