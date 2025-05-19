// app/auth/layout.tsx
import { SocialLogins } from './social-logins';
import { InitSession } from './auth/init-session';

export default function AuthLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid  bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Initialize session from cookies */}
            <InitSession />
            {/* Social Login Side */}
            {/* <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-muted/50">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome</h1>
                        <p className="text-gray-500">Continue with your social account</p>
                    </div>
                    <SocialLogins />
                </div>
            </div> */}

            {/* Main Content Side */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {children}
                    {/* Show social logins on mobile */}
                    <div className="mt-8 ">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <SocialLogins />
                    </div>
                </div>
            </div>
        </div>
    );
}
