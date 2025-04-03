import React from 'react';
import { useShallow } from 'zustand/shallow';
import { useDataImportStore } from './data-import-store';
import { IconRenderer } from '../ui/icon-renderer';
import BusyIcon from '../ui/busy-icon';

export const ValidationStep = ({ isValidating, validationResult }) => {
  const { activeStep, getStateItem } = useDataImportStore(
    useShallow(state => ({ 
      activeStep: state.activeStep, 
      getStateItem: state.getStateItem 
    }))
  );

  if (activeStep !== 1) return null;

  const dataSource = getStateItem('dataSource');

  // Create a simple source info string based on data source type
  let sourceInfoText = '';
  if (dataSource?.source === 'file') {
    const fileName = typeof dataSource.file === 'string' ? dataSource.file : dataSource?.file?.name;
    sourceInfoText = `File: ${fileName || 'N/A'}`;
  } else if (dataSource?.source === 'text') {
    const size = dataSource.data ? `${(dataSource.data.length / 1024).toFixed(2)} KB` : 'N/A';
    sourceInfoText = `Pasted JSON (${size})`;
  }
  const sourceInfo = (
    <div className="bg-gray-50 border border-gray-200 rounded px-4 py-2 mb-6">
      <span className="font-medium">{sourceInfoText}</span>
    </div>
  );

  return (
    <div className="p-10 text-sm">
      {sourceInfo}

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Validation Report</h3>

        {isValidating ? (
          <div className="flex items-center justify-center py-8">
            <BusyIcon isLoading={true} />
            <span className="ml-2">Validating workflow JSON...</span>
          </div>
        ) : validationResult.valid ? (
          <div>
            <div className="flex items-center text-green-600 mb-4">
              <IconRenderer icon="CheckCircle" className="h-6 w-6 mr-2" />
              <span className="font-medium">Validation Successful!</span>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="font-medium">The workflow JSON is valid and ready to import.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="font-medium text-gray-700">Nodes:</p>
                <p>{validationResult.data?.nodes?.length || 0}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Connections:</p>
                <p>{validationResult.data?.edges?.length || 0}</p>
              </div>
              {validationResult.data?.lastSaved && (
                <div>
                  <p className="font-medium text-gray-700">Last Saved:</p>
                  <p>{new Date(validationResult.data.lastSaved).toLocaleString()}</p>
                </div>
              )}
            </div>

            <p className="mt-4">Click "Import Workflow" to add this workflow to the designer.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center text-red-600 mb-4">
              <IconRenderer icon="XCircle" className="h-6 w-6 mr-2" />
              <span className="font-medium">Validation Failed</span>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium">Error:</p>
              <p>{validationResult.message || 'JSON validation error'}</p>

              {validationResult.details && validationResult.details.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Details:</p>
                  <ul className="list-disc ml-5 mt-1">
                    {validationResult.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <p className="mt-4">
              {dataSource?.source === 'file'
                ? 'Please go back and select a valid workflow JSON file.'
                : 'Please go back and provide valid workflow JSON.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationStep;
