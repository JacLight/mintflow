'use client';
import {
    FiGithub,
} from 'react-icons/fi';
import { content, theme } from '@/data/appInfo';
import ThemeToggle from '@/components/common/theme-toggle';
import AIChat from '../ai/ai-chat';
import { ActionButtons } from '../common/action-buttons';
import BusinessAppSwitch from '../common/app-switch';
import SideNav from './site-nav';
import { LinearLoader } from '../ui/loading-indicator/linear-loader';
import { AlertIcon } from '../alert/AlertIcon';

const buttonsList = [
    { name: 'new-employee', label: 'New Employee', icon: 'UserPlus', showCaption: true, action: '', url: '/people/employees/employee-form' },
];
const MainLayout = ({ children }) => {

    return (
        <div className={`w-full h-screen ${theme.background} transition-colors duration-200`}>
            <div className='flex justify-between w-full'>
                <SideNav />
                {/* <SideNav /> */}
                <div className=' w-full h-screen overflow-auto'>
                    <header className={` border-b border-b-white/60 dark:border-b-white/20 h-16 flex w-full bg-transparent items-center ${theme.border}}`}>
                        <div className="px-4 flex w-full items-center justify-between">
                            <div className="flex items-center justify-between gap-10">
                                <BusinessAppSwitch />
                                <ActionButtons moreButtons={buttonsList} />
                            </div>
                            {/* Right section */}
                            <div className="flex items-center space-x-2">
                                {content.navigation.secondaryNav.map((item) => (
                                    <button
                                        key={item.href}
                                        className={`p-2 rounded-md ${theme.textSecondary} ${theme.navHover}`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                    </button>
                                ))}
                                <AlertIcon />
                                <ThemeToggle />
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2 rounded-md ${theme.textSecondary} ${theme.navHover}`}
                                >
                                    <FiGithub className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </header>
                    <LinearLoader />
                    <main className=" w-full p-10">
                        {children || 'Nothing Here'}
                    </main>
                </div>
                {/* <QuickView /> */}
                <AIChat />
            </div>
        </div>
    );
};

export default MainLayout;
