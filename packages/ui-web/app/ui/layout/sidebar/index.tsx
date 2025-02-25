'use client';

import React from 'react';
import { classNames } from '@jaclight/dbsdk';
import { useState } from 'react';
import { Icon } from '../icons';

const navigationData = {
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

const Header = () => {
    const [currentDevice, setCurrentDevice] = useState('desktop');
    const [zoomLevel, setZoomLevel] = useState(100);

    return (
        <div className="flex flex-col w-full border-b shadow-sm bg-white dark:bg-gray-800 dark:text-white">
            {/* Main Navigation */}
            <div className="flex items-center justify-between px-4 h-14 border-b">
                {/* Left Section */}
                <div className="flex items-center space-x-8">
                    {/* Logo */}
                    <span className="text-xl font-bold">WIX</span>

                    {/* Main Navigation */}
                    <nav className="flex items-center space-x-6">
                        {navigationData.mainNav.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                            >
                                {item.label}
                            </a>
                        ))}
                        <button className="text-gray-600 hover:text-gray-900" title="Help">
                            <Icon name='FaHelpCircle' size={18} />
                        </button>
                    </nav>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {navigationData.actions.map((action) => (
                        <button
                            title={action.label}
                            key={action.id}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium ${action.variant}`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sub Navigation */}
            <div className="flex items-center justify-between px-4 h-12">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Page:</span>
                        <button title='Home' className="flex items-center space-x-2 px-2 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 rounded">
                            <span>Home</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Device Switcher */}
                    <div className="flex items-center space-x-2 border-l pl-4">
                        <button
                            title='Device: Desktop'
                            onClick={() => setCurrentDevice('desktop')}
                            className={`p-1.5 rounded ${currentDevice === 'desktop' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <Icon name='FaLaptop' size={18} />
                        </button>
                        <button
                            title='Device: Mobile'
                            onClick={() => setCurrentDevice('mobile')}
                            className={`p-1.5 rounded ${currentDevice === 'mobile' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <Icon name='FaSmartphone' size={18} />
                        </button>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Undo">
                            <Icon name='FaUndo' size={18} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Redo">
                            <Icon name='FaRedo ' size={18} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4 border-l pl-4">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                -
                            </button>
                            <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                                {zoomLevel}%
                            </span>
                            <button
                                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                +
                            </button>
                        </div>

                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Tools">
                            <Icon name='FaTools' size={18} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Search">
                            <Icon name='FaSearch' size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Header2 = ({ theme = 'light', onThemeChange = null }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="flex flex-col w-full">
            {/* Main Header */}
            <div className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-b`}>
                <div className="flex items-center justify-between px-4 h-14">
                    {/* Left Section */}
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg" title="Search">
                            <Icon name='FaMenu' size={20} />
                        </button>
                        <h1 className="text-lg font-semibold">Project Tracker</h1>
                    </div>

                    {/* Center Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        <nav className="flex space-x-2">
                            {['Overview', 'Data', 'Forms', 'Automations'].map((item) => (
                                <button
                                    key={item}
                                    className={`px-3 py-2 rounded-lg hover:bg-gray-100 hover:dark:bg-gray-700
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg"
                        >
                            {theme === 'dark' ? <Icon name='FaSun' size={20} /> : <Icon name='FaMoon' size={20} />}
                        </button>

                        <button className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg" title="Search">
                            <Icon name='FaSearch' size={20} />
                        </button>

                        <button className="p-2 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg" title="Help">
                            <Icon name='FaHelp' size={20} />
                        </button>

                        <button className="hidden md:flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Icon name='FaShare' size={18} className="mr-2" />
                            Share
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub Header */}
            <div className={`w-full ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} border-b`}>
                <div className="flex items-center justify-between px-4 h-12">
                    <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-200 hover:dark:bg-gray-700 rounded">
                            <span>Views</span>
                            <Icon name='FaChevronDown' size={16} />
                        </button>
                        <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-200 hover:dark:bg-gray-700 rounded">
                            <span>Tools</span>
                            <Icon name='FaChevronDown' size={16} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-1.5 hover:bg-gray-200 hover:dark:bg-gray-700 rounded" title="Maximize">
                            <Icon name='FaMaximize2' size={18} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-200 hover:dark:bg-gray-700 rounded" title="Close">
                            <Icon name='FaXmark' size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const NavPanel = ({ children, isOpen, onClose, level }) => (
    <div
        className={`absolute h-full border-r shadow-lg transition-all duration-300 ease-in-out 
    dark:bg-gray-800 bg-white dark:border-gray-700 border-gray-200
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
            left: `${level * 256}px`,
            width: '256px',
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transformOrigin: 'left'
        }}
    >
        <button
            onClick={onClose}
            className="absolute right-2 top-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Close"
        >
            <Icon name='FaXmark' size={20} className="dark:text-gray-200" />
        </button>
        <div className="h-full">
            {children}
        </div>
    </div>
);

/*
               className={`h-full transition-all duration-300 ease-in-out
          bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700
          shadow-lg

          */

const SideNav = ({ siteTree = demo.siteTree }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeL1, setActiveL1] = useState(null);
    const [activeL2, setActiveL2] = useState(null);

    const getIcon = (iconName) => {
        return <Icon name={iconName} size={20} />
    };

    const handleL1Click = (item) => {
        if (activeL1?.name === item.name) {
            setActiveL1(null);
            setActiveL2(null);
        } else {
            setActiveL1(null);
            setActiveL2(null);
            setTimeout(() => {
                setActiveL1(item);
            }, 200);
        }
    };

    const handleL2Click = (item) => {
        setActiveL2(activeL2?.name === item.name ? null : item);
    };

    const closeMenu = (level) => {
        if (level === 1) {
            setActiveL1(null);
            setActiveL2(null);
        } else if (level === 2) {
            setActiveL2(null);
        }
    }

    return (
        <div className='fixed left-0 top-16'>
            {/* <Header /> */}
            {/* <Header2 /> */}
            <div className="relative h-screen w-fit m">

                {/* First Level - Always visible */}
                <div className={classNames(isExpanded ? 'w-72' : 'w-14', 'bg-white  z-50 absolute top-0 left-0 h-full overflow-y-auto transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 shadow-lg dark:bg-gray-800  ')}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-4 w-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {isExpanded ? <Icon name='FaChevronLeft' size={24} /> : <Icon name='FaChevronRight' size={24} />}
                    </button>

                    {siteTree.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleL1Click(item)}
                            className={classNames('flex items-center p-4 w-full hover:bg-gray-100 dark:hover:bg-gray-600   transition-colors',
                                activeL1?.name === item.name ? 'bg-purple-100 dark:bg-purple-700' : '')}
                        >
                            <span className="flex-shrink-0">{getIcon(item.icon)}</span>
                            {isExpanded && (
                                <span className="truncate leading-none  ml-4">{item.label}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Second Level Panel */}
                <div className={classNames(activeL1 ? `${isExpanded ? 'translate-x-[280px]' : 'translate-x-[56px]'}  ` : '  -translate-x-[280px]  ', ' z-40 absolute top-0 left-0 bg-gray-100 dark:bg-gray-700 w-[280px] h-full overflow-y-auto transition-all duration-500 ease-in-out border-r border-gray-200 dark:border-gray-700 shadow-lg')}>
                    {activeL1 && (
                        <div className="h-full">
                            <div className="px-4 py-3 pl-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex item justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    {getIcon(activeL1.icon)}
                                    {activeL1.label}
                                </h2>
                                <button
                                    onClick={() => closeMenu(1)}
                                    className={classNames('transition-colors p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100',
                                    )}
                                >
                                    <Icon name='FaXmark' className="ml-auto" size={16} />
                                </button>
                            </div>
                            <div className="py-2">
                                {activeL1.children?.map((child) => (
                                    <button
                                        key={child.name}
                                        onClick={() => handleL2Click(child)}

                                        className={classNames('w-full flex items-center transition-colors p-4  pl-6 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100',
                                            activeL2?.name === child.name ? 'bg-purple-200 dark:bg-purple-700' : '')}
                                    >
                                        <span className="flex-shrink-0">{getIcon(child.icon)}</span>
                                        <span className="ml-3 truncate">{child.label}</span>
                                        {child.children && <Icon name='FaChevronRight' className="ml-auto" size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Third Level Panel */}
                <div className={classNames(activeL2 ? `${isExpanded ? 'translate-x-[560px]' : 'translate-x-[336px]'}  ` : ' -translate-x-[280px] ', 'z-30  absolute top-0 left-0 bg-gray-200 dark:bg-gray-400 w-[280px] h-full overflow-y-auto transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 shadow-lg')}>
                    {activeL2 && (
                        <div className="h-full">
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex item justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    {getIcon(activeL2.icon)}
                                    {activeL2.label}
                                </h2>
                                <button
                                    onClick={() => closeMenu(2)}
                                    className={classNames('transition-colors p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100',
                                    )}
                                >
                                    <Icon name='FaXmark' className="ml-auto" size={16} />
                                </button>
                            </div>
                            <div className="py-2">
                                {activeL2.children?.map((child) => (
                                    <button
                                        key={child.name}
                                        className="w-full flex items-center p-4 
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-900 dark:text-gray-100
                    transition-colors"
                                    >
                                        <span className="flex-shrink-0">{getIcon(child.icon)}</span>
                                        <span className="ml-3 truncate">{child.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SideNav;


const demo = {
    "siteTree": [
        {
            "name": "approot",
            "label": "App Root",
            "icon": "FiHome",
            "children": [
                { "name": "site-demo", "label": "Site - demo", "icon": "FiMonitor" },
                { "name": "publish-demo", "label": "Publish - demo", "icon": "FiUpload" },
                { "name": "dashboard", "label": "Dashboard", "icon": "FiBarChart2" },
                { "name": "inbox", "label": "Inbox", "icon": "FiMail" },
                { "name": "setup-wizard", "label": "Setup Wizard", "icon": "FiSettings" },
                { "name": "workspace", "label": "Workspace", "icon": "FiBriefcase" },
                { "name": "workflow", "label": "Workflow", "icon": "FiActivity" },
                { "name": "domains", "label": "Domains", "icon": "FiGlobe" },
                { "name": "schedule", "label": "Schedule", "icon": "FiClock" }
            ]
        },
        {
            "name": "site-pages",
            "label": "Site Pages",
            "icon": "FiFileText",
            "children": [
                { "name": "new-page", "label": "New Page", "icon": "FiPlusCircle" },
                { "name": "products", "label": "Products", "icon": "FiBox" },
                { "name": "book-me", "label": "Book Me", "icon": "FiCalendar" },
                { "name": "animation-demo", "label": "Animation Demo", "icon": "FiPlayCircle" },
                { "name": "mobile-style", "label": "Mobile Style", "icon": "FiSmartphone" },
                { "name": "list-details", "label": "List Details", "icon": "FiList" }
            ]
        },
        {
            "name": "auraflow",
            "label": "Auraflow",
            "icon": "FiWind",
            "children": [
                { "name": "new-auraflow", "label": "New AuraFlow", "icon": "FiPlus" },
                { "name": "help-pass", "label": "We Need Help Pass", "icon": "FiHelpCircle" },
                { "name": "pizza-app", "label": "Pizza App", "icon": "FiPieChart" }
            ]
        },
        {
            "name": "content",
            "label": "Content",
            "icon": "FiFolder",
            "children": [
                { "name": "post", "label": "Post", "icon": "FiEdit" },
                { "name": "document", "label": "Document", "icon": "FiFileText" },
                { "name": "navigation", "label": "Navigation", "icon": "FiNavigation" },
                { "name": "tag", "label": "Tag", "icon": "FiTag" },
                { "name": "category", "label": "Category", "icon": "FiFolderPlus" },
                { "name": "view-template", "label": "View Template", "icon": "FiLayout" },
                { "name": "view-component", "label": "View Component", "icon": "FiPackage" },
                { "name": "comment", "label": "Comment", "icon": "FiMessageCircle" }
            ]
        },
        {
            "name": "storefront",
            "label": "Storefront",
            "icon": "FiShoppingCart",
            "children": [
                { "name": "dashboard", "label": "Dashboard", "icon": "FiBarChart" },
                { "name": "product", "label": "Product", "icon": "FiPackage" },
                { "name": "order", "label": "Order", "icon": "FiShoppingBag" },
                { "name": "subscription", "label": "Subscription", "icon": "FiRepeat" },
                { "name": "invoice", "label": "Invoice", "icon": "FiFileText" },
                { "name": "shipping", "label": "Shipping", "icon": "FiTruck" },
                { "name": "return", "label": "Return", "icon": "FiCornerDownLeft" },
                { "name": "promotions", "label": "Promotions", "icon": "FiGift" }
            ]
        },
        {
            "name": "crm",
            "label": "CRM",
            "icon": "FiUsers",
            "children": [
                { "name": "dashboard", "label": "Dashboard", "icon": "FiBarChart" },
                { "name": "social-media-marketing", "label": "Social Media & Marketing", "icon": "FiShare2" },
                { "name": "leads", "label": "Leads", "icon": "FiUserPlus" },
                { "name": "contacts", "label": "Contacts", "icon": "FiUsers" },
                { "name": "chat", "label": "Chat", "icon": "FiMessageSquare" },
                { "name": "comm-center", "label": "Comm Center", "icon": "FiPhone" },
                { "name": "tickets", "label": "Tickets", "icon": "FiClipboard" }
            ]
        },
        {
            "name": "database",
            "label": "Database",
            "icon": "FiDatabase",
            "children": [
                { "name": "base-collection", "label": "Base Collection", "icon": "FiArchive" },
                { "name": "custom-collection", "label": "Custom Collection", "icon": "FiEdit" },
                { "name": "sub-schemas", "label": "Sub Schemas", "icon": "FiLayers" },
                { "name": "import-export-data", "label": "Import, Export Data", "icon": "FiDownload" }
            ]
        },
        {
            "name": "applications",
            "label": "Applications",
            "icon": "FiGrid",
            "children": [
                { "name": "mintflow-designer", "label": "Mintflow Designer", "icon": "FiCode" },
                { "name": "template-editor", "label": "Template Editor", "icon": "FiEdit" },
                { "name": "creative-studio", "label": "Creative Studio", "icon": "FiCamera" }
            ]
        },
        {
            "name": "configuration",
            "label": "Configuration",
            "icon": "FiSettings",
            "children": [
                { "name": "business-locations", "label": "Business Locations", "icon": "FiMapPin" },
                { "name": "settings", "label": "Settings", "icon": "FiSliders" },
                { "name": "user-group", "label": "User, Group", "icon": "FiUsers" },
                { "name": "role-permission", "label": "Role & Permission", "icon": "FiShield" },
                { "name": "password-policy", "label": "Password Policy", "icon": "FiLock" },
                { "name": "integration-config", "label": "Integration Config", "icon": "FiSettings" },
                { "name": "escalation", "label": "Escalation", "icon": "FiArrowUp" },
                { "name": "translation", "label": "Translation", "icon": "FiGlobe" },
                { "name": "blacklist", "label": "Blacklist", "icon": "FiXCircle" },
                { "name": "queue-manager", "label": "Queue Manager", "icon": "FiActivity" }
            ]
        },
        {
            "name": "trash",
            "label": "Trash",
            "icon": "FiTrash"
        }
    ]
}
