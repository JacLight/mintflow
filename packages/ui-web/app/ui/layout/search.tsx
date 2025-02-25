import React from 'react';
import { FaFolder } from 'react-icons/fa';
import { IoSearchOutline } from 'react-icons/io5';

const SearchUI = () => {
    const projects = [
        { name: 'Website Redesign', company: 'Workflow Inc.' },
        { name: 'Open Graph Image', company: 'Workflow Inc.' },
        { name: 'Logo Design', company: 'Workflow Inc.' },
        { name: 'Advertising Campaign', company: 'Workflow Inc.' },
        { name: 'TV Ad Campaign', company: 'Conglomerate Inc.' },
        { name: 'Mobile App', company: 'Conglomerate Inc.' },
        { name: 'Product Design', company: 'Conglomerate Inc.' }
    ];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full h-full">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-800 px-3 py-2">
                <IoSearchOutline className="text-gray-400 text-lg" />
                <input
                    type="text"
                    className="bg-transparent outline-none focus:ring-0  text-gray-900 dark:text-white w-full border-none placeholder:text-gray-400"
                    placeholder='Search for "Website Redesign"'
                />
            </div>
            <div className="p-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">
                    Projects
                </div>

                <div className="space-y-0.5">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className={`flex items-center px-2 py-1.5 rounded ${index === 0 ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <FaFolder className="mr-2 text-sm" />
                            <span className="text-sm">{project.company} / {project.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-0 w-full bg-gray-50">
                <div className="text-sm text-gray-600 dark:text-gray-400 p-2">
                    Type <span className="px-1 rounded bg-gray-100 dark:bg-gray-800">#</span> to access projects,{' '}
                    <span className="px-1 rounded bg-gray-100 dark:bg-gray-800">{'>'}</span> for users, and{' '}
                    <span className="px-1 rounded bg-gray-100 dark:bg-gray-800">?</span> for help.
                </div>
            </div>
        </div>
    );
};

export default SearchUI;