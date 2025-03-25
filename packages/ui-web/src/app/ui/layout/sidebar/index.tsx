'use client';

import React from 'react';
import { useState } from 'react';
import { Icon } from '../icons';
import { classNames } from '@/src/lib/utils';

const SideNav = ({ siteTree = demo.siteTree }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeL1, setActiveL1] = useState<any>(null);
    const [activeL2, setActiveL2] = useState<any>(null);

    const getIcon = (iconName: any) => {
        return <Icon name={iconName} size={20} />
    };

    const handleL1Click = (item: any) => {
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

    const handleL2Click = (item: any) => {
        setActiveL2(activeL2?.name === item.name ? null : item);
    };

    const closeMenu = (level: any) => {
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
                                {activeL1.children?.map((child: any) => (
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
                                {activeL2.children?.map((child: any) => (
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
