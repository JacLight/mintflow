import React from 'react';

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any;
  onSave?: (data: any) => void;
}

const NodeConfigModal: React.FC<NodeConfigModalProps> = ({
  isOpen,
  onClose,
  nodeData,
  onSave,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (onSave && nodeData) {
      onSave(nodeData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Configure Node</h2>
        
        <div className="mb-4">
          <p className="text-gray-600">Node ID: {nodeData?.id || 'Unknown'}</p>
          <p className="text-gray-600">Type: {nodeData?.type || 'Unknown'}</p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigModal;
