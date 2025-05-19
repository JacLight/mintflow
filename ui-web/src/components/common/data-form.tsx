'use client';

import React, { useState } from 'react';
import ViewManager from './view-manager';
import { AppmintForm, validateForm } from 'appmint-form';
import { BaseModel } from '../../lib/models/base.model';
import { getMintflowService } from '../../lib/mintflow-service';
import { deepCopy } from '@/lib-client/helpers';
import { useSiteStore } from '@/context/site-store';

interface DataFormProps {
  schema: any;
  data: BaseModel<any>;
  onSave?: (savedData: BaseModel<any>) => void;
  onError?: (error: any) => void;
  show?: boolean;
  datatype?: string;
  title?: string;
  onFormEvent?: (event: string, data: any) => void;
  onClose?: () => void;
}

export const DataForm: React.FC<DataFormProps> = ({
  schema,
  datatype,
  data,
  onSave,
  onError,
  show = false,
  onFormEvent = () => {},
  onClose = () => {}
}) => {
  const [baseData, setBaseData] = useState<any>(data || {});
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('DataForm');

  const onChange = (path, value, data) => {
    setError(null);
    const newBaseData: BaseModel<any> = deepCopy(baseData);
    newBaseData.data = {
      ...newBaseData.data,
     ...data
    };
    setBaseData(newBaseData);
    if (onFormEvent) {
      onFormEvent('change', baseData);
    }
  };

  const handleSave = async () => {
    if (isLoading) return;

    setError({});
    const newErrors = validateForm(baseData?.data, schema);
    if (!newErrors.valid) {
      useSiteStore().ui.getState().showNotice(newErrors?.message, 'error');
      setError(newErrors);
      console.error(newErrors);
      return;
    }
    let newBaseData: BaseModel<any> = deepCopy(baseData);
    newBaseData = { ...data, data: { ...data.data, ...newBaseData.data } };
    setLoading(true);
    try {
      const mintflowService = getMintflowService();
      const result = await mintflowService.saveBaseFlow(baseData);
      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  const title =
    data?.data?.title ||
    data?.data?.label ||
    data?.data?.name ||
    data?.data?.username ||
    data?.data?.email ||
    data?.name ||
    data?.sk ||
    'New ' + data?.datatype;
  return (
    <ViewManager id={data.sk} title={title}>
      <div className="flex flex-col h-full p-4">
        <AppmintForm
          datatype={data.datatype}
          schema={schema}
          data={data.data}
          id={data.sk || data.create_hash}
          onChange={onChange}
        />

        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : data.isNew ? 'Create' : 'Update'}
          </button>
        </div>
      </div>
    </ViewManager>
  );
};
