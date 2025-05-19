import { produce } from 'immer';
import { create } from 'zustand';
import * as objectPath from 'object-path';

export interface DataImportStoreProps {
  dataSource?: { source; file; data; format };
  error?: any;
  done?: boolean;
  activeStep?: number;
  activeTab?: string;
  isClose?: boolean;
  title: string;
  jsonData?: any;
  uploadReport?: any;
  setStateItem?: (item: { [key: string]: any }) => void;
  getStateItem?: (key: string) => any;
  closeImport?: () => void;
}

export const useDataImportStore = create<DataImportStoreProps>((set, get) => ({
  isClose: true,
  activeStep: 0,
  title: 'New Data Import',
  closeImport: () => {
    set({ isClose: true });
  },
  setStateItem: (item: { [key: string]: any }) => {
    set(
      produce((state: DataImportStoreProps) => {
        Object.keys(item).forEach(key => {
          objectPath.set(state, key, item[key]);
        });
      }),
    );
  },
  getStateItem: (key: string) => {
    const state = get();
    return objectPath.get(state, key);
  },
}));



export const csvToJSON = (csv: string): any[] => {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].split(',');
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(',');
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result;
};

export const isJSON = (data: string): boolean => {
  try {
    JSON.parse(data);
    return true;
  } catch (e) {
    return false;
  }
};

export const isCSV = (data: string): boolean => {
  const lines = data.split('\n');
  if (lines.length < 2) {
    return false;
  }
  const firstLine = lines[0].split(',');
  return firstLine.length > 1;
};

export const getStringSize = str => {
  const rawSize = new Blob([str]).size;
  return toHumanSize(rawSize);
};

export const toHumanSize = rawSize => {
  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;
  const tb = gb * 1024;

  if (rawSize < kb) {
    return `${rawSize} B`;
  }
  if (rawSize < mb) {
    return `${(rawSize / kb).toFixed(2)} KB`;
  }
  if (rawSize < gb) {
    return `${(rawSize / mb).toFixed(2)} MB`;
  }
  if (rawSize < tb) {
    return `${(rawSize / gb).toFixed(2)} GB`;
  }
  return `${(rawSize / tb).toFixed(2)} TB`;
};
