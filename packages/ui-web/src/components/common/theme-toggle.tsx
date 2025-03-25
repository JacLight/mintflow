'use client';

import { useSiteStore } from '@/contexts/site-store';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { IconRenderer } from '../ui/icon-renderer';
import { localStorageUtils } from '@/lib-client/localstorage';

const defaultTheme = {
    colors: {
        primary: '#0cd6a0',
        secondary: '#c6842d',
        accent: '#c44a5c',
        neutral: '#22263A',
        base100: '#FFFFFF',
        info: '#9FEAF9',
        success: '#22DD98',
        warning: '#DF7E16',
        error: '#E77489',
    },
}
const colorKeys = ["primary", "secondary", "accent", "neutral", "base100", "info", "success", "warning", "error"]

export const getDarkMode = () => {
    if (typeof window === 'undefined') return 'light';
    let darkMode = localStorageUtils.get('darkMode');
    if (!darkMode) {
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return darkMode;
}

export default function ThemeToggle() {
    const { theme, setTheme, setStateItem } = useSiteStore().ui(useShallow(state => ({ theme: state.theme, setTheme: state.setTheme, setStateItem: state.setStateItem })));
    const [darkMode, setDarkMode] = useState(getDarkMode());

    useEffect(() => {
        document.documentElement.classList.add(getDarkMode());
    }, []);

    const changeTheme = (theme: any) => {
        setStateItem({ theme });
        changeDarkMode(getDarkMode());
    };

    const changeDarkMode = (mode?: string) => {
        const root = document.documentElement;
        if (!mode) {
            mode = getDarkMode() === 'dark' ? 'light' : 'dark';
            localStorageUtils.set('darkMode', mode);
        }

        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        setDarkMode(mode);
        const colorsToApply = darkMode === 'dark' ? generateDarkModeColors(theme.colors) : theme.colors;
        Object.keys(colorsToApply).forEach((key) => {
            root.style.setProperty(`--tw-${key}`, colorsToApply[key]);
        });
    };


    const icon = darkMode === 'light' ? 'Sun' : 'Moon'
    return (
        <div>
            {/* <button onClick={e => changeTheme()} className="p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-800">
                <IconRenderer icon={icon} className="w-5 h-5 dark:stroke-slate-400" />
            </button> */}
            <button onClick={e => changeDarkMode()} className="p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-800">
                <IconRenderer icon={icon} className="w-5 h-5 dark:stroke-slate-400" />
            </button>
        </div>
    );
}


const generateDarkModeColors = (colors) => {
    const darkModeColors = {};
    colorKeys.forEach(key => {
        const color = Color(colors[key]);
        if (color.luminosity() > 0.5) {
            darkModeColors[key] = color.darken(0.8).hex();
        } else {
            darkModeColors[key] = color.darken(0.2).hex();
        }
    });
    return darkModeColors;
};
