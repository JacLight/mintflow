import React, { useEffect, useState, useRef } from 'react';
import { Suspense } from 'react';

// Define the Markdown Editor component interface
interface MarkdownEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    height?: string | number;
    preview?: 'live' | 'edit' | 'preview';
    visiableDragbar?: boolean;
    hideToolbar?: boolean;
}

// Create a simple Markdown Editor component
const MarkdownEditorSimple = (props: MarkdownEditorProps) => {
    const [value, setValue] = useState(props.value || '');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        if (props.onChange) {
            props.onChange(newValue);
        }
    };

    return (
        <div className="markdown-editor-simple">
            <label htmlFor="markdown-simple-editor" className="sr-only">Markdown Editor</label>
            <textarea
                id="markdown-simple-editor"
                value={value}
                onChange={handleChange}
                placeholder="Enter markdown text here"
                aria-label="Markdown Editor"
                style={{
                    width: '100%',
                    height: props.height || 400,
                    padding: '10px',
                    fontFamily: 'monospace',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    resize: 'vertical'
                }}
            />
        </div>
    );
};

// Create a Markdown Editor component that loads from CDN
const MarkdownEditorCDN = React.lazy(() => {
    return import('@uiw/react-md-editor').then((module) => {
        // Create a component that uses the imported Markdown Editor
        const MarkdownEditor = (props: MarkdownEditorProps) => {
            const [value, setValue] = useState(props.value || '');

            const handleChange = (val?: string) => {
                if (val !== undefined) {
                    setValue(val);
                    if (props.onChange) {
                        props.onChange(val);
                    }
                }
            };

            return (
                <div data-color-mode="light">
                    <module.default
                        value={value}
                        onChange={handleChange}
                        height={props.height || 400}
                        preview={props.preview || 'live'}
                        visibleDragbar={props.visiableDragbar !== false}
                        hideToolbar={props.hideToolbar || false}
                    />
                </div>
            );
        };

        return { default: MarkdownEditor };
    }).catch(() => {
        // Fallback to simple editor if import fails
        return { default: MarkdownEditorSimple };
    });
});

// Markdown editor loading placeholder
const EditorLoading = () => (
    <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f6f8fa',
        color: '#24292e'
    }}>
        Loading markdown editor...
    </div>
);

export const MarkdownEditor = (props: MarkdownEditorProps) => {
    return (
        <div className="markdown-editor">
            <Suspense fallback={<EditorLoading />}>
                <MarkdownEditorCDN {...props} />
            </Suspense>
        </div>
    );
};

export default MarkdownEditor;
