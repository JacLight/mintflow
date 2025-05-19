'use client';

import { useState, useEffect } from "react";
import { IconRenderer } from "../ui/icon-renderer";
import { formatDistance } from "date-fns";
import { classNames } from "@/lib-client/helpers";
import { CustomVideoPlayer } from "../custom-video-player";
import Link from "next/link";

// Tutorial data
const tutorials = [
    { id: 1, title: "Getting Started with Mintflow", duration: "5:30", thumbnail: "", url: "https://www.youtube.com/watch?v=_UTqwU8IZH0" },
    { id: 2, title: "Creating Your First Workflow", duration: "8:45", thumbnail: "", url: "https://www.youtube.com/watch?v=PNRUWs8HFkU" },
];

// Recent flows data
const recentFlows = [
    {
        id: 'flow-123456',
        name: 'Data Sync Workflow',
        description: 'Synchronize data between multiple systems',
        lastRun: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'running',
        type: 'Integration',
        icon: 'RefreshCw'
    },
    {
        id: 'flow-234567',
        name: 'Customer Onboarding',
        description: 'Automate customer welcome and setup process',
        lastRun: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        status: 'completed',
        type: 'Automation',
        icon: 'UserPlus'
    },
    {
        id: 'flow-345678',
        name: 'Document Processing',
        description: 'Extract and process data from documents',
        lastRun: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
        status: 'error',
        type: 'AI',
        icon: 'FileText'
    }
];

// Template categories
const templateCategories = [
    { id: 'popular', name: 'Popular' },
    { id: 'integration', name: 'Integration' },
    { id: 'automation', name: 'Automation' },
    { id: 'ai', name: 'AI & ML' },
    { id: 'marketing', name: 'Marketing' }
];

// Template data
const flowTemplates = [
    {
        id: 'template-1',
        name: 'Data Sync Workflow',
        description: 'Synchronize data between multiple systems automatically',
        category: 'integration',
        popularity: 4.8,
        usedBy: 1245,
        image: 'https://picsum.photos/seed/picsum/200/300?random=1',
        tags: ['Integration', 'Data', 'Sync']
    },
    {
        id: 'template-2',
        name: 'Customer Onboarding',
        description: 'Automate your customer welcome and setup process',
        category: 'automation',
        popularity: 4.7,
        usedBy: 987,
        image: 'https://picsum.photos/seed/picsum/200/300?random=2',
        tags: ['Automation', 'Customer', 'Onboarding']
    },
    {
        id: 'template-3',
        name: 'Document Processing',
        description: 'Extract and process data from documents using AI',
        category: 'ai',
        popularity: 4.6,
        usedBy: 756,
        image: 'https://picsum.photos/seed/picsum/200/300?random=3',
        tags: ['AI', 'Document', 'Processing']
    },
    {
        id: 'template-4',
        name: 'Marketing Automation',
        description: 'Automate your marketing campaigns and follow-ups',
        category: 'marketing',
        popularity: 4.5,
        usedBy: 623,
        image: 'https://picsum.photos/seed/picsum/200/300?random=4',
        tags: ['Marketing', 'Automation', 'Campaign']
    },
    {
        id: 'template-5',
        name: 'Analytics Dashboard',
        description: 'Create a real-time analytics dashboard for your data',
        category: 'integration',
        popularity: 4.4,
        usedBy: 512,
        image: 'https://picsum.photos/seed/picsum/200/300?random=5',
        tags: ['Analytics', 'Dashboard', 'Data']
    },
    {
        id: 'template-6',
        name: 'AI Content Generator',
        description: 'Generate content for your website or marketing materials',
        category: 'ai',
        popularity: 4.3,
        usedBy: 489,
        image: 'https://picsum.photos/seed/picsum/200/300?random=6',
        tags: ['AI', 'Content', 'Generator']
    }
];

// News and updates
const newsAndUpdates = [
    {
        id: 'news-1',
        title: 'New AI Integration Available',
        description: 'Connect your workflows to the latest AI models with our new integration.',
        date: '2 days ago',
        link: '#',
        type: 'Feature'
    },
    {
        id: 'news-2',
        title: 'Workflow Performance Improvements',
        description: 'We\'ve made significant improvements to workflow execution speed.',
        date: '1 week ago',
        link: '#',
        type: 'Update'
    },
    {
        id: 'news-3',
        title: 'Upcoming Webinar: Advanced Workflow Techniques',
        description: 'Join us for a deep dive into advanced workflow automation techniques.',
        date: '2 weeks ago',
        link: '#',
        type: 'Event'
    }
];

// Quick help topics
const helpTopics = [
    {
        id: 'help-1',
        title: 'Creating Your First Flow',
        description: 'Learn how to create and configure your first workflow.',
        icon: 'GitBranch',
        link: '#'
    },
    {
        id: 'help-2',
        title: 'Connecting to External Services',
        description: 'Set up connections to external APIs and services.',
        icon: 'Globe',
        link: '#'
    },
    {
        id: 'help-3',
        title: 'Using AI in Your Workflows',
        description: 'Leverage AI capabilities in your automation flows.',
        icon: 'Brain',
        link: '#'
    },
    {
        id: 'help-4',
        title: 'Monitoring and Debugging',
        description: 'Learn how to monitor and troubleshoot your workflows.',
        icon: 'Activity',
        link: '#'
    }
];

// Community showcase
const communityShowcase = [
    {
        id: 'showcase-1',
        title: 'E-commerce Order Processing',
        description: 'Automated order processing and fulfillment workflow',
        author: 'Sarah Johnson',
        likes: 128,
        image: 'https://picsum.photos/seed/picsum/200/300?random=7'
    },
    {
        id: 'showcase-2',
        title: 'AI-Powered Content Calendar',
        description: 'Content planning and creation with AI assistance',
        author: 'Michael Chen',
        likes: 95,
        image: 'https://picsum.photos/seed/picsum/200/300?random=8'
    },
    {
        id: 'showcase-3',
        title: 'Customer Support Automation',
        description: 'Intelligent ticket routing and response system',
        author: 'Alex Rodriguez',
        likes: 87,
        image: 'https://picsum.photos/seed/picsum/200/300?random=9'
    }
];

const WelcomeDashboard = () => {
    const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('popular');

    // Get filtered templates based on selected category
    const filteredTemplates = selectedTemplateCategory === 'popular'
        ? [...flowTemplates].sort((a, b) => b.popularity - a.popularity).slice(0, 4)
        : flowTemplates.filter(template => template.category === selectedTemplateCategory).slice(0, 4);

    // Get status color based on flow status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'bg-green-500';
            case 'paused':
                return 'bg-yellow-500';
            case 'completed':
                return 'bg-blue-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    // Get status text color based on flow status
    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'text-green-600';
            case 'paused':
                return 'text-yellow-600';
            case 'completed':
                return 'text-blue-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="bg-transparent overflow-y-auto h-full pb-24">
            {/* Main Content */}
            <div className="p-6 max-w-screen-2xl mx-auto">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 mb-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to Mintflow</h1>
                    <p className="text-lg opacity-90 mb-6">Create, automate, and monitor your workflow processes with ease</p>

                    <div className="flex flex-wrap gap-4">
                        <button className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-blue-50">
                            <IconRenderer icon="GitBranch" className="w-4 h-4 mr-2" />
                            Create New Flow
                        </button>
                        <button className="bg-blue-500 bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-opacity-40 border border-white border-opacity-20">
                            <IconRenderer icon="BookOpen" className="w-4 h-4 mr-2" />
                            View Tutorials
                        </button>
                        <button className="bg-blue-500 bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-opacity-40 border border-white border-opacity-20">
                            <IconRenderer icon="LayoutTemplate" className="w-4 h-4 mr-2" />
                            Explore Templates
                        </button>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Continue Your Work & Templates */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Continue Your Work */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Continue Your Work</h2>
                                <Link href="/flow-runs/executions" className="text-blue-600 text-sm font-medium hover:text-blue-700">View All Flows</Link>
                            </div>

                            {recentFlows.length > 0 ? (
                                <div className="space-y-4">
                                    {recentFlows.map(flow => (
                                        <div key={flow.id} className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <div className={`p-3 rounded-lg ${flow.status === 'error' ? 'bg-red-50' : 'bg-blue-50'} mr-4`}>
                                                <IconRenderer icon={flow.icon} className={`w-6 h-6 ${flow.status === 'error' ? 'text-red-600' : 'text-blue-600'}`} />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium text-gray-900">{flow.name}</h3>
                                                    <div className="flex items-center">
                                                        <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(flow.status)}`}></span>
                                                        <span className={`text-xs font-medium ${getStatusTextColor(flow.status)}`}>
                                                            {flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{flow.description}</p>
                                                <div className="flex items-center mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        Last run {formatDistance(flow.lastRun, new Date())} ago
                                                    </span>
                                                    <span className="mx-2 text-gray-300">•</span>
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        {flow.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <IconRenderer icon="GitBranch" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-gray-500 font-medium mb-1">No recent flows</h3>
                                    <p className="text-gray-400 text-sm mb-4">Create your first workflow to get started</p>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                        Create New Flow
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Flow Templates */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Flow Templates</h2>
                                <Link href="/designer/templates" className="text-blue-600 text-sm font-medium hover:text-blue-700">View All Templates</Link>
                            </div>

                            {/* Template Categories */}
                            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                                {templateCategories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedTemplateCategory(category.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedTemplateCategory === category.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>

                            {/* Template Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredTemplates.map(template => (
                                    <div key={template.id} className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="h-40 bg-gray-100 relative">
                                            <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium text-gray-700 flex items-center">
                                                <IconRenderer icon="Star" className="w-3 h-3 text-yellow-500 mr-1" />
                                                {template.popularity}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {template.tags.map((tag, index) => (
                                                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="mt-3 text-xs text-gray-500">
                                                Used by {template.usedBy.toLocaleString()} users
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Community Showcase */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Community Showcase</h2>
                                <Link href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">View More</Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {communityShowcase.map(item => (
                                    <div key={item.id} className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="h-32 bg-gray-100">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                                            <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">By {item.author}</span>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <IconRenderer icon="Heart" className="w-3 h-3 mr-1" />
                                                    {item.likes}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Help, News, and Quick Start */}
                    <div className="space-y-6">
                        {/* Quick Start Videos */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Quick Start</h2>
                                <Link href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">View Library</Link>
                            </div>
                            <div className="space-y-4">
                                {tutorials.map(tutorial => (
                                    <div key={tutorial.id} className="group cursor-pointer">
                                        <div className="relative rounded-lg overflow-hidden mb-2">
                                            <CustomVideoPlayer width={'100%'} coverImage={tutorial?.thumbnail} url={tutorial.url} height={160} className={'w-full h-full'} />
                                        </div>
                                        <h3 className="font-medium text-gray-900 text-sm">{tutorial.title}</h3>
                                        <p className="text-xs text-gray-500">{tutorial.duration}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Help Center */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Help Center</h2>
                                <Link href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</Link>
                            </div>
                            <div className="space-y-3">
                                {helpTopics.map(topic => (
                                    <Link href={topic.link} key={topic.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <IconRenderer icon={topic.icon} className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">{topic.title}</h3>
                                            <p className="text-xs text-gray-600">{topic.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900 text-sm">Need more help?</h3>
                                        <p className="text-xs text-gray-600">Our support team is here for you</p>
                                    </div>
                                    <button className="bg-blue-50 text-blue-600 px-3 py-2 rounded text-sm font-medium hover:bg-blue-100">
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* News & Updates */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">News & Updates</h2>
                                <Link href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</Link>
                            </div>
                            <div className="space-y-4">
                                {newsAndUpdates.map(item => (
                                    <div key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center mb-2">
                                            <span className={`text-xs px-2 py-1 rounded-full mr-2 ${item.type === 'Feature' ? 'bg-green-100 text-green-700' :
                                                    item.type === 'Update' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-purple-100 text-purple-700'
                                                }`}>
                                                {item.type}
                                            </span>
                                            <span className="text-xs text-gray-500">{item.date}</span>
                                        </div>
                                        <h3 className="font-medium text-gray-900 text-sm mb-1">{item.title}</h3>
                                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                                        <Link href={item.link} className="text-xs text-blue-600 font-medium hover:text-blue-700">
                                            Learn more →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Community & Support */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Community & Support</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="#" className="flex flex-col items-center p-4 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                                    <IconRenderer icon="MessageSquare" className="w-6 h-6 mb-2" />
                                    <span className="text-sm text-center">Discord Community</span>
                                </Link>
                                <Link href="#" className="flex flex-col items-center p-4 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100">
                                    <IconRenderer icon="Book" className="w-6 h-6 mb-2" />
                                    <span className="text-sm text-center">Documentation</span>
                                </Link>
                                <Link href="#" className="flex flex-col items-center p-4 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                                    <IconRenderer icon="Video" className="w-6 h-6 mb-2" />
                                    <span className="text-sm text-center">Video Tutorials</span>
                                </Link>
                                <Link href="#" className="flex flex-col items-center p-4 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100">
                                    <IconRenderer icon="Calendar" className="w-6 h-6 mb-2" />
                                    <span className="text-sm text-center">Webinars</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeDashboard;
