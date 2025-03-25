'use client';

import { useEffect, useState } from 'react';
import { HiMoon, HiSun } from 'react-icons/hi';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('light');

    const Icon = theme === 'light' ? HiSun : HiMoon

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            setTheme('light');
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setTheme('light');
        }
    };

    return (
        <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 rounded-md">
            <Icon className="w-5 h-5" />
        </button>

    );
}
