import React from 'react';
import { showNotice } from '../context/store';
import { IconRenderer } from '../common/icons/icon-renderer';
import { classNames } from '../utils';


const DataJSONView = (props) => {
    return (
        <div className=' dark:bg-[#1f2937]   bg-white text-black  rounded-lg shadow-lg dark:text-gray-100 transform-[translate(-50%,-50%)] fixed top-1/2 left-1/2 p-4 z-10 dark:shadow-[]'
        >
            <h3>JSON Data</h3>
            <pre>{JSON.stringify(props.data, null, 2)}</pre>
            <button
                onClick={props.onClose}
                className='dark:bg-[#374151] bg-[#f3f4f6] text-black dark:text-white p-2 rounded-md'
            >
                Close
            </button>
        </div >
    );
};

const BusyIcon = ({ isLoading }) => isLoading ? <span>⌛</span> : null;

const Icon = ({ name, color, size }) => {
    const icons = {
        FaEdit: '✏️',
        FaEye: '👁️',
        FaClone: '📋'
    };
    return <span style={{ color, fontSize: size }}>{icons[name] || '⚠️'}</span>;
};

// Stub for requestQueueInstance
const requestQueueInstance = {
    deleteData: async (datatype, id) => {
        console.log(`Deleting ${id} from ${datatype}`);
        return { success: true };
    },
    getDataById: async (datatype, id) => {
        console.log(`Getting ${id} from ${datatype}`);
        return { sk: id, datatype, data: {} };
    }
};

const iconSize = 12;
export const RowHandler: React.FC<any> = (props: { options?; row; onRowEvent: (event, id, row) => boolean; datatype; onRowDataEvent }) => {
    const { row, onRowEvent } = props;
    const [showJSON, setShowJSON] = React.useState<any>(false);
    const [isLoading, setIsLoading] = React.useState<any>(false);
    const [deleteActive, setDeleteActive] = React.useState<any>(false);

    const deleteHandler = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!deleteActive) {
            setDeleteActive(true);
            setTimeout(() => {
                setDeleteActive(false);
            }, 3000);
            return;
        }
        if (onRowEvent) {
            const rt = await onRowEvent('delete', row.id, row);
            if (rt === true) {
                return;
            }
        }
        if (props.datatype) {
            setIsLoading(true);
            await requestQueueInstance
                .deleteData(props.datatype, row.original.sk)
                .then(res => {
                    showNotice(props.datatype.toUpperCase() + ' deleted', 'info');
                    if (props.onRowDataEvent) {
                        props.onRowDataEvent('delete', row.original.sk, row);
                    }
                })
                .catch(e => {
                    console.error(e);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const rowEditHandler = async e => {
        e.preventDefault();
        e.stopPropagation();

        if (onRowEvent) {
            const rt = await onRowEvent('edit', row.id, row);
            if (rt === true) {
                return;
            }
        }
        setIsLoading(true);
        const data = await requestQueueInstance
            .getDataById(props.datatype, row.original.sk)
            .catch(e => {
                console.error(e);
            })
            .finally(() => {
                setIsLoading(false);
            });

        if (props.datatype) {
            // useSiteStore.getState().setStateItem({ dataFormProps: { data: data, datatype: props.datatype } });
        }
        console.log('rowEditHandler', row);
    };

    const rowJSONViewHandler = async e => {
        e.preventDefault();
        e.stopPropagation();

        if (onRowEvent) {
            const rt = await onRowEvent('view', row.id, row);
            if (rt === true) {
                return;
            }
        }
        setShowJSON(!showJSON);
        console.log('rowJSONViewHandler', row);
    };

    const rowCloneHandler = async e => {
        e.preventDefault();
        e.stopPropagation();

        if (onRowEvent) {
            const rt = await onRowEvent('clone', row.id, row);
            if (rt === true) {
                return;
            }
        }
        console.log('rowCloneHandler', row);
    };

    const canEdit = props.options?.rowEdit !== false && props.options?.readOnly !== true;
    const canDelete = props.options?.rowDelete !== false && props.options?.readOnly !== true;
    const canClone = props.options?.rowClone !== false && props.options?.readOnly !== true;

    const buttonClass = "p-1 bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 rounded-full shadow hover:scale-125 block transition-all duration-200";

    return (
        <div className="flex gap-0 mr-2 items-center">
            <div className="">
                <BusyIcon isLoading={isLoading} />
            </div>
            {canEdit && (
                <button
                    onClick={rowEditHandler}
                    title="Edit"
                    className={buttonClass}
                >
                    <IconRenderer icon="Edit" size={iconSize} className=' stroke-sky-500' />
                </button>
            )}
            <button
                title="View JSON"
                onClick={rowJSONViewHandler}
                className={buttonClass}
            >
                <IconRenderer icon="Eye" size={iconSize} className=' stroke-sky-500' />
            </button>
            {canClone && (
                <button
                    title="Clone"
                    onClick={rowCloneHandler}
                    className={buttonClass}
                >
                    <IconRenderer icon="Copy" size={iconSize} className=' stroke-sky-500' />
                </button>
            )}
            {canDelete &&
                <button
                    onClick={deleteHandler}
                    title="Delete"
                    className={buttonClass}
                >
                    <IconRenderer icon={deleteActive ? 'Check' : "Trash"} size={iconSize} className={classNames(deleteActive ? 'stroke-red-600' : ' stroke-sky-500')} color={deleteActive ? 'red' : undefined} />
                </button>
            }

            {showJSON && <DataJSONView key={row.id} datatype={row.original.datatype} uid={row.original.sk} data={row.original} onClose={e => setShowJSON(false)} />}
        </div>
    );
};
