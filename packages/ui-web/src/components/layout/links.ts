export const sidebarLinks = {
    "name": "Mintflow",
    "logo": "https://appmint.io/assets/img/logo.png",
    "siteTree": [
        {
            "name": "approot",
            "label": "App Root",
            "icon": "Home",
            "children": [
                { "name": "site", "label": "Site - demo", "icon": "Monitor" },
                { "name": "publish", "label": "Publish - demo", "icon": "Upload" },
                { "name": "dashboard", "label": "Dashboard", "icon": "BarChart2" },
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
        // {
        //     "name": "creative-studio",
        //     "label": "Creative Studio",
        //     "icon": "Camera",
        //     "children": [
        //         { "name": "saved", "label": "Saved", "icon": "SaveAll" },
        //         { "name": "sep", "label": "Sep" },
        //         { "name": "new-design", "label": "New Design", "icon": "Plus" },
        //         { "name": "templates", "label": "Templates", "icon": "LayoutPanelTop" },
        //         { "name": "sep", "label": "Sep" },
        //         { "name": "help-pass", "label": "We Need Help Pass", "icon": "HelpCircle" },
        //     ]
        // },
        // {
        //     "name": "content",
        //     "label": "Content",
        //     "icon": "Folder",
        //     "children": [
        //         { "name": "content-studio", "label": "Content Studio", "icon": "LibraryBig" },
        //         { "name": "post", "label": "Post", "icon": "Edit" },
        //         { "name": "document", "label": "Document", "icon": "FileText", "view": 'secondary' },
        //         { "name": "navigation", "label": "Navigation", "icon": "Navigation" },
        //         { "name": "tag", "label": "Tag", "icon": "Tag" },
        //         { "name": "category", "label": "Category", "icon": "FolderPlus" },
        //         { "name": "saved-templates", "label": "Saved Templates", "icon": "Layout" },
        //         { "name": "forms", "label": "Forms", "icon": "FileText" },
        //         { "name": "comment", "label": "Comment", "icon": "MessageCircle" }
        //     ]
        // },
        // {
        //     "name": "storefront",
        //     "label": "Storefront",
        //     "icon": "ShoppingCart",
        //     "children": [
        //         { "name": "dashboard", "label": "Dashboard", "icon": "BarChart" },
        //         { "name": "product", "label": "Product", "icon": "Package" },
        //         { "name": "order", "label": "Order", "icon": "ShoppingBag" },
        //         { "name": "subscription", "label": "Subscription", "icon": "Repeat" },
        //         { "name": "invoice", "label": "Invoice", "icon": "FileText" },
        //         { "name": "shipping", "label": "Shipping", "icon": "Truck" },
        //         { "name": "return", "label": "Return", "icon": "CornerDownLeft" },
        //         { "name": "promotions", "label": "Promotions", "icon": "Gift" },
        //         { "name": "discount", "label": "Discount", "icon": "Percent" },
        //         { "name": "gift-card", "label": "Gift Card", "icon": "Gift" },
        //         { "name": "payment", "label": "Payment", "icon": "CreditCard" },
        //         { "name": "cart", "label": "Cart", "icon": "ShoppingCart" },
        //         { "name": "inventory", "label": "Inventory", "icon": "Archive" },
        //         { "name": "attribute", "label": "Attribute", "icon": "Layers" },
        //         { "name": "brand", "label": "Brand", "icon": "Tag" },
        //     ]
        // },
        // {
        //     "name": "crm",
        //     "label": "CRM",
        //     "icon": "Users",
        //     "children": [
        //         { "name": "dashboard", "label": "Dashboard", "icon": "BarChart" },
        //         { "name": "social-manager", "label": "Social Media & Marketing", "icon": "Share2" },
        //         { "name": "leads", "label": "Leads", "icon": "UserPlus" },
        //         { "name": "contacts", "label": "Contacts", "icon": "Users" },
        //         { "name": "chat", "label": "Chat", "icon": "MessageSquare" },
        //         { "name": "comm-center", "label": "Comm Center", "icon": "Phone" },
        //         { "name": "tickets", "label": "Tickets", "icon": "Clipboard" },
        //         { "name": "forms", "label": "Forms", "icon": "FileText" },
        //         { "name": "campaigns", "label": "Campaigns", "icon": "Send" },
        //         { "name": "signed-docs", "label": "Signed Docs", "icon": "FileText" },
        //         { "name": "events-reservation", "label": "Events & Reservation", "icon": "Calendar" },
        //         { "name": "calendar", "label": "Calendar", "icon": "Calendar" },
        //     ]
        // },
        // {
        //     "name": "database",
        //     "label": "Database",
        //     "icon": "Database",
        //     "children": [
        //         { "name": "base-collection", "label": "Base Collection", "icon": "Archive" },
        //         { "name": "custom-collection", "label": "Custom Collection", "icon": "Edit" },
        //         { "name": "sub-schemas", "label": "Sub Schemas", "icon": "Layers" },
        //         { "name": "data-import", "label": "Import, Export Data", "icon": "Download", "view": 'secondary' },
        //     ]
        // },
        {
            "name": "configuration",
            "label": "Configuration",
            "icon": "Settings",
            "children": [
                { "name": "business-locations", "label": "Business Locations", "icon": "MapPin" },
                { "name": "settings", "label": "Settings", "icon": "Sliders" },
                { "name": "user-group", "label": "User, Group", "icon": "Users" },
                { "name": "role-permission", "label": "Role & Permission", "icon": "Shield" },
                { "name": "password-policy", "label": "Password Policy", "icon": "Lock" },
                { "name": "integration-config", "label": "Integration Config", "icon": "Settings" },
                { "name": "escalation", "label": "Escalation", "icon": "ArrowUp", "view": 'secondary' },
                { "name": "translation", "label": "Translation", "icon": "Globe" },
                { "name": "blacklist", "label": "Blacklist", "icon": "XCircle", "view": 'secondary' },
                { "name": "queue-manager", "label": "Queue Manager", "icon": "Activity" }
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
