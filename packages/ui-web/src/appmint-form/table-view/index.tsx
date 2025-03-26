'use client';

import React, { useEffect, useState } from 'react';
import { generateFakeData } from './table-util';
import { convertSchemaToColumns } from './generate.colums';
import { TableGroup } from './table-group';
import { classNames, getRandomString, toTitleCase } from '../utils';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, PaginationState, FilterFn, SortingFn, sortingFns } from '@tanstack/react-table';
import { compareItems } from '@tanstack/match-sorter-utils';
import { TableFilter } from './table-filter';
import { TablePagination } from './table-pagination';
import { TablePresetFilter } from './table-preset-filter';
import { TableButtons } from './table-buttons';
import { CollectionTableCardView } from './renderer/view-cards';
import { CollectionTableView } from './renderer/view-table';

// Stubs for missing dependencies
const GenerateSchema = {
    json: (title, data) => ({
        title,
        type: 'object',
        properties: {}
    })
};

export type TableEvents = 'data-request' | 'data-loaded' | 'select' | 'export' | 'refresh' | 'delete' | 'add' | 'datatype';
export type RowEvents = 'edit' | 'delete' | 'view' | 'clone' | 'select';

export const CollectionTable = (props: {
    hash?;
    options?;
    title?;
    description?;
    data?;
    path?;
    columns?;
    filterPreset?;
    schema?;
    filters?;
    accessMode?;
    inlineEdit?;
    datatype?;
    isDemo?;
    onRowEvent?: (event: RowEvents, rowId, row) => any;
    onTableEvent?: (event: TableEvents, option, selected) => any;
    isLoading?;
    cellRenderers?;
    itemRenderer?;
}) => {
    const [data, setData] = useState<any>([]);
    const [columns, setColumns] = useState<any>([]);
    const [creatingRowIndex, setCreatingRowIndex] = useState<number | undefined>();
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 40 });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [datatype, setDatatype] = useState(props.datatype);
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility,
            rowSelection,
            pagination,
            globalFilter,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: (newPagination: any) => {
            setPagination(newPagination);
            setCurrentPage(newPagination.pageIndex); // Update current page
        },
        // debugTable: true,
        // filterFns: {
        //     fuzzy: fuzzyFilter,
        // },
        globalFilterFn: 'fuzzy' as any,
        enableMultiRowSelection: true,
    });

    useEffect(() => {
        let schema = props.schema;
        if (!schema) {
            schema = GenerateSchema.json(props.title || getRandomString(6), props.data);
        }
        const [row0] = Array.isArray(props?.data) ? props?.data : [];
        let auditFields;
        let idField;
        let dataPrefix;
        if (props.datatype || row0?.sk) {
            auditFields = true;
            idField = 'sk';
            dataPrefix = 'data';
        } else if (row0) {
            auditFields = false;
            for (const key in ['_id', 'id', 'uid', 'key', 'name', 'title', 'label']) {
                if (row0[key]) {
                    idField = key;
                    break;
                }
            }
        }
        const columns = convertSchemaToColumns(idField, dataPrefix, schema, auditFields, props.cellRenderers);
        setColumns(columns);
        if (props.isDemo) {
            setData(generateFakeData(columns, 100));
        } else if (props.data) {
            setData(props.data);
        }
    }, [props.data, props.hash, props.datatype, props.schema]);

    useEffect(() => {
        if (!props.isDemo && datatype && !props.data) {
            (async () => {
                await loadData(currentPage);
            })();
        }
    }, [datatype, props.filters, props.hash, currentPage]);

    const onRowDataEvent = (eventType, id, row) => {
        if (eventType === 'delete') {
            setData(data.filter(item => item.sk !== id));
        }
    };

    const loadData = async (page = 1, refresh = false) => {
        const data = await onTableEvent('data-request', { page, refresh });
        setData(data);
        onTableEvent('data-loaded', { page, refresh });
    };

    const onTableEvent = async (e, option) => {
        let name;
        if (typeof e === 'object') {
            e.preventDefault();
            name = e.currentTarget.name;
        } else {
            name = e;
        }

        if (props.onTableEvent) {
            const selected: any[] = table.getSelectedRowModel().rows.map(row => row.original) || [];
            selectedRows.forEach(row => {
                const record = data[row];
                if (record) {
                    selected.push(record);
                }
            });
            if (await props.onTableEvent(name, option, selected)) {
                return;
            }
        }

        if (name === 'data-request') {

        } else if (name === 'data-loaded') {

        } else if (name === 'select') {

        } else if (name === 'export') {
            const selected: any[] = table.getSelectedRowModel().rows.map(row => row.original) || [];
            selectedRows.forEach(row => {
                const record = data[row];
                if (record) {
                    selected.push(record);
                }
            });

            if (!Array.isArray(selected)) return;
            const exportDTO = { length: selected.length, datatype, create_date: new Date().toISOString(), author: ' activeSession.getUser().data.email', data: selected };
            const blob = new Blob([JSON.stringify(exportDTO, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportDTO.datatype}-${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (name === 'refresh') {
            await loadData(1, true);
        } else if (name === 'delete') {
            const tableSelRows = table.getSelectedRowModel().rows;
            console.log('tableSelRows', tableSelRows);

            const ids: string[] = [];
            selectedRows.forEach(row => {
                const record = data[row];
                if (record && record.sk) {
                    ids.push(record.sk);
                }
            });
            await loadData(1, true);
            setSelectedRows([]);
        } else if (name === 'add') {
        } else if (name === 'datatype') {
            setDatatype(option);
        }
    };

    const selectRow = e => {
        const id = e.currentTarget.id;
        const index = selectedRows.indexOf(id);
        let selected;
        if (index > -1) {
            selected = selectedRows.filter(row => row !== id);
        } else {
            selected = [...selectedRows, id];
        }
        setSelectedRows(selected);

        if (props.onRowEvent) {
            props.onRowEvent('select', id, selected);
        }
    };

    const canSearch = props.options?.search !== false;
    const slimRow = props.options?.slimRow === true || props.options?.compact === true;
    const showGroup = props.options?.grouping !== false;
    const showPagination = props.options?.pagination !== false;
    const cardView = props.options?.cardView === true;

    const title = typeof props.title === 'undefined' && props.datatype ? toTitleCase(props.datatype) : props.title;
    return (
        <div className="h-full w-full overflow-hidden min-w-[600px] dark:bg-gray-900/80 bg-white/80 p-4 rounded-xl shadow-lg">
            {canSearch && (
                <div className="lg:flex items-center">
                    {(title || props.description) && <div className="lg:flex gap-3">
                        <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">{title || ''}</h1>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{props.description}</p>
                    </div>
                    }
                    <div className="flex justify-between items-center gap-5 w-full">
                        <TableFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} datatype={datatype} onTableEvent={onTableEvent} />
                        <TableButtons onTableEvent={onTableEvent} options={props.options} selectedRows={selectedRows} />
                    </div>
                </div>
            )}
            {(showGroup || props.filterPreset) && (
                <div className="lg:flex justify-between items-center gap-10 mt-4">
                    {props.filterPreset && <TablePresetFilter filterPreset={props.filterPreset} />}
                    {showGroup && <TableGroup />}
                </div>
            )}
            <div
                className={classNames(
                    canSearch && showGroup ? 'h-[calc(100%-300px)] ' : canSearch && !showGroup ? 'h-[calc(100%-150px)] ' : !canSearch && showGroup ? 'h-[calc(100%-150px)]' : 'h-[calc(100%-90px)]',
                    'mt-8 flow-root w-full overflow-auto',
                )}
            >
                <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
                    {cardView ? (
                        <CollectionTableCardView
                            table={table}
                            selectRow={selectRow}
                            selectedRows={selectedRows}
                            slimRow={slimRow}
                            onRowEvent={props.onRowEvent}
                            options={props.options}
                            itemRenderer={props.itemRenderer}
                            onRowDataEvent={onRowDataEvent}
                            datatype={props.datatype}
                        />
                    ) : (
                        <CollectionTableView table={table} selectRow={selectRow} selectedRows={selectedRows} slimRow={slimRow} onRowEvent={props.onRowEvent} options={props.options} onRowDataEvent={onRowDataEvent} datatype={props.datatype} />
                    )}
                </div>
            </div>
            {showPagination && <TablePagination table={table} />}
        </div>
    );
};


// Define a custom fuzzy sort function that will sort by rank if the row has ranking information
const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
    let dir = 0;

    // Only sort by rank if the column has ranking information
    if (rowA.columnFiltersMeta[columnId]) {
        // Using any type assertion to avoid TypeScript errors with itemRank property
        const metaA = rowA.columnFiltersMeta[columnId] as any;
        const metaB = rowB.columnFiltersMeta[columnId] as any;
        dir = compareItems(metaA?.itemRank, metaB?.itemRank);
    }

    // Provide an alphanumeric fallback for when the item ranks are equal
    return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export default CollectionTable;
