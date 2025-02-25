'use server';
// app/auth/actions.ts

import { signIn } from 'app/(auth)/auth';

export async function loginWithGithub() {
    await signIn('github', { redirectTo: '/' });
}

export async function loginWithGoogle() {
    await signIn('google', { redirectTo: '/' });
}

export async function loginWithFacebook() {
    await signIn('facebook', { redirectTo: '/' });
}

export async function loginWithCredentials(formData: FormData) {
    console.log('loginWithCredentials');
    await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: '/'
    });
}

export async function sendMagicLink(formData: FormData) {
    await signIn('email', {
        email: formData.get('magic-email'),
        redirectTo: '/'
    });
}

export async function registerUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // const hashedPassword = await bcrypt.hash(password, 10)

    await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: '/'
    });
}