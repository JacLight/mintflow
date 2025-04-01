'use client';

import { useEffect } from 'react';
import { activeSession } from '@/lib/active-session';

/**
 * Component to initialize the active session from cookies
 * This is needed after social login since we can't call activeSession.setActiveSession
 * directly from server components
 */
export function InitSession() {
    useEffect(() => {
        // Get values from cookies
        const getCookie = (name: string) => {
            return document.cookie.split('; ').reduce((r, v) => {
                const parts = v.split('=');
                return parts[0] === name ? decodeURIComponent(parts[1]) : r;
            }, '');
        };

        const tokenCookie = getCookie('token');
        const userCookie = getCookie('user');
        const refreshTokenCookie = getCookie('refreshToken');

        if (tokenCookie && userCookie) {
            try {
                const user = JSON.parse(userCookie);
                // Initialize the active session
                activeSession.setActiveSession(tokenCookie, user, refreshTokenCookie || '');
                console.log('Session initialized from cookies');
            } catch (e) {
                console.error('Error initializing session:', e);
            }
        }
    }, []);

    // This component doesn't render anything
    return null;
}
