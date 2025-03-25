"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "../ui/icons";
import { IconRenderer } from "@/components/ui/icon-renderer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";

// Function to get document name from filename
const getDocumentName = (filename: string): string => {
    // Remove file extension
    const nameWithoutExtension = filename.replace(/\.[^/.]+$/, "");

    // Replace hyphens and underscores with spaces
    const nameWithSpaces = nameWithoutExtension.replace(/[-_]/g, " ");

    // Capitalize each word
    return nameWithSpaces
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// List of documents from the docs folder
const documentsList = [
    "account_progress_report.md",
    "account_readme.md",
    "account-flow.md",
    "business-made-integrated-system-map.md",
    "business-made-market-analysis.md",
    "business-made-master-plan.md",
    "business-made-navigation-data-flow.md",
    "business-made-sitemap.md",
    "business-made-summary.md",
    "data-model.md",
    "hr-flow.md",
    "hr-implementation-progress.md",
    "hr-ui-design.md",
    "instructions.md",
    "operation-flow.md",
    "operations-implementation-progress.md",
    "payroll-flow.md",
    "payroll-ui-design-analysis.md",
    "payroll-ui-design.md"
];

interface SideNavProps {
    siteTree?: typeof businessMadeNavigation.siteTree;
}

const SideNav = ({ siteTree = businessMadeNavigation.siteTree }: SideNavProps) => {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeL1, setActiveL1] = useState<any>(null);
    const [activeL2, setActiveL2] = useState<any>(null);
    const [hoverL1, setHoverL1] = useState<any>(null);
    const [hoverL2, setHoverL2] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getIcon = (iconName) => {
        return <Icon name={iconName} size={20} />
    };

    const handleL1MenuToggle = (item, e) => {
        // Prevent the event from bubbling up to the link
        e.stopPropagation();

        // Cancel lock if clicking on a different menu
        if (isLocked && activeL1?.name !== item.name) {
            setIsLocked(false);
        }

        if (activeL1?.name === item.name) {
            setActiveL1(null);
            setActiveL2(null);
            setIsMenuOpen(false);
        } else {
            setActiveL1(null);
            setActiveL2(null);
            setTimeout(() => {
                setActiveL1(item);
                setIsMenuOpen(true);
            }, 200);
        }
    };

    const handleL2MenuToggle = (item, e) => {
        // Prevent the event from bubbling up to the link
        e.stopPropagation();
        setActiveL2(activeL2?.name === item.name ? null : item);
    };

    // Hover handlers are now empty as menus should only open on click
    const handleL1MouseEnter = () => { };
    const handleL1MouseLeave = () => { };
    const handleL2MouseEnter = () => { };
    const handleL2MouseLeave = () => { };

    const toggleLock = (e) => {
        e.stopPropagation();
        setIsLocked(!isLocked);
    };

    const closeMenu = (level) => {
        if (level === 1) {
            setActiveL1(null);
            setActiveL2(null);
            setHoverL1(null);
            setHoverL2(null);
            setIsMenuOpen(false);
            setIsLocked(false);
        } else if (level === 2) {
            setActiveL2(null);
            setHoverL2(null);
        }
    }

    // Only show menus based on active state, not hover state
    const displayL1 = activeL1;
    const displayL2 = activeL2;

    return (
        <div className='bg-transparent'>
            <div className="relative h-screen w-fit ">
                <div className={classNames(isExpanded ? 'w-72' : 'w-14', 'bg-white/50 z-50 top-0 left-0 h-full overflow-y-auto transition-all duration-300 ease-in-out border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg  dark:bg-black/70 ')}>
                    <div className={classNames(isExpanded ? 'px-4' : '', 'flex items-center justify-center w-ful h-16')}>
                        {isExpanded && (
                            <div className='flex gap-4 items-center w-full'>
                                <div className='w-8'>
                                    <img src={'/assets/logo.png'} alt='Business Made' className="w-full" />
                                </div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {/* {content.navigation.logo} */}
                                </h1>
                            </div>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className=" hover:bg-gray-100 dark:hover:bg-gray-800   dark:text-gray-100"
                        >
                            {isExpanded ? <IconRenderer icon='ArrowLeftToLine' size={18} /> : <IconRenderer icon='ArrowRightToLine' size={18} />}
                        </button>
                    </div>
                    {siteTree.map((item) => (
                        <div
                            key={item.name}
                            className="w-full"
                        >
                            {item.children ? (
                                <div className={classNames('flex items-center w-full transition-colors',
                                    activeL1?.name === item.name ? 'bg-purple-100 dark:bg-purple-700' : '',
                                    pathname === `/${item.name}` ? 'bg-purple-100 dark:bg-purple-700' : '')}>
                                    <Link
                                        href={item.name === "docs" ? "/docs" : `/${item.name}`}
                                        className="flex items-center p-4 flex-grow hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-100 min-w-0"
                                    >
                                        <span className="flex-shrink-0">{getIcon(item.icon)}</span>
                                        {isExpanded && (
                                            <span className="truncate leading-none ml-4 max-w-[160px]">{item.label}</span>
                                        )}
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            if (isLocked && activeL1?.name === item.name) {
                                                // If already locked, toggle lock
                                                toggleLock(e);
                                            } else {
                                                // Otherwise toggle menu
                                                handleL1MenuToggle(item, e);
                                            }
                                        }}
                                        className="p-4 hover:bg-purple-200 dark:hover:bg-purple-600 rounded-r transition-colors"
                                        title={isLocked && activeL1?.name === item.name ? "Unlock menu" : "Open submenu"}
                                    >
                                        {isExpanded && (
                                            <Icon
                                                name='FaChevronRight'
                                                size={16}
                                                className={isLocked && activeL1?.name === item.name ? "text-purple-600 dark:text-purple-300" : ""}
                                            />
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href={`/${item.name}`}
                                    className={classNames('flex items-center p-4 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-100 transition-colors min-w-0',
                                        pathname === `/${item.name}` ? 'bg-purple-100 dark:bg-purple-700' : '')}
                                >
                                    <span className="flex-shrink-0">{getIcon(item.icon)}</span>
                                    {isExpanded && (
                                        <span className="truncate leading-none ml-4 max-w-[160px]">{item.label}</span>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Second Level Panel */}
                <div
                    className={classNames(displayL1 ? `${isExpanded ? 'translate-x-[280px]' : 'translate-x-[56px]'}  ` : '  -translate-x-[280px]  ', ' z-40 absolute top-0 left-0 bg-gray-100 dark:bg-gray-700 w-[280px] h-full overflow-y-auto transition-all duration-500 ease-in-out border-r border-gray-200 dark:border-gray-700 shadow-lg')}
                >
                    {displayL1 && (
                        <div className="h-full">
                            <div className="px-4 py-3 pl-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex item justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    {getIcon(displayL1.icon)}
                                    {displayL1.label}
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
                                {displayL1.children?.map((child) => (
                                    <div
                                        key={child.name}
                                        className="w-full"
                                    >
                                        {child.children ? (
                                            <div className={classNames('w-full flex items-center transition-colors text-gray-900 dark:text-gray-100',
                                                activeL2?.name === child.name ? 'bg-purple-200 dark:bg-purple-700' : '',
                                                pathname === `/${displayL1?.name}/${child.name}` ? 'bg-purple-200 dark:bg-purple-700' : '')}>
                                                <Link
                                                    href={`/${displayL1?.name}/${child.name}`}
                                                    className="flex items-center p-4 pl-6 flex-grow hover:bg-gray-200 dark:hover:bg-gray-500 min-w-0"
                                                >
                                                    <span className="flex-shrink-0">{getIcon(child.icon)}</span>
                                                    <span className="ml-3 truncate max-w-[160px]">{child.label}</span>
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        if (isLocked && activeL2?.name === child.name) {
                                                            // If already locked, toggle lock
                                                            toggleLock(e);
                                                        } else {
                                                            // Otherwise toggle menu
                                                            handleL2MenuToggle(child, e);
                                                        }
                                                    }}
                                                    className="p-4 hover:bg-purple-300 dark:hover:bg-purple-600 rounded-r transition-colors"
                                                    title={isLocked && activeL2?.name === child.name ? "Unlock menu" : "Open submenu"}
                                                >
                                                    <Icon
                                                        name='FaChevronRight'
                                                        size={16}
                                                        className={isLocked && activeL2?.name === child.name ? "text-purple-600 dark:text-purple-300" : ""}
                                                    />
                                                </button>
                                            </div>
                                        ) : (
                                            displayL1.name === "docs" ? (
                                                <Link
                                                    href={`/docs/view/${child.name}`}
                                                    className={classNames('w-full flex items-center transition-colors p-4 pl-6 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 min-w-0',
                                                        pathname === `/docs/view/${child.name}` ? 'bg-purple-200 dark:bg-purple-700' : '')}
                                                >
                                                    <span className="flex-shrink-0">{getIcon(child.icon)}</span>
                                                    <span className="ml-3 truncate max-w-[160px]">{child.label}</span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/${displayL1?.name}/${child.name}`}
                                                    className={classNames('w-full flex items-center transition-colors p-4 pl-6 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 min-w-0',
                                                        pathname === `/${displayL1?.name}/${child.name}` ? 'bg-purple-200 dark:bg-purple-700' : '')}
                                                >
                                                    <span className="flex-shrink-0">{getIcon(child.icon)}</span>
                                                    <span className="ml-3 truncate max-w-[160px]">{child.label}</span>
                                                </Link>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Third Level Panel - Quick Actions */}
                <div
                    className={classNames(displayL2 ? `${isExpanded ? 'translate-x-[560px]' : 'translate-x-[336px]'}  ` : ' -translate-x-[380px] ', 'z-30  absolute top-0 left-0 bg-gray-200 dark:bg-gray-400 w-[380px] h-full overflow-y-auto transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 shadow-lg')}
                >
                    {displayL2 && (
                        <div className="h-full">
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex item justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    {getIcon(displayL2.icon)}
                                    {displayL2.label} <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">Quick Actions</span>
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
                                <div className="px-4 mb-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Quick actions for {displayL2.label} without leaving your current context</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 px-2">
                                    {displayL2.children?.map((child: any) => (
                                        <div
                                            key={child.name}
                                            className={classNames("flex flex-col items-center justify-center p-3 rounded-lg text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                                                pathname === `/${displayL1?.name}/${displayL2.name}/${child.name}` ? 'bg-purple-100 dark:bg-purple-700' : 'bg-white dark:bg-gray-800')}
                                        >
                                            <Link
                                                href={`/${displayL1?.name}/${displayL2.name}/${child.name}`}
                                                className="flex flex-col items-center text-center"
                                            >
                                                <span className="flex-shrink-0 p-2 bg-purple-100 dark:bg-purple-800 rounded-full mb-2">{getIcon(child.icon)}</span>
                                                <span className="text-sm font-medium truncate w-full max-w-[120px]">{child.label}</span>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SideNav;

// Navigation tree with all critical functionality preserved
const businessMadeNavigation = {
    "siteTree": [
        {
            "name": "dashboard",
            "label": "Dashboard",
            "icon": "FiHome",
            "children": [
                { "name": "overview", "label": "Overview", "icon": "FiBarChart2" },
                { "name": "notifications", "label": "Notifications", "icon": "FiBell" },
                { "name": "tasks", "label": "Tasks", "icon": "FiCheckSquare" },
                { "name": "calendar", "label": "Calendar", "icon": "FiCalendar" },
                { "name": "widgets", "label": "Widgets", "icon": "FiGrid" }
            ]
        },
        {
            "name": "pos",
            "label": "POS",
            "icon": "FiCreditCard",
            "children": [
                { "name": "overview", "label": "Overview", "icon": "FiLayout" },
                { "name": "shop", "label": "Shop", "icon": "FiTag" },
                { "name": "cart", "label": "Cart", "icon": "FiShoppingBag" },
                { "name": "orders", "label": "Orders", "icon": "FiClipboard" },
                { "name": "customers", "label": "Customers", "icon": "FiUsers" },
                { "name": "payments", "label": "Payments", "icon": "FiCreditCard" },
                { "name": "reservation", "label": "Reservation", "icon": "FiCalendar" },
                { "name": "service-points", "label": "Service Points", "icon": "FiMapPin" },
                { "name": "service-definitions", "label": "Service Definitions", "icon": "FiSettings" },
                { "name": "queue", "label": "Queue", "icon": "FiAlignLeft" },
                { "name": "estimates", "label": "Estimates", "icon": "FiFileText" },
                { "name": "invoices", "label": "Invoices", "icon": "FiFile" },
                { "name": "demo", "label": "POS Demo", "icon": "FiMonitor" }
            ]
        },
        {
            "name": "serviceflow",
            "label": "ServiceFlow",
            "icon": "FiLayers",
            "children": [
                { "name": "dashboard", "label": "ServiceFlow Dashboard", "icon": "FiGrid" },
                { "name": "queue", "label": "Queue Management", "icon": "FiAlignLeft" },
                { "name": "reservations", "label": "Reservations", "icon": "FiCalendar" },
                { "name": "calendar", "label": "Service Calendar", "icon": "FiCalendar" },
                {
                    "name": "queue",
                    "label": "Queue Management",
                    "icon": "FiAlignLeft",
                },
                { "name": "dashboard", "label": "Queue Dashboard", "icon": "FiUsers" },
                { "name": "kiosk", "label": "Kiosk Interface", "icon": "FiMonitor" },
                {
                    "name": "self-service",
                    "label": "Self-Service Checkout",
                    "icon": "FiSmartphone",
                },
            ]
        },
        {
            "name": "people",
            "label": "People",
            "icon": "FiUsers",
            "children": [
                {
                    "name": "setup",
                    "label": "HR Setup",
                    "icon": "FiSettings",
                    "children": [
                        { "name": "welcome", "label": "Welcome", "icon": "FiInfo" },
                        { "name": "company-policies", "label": "Company Policies", "icon": "FiFileText" },
                        { "name": "role-mapping", "label": "Role Mapping", "icon": "FiUsers" },
                        { "name": "payroll-integration", "label": "Payroll Integration", "icon": "FiDollarSign" },
                        { "name": "performance-setup", "label": "Performance Setup", "icon": "FiTrendingUp" },
                        { "name": "review-activation", "label": "Review & Activation", "icon": "FiCheckCircle" }
                    ]
                },
                {
                    "name": "workforce",
                    "label": "Workforce Management",
                    "icon": "FiUsers",
                    "children": [
                        { "name": "employee-directory", "label": "Employee Directory", "icon": "FiBook" },
                        { "name": "time-tracking", "label": "Time Tracking", "icon": "FiClock" },
                        { "name": "leave-management", "label": "Leave Management", "icon": "FiCalendar" },
                        { "name": "shift-scheduling", "label": "Shift Scheduling", "icon": "FiCalendar" },
                        { "name": "absence-alerts", "label": "Absence Alerts", "icon": "FiBell" }
                    ]
                },
                {
                    "name": "hiring",
                    "label": "Hiring & Onboarding",
                    "icon": "FiUserPlus",
                    "children": [
                        { "name": "job-posting", "label": "Job Posting", "icon": "FiFileText" },
                        { "name": "candidate-workflow", "label": "Candidate Workflow", "icon": "FiUsers" },
                        { "name": "offer-management", "label": "Offer Management", "icon": "FiMail" },
                        { "name": "data-collection", "label": "Data Collection", "icon": "FiDatabase" },
                        { "name": "onboarding-checklist", "label": "Onboarding Checklist", "icon": "FiCheckSquare" },
                        { "name": "payroll-activation", "label": "Payroll Activation", "icon": "FiDollarSign" }
                    ]
                },

                {
                    "name": "performance",
                    "label": "Performance Management",
                    "icon": "FiTrendingUp",
                    "children": [
                        { "name": "review-dashboard", "label": "Review Dashboard", "icon": "FiBarChart2" },
                        { "name": "goal-setting", "label": "Goal Setting", "icon": "FiTarget" },
                        { "name": "recognition", "label": "Recognition & Rewards", "icon": "FiAward" },
                        { "name": "training", "label": "Training & Development", "icon": "FiBookOpen" },
                        { "name": "personnel", "label": "Personnel Dashboard", "icon": "FiBookOpen" },
                        { "name": "appraisal", "label": "Appraisal", "icon": "FiBookOpen" },
                        { "name": "retention-alerts", "label": "Retention Alerts", "icon": "FiAlertTriangle" }
                    ]
                },
                {
                    "name": "compliance",
                    "label": "Compliance Management",
                    "icon": "FiShield",
                    "children": [
                        { "name": "policy-audits", "label": "Policy Audits", "icon": "FiClipboard" },
                        { "name": "document-storage", "label": "Document Storage", "icon": "FiFolder" },
                        { "name": "ethics-management", "label": "Ethics Management", "icon": "FiHeart" },
                        { "name": "compliance-alerts", "label": "Compliance Alerts", "icon": "FiBell" }
                    ]
                },
                {
                    "name": "analytics",
                    "label": "HR Analytics",
                    "icon": "FiPieChart",
                    "children": [
                        { "name": "cost-analysis", "label": "Cost Analysis", "icon": "FiDollarSign" },
                        { "name": "workforce-planning", "label": "Workforce Planning", "icon": "FiUsers" },
                        { "name": "satisfaction-trends", "label": "Satisfaction Trends", "icon": "FiSmile" },
                        { "name": "turnover-reports", "label": "Turnover Reports", "icon": "FiBarChart" }
                    ]
                },
                {
                    "name": "payroll",
                    "label": "Payroll",
                    "icon": "FiDollarSign",
                    "children": [
                        { "name": "welcome", "label": "Welcome", "icon": "FiInfo" },
                        { "name": "setup", "label": "Payroll Setup", "icon": "FiSettings" },
                        { "name": "employee", "label": "Employee Payroll", "icon": "FiUser" },
                        { "name": "run", "label": "Payroll Run", "icon": "FiPlay" },
                        { "name": "reports", "label": "Payroll Reports", "icon": "FiFileText" }
                    ]
                },
                { "name": "directory", "label": "Directory", "icon": "FiBook" }
            ]
        },
        {
            "name": "money",
            "label": "Money",
            "icon": "FiDollarSign",
            "children": [
                { "name": "dashboard", "label": "Financial Dashboard", "icon": "FiBarChart2" },
                {
                    "name": "setup",
                    "label": "Smart Setup",
                    "icon": "FiSettings",
                    "children": [
                        { "name": "business-profile", "label": "Business Profile", "icon": "FiHome" },
                        { "name": "chart-of-accounts", "label": "Chart of Accounts", "icon": "FiList" },
                        { "name": "banking-connection", "label": "Banking Connection", "icon": "FiLink" },
                        { "name": "tax-settings", "label": "Tax Settings", "icon": "FiPercent" },
                        { "name": "go-live", "label": "Go Live", "icon": "FiCheckCircle" }
                    ]
                },
                {
                    "name": "accounting",
                    "label": "Accounting",
                    "icon": "FiBook",
                    "children": [
                        { "name": "journal-entries", "label": "Journal Entries", "icon": "FiEdit" },
                        { "name": "chart-of-accounts", "label": "Chart of Accounts", "icon": "FiList" },
                        { "name": "reconciliation", "label": "Reconciliation", "icon": "FiCheckCircle" },
                        { "name": "assets", "label": "Assets", "icon": "FiCheckCircle" }
                    ]
                },
                {
                    "name": "banking",
                    "label": "Banking",
                    "icon": "FiCreditCard",
                    "children": [
                        { "name": "accounts", "label": "Bank Accounts", "icon": "FiCreditCard" },
                        { "name": "transactions", "label": "Transactions", "icon": "FiList" },
                        { "name": "cash-flow", "label": "Cash Flow", "icon": "FiTrendingUp" }
                    ]
                },
                {
                    "name": "invoicing",
                    "label": "Invoicing",
                    "icon": "FiFile",
                    "children": [
                        { "name": "create-invoice", "label": "Create Invoice", "icon": "FiPlus" },
                        { "name": "manage-invoices", "label": "Manage Invoices", "icon": "FiList" },
                        { "name": "payment-reminders", "label": "Payment Reminders", "icon": "FiBell" }
                    ]
                },
                {
                    "name": "expenses",
                    "label": "Expenses",
                    "icon": "FiShoppingBag",
                    "children": [
                        { "name": "capture-receipt", "label": "Capture Receipt", "icon": "FiCamera" },
                        { "name": "manage-expenses", "label": "Manage Expenses", "icon": "FiList" },
                        { "name": "approval-workflows", "label": "Approval Workflows", "icon": "FiCheckSquare" }
                    ]
                },
                {
                    "name": "inventory",
                    "label": "Inventory & Procurement",
                    "icon": "FiPackage",
                    "children": [
                        { "name": "stock-levels", "label": "Stock Levels", "icon": "FiPackage" },
                        { "name": "purchase-orders", "label": "Purchase Orders", "icon": "FiShoppingCart" },
                        { "name": "vendors", "label": "Vendor Management", "icon": "FiUsers" }
                    ]
                },
                {
                    "name": "budgeting",
                    "label": "Budgeting & Forecasting",
                    "icon": "FiTrendingUp",
                    "children": [
                        { "name": "create-budget", "label": "Create Budget", "icon": "FiPlus" },
                        { "name": "what-if-scenarios", "label": "What-If Scenarios", "icon": "FiHelpCircle" },
                        { "name": "performance-tracking", "label": "Performance Tracking", "icon": "FiActivity" }
                    ]
                },
                {
                    "name": "tax",
                    "label": "Tax & Compliance",
                    "icon": "FiFileText",
                    "children": [
                        { "name": "overview", "label": "Overview", "icon": "FiBarChart2" },
                        { "name": "tax-calculation", "label": "Tax Calculation", "icon": "FiPercent" },
                        { "name": "filing-preparation", "label": "Filing Preparation", "icon": "FiFileText" },
                        { "name": "audit-records", "label": "Audit Records", "icon": "FiShield" },
                        { "name": "expense", "label": "Business Expense", "icon": "FiDollarSign" },
                        { "name": "income", "label": "Business Income", "icon": "FiDollarSign" },
                        { "name": "credit", "label": "Tax Credit", "icon": "FiPercent" },
                        { "name": "deduction", "label": "Tax Deduction", "icon": "FiPercent" },
                        { "name": "exemption", "label": "Tax Exemption", "icon": "FiPercent" },
                        { "name": "liability", "label": "Tax Liability", "icon": "FiPercent" },
                        { "name": "summary", "label": "Tax Summary", "icon": "FiFileText" },
                    ]
                },
                {
                    "name": "reports",
                    "label": "Financial Reports",
                    "icon": "FiPieChart",
                    "children": [
                        { "name": "profit-loss", "label": "Profit & Loss", "icon": "FiDollarSign" },
                        { "name": "balance-sheet", "label": "Balance Sheet", "icon": "FiLayers" },
                        { "name": "cash-flow-statement", "label": "Cash Flow Statement", "icon": "FiTrendingUp" },
                        { "name": "custom-reports", "label": "Custom Reports", "icon": "FiEdit" }
                    ]
                },
                {
                    "name": "asssets",
                    "label": "Assets",
                    "icon": "FiPieChart",
                    "children": [
                        { "name": "profit-loss", "label": "Profit & Loss", "icon": "FiDollarSign" },
                        { "name": "balance-sheet", "label": "Balance Sheet", "icon": "FiLayers" },
                        { "name": "cash-flow-statement", "label": "Cash Flow Statement", "icon": "FiTrendingUp" },
                        { "name": "custom-reports", "label": "Custom Reports", "icon": "FiEdit" }
                    ]
                },
            ]
        },
        {
            "name": "operations",
            "label": "Operations",
            "icon": "FiActivity",
            "children": [
                {
                    "name": "dashboard",
                    "label": "Operations Dashboard",
                    "icon": "FiHome",
                    "children": [
                        { "name": "home", "label": "Dashboard Home", "icon": "FiBarChart2" }
                    ]
                },
                {
                    "name": "work-scheduling",
                    "label": "Work & Scheduling",
                    "icon": "FiCalendar",
                    "children": [
                        { "name": "timeline", "label": "Employee Timeline", "icon": "FiClock" },
                        { "name": "ai-optimizer", "label": "AI Shift Optimizer", "icon": "FiCpu" },
                        { "name": "approval", "label": "Approval Workflow", "icon": "FiCheckSquare" },
                        { "name": "compliance", "label": "Compliance Alerts", "icon": "FiAlertTriangle" }
                    ]
                },
                {
                    "name": "sales-transactions",
                    "label": "Sales & Transactions",
                    "icon": "FiShoppingCart",
                    "children": [
                        { "name": "pos", "label": "POS System", "icon": "FiCreditCard" },
                        { "name": "quick-checkout", "label": "Quick Checkout", "icon": "FiZap" },
                        { "name": "invoices", "label": "Invoice Processing", "icon": "FiFileText" },
                        { "name": "refunds", "label": "Refunds Management", "icon": "FiRefreshCw" }
                    ]
                },
                {
                    "name": "inventory-orders",
                    "label": "Inventory & Orders",
                    "icon": "FiPackage",
                    "children": [
                        { "name": "tracking", "label": "Inventory Tracking", "icon": "FiList" }
                    ]
                },
                {
                    "name": "intelligence",
                    "label": "Operations Intelligence",
                    "icon": "FiPieChart",
                    "children": [
                        { "name": "analytics", "label": "AI Analytics", "icon": "FiBarChart2" }
                    ]
                }
            ]
        },
        {
            "name": "reports",
            "label": "Reports",
            "icon": "FiPieChart",
            "children": [
                { "name": "financial", "label": "Financial Reports", "icon": "FiDollarSign" },
                { "name": "hr", "label": "HR Reports", "icon": "FiUsers" },
                { "name": "sales", "label": "Sales Reports", "icon": "FiShoppingCart" },
                { "name": "inventory", "label": "Inventory Reports", "icon": "FiPackage" },
                { "name": "custom", "label": "Custom Reports", "icon": "FiEdit" }
            ]
        },
        {
            "name": "settings",
            "label": "Settings",
            "icon": "FiSettings",
            "children": [
                { "name": "company", "label": "Company", "icon": "FiHome" },
                { "name": "users", "label": "Users", "icon": "FiUsers" },
                { "name": "system", "label": "System", "icon": "FiMonitor" },
                { "name": "integrations", "label": "Integrations", "icon": "FiLink" }
            ]
        },
        {
            "name": "self-service",
            "label": "Self Service",
            "icon": "FiUser",
            "children": [
                { "name": "requests", "label": "Requests", "icon": "FiFileText" },
                { "name": "appointments", "label": "Appointments", "icon": "FiCalendar" },
                { "name": "profile", "label": "My Profile", "icon": "FiUser" },
                { "name": "documents", "label": "Documents", "icon": "FiFile" },
                { "name": "upload-document", "label": "Upload Document", "icon": "FiUpload" }
            ]
        },
        {
            "name": "help",
            "label": "Help & Support",
            "icon": "FiHelpCircle",
            "children": [
                { "name": "documentation", "label": "Documentation", "icon": "FiBook" },
                { "name": "support", "label": "Support", "icon": "FiMessageSquare" },
                { "name": "training", "label": "Training", "icon": "FiVideo" },
                { "name": "feedback", "label": "Feedback", "icon": "FiMessageCircle" }
            ]
        },
        {
            "name": "docs",
            "label": "Documentation",
            "icon": "FiFileText",
            "children": documentsList.map(doc => ({
                "name": doc.replace(/\.[^/.]+$/, ""),
                "label": getDocumentName(doc),
                "icon": "FiFile"
            }))
        }
    ]
};
