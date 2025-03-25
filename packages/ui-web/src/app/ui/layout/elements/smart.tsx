'use client';
import React, { useState } from 'react';
import {
    FaThLarge,
    FaStream,
    FaCircle,
    FaStarOfLife,
} from 'react-icons/fa';

const content = {
    vision: {
        title: "Vision",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    },
    mission: {
        title: "Mission",
        text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim"
    },
    goal: {
        title: "Goal",
        text: "Sed ut perspiciatis unde omnis iste natus error sit volupte tem accusa ntium eius modi tempora"
    },
    strategy: {
        title: "Strategy",
        text: "Foste natus error sit volupte tem accusa ntium eius modi tempora"
    }
};

const LayoutSwitcher = () => {
    const [layout, setLayout] = useState('grid');

    const layouts = {
        grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
        staircase: 'flex flex-col space-y-4',
        timeline: 'flex flex-col space-y-8',
        ring: 'grid grid-cols-1 md:grid-cols-2 gap-4'
    };

    const renderGrid = () => (
        <div className={layouts.grid}>
            {Object.entries(content).map(([key, item]) => (
                <div key={key} className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.text}</p>
                </div>
            ))}
        </div>
    );

    const renderStaircase = () => (
        <div className={layouts.staircase}>
            {Object.entries(content).map(([key, item], index) => (
                <div
                    key={key}
                    className="flex items-start"
                    style={{ marginLeft: `${index * 2}rem` }}
                >
                    <div className="bg-purple-100 p-4 rounded-lg w-12 h-12 flex items-center justify-center mr-4">
                        <span className="font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTimeline = () => (
        <div className="relative">
            <div className="absolute left-1/2 h-full w-1 bg-purple-100"></div>
            <div className={layouts.timeline}>
                {Object.entries(content).map(([key, item], index) => (
                    <div key={key} className="flex items-center">
                        <div className="w-1/2 pr-8 text-right">
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            {index % 2 === 0 && <p className="text-gray-600">{item.text}</p>}
                        </div>
                        <div className="relative flex items-center justify-center w-8">
                            <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center z-10">
                                {index + 1}
                            </div>
                        </div>
                        <div className="w-1/2 pl-8">
                            {index % 2 === 1 && <p className="text-gray-600">{item.text}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRing = () => (
        <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-purple-100 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-8 p-16">
                {Object.entries(content).map(([key, item], index) => (
                    <div key={key} className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (layout) {
            case 'grid':
                return renderGrid();
            case 'staircase':
                return renderStaircase();
            case 'timeline':
                return renderTimeline();
            case 'ring':
                return renderRing();
            default:
                return renderGrid();
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8 flex space-x-4">
                <button
                    onClick={() => setLayout('grid')}
                    className={`p-2 rounded ${layout === 'grid' ? 'bg-purple-100' : 'bg-gray-100'}`}
                >
                    <FaThLarge className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setLayout('staircase')}
                    className={`p-2 rounded ${layout === 'staircase' ? 'bg-purple-100' : 'bg-gray-100'}`}
                >
                    <FaStarOfLife className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setLayout('timeline')}
                    className={`p-2 rounded ${layout === 'timeline' ? 'bg-purple-100' : 'bg-gray-100'}`}
                >
                    <FaStream className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setLayout('ring')}
                    className={`p-2 rounded ${layout === 'ring' ? 'bg-purple-100' : 'bg-gray-100'}`}
                >
                    <FaCircle className="w-6 h-6" />
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default LayoutSwitcher;