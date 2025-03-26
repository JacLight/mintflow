import React, { useState } from 'react';
import { classNames, toTitleCase } from '../utils';
import { IconRenderer } from '../common/icons/icon-renderer';
import { iconButtonClass, iconClass } from '../utils/constants';
import { withTooltip } from '../common/tooltip';

export const tableButtonNames = [
  { name: 'refresh', icon: 'RefreshCcw' },
  { name: 'delete', icon: 'Trash', className: 'text-red-500 dark:text-red-400', confirm: true },
  { name: 'add', icon: 'Plus' },
  { name: 'select', icon: 'Check' },
  // { name: 'Edit', icon: 'Edit' },
  { name: 'export', icon: 'FileDown' },
  { name: 'import', icon: 'FileUp' },
  // { name: 'Print', icon: 'Printer' },
];

const ButtonTP = withTooltip('button', 'bottom', 5, 0);
export const TableButtons: React.FC<any> = ({ onTableEvent, options, selectedRows }) => {
  const [buttonStates, setButtonStates] = useState({});

  const onClick = async (e, option) => {
    let name = e.currentTarget.name;
    const button = tableButtonNames.find(button => button.name === name);
    if (button?.confirm && !buttonStates[name]) {
      setButtonStates({ ...buttonStates, [name]: true });
      setTimeout(() => {
        setButtonStates({ ...buttonStates, [name]: false });
      }, 3000);
      return;
    } else if (button?.confirm && buttonStates[name]) {
      setButtonStates({ ...buttonStates, [name]: false });
    }

    if (onTableEvent) {
      await onTableEvent(name, option);
    }
  };

  const isReadOnly = options?.readOnly === true;
  return (
    <div className="flex gap-2 items-center">
      {tableButtonNames.map(button => {
        if (button.name !== 'refresh' && isReadOnly) return null;
        return (
          <ButtonTP
            onClick={onClick}
            title={toTitleCase(button.name)}
            key={button.name}
            name={button.name}
            type="button"
            className={classNames(
              iconButtonClass,
              button.className,
            )}
          >
            <IconRenderer icon={(buttonStates[button.name] ? 'Check' : button.icon) as any} className={iconClass} />
            {button.name === 'select' && selectedRows.length > 0 && <span className='absolute -top-2 w-4 h-4 -right-2 flex items-center justify-center rounded-full text-xs bg-purple-700 text-white'>{selectedRows.length}</span>}
          </ButtonTP>
        );
      })}
    </div>
  );
};
