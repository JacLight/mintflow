import { classNames } from '@/lib/utils';
import React from 'react';
import { IconRenderer } from '../ui/icon-renderer';
import Link from 'next/link';
import { withTooltip } from '../ui/tooltip';
import { iconButtonClass } from '@/lib-client/constants';

const buttonsList = [
  { name: 'call', label: 'Call', icon: 'Phone' },
  { name: 'email', label: 'Email', icon: 'Mail' },
  { name: 'note', label: 'Note', icon: 'FileText' },
  { name: 'meeting', label: 'Meeting', icon: 'Calendar' },
  { name: 'task', label: 'Task', icon: 'Check' },
];

const ButtonTP = withTooltip('button', 'bottom', 5, 0);

export const ActionButtons = ({ moreButtons }) => {

  const onClickHandler = (e, button) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof button.action === 'function') {
      button.action(e);
    }
  };


  return (
    <div className="flex space-x-3">
      {[...buttonsList, ...(moreButtons || [])].map((button, index) => {
        const Wrapper: any = button.url ? Link : ButtonTP
        return (
          <Wrapper key={index} title={button.label} className={classNames(iconButtonClass, ' bg-white ')} onClick={(e) => onClickHandler(e, button)} value={button.name} href={button.url}>
            <IconRenderer icon={button.icon} className={''} /> <span className={classNames(!button.showCaption && 'sr-only', 'sm:inline text-xs')}>{button.label}</span>
          </Wrapper>
        )
      })}
    </div>
  );
};
