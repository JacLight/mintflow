'use client';
import { Fragment, useEffect, useState, ReactNode } from 'react'
import { classNames } from '@/lib-client/helpers'
import { usePathname, useRouter } from "next/navigation";
import { IconRenderer } from '../ui/icon-renderer';
import ModernDropdown from './modern-dropdown';



const appNames = [
    { name: 'POS & Billing', href: '/business/pos', description: 'Integrated POS system with invoicing & service point', icon: '', current: false },
    { name: 'Service', href: '/business/service', description: 'Service request, check-in, modify or cancel, check status', icon: '', current: false },
    // { name: 'Customer', href: '/business/customer', description: 'Customer self-service portal, request, check-in, modify or cancel, check status', icon: '', current: false },
    // { name: 'User', href: '/business/user', description: 'Manage your user account', icon: '', current: false },
    { name: 'Account', href: '/business/account', description: 'Manage your account, purchase, asset, inventory, transaction, reconciliation, chart of account, banking', icon: '', current: false },
    { name: 'HR', href: '/business/hr', description: 'Manage your HR benefits, employee list, recruitment, appraisals, payroll, expenses, time off', icon: '', current: false },
    { name: 'Admin', href: '/business/admin', description: 'Manage your admin features & system settings', icon: '', current: false },
]

export default function BusinessAppSwitch() {
    const router = useRouter();
    const pathname = usePathname() || '';
    const currentApp = appNames.find(app => pathname.startsWith(app.href));

    const handleAppChange = (app: typeof appNames[0]) => {
        router.push(app.href)
    }

    return (
        <ModernDropdown id='app-switch' options={appNames} value={currentApp} onChange={handleAppChange}/>
    )
}
