import React, { useEffect, useState, useRef } from 'react';
import { Suspense } from 'react';

// Define the RichText Editor component interface
interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    height?: string | number;
    width?: string | number;
    toolbar?: string;
    plugins?: string;
    menubar?: boolean | string;
    inline?: boolean;
}

// Create a RichText Editor component that loads from CDN
const RichTextEditorCDN = React.lazy(() => {
    // Load TinyMCE from CDN
    const loadTinyMCE = () => {
        return new Promise<void>((resolve) => {
            // Check if TinyMCE is already loaded
            if ((window as any).tinymce) {
                resolve();
                return;
            }

            // Load TinyMCE script
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.6.0/tinymce.min.js';
            script.integrity = 'sha512-/4EpSbZW47rO/cUIb0AMRs/xWwE8pyOLf8eiDWQ6sQash5RP1Cl8Zi2aqa4QEufjeqnzTK8CLZWX7J5ZjLcc1Q==';
            script.crossOrigin = 'anonymous';
            script.referrerPolicy = 'no-referrer';
            script.async = true;
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    };

    // Return a component that uses TinyMCE
    return loadTinyMCE().then(() => {
        // Create a component that uses TinyMCE
        const RichTextEditor = (props: RichTextEditorProps) => {
            const containerRef = useRef<HTMLDivElement>(null);
            const editorRef = useRef<any>(null);
            const [value, setValue] = useState(props.value || '');

            // Initialize TinyMCE
            useEffect(() => {
                if (containerRef.current && !editorRef.current && (window as any).tinymce) {
                    const tinymce = (window as any).tinymce;

                    // Default configuration
                    const defaultPlugins = 'advlist autolink lists link image charmap preview anchor ' +
                        'searchreplace visualblocks code fullscreen ' +
                        'insertdatetime media table code help wordcount';

                    const defaultToolbar = 'undo redo | formatselect | ' +
                        'bold italic backcolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help';

                    // Initialize editor with GPL license
                    tinymce.init({
                        target: containerRef.current,
                        height: props.height || 400,
                        width: props.width || '100%',
                        plugins: props.plugins || defaultPlugins,
                        toolbar: props.toolbar || defaultToolbar,
                        menubar: props.menubar !== undefined ? props.menubar : true,
                        inline: props.inline || false,
                        license_key: 'gpl',
                        setup: (editor: any) => {
                            editorRef.current = editor;

                            // Set initial content
                            editor.on('init', () => {
                                editor.setContent(props.value || '');
                            });

                            // Handle content changes
                            editor.on('change input blur', () => {
                                const content = editor.getContent();
                                setValue(content);
                                if (props.onChange) {
                                    props.onChange(content);
                                }
                            });
                        }
                    });

                    // Clean up on unmount
                    return () => {
                        if (editorRef.current) {
                            editorRef.current.destroy();
                            editorRef.current = null;
                        }
                    };
                }
            }, []);

            // Update editor content when props.value changes
            useEffect(() => {
                if (editorRef.current && props.value !== undefined && value !== props.value) {
                    setValue(props.value);
                    editorRef.current.setContent(props.value);
                }
            }, [props.value]);

            return (
                <div
                    ref={containerRef}
                    style={{
                        width: props.width || '100%',
                        minHeight: props.height || 400
                    }}
                />
            );
        };

        return { default: RichTextEditor };
    });
});

// RichText editor loading placeholder
const EditorLoading = () => (
    <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        color: '#495057'
    }}>
        Loading rich text editor...
    </div>
);

export const RichTextEditor = (props: RichTextEditorProps) => {
    return (
        <div className="richtext-editor">
            <Suspense fallback={<EditorLoading />}>
                <RichTextEditorCDN {...props} />
            </Suspense>
        </div>
    );
};

export default RichTextEditor;
