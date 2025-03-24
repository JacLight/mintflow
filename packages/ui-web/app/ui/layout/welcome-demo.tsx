// import Icon from 'sharedApp/Icon';
import React from 'react';
import { BsGithub } from "react-icons/bs";
import { HiSun } from "react-icons/hi";
import { FaFacebook } from 'react-icons/fa';
// import ViewImage from './view.png';
import EditableComponent from './editable';
import ViewManager from './view-manager';
import MusicPlayer from './music-player';
import SearchUI from './search';
import ThemeToggle from './ThemeToggle';
import LayoutSwitcher from './elements/smart';
import { InviteBox } from './invite-box';

const LandingPage = () => {


    return (
        // <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="min-h-screen">

            {/* <ViewManager
                id="unique-box-1"
                title="My Float Box"
                defaultPosition={{ x: 100, y: 100 }}
                defaultSize={{ width: 400, height: 300 }}
            >
                <div className="p-4">
                    Any content you want to float
                </div>
            </ViewManager> */}

            {/* 
            <ViewManager id="search-box-1" title="Search UI">
                <SearchUI />
            </ViewManager> */}

            <ViewManager id="box-1" title="Box One">
                <InviteBox />
            </ViewManager>


            <ViewManager id="music-box-1" title="Music Player" defaultSize={{ width: 400, height: 300 }} compact={true} defaultPosition={{ x: 100, y: 100 }}>
                <MusicPlayer />
            </ViewManager>

            {/* <ViewManager id="music-box-1" title="Music Player" defaultSize={{ width: 1000, height: 800 }} compact={true} defaultPosition={{ x: 100, y: 100 }}>
                <LayoutSwitcher />
            </ViewManager> */}

            {/* 

            <ViewManager id="box-c1" title="Box 1">
                <img src={ViewImage} alt="View Image" />
            </ViewManager>

            <ViewManager id="box-2" title="Box 2">
                <div>Content for box 2</div>
            </ViewManager> */}

            <ViewManager
                id="my-float-box"
                title="My Floating Window"
                defaultPosition={{ x: 100, y: 100 }}
                defaultSize={{ width: 400, height: 300 }}
                compact={true}
            >
                <EditableComponent />
            </ViewManager>

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 bg-white/50 backdrop-blur-sm border-b border-gray-200">
                {/* Left section - Logos */}
                <div className="flex items-center gap-3">
                    <FaFacebook className="h-6 w-6" />
                    <div className="w-px h-6 bg-gray-200" /> {/* Divider */}
                    <div className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs">W</div>
                        <span className="text-sm text-gray-600">Made by WorkOS</span>
                    </div>
                </div>

                {/* Center section - Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1 rounded-full bg-black text-white text-sm">
                            Themes
                        </button>
                        <button className="px-3 py-1 rounded-full hover:bg-gray-100 text-sm text-gray-600">
                            Primitives
                        </button>
                        <button className="px-3 py-1 rounded-full hover:bg-gray-100 text-sm text-gray-600">
                            Icons
                        </button>
                        <button className="px-3 py-1 rounded-full hover:bg-gray-100 text-sm text-gray-600">
                            Colors
                        </button>
                    </div>
                </nav>

                {/* Right section - Actions */}
                <div className="flex items-center gap-4">
                    <a href="#" className="text-gray-600 hover:text-gray-900">Documentation</a>
                    <a href="#" className="text-gray-600 hover:text-gray-900">Playground</a>
                    <a href="#" className="text-gray-600 hover:text-gray-900">Blog</a>
                    <button className="p-2 hover:bg-gray-100 rounded-md">
                        <BsGithub className="w-5 h-5" />
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 mt-12">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left Column */}
                    <div>
                        <h1 className="text-4xl md:text-6xl font-serif mb-4">
                            Start building your app now
                        </h1>
                        <p className="text-gray-600 mb-8">
                            An open source component library optimized for fast development,
                            easy maintenance, and accessibility. Just import and go—no configuration required.
                        </p>
                        <div className="flex gap-4">
                            <button className="bg-black text-white px-6 py-2 rounded-md flex items-center gap-2">
                                Get started
                            </button>
                            <button className="bg-purple-100 text-purple-900 px-6 py-2 rounded-md">
                                Playground
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}

                </div>
            </main>
        </div>
    );
};

export default LandingPage;