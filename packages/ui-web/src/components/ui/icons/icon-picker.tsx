import { createRef, useEffect, useState } from 'react';
import { emojiMartCustom, Icon } from './custom-icons';
import { Popover } from '../popover';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { classNames } from '@/lib/utils';

export const IconPicker = (props: { blur; focus; change; value; path; label; name; data; schema; autoUnselect }) => {
  const { path, name, schema, label, data: data_icon } = props;
  const [value, setValue] = useState<any>('');
  const [show, setShow] = useState(false);

  const buttonRef = createRef<any>();

  useEffect(() => {
    setValue(props.value);
  }, []);

  const handleEmojiSelect = (emoji: any) => {
    if (emoji?.native) {
      setValue(emoji.native);
      if (props.blur) {
        props.blur(emoji.native);
      }
    } else {
      setValue(emoji.id);
      if (props.blur) {
        props.blur(emoji.id);
      }
    }
    buttonRef.current.click();
    if (props.autoUnselect) {
      setValue(null);
    }
  };

  const getIcon = () => {
    if (value?.length > 2) {
      return <Icon name={value} />;
    } else if (value?.length === 2) {
      return value;
    }
    return null;
  };

  const unselect = () => {
    setValue(null);
    if (props.blur) {
      props.blur(null);
    }
  };

  if (schema && schema['x-control-variant'] === 'inline') {
    return (
      <div>
        {value && (
          <div className="flex gap-2 items-center mb-2">
            <div className={classNames('text-sm pl-2 group pr-3 py-1 rounded-full flex items-center gap-2 shadow bg-white border border-gray-100 hover:bg-cyan-100')}>{getIcon()}</div>
            <button onClick={unselect}>
              <Icon name="FaXmark" color="red" />
            </button>
          </div>
        )}
        <Picker data={data} onEmojiSelect={handleEmojiSelect} custom={props.schema?.noSvg ? {} : emojiMartCustom} />
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <Popover position="context" offsetY={-20} content={<Picker data={data} onEmojiSelect={handleEmojiSelect} custom={props.schema?.noSvg ? {} : emojiMartCustom} />}>
        <button className={classNames('text-sm px-2 group py-1 rounded-full flex items-center gap-2 shadow bg-white border border-gray-100 hover:bg-cyan-100')} ref={buttonRef}>
          {getIcon() || label || <Icon name="FaIcons" />}
        </button>
      </Popover>
      {value && (
        <button onClick={unselect}>
          <Icon name="FaXmark" color="red" />
        </button>
      )}
    </div>
  );
};


export default IconPicker;
