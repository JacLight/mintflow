import * as objectPath from 'object-path';
import { getRandomString } from '../utils';

export const generateData = (columns, count) => {
  return [...Array(count)].map(() => {
    const row = {};
    columns?.forEach(column => {
      row[column.accessorKey] = getRandomString(10);
    });
    return row;
  });
};

export const generateFakeData = (columns: any[], count: number = 10) => {
  return Array.from({ length: count }).map((_, index) => {
    const row: Record<string, any> = {};

    columns.forEach(column => {
      const path = column.accessorKey || column.header.toLowerCase();
      const value = column.generateValue ? column.generateValue(index) : getRandomString(10);
      objectPath.set(row, path, value);
    });

    return row;
  });
};

