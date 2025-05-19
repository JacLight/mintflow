import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

export const MonacoCodeEditor = (props) => {
  const [value, setValue] = useState(props.value);
  const updateTimeout = useRef(null);
  const { mode = 'json', theme = 'vs-dark', editorHeight = 400, options } = props;

  const onChange = (newValue) => {
    setValue(newValue);
    if (props.onChange) {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
      updateTimeout.current = setTimeout(() => {
        props.onChange(newValue);
      }, 500);
    }
  };

  return (
    <div className="relative">
      <Editor
        options={options}
        language={mode.toLowerCase()}
        value={value}
        onChange={onChange}
        width="100%"
        height={editorHeight}
        theme={theme}
      />
    </div>
  );
};

export default MonacoCodeEditor;