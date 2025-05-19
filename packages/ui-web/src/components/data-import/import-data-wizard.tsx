import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { ImportProgress } from './import-progress';
import { useShallow } from 'zustand/shallow';
import { useDataImportStore } from './data-import-store';
import { classNames, isNotEmpty, safeParseJSON } from '@/lib-client/helpers';
import { useSiteStore } from '@/context/site-store';
import { IconRenderer } from '../ui/icon-renderer';
import BusyIcon from '../ui/busy-icon';
import { DataImportDataSourceView } from './step-datasource';
import ValidationStep from './step-validation';

export function ImportWizard() {
  const { error, activeStep, getStateItem } = useDataImportStore(useShallow(state => ({ error: state.error, activeStep: state.activeStep, getStateItem: state.getStateItem })));
  const [status, setStatus] = React.useState('pending');
  const [isLoading, setIsLoading] = React.useState(false);

  // State to store validation results
  const [validationResult, setValidationResult] = React.useState<{ valid: boolean; message?: string; data?: any; details?: string[] }>({ valid: false });
  const [isValidating, setIsValidating] = React.useState(false);

  // Function to validate the workflow JSON
  const validateWorkflow = async () => {
    const dataSource = getStateItem('dataSource');
    setIsValidating(true);

    try {
      let workflowData = null;
      
      // Handle different data sources
      if (dataSource?.source === 'text') {
        // For pasted JSON, parse the data
        if (typeof dataSource.data === 'string') {
          const { json, err } = safeParseJSON(dataSource.data);
          if (err) {
            setValidationResult({
              valid: false,
              message: err || 'Invalid JSON format',
              details: ['The JSON parser reported an error. Please check your JSON syntax.']
            });
            setIsValidating(false);
            return;
          }
          workflowData = json;
        } else {
          workflowData = dataSource.data;
        }
      } else if (dataSource?.source === 'demo') {
        // For demo files, use the data directly
        workflowData = dataSource.data;
        if (typeof workflowData === 'string') {
          const { json, err } = safeParseJSON(workflowData);
          if (err) {
            setValidationResult({
              valid: false,
              message: err || 'Invalid JSON format',
              details: ['The demo file contains invalid JSON. Please report this issue.']
            });
            setIsValidating(false);
            return;
          }
          workflowData = json;
        }
      } else if (dataSource?.source === 'file' && dataSource?.file) {
        // For uploaded files, read the file content
        const file = dataSource.file;
        const text = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(file);
        });
        
        const { json, err } = safeParseJSON(text);
        if (err) {
          setValidationResult({
            valid: false,
            message: err || 'Invalid JSON format',
            details: [`Error parsing file "${file.name}". Please check your JSON syntax.`]
          });
          setIsValidating(false);
          return;
        }
        workflowData = json;
      }

      if (workflowData) {
        // Validate if the JSON is a valid workflow JSON
        const result = isValidWorkflowJSON(workflowData);
        setValidationResult({ ...result, data: workflowData });
      } else {
        setValidationResult({
          valid: false,
          message: 'No valid workflow data found',
          details: [
            'The provided content does not contain any valid workflow data.',
            'Please ensure you are providing a complete workflow JSON with nodes and edges arrays.'
          ]
        });
      }
    } catch (error) {
      console.error('Error validating workflow:', error);
      setValidationResult({
        valid: false,
        message: `Validation error: ${error.message}`,
        details: [
          'An unexpected error occurred while validating the workflow.',
          `Error details: ${error.message}`,
          'Please check your JSON content and try again.'
        ]
      });
    } finally {
      setIsValidating(false);
    }
  };

  const nextStep = () => {
    if (isNotEmpty(error)) {
      useSiteStore().ui.getState().showNotice('There is an error in the current step, please fix it before proceeding', 'error');
      return;
    }

    const dataSource = getStateItem('dataSource');
    if ((dataSource?.file || dataSource?.data) && activeStep === 0) {
      // Move to the validate step (step 1) and trigger validation
      useDataImportStore.getState().setStateItem({ activeStep: 1, error: null });
      // Validate the workflow when moving to step 1
      setTimeout(() => validateWorkflow(), 100);
      return;
    }
    useDataImportStore.getState().setStateItem({ activeStep: activeStep + 1, error: null });
  };

  const prevStep = () => {
    if (activeStep === 0) return;
    useDataImportStore.getState().setStateItem({ activeStep: 0, error: null });
  };

  // Function to validate if the JSON is a valid workflow JSON
  
  const finishWizard = async () => {
    const dataSource = getStateItem('dataSource');
    setStatus('sending');
    setIsLoading(true);

    try {
      // Use the validated data from the validation step
      if (validationResult.valid && validationResult.data) {
        const workflowData = validationResult.data;
        
        // Store the workflow data in the store for the workflow designer to access
        useDataImportStore.getState().setStateItem({
          jsonData: workflowData,
          uploadReport: {
            status: 'success',
            message: 'Workflow imported successfully',
            timestamp: new Date().toISOString()
          }
        });

        // If we have a workflow service instance, load the workflow
        const workflowInstance = window['workflowInstance'];
        if (workflowInstance) {
          // Clear existing nodes and edges
          workflowInstance.clear();

          // Load the new workflow
          workflowInstance.setNodes(workflowData.nodes);
          workflowInstance.setEdges(workflowData.edges);
        }

        // Show success message
        useSiteStore().ui.getState().showNotice('Workflow imported successfully!', 'success');

        // Close the import wizard
        closeUpload();
      } else {
        throw new Error(validationResult.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Error importing workflow:', error);
      useDataImportStore.getState().setStateItem({
        error: `Failed to import workflow: ${error.message}`,
        uploadReport: {
          status: 'error',
          message: `Failed to import workflow: ${error.message}`,
          timestamp: new Date().toISOString()
        }
      });
      setStatus('pending');
    } finally {
      setIsLoading(false);
    }
  };

  const closeUpload = () => {
    useDataImportStore.getState().closeImport();
  };



  return (
    <div className="w-full h-full">
      <ImportProgress activeStep={activeStep} />
      <div className=" h-[calc(100%-100px)] w-full">
        {isNotEmpty(error) && <div className={classNames('px-4 py-2 text-center max-w-screen-md mx-auto mb-2 bg-red-100 border-red-700 border rounded')}>{typeof error === 'object' ? Object.values(error).join(' ') : error}</div>}
        <div className={classNames(status !== 'pending' && 'opacity-50', 'h-full')}>
          <DataImportDataSourceView />
          <ValidationStep isValidating={isValidating} validationResult={validationResult} />
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
        {status === 'pending' && activeStep === 0 && (
          <button onClick={nextStep} className="text-sm hover:bg-cyan-100 pl-3  pr-2 py-1 rounded-full flex items-center gap-2 border border-gray-200">
            <span>Next</span>
            <IconRenderer icon="ArrowRight" className="w-5 h-5 rounded-full shadow bg-white p-1" />
          </button>
        )}
        {activeStep === 1 && status === 'pending' && validationResult.valid && (
          <button onClick={finishWizard} className="text-sm hover:bg-cyan-100 pl-2 pr-3 py-1 rounded-full flex items-center gap-2 bg-sky-100 border border-gray-200">
            <BusyIcon isLoading={isLoading} />
            <IconRenderer icon="Upload" className="w-5 h-5 rounded-full shadow bg-white p-1" />
            <span>Import Workflow</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ImportWizard;


const isValidWorkflowJSON = (data: any): { valid: boolean; message?: string; details?: string[] } => {
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      message: 'Invalid JSON: Not a valid object',
      details: ['The uploaded content does not contain a valid JSON object.', 'Please check that your content contains a properly formatted JSON object.']
    };
  }

  // Check if data has nodes array
  if (!data.nodes) {
    return {
      valid: false,
      message: 'Missing required "nodes" array',
      details: ['The workflow JSON must contain a "nodes" array.', 'Example: { "nodes": [], "edges": [] }']
    };
  }

  if (!Array.isArray(data.nodes)) {
    return {
      valid: false,
      message: '"nodes" must be an array',
      details: ['The "nodes" property must be an array, but found ' + typeof data.nodes + ' instead.']
    };
  }

  // Check if data has edges array
  if (!data.edges) {
    return {
      valid: false,
      message: 'Missing required "edges" array',
      details: ['The workflow JSON must contain an "edges" array.', 'Example: { "nodes": [], "edges": [] }']
    };
  }

  if (!Array.isArray(data.edges)) {
    return {
      valid: false,
      message: '"edges" must be an array',
      details: ['The "edges" property must be an array, but found ' + typeof data.edges + ' instead.']
    };
  }

  // Check if each node has required properties
  for (let i = 0; i < data.nodes.length; i++) {
    const node = data.nodes[i];
    const nodeIndex = i + 1;

    // Check if node is an object
    if (!node || typeof node !== 'object') {
      return {
        valid: false,
        message: `Node at index ${i} is not a valid object`,
        details: [`Node #${nodeIndex} in the nodes array is not a valid object.`, 'Each node must be an object with id, type, position, and data properties.']
      };
    }

    // Check for required properties
    if (!node.id) {
      return {
        valid: false,
        message: `Node at index ${i} is missing required "id" property`,
        details: [`Node #${nodeIndex} is missing the required "id" property.`, 'Each node must have a unique string identifier.']
      };
    }

    if (!node.type) {
      return {
        valid: false,
        message: `Node at index ${i} is missing required "type" property`,
        details: [`Node #${nodeIndex} (id: "${node.id}") is missing the required "type" property.`, 'Each node must have a type that defines its behavior and appearance.']
      };
    }

    if (!node.position) {
      return {
        valid: false,
        message: `Node at index ${i} is missing required "position" property`,
        details: [`Node #${nodeIndex} (id: "${node.id}") is missing the required "position" property.`, 'Each node must have a position object with x and y coordinates.']
      };
    }

    if (!node.data) {
      return {
        valid: false,
        message: `Node at index ${i} is missing required "data" property`,
        details: [`Node #${nodeIndex} (id: "${node.id}") is missing the required "data" property.`, 'Each node must have a data object containing its configuration.']
      };
    }

    // Check position format
    if (typeof node.position !== 'object') {
      return {
        valid: false,
        message: `Node at index ${i} has invalid "position" format`,
        details: [`Node #${nodeIndex} (id: "${node.id}") has an invalid position format.`, 'Position must be an object, but found ' + typeof node.position + ' instead.']
      };
    }

    if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      return {
        valid: false,
        message: `Node at index ${i} has invalid position coordinates`,
        details: [`Node #${nodeIndex} (id: "${node.id}") has invalid position coordinates.`, 'Position must have numeric x and y properties.']
      };
    }
  }

  // Check if each edge has required properties
  for (let i = 0; i < data.edges.length; i++) {
    const edge = data.edges[i];
    const edgeIndex = i + 1;

    // Check if edge is an object
    if (!edge || typeof edge !== 'object') {
      return {
        valid: false,
        message: `Edge at index ${i} is not a valid object`,
        details: [`Edge #${edgeIndex} in the edges array is not a valid object.`, 'Each edge must be an object with id, source, and target properties.']
      };
    }

    // Check for required properties
    if (!edge.id) {
      return {
        valid: false,
        message: `Edge at index ${i} is missing required "id" property`,
        details: [`Edge #${edgeIndex} is missing the required "id" property.`, 'Each edge must have a unique string identifier.']
      };
    }

    if (!edge.source) {
      return {
        valid: false,
        message: `Edge at index ${i} is missing required "source" property`,
        details: [`Edge #${edgeIndex} (id: "${edge.id}") is missing the required "source" property.`, 'Each edge must have a source property that references a node id.']
      };
    }

    if (!edge.target) {
      return {
        valid: false,
        message: `Edge at index ${i} is missing required "target" property`,
        details: [`Edge #${edgeIndex} (id: "${edge.id}") is missing the required "target" property.`, 'Each edge must have a target property that references a node id.']
      };
    }
  }

  return { valid: true };
};
