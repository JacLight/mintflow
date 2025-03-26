import React from 'react';
import { IconRenderer } from '../common/icons/icon-renderer';
import { useTheme } from '../../../../../contexts/theme-context';

export const TablePagination: React.FC<any> = ({ table }) => {
    return (
        <div>
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-5">
                        <span className="flex items-center gap-1">
                            <div>Page</div>
                            <strong className="dark:text-white">
                                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </strong>
                        </span>
                        <select
                            className="text-sm w-24 rounded h-8 px-2 py-0 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={table.getState().pagination.pageSize}
                            onChange={e => {
                                table.setPageSize(Number(e.target.value));
                            }}
                        >
                            {[10, 20, 30, 40, 50, 100].map(pageSize => (
                                <option key={pageSize} value={pageSize} className="dark:bg-gray-700">
                                    Show {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                                className="relative inline-flex items-center rounded-l-md px-2 py-1 text-gray-400 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
                            >
                                <IconRenderer icon="ChevronsLeft" className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="relative inline-flex items-center px-4 py-1 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
                            >
                                <IconRenderer icon="ChevronLeft" className="h-5 w-5" aria-hidden="true" />
                            </button>

                            <span className="relative inline-flex items-center gap-1 px-4 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0">
                                <span>Go to page:</span>
                                <input
                                    type="number"
                                    className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white w-16 rounded h-8 px-2 py-0"
                                    value={table.getState().pagination.pageIndex + 1}
                                    onChange={e => {
                                        const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                        table.setPageIndex(page);
                                    }}
                                />
                            </span>
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="relative inline-flex items-center px-4 py-1 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
                            >
                                <IconRenderer icon="ChevronRight" className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                                className="relative inline-flex items-center rounded-r-md px-2 py-1 text-gray-400 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
                            >
                                <IconRenderer icon="ChevronsRight" className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};
