import React, { Fragment, useEffect, useState } from 'react'
import { Transition } from './select-components'
import { IconRenderer } from './icons/icon-renderer';

export function SiteNotification() {
    const [notice, setNotice] = useState<any>()
    const { message, duration, type } = notice || {};
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            setTimeout(() => {
                setVisible(false);
                setNotice({ notice: {} })
            }, 5000);
        }
    }, [notice]);

    let icon;
    let color;
    if (type === 'success') { icon = <IconRenderer icon={'BsCheckCircle'} className="h-6 w-6  text-green-400" />; color = 'text-green-400'; }
    if (type === 'error') { icon = <IconRenderer icon={'VscError'} className="h-6 w-6  text-red-400" />; color = 'text-red-400'; }
    if (type === 'warning') { icon = <IconRenderer icon={'AiOutlineWarning'} className="h-6 w-6  text-yellow-400" />; color = 'text-yellow-400'; }
    if (type === 'info') { icon = <IconRenderer icon={'BsInfoCircle'} className="h-6 w-6  text-blue-400" />; color = 'text-blue-400'; }

    return (
        <>
            {/* Global notification live region, render this permanently at the end of the document */}
            <div
                aria-live="assertive"
                className="pointer-events-none top-16 fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
            >
                <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                    {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
                    <Transition
                        show={visible}
                        as={Fragment}
                        enter="transform ease-out duration-300 transition"
                        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        {icon}
                                    </div>
                                    <div className="ml-3 w-0 flex-1 pt-0.5">
                                        <p className={`text-sm font-medium ${color}`}>{type?.toUpperCase()}</p>
                                        <p className="mt-1 text-sm text-slate-500">{message}</p>
                                    </div>
                                    <div className="ml-4 flex flex-shrink-0">
                                        <button
                                            type="button"
                                            className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            onClick={() => {
                                                setVisible(false)
                                            }}
                                        >
                                            <span className="sr-only">Close</span>
                                            <IconRenderer icon={'X'} className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </>
    )
}
