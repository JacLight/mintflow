import React from 'react';
import { useDataImportStore } from './data-import-store';
import { useShallow } from 'zustand/shallow';

export const DataImportFinishView = () => {
  const { error, jsonData, setStateItem, activeStep, uploadReport } = useDataImportStore(useShallow(state => ({ error: state.error, jsonData: state.jsonData, setStateItem: state.setStateItem, activeStep: state.activeStep, uploadReport: state.uploadReport })));

  return (
    <div className="p-10 text-sm">
      <h2 className="text-xl">Summary</h2>
      <div className=" mt-2 mb-0 font-semibold">Data Source Info</div>
    </div>
  );
};
