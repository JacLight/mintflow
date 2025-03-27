'use client';

import { useState, useEffect } from "react";
import { DataList } from "../common/data-list";
import { MintflowSchema } from "../../lib/models/flow-model";
import { getMintflowService } from "../../lib/mintflow-service";
import { IconRenderer } from "../ui/icon-renderer";
import { formatDistance } from "date-fns";
import { classNames } from "@/lib/utils";
import { CustomVideoPlayer } from "../custom-video-player";

// Tutorial data
const tutorials = [
    { id: 1, title: "How to Create a Responsive Layout", duration: "5:30", thumbnail: "", url: "https://www.youtube.com/watch?v=_UTqwU8IZH0" },
    { id: 2, title: "Building Interactive Forms", duration: "8:45", thumbnail: "", url: "https://www.youtube.com/watch?v=PNRUWs8HFkU" },
];

// Essential tools data
const tools = [
    { id: 1, name: "Component Library", description: "Access pre-built UI components", icon: 'Layout' },
    { id: 2, name: "Data Connector", description: "Connect your app to data sources", icon: 'Database' },
    { id: 3, name: "Form Builder", description: "Create interactive forms", icon: 'FileText' },
    { id: 4, name: "Workflow Designer", description: "Design app logic and workflows", icon: 'GitBranch' }
];

const demoTemplates = [
    {
        id: 1,
        name: 'Personal Portfolio',
        image: 'https://picsum.photos/seed/picsum/200/300?random=1',
        tags: 'Website',
        templateName: 'Personal Portfolio',
        url: 'https://www.google.com'
    },
    {

        id: 2,
        name: 'E-commerce Store',
        image: 'https://picsum.photos/seed/picsum/200/300?random=2',
        tags: 'Website',
        templateName: 'E-commerce Store',
        url: 'https://www.google.com'
    },
    {
        id: 3,
        name: 'Customer Feedback Form',
        image: 'https://picsum.photos/seed/picsum/200/300?random=3',
        tags: 'Form',
        templateName: 'Customer Feedback Form',
        url: 'https://www.google.com'
    },
    {
        id: 4,
        name: 'Mobile App',
        image: 'https://picsum.photos/seed/picsum/200/300?random=4',
        tags: 'App',
        templateName: 'Mobile App',
        url: 'https://www.google.com'
    },
    {
        id: 5,
        name: 'Admin Dashboard',
        image: 'https://picsum.photos/seed/picsum/200/300?random=5',
        tags: 'Website',
        templateName: 'Admin Dashboard',
        url: 'https://www.google.com'
    },
];

// Define the type for page data
interface PageData {
    sk: string;
    data: {
        name: string;
        thumbnail: string;
        type?: string;
    };
    status: string;
    modifydate: string;
    type?: string;
}

const lastModifiedPages: PageData[] = [
    {
        sk: '1', data: { name: 'Personal Portfolio', thumbnail: `https://picsum.photos/seed/picsum/201/301?random=23423` },
        status: 'published', modifydate: '2021-10-10', type: 'Website'
    },
    {
        sk: '2', data: { name: 'E-commerce Store', thumbnail: `https://picsum.photos/seed/picsum/202/302?random=dadsfa` },
        status: 'draft', modifydate: '2021-10-10', type: 'Website'
    },
    {
        sk: '3', data: { name: 'Customer Feedback Form', thumbnail: `https://picsum.photos/seed/picsum/203/303?random=eee` },
        status: 'published', modifydate: '2021-10-10', type: 'Form'
    },
    {
        sk: '4', data: { name: 'Mobile App', thumbnail: `https://picsum.photos/seed/picsum/204/304?random=1234` },
        status: 'published', modifydate: '2021-10-10', type: 'App'
    },
    {
        sk: '5', data: { name: 'Admin Dashboard', thumbnail: `https://picsum.photos/seed/picsum/205/305?random=123443` },
        status: 'published', modifydate: '2021-10-10', type: 'Website'
    },
];

// AI suggestions
const aiSuggestions = [
    "Add user authentication to your app",
    "Create a responsive dashboard layout",
    "Implement form validation for better UX",
    "Add data visualization to your dashboard"
];

const WelcomeMintflow = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [showAllProjects, setShowAllProjects] = useState(false);
    const mintflowService = getMintflowService();

    const buttons = [
        { method: null, icon: 'Layout', name: 'Create from template' },
        { method: null, icon: 'Wand', name: 'Create with AI' },
    ];

    const pageUpdated = (newPage: any) => {

    };

    const createNewProject = async (appType = 'web') => {
    };

    const createWithAI = async () => {
    };

    const showProjects = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShowAllProjects(true);
    };

    const openProject = (rowId: string, row: any) => {
        // Here you would navigate to the workflow designer with the selected flow
        console.log('Opening project:', rowId, row);
        // Example: router.push(`/workflow-designer/${rowId}`);
    };

    // Handle click on project card
    const handleProjectCardClick = (page: PageData) => {
        if (page && page.sk) {
            openProject(page.sk, page);
        }
    };


    return (
        <div className="bg-transparent overflow-y-auto h-full pb-24">
            {/* Main Content */}
            <div className="p-6 max-w-screen-2xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Build Studio</h1>
                        <p className="text-gray-600 mt-1">Create websites, apps, and forms with our visual builder</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => createNewProject('web')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                            <IconRenderer icon="Plus" className="w-4 h-4 mr-2" />
                            Create new
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                            <IconRenderer icon="Download" className="w-4 h-4 mr-2" />
                            Import
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('recent')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'recent' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Recently viewed
                    </button>
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'created' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Created by you
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'favorites' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Favorites
                    </button>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* New Project Card */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center h-64 hover:border-blue-400 cursor-pointer">
                        <div className="bg-blue-50 p-3 rounded-full mb-3">
                            <IconRenderer icon="Plus" className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">Create New Project</h3>
                        <p className="text-sm text-gray-500 mb-4">Start building a website, app, or form</p>
                        <div className="flex space-x-2">
                            <button onClick={() => createNewProject('web')} className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm">Website</button>
                            <button onClick={() => createNewProject('mobile')} className="bg-purple-100 text-purple-600 px-3 py-1 rounded text-sm">App</button>
                            <button onClick={() => createNewProject('form')} className="bg-green-100 text-green-600 px-3 py-1 rounded text-sm">Form</button>
                        </div>
                    </div>

                    {/* Project Cards */}
                    {lastModifiedPages?.slice(0, 5).map((page, index) => (
                        <div key={page.sk} onClick={() => handleProjectCardClick(page)} className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                            {/* Preview Image */}
                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                                {page.data.thumbnail ? (
                                    <img src={page.data.thumbnail} alt={page.data.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-400">
                                        <IconRenderer icon="Layout" className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            {/* Project Info */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-gray-900">{page.data.name}</h3>
                                    <div className="flex items-center">
                                        <span className={`w-2 h-2 rounded-full ${page.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Last edited {page?.modifydate && formatDistance(new Date(page?.modifydate), new Date())} ago
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {page.type || page.data.type || 'Website'}
                                    </span>
                                    <button
                                        className="text-gray-400 hover:text-gray-600"
                                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}
                                        aria-label="More options"
                                    >
                                        <IconRenderer icon="MoreHorizontal" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mb-8">
                    <button onClick={showProjects} className="text-blue-600 font-medium hover:text-blue-700">
                        View All Projects
                    </button>
                </div>

                <DataList
                    show={showAllProjects}
                    datatype={'mintflow'}
                    onClose={() => setShowAllProjects(false)}
                    onRowClick={openProject}
                />

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Templates & Tutorials */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Popular Templates */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Popular Templates</h2>
                                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
                            </div>
                            <BasePageTemplate itemCount={4} itemClass={'w-full max-w-fit lg:max-w-80'} />
                        </div>

                        {/* Video Tutorials */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Quick Start Videos</h2>
                                <a href='https://www.youtube.com/@appmint' target='_blank' rel="noopener noreferrer" className="text-blue-600 text-sm font-medium hover:text-blue-700">View Library</a>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tutorials.map(tutorial => (
                                    <div key={tutorial.id} className="group cursor-pointer">
                                        <div className="relative rounded-lg overflow-hidden mb-2">
                                            <CustomVideoPlayer width={'100%'} coverImage={tutorial?.thumbnail} url={tutorial.url} height={220} className={'w-full h-full'} />
                                        </div>
                                        <h3 className="font-medium text-gray-900">{tutorial.title}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Tools & Resources */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => createNewProject('web')} className="flex flex-col items-center p-4 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                                    <IconRenderer icon="Globe" className="w-6 h-6 mb-2" />
                                    <span className="text-sm">New Website</span>
                                </button>
                                <button onClick={() => createNewProject('mobile')} className="flex flex-col items-center p-4 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100">
                                    <IconRenderer icon="Smartphone" className="w-6 h-6 mb-2" />
                                    <span className="text-sm">New App</span>
                                </button>
                                <button onClick={() => createNewProject('form')} className="flex flex-col items-center p-4 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                                    <IconRenderer icon="FileText" className="w-6 h-6 mb-2" />
                                    <span className="text-sm">New Form</span>
                                </button>
                                <button onClick={createWithAI} className="flex flex-col items-center p-4 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100">
                                    <IconRenderer icon="Wand" className="w-6 h-6 mb-2" />
                                    <span className="text-sm">AI Builder</span>
                                </button>
                            </div>
                        </div>

                        {/* Essential Tools */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Essential Tools</h2>
                            <div className="space-y-3">
                                {tools.map(tool => (
                                    <div key={tool.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <IconRenderer icon={tool.icon} className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{tool.name}</h3>
                                            <p className="text-sm text-gray-600">{tool.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">AI Suggestions</h2>
                                <button className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
                            </div>
                            <div className="space-y-3">
                                {aiSuggestions.map((suggestion, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-2">
                                        <IconRenderer icon="Zap" className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <p className="text-sm text-gray-600">{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface BasePageTemplateProps {
    templates?: typeof demoTemplates;
    itemClass?: string;
    itemCount?: number;
}

const BasePageTemplate = ({ templates = demoTemplates, itemClass, itemCount }: BasePageTemplateProps) => {
    const [selected, setSelected] = useState<any>(null);


    const selectItem = (item: any) => {
        setSelected(item);
    };

    return (
        <div className="flex gap-5 flex-wrap">
            {templates?.map((item: any, index: number) => {
                const commonClasses = "opacity-0 absolute group-hover:opacity-90 duration-200 transition-all  text-xs"
                return (
                    <div onClick={e => selectItem(item)} key={index} className={classNames(selected?.id === item.id && 'bg-purple-600', 'p-2 max-w-96 h-64 overflow-hidden w-full cursor-pointer group hover:bg-cyan-100 relative')}>
                        <div className='h-[calc(288px-40px)] overflow-hidden'>
                            <img className="w-full" src={item.image} alt={item?.path} />
                        </div>
                        <div className={classNames(commonClasses, "bottom-4 text-center w-full")}>
                            <a href={item.url} target={'_blank'} rel="noopener noreferrer" className={classNames(item.url && "hover:bg-purple-700 px-2 py-1 text-sm semibold hover:text-white bg-white rounded-full")}>Live preview - {item?.title || item?.name}</a>
                        </div>
                        {item.tags && <div className={classNames(commonClasses, "top-10 left-10 px-2 py-1 rounded-full shadow bg-white")}>{item.tags}</div>}
                        <div className={classNames(commonClasses, "top-10 right-10 px-2 py-1 rounded-full shadow bg-purple-700 text-white")}>{item.templateTitle || item.templateName}</div>
                    </div>
                );
            })}
        </div>
    );
}

export default WelcomeMintflow;
