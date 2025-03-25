'use client';

import React from 'react';
import { useAlertStore } from './alertStore';
import { Alert, AlertType } from './types';

interface AlertDialogProps {
    alert: Alert;
    onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ alert, onClose }) => {
    const { updateConfirmAlert } = useAlertStore();

    // Get background color based on alert type
    const getBgColor = (type: AlertType): string => {
        switch (type) {
            case AlertType.ERROR:
                return 'bg-red-50 border-red-300';
            case AlertType.WARNING:
                return 'bg-yellow-50 border-yellow-300';
            case AlertType.SUCCESS:
                return 'bg-green-50 border-green-300';
            case AlertType.CONFIRM:
                return 'bg-blue-50 border-blue-300';
            case AlertType.INFO:
            default:
                return 'bg-blue-50 border-blue-300';
        }
    };

    // Get text color based on alert type
    const getTextColor = (type: AlertType): string => {
        switch (type) {
            case AlertType.ERROR:
                return 'text-red-800';
            case AlertType.WARNING:
                return 'text-yellow-800';
            case AlertType.SUCCESS:
                return 'text-green-800';
            case AlertType.CONFIRM:
                return 'text-blue-800';
            case AlertType.INFO:
            default:
                return 'text-blue-800';
        }
    };

    // Handle confirm action
    const handleConfirmAction = (confirmed: boolean) => {
        updateConfirmAlert(alert.id, confirmed);
        if (alert.onAction) {
            alert.onAction(confirmed);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${getBgColor(alert.alertType)}`}>
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className={`text-lg leading-6 font-medium ${getTextColor(alert.alertType)}`} id="modal-title">
                                    {alert.title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-700">
                                        {alert.message}
                                    </p>
                                    {alert.details && (
                                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                                            <p className="text-sm text-gray-600">
                                                {alert.details}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        {alert.alertType === AlertType.CONFIRM && !alert.confirmed && (
                            <>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => handleConfirmAction(true)}
                                >
                                    Confirm
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => handleConfirmAction(false)}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            className={`${alert.alertType === AlertType.CONFIRM && !alert.confirmed ? 'mt-3 sm:mt-0 sm:ml-3' : 'w-full sm:w-auto'} inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm`}
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
