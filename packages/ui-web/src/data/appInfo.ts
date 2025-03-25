import { FiBook, FiBox, FiGrid } from "react-icons/fi";

export const content = {
    navigation: {
        logo: 'Mintflow',
        mainNav: [
            { label: 'Themes', href: '/themes' },
            { label: 'Primitives', href: '/primitives' },
            { label: 'Icons', href: '/icons' },
            { label: 'Colors', href: '/colors' },
        ],
        secondaryNav: [
            { label: 'Documentation', href: '/docs', icon: FiBook },
            { label: 'Playground', href: '/playground', icon: FiBox },
            { label: 'Blog', href: '/blog', icon: FiGrid },
        ],
    }
};

export const theme = {
    background: ' bg-transparent',
    // cardBg: 'bg-black/10',
    textPrimary: 'text-gray-900 dark:text-gray-100',
    textSecondary: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    navHover: 'hover:bg-gray-100 dark:hover:bg-gray-800',
};

export const navigationData = {
    mainNav: [
        { id: 1, label: 'Site', href: '#' },
        { id: 2, label: 'Settings', href: '#' },
        { id: 3, label: 'Dev Mode', href: '#' },
        { id: 4, label: 'Hire a Professional', href: '#' },
    ],
    actions: [
        { id: 1, label: 'Upgrade', variant: 'text-purple-600 hover:text-purple-700' },
        { id: 2, label: 'Save', variant: 'text-blue-600 hover:text-blue-700' },
        { id: 3, label: 'Preview', variant: 'text-blue-600 hover:text-blue-700' },
        { id: 4, label: 'Publish', variant: 'bg-blue-600 hover:bg-blue-700 text-white' },
    ]
};
