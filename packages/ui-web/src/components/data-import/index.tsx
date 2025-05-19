import React from 'react';
import { useDataImportStore } from './data-import-store';
import { ImportWizard } from './import-data-wizard';
import { useShallow } from 'zustand/shallow';
import ViewManager from '../common/view-manager';

const style = { left: 'calc(30% / 2)', top: 'calc(30% / 4)', width: '70%', height: '70%' };

export const DataImportApp = () => {
  const { isClose, activeTab } = useDataImportStore(useShallow(state => ({ isClose: state.isClose, activeTab: state.activeTab })));

  const close = () => {
    useDataImportStore.getState().setStateItem({ isClose: true });
  };

  if (isClose) return null;
  return (
    <ViewManager style={style} key="data-import-export" id="data-import-export" title="Data Import Export" onClose={close}>
      <ImportWizard />
    </ViewManager>
  );
};

export default DataImportApp;
