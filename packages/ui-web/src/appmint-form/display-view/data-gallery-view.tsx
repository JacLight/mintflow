'use client';
import React, { useEffect } from 'react';
import { BaseModelDTO, classNames, getRandomString, getResponseErrorMessage } from '../utils';
import { useShallow } from 'zustand/shallow';
import { useFormStore } from '../context/store';
import { LoadingIndicator } from '../common/loading-indicator';
import { IconRenderer } from '../common/icons/icon-renderer';
import CollectionTable from '../table-view';
import CollectionForm from '../form-view';
import { CollectionHelper } from '../form-view/form-utils';
import ViewManager from '../common/view-manager/view-manager';
import { iconButtonClass } from '../utils/constants';
import { StyledComponent } from '../form-elements/styling';
import { JSONViewer } from '../common/json-viewer';

// // Dynamically import JSONViewer with ssr disabled
// const JSONViewer = dynamic(() => import('../common/json-viewer').then(mod => mod.JSONViewer), {
//   ssr: false,
//   loading: () => <div>Loading JSON viewer...</div>
// });

export const DataGalleryView = (props: { datatype?; data?, popup?, filter?, openRecord?}) => {
  const { dataViewProps } = useFormStore(useShallow(state => ({ dataViewProps: state.dataViewProps })));
  const [activeTab, setActiveTab] = React.useState('list');
  const [activeRecord, setActiveRecord] = React.useState(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [dataDTO, setDataDTO] = React.useState<BaseModelDTO<any> | null>(null);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [datatype, setDatatype] = React.useState(props.datatype || dataViewProps?.datatype);

  useEffect(() => {
    if (dataViewProps?.type === 'gallery') {
      changeDatatype(dataViewProps.datatype);
    }

    return () => {
      setDatatype(null);
      setActiveRecord(null);
      setCurrentIndex(0);
      setDataDTO(null);
      setError(null);
    }
  }, [dataViewProps]);

  const changeDatatype = datatype => {
    setDatatype(datatype);
    setError(null);
    setActiveRecord(null);
    setCurrentIndex(0);
    setDataDTO(null);
    setIsLoading(false);
  };

  const closeHandler = () => {
    useFormStore.getState().setStateItem({ dataViewProps: null });
  };

  const nextRecord = () => {
    setError(null);
    const currentIndex = dataDTO?.data.findIndex(item => item.sk === activeRecord?.sk);
    if (currentIndex !== undefined && dataDTO && currentIndex < dataDTO.data.length - 1) {
      setActiveRecord(dataDTO.data[currentIndex + 1]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevRecord = () => {
    setError(null);
    const currentIndex = dataDTO?.data.findIndex(item => item.sk === activeRecord?.sk);
    if (currentIndex !== undefined && currentIndex > 0) {
      setActiveRecord(dataDTO?.data[currentIndex - 1]);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const openRecord = (record) => {
    const currentIndex = dataDTO?.data.findIndex(item => item.sk === record.sk);
    if (props.openRecord) {
      props.openRecord(record);
      return;
    }
    setActiveRecord(record);
    if (currentIndex !== undefined) {
      setCurrentIndex(currentIndex);
    }
    setActiveTab('detail');
  };

  const collection: any = datatype ? CollectionHelper.getInstance().getCollection(datatype) : "";
  if (dataViewProps?.type !== 'gallery') return null;

  const table = (
    <div className="h-full w-full relative">
      <StyledComponent
        componentType="data-gallery-view"
        part="tabs"
      >
        <StyledComponent
          componentType="data-gallery-view"
          part={activeTab === 'list' ? "tabActive" : "tab"}
          onClick={e => setActiveTab('list')}
        >
          List
        </StyledComponent>
        <StyledComponent
          componentType="data-gallery-view"
          part={activeTab === 'detail' ? "tabActive" : "tab"}
          onClick={e => setActiveTab('detail')}
        >
          Data View
        </StyledComponent>
      </StyledComponent>
      {error && <div className=" max-w-screen-md mx-auto bg-red-100 p-2 text-sm text-center">{error}</div>}
      {(!collection || isLoading) ? <LoadingIndicator /> :
        (
          <>
            <div className="text-sm flex items-center w-fit gap-5 absolute top-0 right-0 h-9 px-4">
              <StyledComponent
                componentType="data-gallery-view"
                part="header"
              >
                {collection?.data?.name}
              </StyledComponent>
              <div>{activeRecord?.sk}</div>
              {dataDTO?.total && (
                <div>
                  {currentIndex + 1} of {dataDTO?.total}
                </div>
              )}
            </div>
            <StyledComponent
              componentType="data-gallery-view"
              part="content"
            >
              <ItemList isActive={activeTab === 'list'} setDataDTO={setDataDTO} schema={collection?.data?.schema} datatype={collection?.data?.name} data={dataDTO?.data} openRecord={openRecord} changeDatatype={changeDatatype} dataViewProps={dataViewProps} />
              <ItemDetail isActive={activeTab === 'detail'} setActiveTab={setActiveTab} schema={collection?.data?.schema} datatype={collection?.data?.name} data={activeRecord} dataViewProps={dataViewProps} />
            </StyledComponent>
            <StyledComponent
              componentType="data-gallery-view"
              part="footer"
            >
              <StyledComponent
                componentType="data-gallery-view"
                part="button"
                onClick={prevRecord}
              >
                <IconRenderer icon="ArrowLeft" className="w-5 h-5 rounded-full shadow bg-white p-1 dark:bg-gray-700" /> <span>Previous</span>
              </StyledComponent>

              <StyledComponent
                componentType="data-gallery-view"
                part="button"
                onClick={nextRecord}
              >
                <span>Next</span>
                <IconRenderer icon="ArrowRight" className="w-5 h-5 rounded-full shadow bg-white p-1 dark:bg-gray-700" />
              </StyledComponent>
            </StyledComponent>
          </>)}
    </div>
  );


  const popup = props.popup || dataViewProps?.datatype
  if (popup) {
    return (<ViewManager id='data-gallery-view' title='Data Gallery' placement={{ width: 1000, height: 600, x: 0, y: 0, ref: 'center' }} onClose={closeHandler}>
      {table}
    </ViewManager>)
  }
  return table;


};

const ItemList = ({ schema, datatype, data, openRecord, setDataDTO, isActive, changeDatatype, dataViewProps }) => {
  const onTableEvent = async (eventName, option, selected, ...others) => {
    if (dataViewProps.onTableEvent) {
      const rt = await dataViewProps.onTableEvent(eventName, option, selected, ...others);
      if (rt === true) return;
    }
    if (eventName === 'datatype') {
      changeDatatype(option);
    }
    if (eventName === 'data-loaded') {
      setDataDTO({ data: option, total: option?.length });
    }
  };

  const onRowEvent = async (eventName, rowId, row, ...others) => {
    if (dataViewProps.onRowEvent) {
      const rt = await dataViewProps.onRowEvent(eventName, rowId, row, ...others);
      if (rt === true) return true;
    }

    if (eventName === 'open' || eventName === 'edit') {
      openRecord(row.original);
      return true;
    }

    return false;
  };


  return (<div className={classNames(isActive ? 'flex' : 'hidden', 'h-full')}>
    <CollectionTable datatype={datatype} schema={schema} data={data} filters={dataViewProps.filter} onTableEvent={onTableEvent} onRowEvent={onRowEvent} />
  </div>);
};

const ItemDetail = ({ schema, datatype, data, isActive, setActiveTab, dataViewProps }) => {
  const [showJSON, setShowJSON] = React.useState(false);
  const [updatedData, setUpdatedData] = React.useState<any>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    setUpdatedData(data);
  }, [data]);

  const onChange = async (path, value, update) => {
    setUpdatedData({ ...updatedData, data: update });
  }

  const saveRecord = async () => {
    setIsLoading(true);
    // await requestQueueInstance.saveData(updatedData).then(res => {
    //   setUpdatedData(res);
    // }).catch(e => {
    //   console.error(e);
    //   setError(getResponseErrorMessage(e));
    // }).finally(() => {
    //   setIsLoading(false);
    // })
  }


  if (!data || !schema) return (
    <div className={classNames(isActive ? 'flex items-center justify-center' : 'hidden', 'h-full')}>
      <div className="text-center text-sm text-gray-400 p-4">No data selected</div>
      <button onClick={e => setActiveTab('list')} title="Show JSON" className={classNames(iconButtonClass)}>
        View List
      </button>
    </div>
  );

  if (isLoading || !updatedData) return <LoadingIndicator />;
  return (
    <div className={classNames(isActive ? 'flex' : 'hidden', " gap-5 h-full")}>
      {error && <div className="text-sm text-red-700 bg-red-50 p-4 max-w-2xl mx-auto text-center">{error}</div>}
      <div className="px-4 h-full overflow-auto w-full pb-10">
        <CollectionForm datatype={datatype} schema={schema} data={updatedData?.data} path="" id={updatedData?.sk} onChange={onChange} hash={updatedData?.create_hash || updatedData?.version || getRandomString(6)} />
        {datatype && (
          <div className='flex items-center justify-center pt-6'>
            <button onClick={saveRecord} className="text-sm hover:bg-cyan-100 pl-2  pr-3 py-1 rounded-full flex items-center gap-2 border border-gray-200">
              <IconRenderer icon="Save" className="w-5 h-5 rounded-full shadow bg-white p-1" /> <span>Save</span>
            </button>
          </div>
        )}
      </div>
      <div className={classNames(showJSON ? 'w-full' : 'w-10', 'text-sm max-w-screen-sm flex-shrink-0  h-full')}>
        <button onClick={e => setShowJSON(!showJSON)} title="Show JSON" className={classNames(iconButtonClass)}>
          <IconRenderer icon={showJSON ? 'MoveRight' : 'MoveLeft'} />
        </button>
        <div className={classNames('h-full overflow-auto pb-10')}>{showJSON && <JSONViewer json={data} />}</div>
      </div>
    </div>
  );
};


export default DataGalleryView;
