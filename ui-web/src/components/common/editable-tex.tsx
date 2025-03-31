import { classNames } from '@/lib-client/helpers';
import React, { useState, useEffect } from 'react';
import { IconRenderer } from '../ui/icon-renderer';

export const EditableText = (props: { color?: string, value?: string; update; children?; buttonClassName?; editClassName?; singleClick?; validate?}) => {
    const [editMode, setEditMode] = useState(false);
    const [value, setValue] = useState('');
    const [color, setColor] = useState('');

    useEffect(() => {
        setValue(props.value);
        setColor(props.color);
        setEditMode(false);
    }, [props.value]);

    let timer;
    let delay = 200;
    let prevent = false;

    const doDoubleClickAction = stepId => {
        setEditMode(true);
    };

    const handleClick = stepId => {
        if (props.singleClick) {
            setEditMode(true);
        } else {
            timer = setTimeout(function () {
                prevent = false;
            }, delay);
        }
    };

    const handleDoubleClick = stepId => {
        clearTimeout(timer);
        prevent = true;
        doDoubleClickAction(stepId);
    };

    const update = e => {
        if (props.validate && !props.validate(value)) {
            return;
        }
        setEditMode(false);
        props.update(value, color);
    };
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const onColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColor(event.target.value);
    };

    if (!editMode) {
        return (
            <div onClick={handleClick} onDoubleClick={handleDoubleClick} className={(classNames(props.buttonClassName ? props.buttonClassName : 'w-full cursor-pointer'))} title="Double click to change">
                {value}
            </div>
        );
    }

    return (
        <div className={classNames(props.editClassName ? props.editClassName : 'w-10/12 props flex gap-2 items-center justify-center')}>
            {props.color && <input placeholder='color' type='color' className="w-5 h-5 shadow" onChange={onColorChange} value={color} />}
            <input placeholder='New Value' className="w-full text-sm px-2 py-1 shadow " onChange={handleChange} value={value} />
            <div className=" flex  gap-1 items-center justify-center">
                <button title='Save' onClick={update} className=" hover:bg-cyan-100 p-1 rounded-lg">
                    <IconRenderer icon="Check" />
                </button>
                <button title='Cancel' onClick={e => setEditMode(false)} className=" hover:bg-cyan-100 p-1 rounded-lg">
                    <IconRenderer icon="X" color="red" />
                </button>
            </div>
        </div>
    );
};