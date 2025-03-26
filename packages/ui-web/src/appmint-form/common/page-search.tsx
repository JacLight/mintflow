'use client';
import React from 'react';
import { PageSort } from './page-sort';
import { IconRenderer } from './icons/icon-renderer';
import BusyIcon from './icons/svg';
import { iconButtonClass } from '../utils/constants';

export const usePageSearch = ({ loadNext, isLoading }) => {
  const [filter, setFilter] = React.useState('');
  const [sort, setSort] = React.useState(null);

  const changeSortType = sortItem => {
    setSort(sortItem.value);
  };

  const searchComponent = (
    <div className="">
      <div className="flex gap-4 w-full items-center">
        <div className="p-2  border border-gray-300 flex items-center rounded-xl w-full">
          <IconRenderer icon="FaSearch" />
          <input name="search" className="w-full text-sm p-1 border-none mx-2  focus:ring-0 focus-within:ring-0 focus-visible:ring-0 " value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        <PageSort sortValue={sort} onChange={changeSortType} />
        <button onClick={() => loadNext(true)} className={iconButtonClass}>
          <BusyIcon isLoading={isLoading} /> <IconRenderer icon="IoRefresh" />{' '}
        </button>
      </div>
    </div>
  );

  return { filter, sort, searchComponent };
};
