import React, { useState } from "react";
import ViewManager from "./view-manager";
import { AppmintForm } from "@appmint/form";
import { BaseModel } from "../../lib/models/base.model";
import { getMintflowService } from "../../lib/mintflow-service";

interface DataFormProps {
  schema: any;
  data: BaseModel<any>;
  onSave?: (savedData: BaseModel<any>) => void;
  onError?: (error: any) => void;
}

export const DataForm: React.FC<DataFormProps> = ({ schema, data, onSave, onError }) => {
  const [formData, setFormData] = useState<any>(data.data || {});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const mintflowService = getMintflowService();

  const onChange = (path: string, value: any, updatedData: any, file: any, error: any) => {
    console.log('onChange', path, value, updatedData, file, error);
    setFormData(updatedData);
  }

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      let result;

      if (data.isNew) {
        // Create new flow
        result = await mintflowService.saveFlow(
          formData.name,
          formData.title,
          formData.description,
          formData.flow
        );
      } else {
        // Update existing flow
        result = await mintflowService.updateFlow(
          data.sk,
          formData.flow
        );
      }

      setIsSaving(false);
      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      setIsSaving(false);
      console.error('Error saving flow:', error);
      if (onError) {
        onError(error);
      }
    }
  }

  return (
    <ViewManager id={data.sk}>
      <div className="flex flex-col h-full">
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
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : (data.isNew ? 'Create' : 'Update')}
          </button>
        </div>
      </div>
    </ViewManager>
  );
};
