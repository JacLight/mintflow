import React from 'react';
import { ImportProgress } from './import-progress';
import { useShallow } from 'zustand/shallow';
import { useDataImportStore } from './data-import-store';
import { classNames, isNotEmpty } from '@/lib-client/helpers';
import { useSiteStore } from '@/context/site-store';
import { IconRenderer } from '../ui/icon-renderer';
import BusyIcon from '../ui/busy-icon';
import { DataImportDataSourceView } from './step-datasource';
import { DataImportFinishView } from './step-finish';

export function ImportWizard() {
  const { error, activeStep, getStateItem } = useDataImportStore(useShallow(state => ({ error: state.error, activeStep: state.activeStep, getStateItem: state.getStateItem })));
  const [status, setStatus] = React.useState('pending');
  const [isLoading, setIsLoading] = React.useState(false);

  const nextStep = () => {
    if (isNotEmpty(error)) {
      useSiteStore().ui.getState().showNotice('There is an error in the current step, please fix it before proceeding', 'error');
      return;
    }

    const dataSource = getStateItem('dataSource');
    if (dataSource?.file && activeStep === 0) {
      useDataImportStore.getState().setStateItem({ activeStep: 2, error: null });
      return;
    }

    const collection = getStateItem('collection');
    if (activeStep === 2 && !getStateItem('targetCollection') && !collection['create_new']) {
      useDataImportStore.getState().setStateItem({ error: 'Please select a target collection', activeStep: 2 });
      return;
    }

    if (activeStep === 3) return;
    useDataImportStore.getState().setStateItem({ activeStep: activeStep + 1, error: null });
  };

  const prevStep = () => {
    if (activeStep === 0) return;

    const dataSource = getStateItem('dataSource');
    if (dataSource?.file && activeStep === 2) {
      useDataImportStore.getState().setStateItem({ activeStep: 0, error: null });
      return;
    }
    useDataImportStore.getState().setStateItem({ activeStep: activeStep - 1, error: null });
  };

  const finishWizard = async () => {
    const targetCollection = getStateItem('targetCollection');
    const bulkUploadData = {
      ...getStateItem('dataSource'),
      sourceCollection: getStateItem('collection'),
      datatype: targetCollection ? targetCollection.data.name : null,
    };
    setStatus('sending');
    setIsLoading(true);
  };

  const closeUpload = () => {
    useDataImportStore.getState().closeImport();
  };

  if (status === 'success') {
    return (
      <div className="w-full h-full">
        <DataImportFinishView />
        <div className="flex items-center gap-4 justify-between absolute bottom-1 w-full px-5 bg-white py-2">
          <button onClick={closeUpload} className="text-sm hover:bg-cyan-100 pl-2  pr-3 py-1 rounded-full flex items-center gap-2  bg-sky-100  border border-gray-200">
            <IconRenderer icon="X" className="w-5 h-5 rounded-full shadow bg-white p-1" />
            <span>Close</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ImportProgress activeStep={activeStep} />
      <div className=" h-[calc(100%-100px)] w-full">
        {isNotEmpty(error) && <div className={classNames('px-4 py-2 text-center max-w-screen-md mx-auto mb-2 bg-red-100 border-red-700 border rounded')}>{typeof error === 'object' ? Object.values(error).join(' ') : error}</div>}
        <div className={classNames(status !== 'pending' && 'opacity-50', 'h-full')}>
          <DataImportDataSourceView />
          <DataImportFinishView />
        </div>
      </div>
      <div className="flex items-center gap-4 justify-between absolute bottom-1 w-full px-5 bg-white py-2">
        {status === 'pending' && activeStep !== 0 ? (
          <button onClick={prevStep} className="text-sm hover:bg-cyan-100 pl-2  pr-3 py-1 rounded-full flex items-center gap-2 border border-gray-200">
            <IconRenderer icon="ArrowLeft" className="w-5 h-5 rounded-full shadow bg-white p-1" /> <span>Previous</span>
          </button>
        ) : (
          <div></div>
        )}
        {status === 'pending' && activeStep !== 3 && (
          <button onClick={nextStep} className="text-sm hover:bg-cyan-100 pl-3  pr-2 py-1 rounded-full flex items-center gap-2 border border-gray-200">
            <span>Next</span>
            <IconRenderer icon="ArrowRight" className="w-5 h-5 rounded-full shadow bg-white p-1" />
          </button>
        )}
        {activeStep === 3 && (
          <button onClick={finishWizard} className="text-sm hover:bg-cyan-100 pl-2  ml-10 pr-3 py-1 rounded-full flex items-center gap-2  bg-sky-100  border border-gray-200">
            <BusyIcon isLoading={isLoading} />
            <IconRenderer icon="Check" className="w-5 h-5 rounded-full shadow bg-white p-1" />
            <span>Finish - Import Data</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ImportWizard;