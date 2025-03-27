import { useSiteStore } from '@/context/site-store';
import { buttonClass, buttonHoverClass } from '@/lib-client/constants';
import { classNames, getRandomString } from '@/lib/utils';
import React from 'react';
import { useShallow } from 'zustand/shallow';
import { Button } from '../ui/button';
import { CustomTabView } from '../ui/custom-tab-view';

export const NoticeViewer = () => {
  const { notifications } = useSiteStore().ui(useShallow(state => ({ notifications: state.notifications })));
  const [showNotice, setShowNotice] = React.useState(false);

  const clearNotifications = () => {
    useSiteStore().ui.getState().setStateItem({ notifications: [] });
  };

  const tabAlerts = () => (
    <>
      <div className="notice-viewer-alert space-y-2">
        {notifications?.map((notification, index) => (
          <div key={index} className={classNames(notification.type === 'error' && 'bg-red-100', notification.type === 'warning' && 'bg-yellow-100', notification.type === 'success' && 'bg-green-100', 'bg-blue-100  text-gray-800 px-2 py-1')}>
            {notification.message}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-gray-800 mt-3 ">
        <button key={getRandomString(6)} onClick={clearNotifications} className={classNames(buttonClass, buttonHoverClass)}>
          Clear
        </button>
      </div>
    </>
  );

  const tabMessages = () => (
    <div className="notice-viewer-messages mt-3 text-gray-800">
      <button color="primary" autoFocus className={classNames(buttonClass, buttonHoverClass)}>
        More
      </button>
    </div>
  );

  const tabActivities = () => <div className="notice-viewer-activities"> Nothing here </div>;

  const tabs = [
    { label: 'Alerts', content: tabAlerts() },
    { label: 'Messages', content: tabMessages() },
    { label: 'Activities', content: tabActivities() },
  ];

  const onClick = () => {
    setShowNotice(!showNotice);
  }

  return (
    <div className='relative  notice-viewer-container flex items-center justify-center'>
      <Button icon='Bell' onClick={onClick} unstyled={true} iconSize={16} />
      {showNotice && (
        <div className="absolute p-3 z-[1005] top-8 -right-2  bg-white shadow-md">
          <CustomTabView tabs={tabs} />
        </div>
      )}
    </div>
  );
};
