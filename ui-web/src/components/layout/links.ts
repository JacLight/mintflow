export const sidebarLinks = {
    "name": "Mintflow",
    "logo": "https://appmint.io/assets/img/logo.png",
    "siteTree": [
        {
            "name": "welcome",
            "label": "App Root",
            "icon": "Home",
            "children": [
                { "name": "dashboard", "label": "Dashboard", "icon": "BarChart2" },
                { "name": "active-flows", "label": "Active Flows", "icon": "Activities" },
                { "name": "schdules", "label": "Schedules", "icon": "CalendarSync" },
            ]
        },
        {
            "name": "designer",
            "label": "Build Studio",
            "icon": "Blocks",
            "children": [
                { "name": "/", "label": "Saved", "icon": "SaveAll" },
                { "name": "sep", "label": "Sep" },
                { "name": "/", "label": "New Flow", "icon": "Workflow" },
                { "name": "/", "label": "New Chat", "icon": "BookCopy" },
                { "name": "/", "label": "New Agent", "icon": "UsersRound" },
                { "name": "sep", "label": "Sep" },
                { "name": "/", "label": "Templates", "icon": "LayoutPanelTop" },
            ]
        },
        {
            "name": "flow-runs/executions",
            "label": "Flow Runs",
            "icon": "MonitorCog",
            "children": [
                { "name": "executions", "label": "Runs", "icon": "Activity" },
                { "name": "logs", "label": "Logs", "icon": "Clock" },
                { "name": "usage", "label": "Usage", "icon": "BarChart3" },
                { "name": "cost", "label": "Cost", "icon": 'FileText' },
                { "name": "sep", "label": "Sep" },
                { "name": "api-keys", "label": "API keys", "icon": "Key" },
            ]
        },
        {
            "name": "account/profile",
            "label": "Account",
            "icon": "ShieldCheck",
            "children": [
                { "name": "profile", "label": "Profile", "icon": "User" },
                { "name": "members", "label": "Members", "icon": "Users" },
                { "name": "workspaces", "label": "Workspaces", "icon": "Building" },
                { "name": "sep", "label": "Sep" },
                { "name": "billing", "label": "Billing", "icon": "CreditCard" },
                { "name": "limits", "label": "Limits", "icon": "Lock" },
                { "name": "sep", "label": "Sep" },
                { "name": "privacy", "label": "Privacy controls", "icon": "Lock" },
            ]
        },
        {
            "name": "trash",
            "label": "Trash",
            "icon": "Trash",
            "view": 'secondary'
        }
    ],
    footer: [
        {
            type: 'button',
            name: 'How to Videos',
            icon: 'Video',
            action: e => {
                window.open('https://appmint.io/docs/user', '_blank');
            },
        },
        {
            type: 'button',
            name: 'Documentation',
            icon: 'Book',
            action: e => {
                window.open('https://appmint.io/docs/user', '_blank');
            },
        },
        {
            type: 'button',
            'name': 'Discord',
            icon: 'MessageSquare',
            action: e => {
                window.open('https://discord.gg/cQuZZY24', '_blank');
            },
        }
    ]
}
