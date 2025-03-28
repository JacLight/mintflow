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
import { Mail, LockKeyhole } from 'lucide-react';
import { loginWithCredentials, sendMagicLink } from '../actions';
import { Label } from '@/components/ui/label';
import { SocialLogins } from '../social-logins';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (formData: FormData) => {
    try {
      const result = await loginWithCredentials(formData);

      if (result && result.success && result.redirectUrl) {
        // Login successful, redirect to the specified URL
        router.push(result.redirectUrl);
        return;
      }

      if (result && result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      // Handle any unexpected errors
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    }
  };

  const handleMagicLink = async (formData: FormData) => {
    try {
      const result = await sendMagicLink(formData);

      if (result && result.success && result.redirectUrl) {
        // Magic link sent successfully, redirect to the specified URL
        router.push(result.redirectUrl);
        return;
      }

      if (result && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to send magic link. Please try again.');
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Enter your email to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form action={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11">
            <LockKeyhole className="mr-2 h-4 w-4" />
            Sign in with email
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-4 mb-4">
          <SocialLogins />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or use magic link
            </span>
          </div>
        </div>

        <form action={handleMagicLink} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email">Email address</Label>
            <Input
              id="magic-email"
              name="magic-email"
              type="email"
              placeholder="name@example.com"
              required
              className="h-11"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full h-11">
            <Mail className="mr-2 h-4 w-4" />
            Send magic link
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <div className="text-sm text-center w-full text-muted-foreground">
          Don't have an account?{' '}
          <a href="/auth/register" className="text-primary hover:underline font-medium">
            Create one
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
