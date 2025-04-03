import React, { useEffect } from 'react';
import { isJSON, useDataImportStore } from './data-import-store';
import { useShallow } from 'zustand/shallow';
import { safeParseJSON } from '@/lib-client/helpers';
import { CustomFileUpload } from '../ui/common-file-upload';
import MonacoCodeEditor from '../ui/monaco';

const sources = [
  { label: '', value: '' },
  { label: 'File Upload', value: 'file' },
  { label: 'Paste JSON or CSV', value: 'text' },
];

export const DataImportDataSourceView = () => {
  const { activeStep, dataSource, setStateItem, error } = useDataImportStore(useShallow(state => ({
    activeStep: state.activeStep,
    dataSource: state.dataSource,
    setStateItem: state.setStateItem,
    error: state.error,
  })));

  useEffect(() => {
    setStateItem({ error: null });
  }, [dataSource]);

  const handleFilePicked = (files: any[]) => {
    const [file] = files;
    console.log(file);
    setStateItem({ dataSource: { source: 'file', file }, error: null });
  };

  const handleSave = (id, data: string) => {
    try {
      if (isJSON(data)) {
        const { json: jsonData, err } = safeParseJSON(data);
        if (!Array.isArray(jsonData)) {
          setStateItem({ error: 'Invalid JSON, Paste only JSON Array' });
          return;
        }
        setStateItem({ dataSource: { source: 'text', data: data, format: 'json' }, jsonData: jsonData, error: null });
        return;
      }
    } catch (e) {
      console.log(e);
    }
    setStateItem({ error: 'Invalid Text, Paste only CSV or JSON' });
  };

  const handelSourceChange = e => {
    setStateItem({ dataSource: { source: e.target.value }, error: null });
  };

  if (activeStep !== 0) return null;

  return (
    <div className="w-full h-full">
      <div className="mx-4 m-4 border-l-8 border-l-[#f4ca16] bg-white shadow p-4 mb-4 rounded">
        <select title="select data source" value={dataSource?.source} onChange={handelSourceChange} className="w-full px-3 py-1 border-gray-300">
          {sources.map(item => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="px-4 pb-4 h-[] ">
        {dataSource?.source === 'file' && <CustomFileUpload onFileUpload={handleFilePicked} />}
        {dataSource?.source === 'text' && <MonacoCodeEditor save={handleSave} mode={'json'} width={100} height={550} value={dataSource?.data} showAppBar={false} name={''} />}
      </div>
    </div>
  );
};
