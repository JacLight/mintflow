import { useSiteStore } from '@/context/site-store';
import { isNotEmpty } from '@/lib-client/helpers';
import { produce } from 'immer';
import React, { useState, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { IconRenderer } from '../ui/icon-renderer';

const positionClasses = {
  'top-left': 'top-10 left-10',
  'top-right': 'top-10 right-10',
  'bottom-left': 'bottom-12 left-10',
  'bottom-right': 'bottom-11 right-10',
};

export const NoticeAlert = () => {
  const { notifications } = useSiteStore().ui(useShallow(state => ({ notifications: state.notifications })));

  const removeNotification = (id: string) => {
    const uNotifications = produce(notifications || [], draft => {
      // const index = draft.findIndex(n => n.id === id);
      // if (index >= 0) draft[index].status = 'shown';
      draft.forEach(n => {
        if (n.status === 'new') n.status = 'shown';
      });
    });
    useSiteStore().ui.getState().setStateItem({ notifications: uNotifications });
  };

  const newAlerts: any = notifications?.filter(notice => notice.status === 'new');
  const newAlert: any = isNotEmpty(newAlerts) ? [newAlerts.pop()] : [];
  return (
    <div className={`fixed flex flex-col gap-2 max-w-lg w-fit z-50 ${positionClasses['top-right']}`}>
      {newAlert?.map((notice: any, idx: number) => (
        <Alert key={idx} type={notice.type} message={notice.message} onFinish={() => removeNotification(notice.id)} />
      ))}
    </div>
  );
};

const Alert = ({ type = '', message = '', onFinish = () => { } }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 200); // Wait for fade out animation before removing
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const alertClasses: any = {
    success: 'bg-green-600 text-white border-green-800',
    warn: 'bg-yellow-600 text-white border-yellow-800',
    error: 'bg-red-600 text-white border-red-800',
    info: 'bg-blue-600 text-white border-blue-800',
  };

  const iconClasses: any = {
    success: 'bg-green-800 text-green-100',
    warn: 'bg-yellow-800 text-yellow-100',
    error: 'bg-red-800 text-red-100',
    info: 'bg-blue-800 text-blue-100',
  };

  const icons: any = {
    success: '✓',
    warn: '!',
    error: '✕',
    info: 'i',
  };

  if (!isVisible) return null;
  return (
    <div className={`flex items-center justify-between px-3  py-2 rounded border shadow ${alertClasses[type]} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition-all duration-300 ease-in-out`}>
      <div className="flex items-center">
        <span className={`mr-3 font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center ${iconClasses[type]}`}>{icons[type]}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onFinish, 200);
        }}
        className="text-current opacity-70 hover:opacity-100 transition-opacity duration-200 ease-in-out ml-4"
      >
        <IconRenderer icon="X" />
      </button>
    </div>
  );
};
