'use client';

import React from 'react';
import { CollectionForm } from './form-view';
import { CollectionTable } from './table-view';
import { RowEvents, TableEvents } from './table-view';


export type { RowEvents, TableEvents };
export interface AppmintFormProps {
  demo?: boolean;
  data?: any;
  path?: string;
  title?: string;
  schema?: any;
  rules?: any;
  theme?: any;
  accessMode?: string;
  id?: string;
  datatype?: string;
  icon?: string;
  readOnly?: boolean;
  hash?: string;
  useAI?: boolean;
  collapsible?: boolean;
  onChange?: (path: string, value: any, data: any, files: any, error: any) => any;
}

export interface AppmintTableProps {
  hash?: string;
  options?: any;
  title?: string;
  description?: string;
  data?: any[];
  path?: string;
  columns?: any[];
  filterPreset?: any;
  schema?: any;
  filters?: any[];
  accessMode?: string;
  inlineEdit?: boolean;
  datatype?: string;
  isDemo?: boolean;
  onRowEvent?: (event: RowEvents, rowId: string, row: any) => any;
  onTableEvent?: (event: TableEvents, option: any, selected: any[]) => any;
  isLoading?: boolean;
  cellRenderers?: Record<string, (value: any, row: any) => React.ReactNode>;
  itemRenderer?: (item: any) => React.ReactNode;
}

export const AppmintForm: React.FC<AppmintFormProps> = (props) => {
  console.log('AppmintForm', props);
  return <CollectionForm {...props} />;
};

export const AppmintTable: React.FC<AppmintTableProps> = (props) => {
  console.log('AppmintTable', props);
  return <CollectionTable {...props} />;
};
