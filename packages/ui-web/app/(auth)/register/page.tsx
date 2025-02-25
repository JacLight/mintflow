// app/auth/register/page.tsx
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

export default function RegisterPage() {
    return (
        <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                <CardDescription className="text-center">
                    Enter your information to get started
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={registerUser} className="space-y-4">
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

                    <Button type="submit" className="w-full h-11">
                        Create account
                    </Button>
                </form>
            </CardContent>

            <CardFooter>
                <div className="text-sm text-center w-full text-muted-foreground">
                    Already have an account?{' '}
                    <a href="/auth/login" className="text-primary hover:underline font-medium">
                        Sign in
                    </a>
                </div>
            </CardFooter>
        </Card>
    );
}