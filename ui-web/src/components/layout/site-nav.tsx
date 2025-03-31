"use client";

import { useState, useRef } from "react";
import { IconRenderer } from "@/components/ui/icon-renderer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib-client/helpers";
import { sidebarLinks } from "./links";

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

const SideNav = ({ }) => {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeL1, setActiveL1] = useState<any>(null);
    const [activeL2, setActiveL2] = useState<any>(null);
    const [hoverL1, setHoverL1] = useState<any>(null);
    const [hoverL2, setHoverL2] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getIcon = (iconName: string) => {
        return <IconRenderer icon={iconName} size={20} />
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
                                    <img src={'/images/mint_flow_logo.png'} alt='Business Made' className="w-full" />
                                </div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {sidebarLinks.name}
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
                    {sidebarLinks.siteTree.map((item) => {
                        if (item.name === 'sep') {
                            return (
                                <div className="h-2" />
                            )
                        }
                        return (
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
                                                <IconRenderer
                                                    icon='ChevronRight'
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
                        )
                    })}
                    <div className='footer absolute bottom-10 w-full'>
                        {sidebarLinks.footer.map((item) => (
                            <button
                                key={item.name}
                                onClick={item.action}
                                className={classNames(isExpanded ? ' px-4 ' : 'justify-center', 'flex items-center py-4 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-100 text-gray-900 transition-colors',
                                    activeL1?.name === item.name ? 'bg-purple-100 dark:bg-purple-700' : '')}
                            >
                                <span className="flex-shrink-0">{getIcon(item.icon)}</span>
                                {isExpanded && (
                                    <span className="truncate leading-none  ml-4">{item.name}</span>
                                )}
                            </button>
                        ))}
                    </div>
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
                                    <IconRenderer icon='X' className="ml-auto" size={16} />
                                </button>
                            </div>
                            <div className="py-2">
                                {displayL1.children?.map((child) => {
                                    if (child.name === 'sep') {
                                        return (
                                            <div className="h-2 border-b border-b-gray-100" />
                                        )
                                    }
                                    return (
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
                                                        <IconRenderer
                                                            icon='ChevronRight'
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
                                    )
                                })}
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
                                    <IconRenderer icon='X' className="ml-auto" size={16} />
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
