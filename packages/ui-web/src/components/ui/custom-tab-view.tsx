import { tabButtonActiveClass, tabButtonClass } from '@/lib-client/constants';
import { classNames } from '@/lib-client/helpers';
import React from 'react';

export const CustomTabView = (props: { tabs }) => {
  const [value, setValue] = React.useState('0');

  const handleChange = (e, newValue) => {
    e.preventDefault();
    setValue(newValue);
  };

  const activeTab = Array.isArray(props.tabs) && props.tabs.length > 0 && props.tabs[value];
  return (
    <div>
      <div className="flex gap-4 items-center mb-1">
        {props.tabs?.map((tab, i) => (
          <button key={i} title={tab.label} onClick={e => handleChange(e, i)} className={classNames(value == i ? tabButtonActiveClass + ' text-gray-600' : 'text-gray-400 hover:text-gray-600', tabButtonClass)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div key={'CustomTabView-TabPanel-' + value}>{activeTab?.content}</div>
    </div>
  );
};
