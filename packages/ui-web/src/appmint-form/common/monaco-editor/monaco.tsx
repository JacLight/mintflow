import React, { useEffect, useRef, useState } from 'react';
import { IconRenderer } from '../icons/icon-renderer';

// Define the props for the Monaco Code Editor component
interface MonacoCodeEditorProps {
    value: string;
    mode?: string;
    onChange?: (value: string) => void;
    save?: (name: string, value: string) => void;
    name?: string;
    width?: number | string;
    height?: number | string;
    showAppBar?: boolean;
    expandable?: boolean;
}

// Define the Monaco Editor component
export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
    value = '',
    mode = 'javascript',
    onChange,
    save,
    name = '',
    width = '100%',
    height = 300,
    showAppBar = true,
    expandable = true,
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoInstanceRef = useRef<any>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [editorValue, setEditorValue] = useState(value);
    const [theme, setTheme] = useState('vs-dark');

    // Function to load Monaco Editor from CDN
    const loadMonacoEditor = () => {
        if (window.monaco) {
            setIsLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
        script.async = true;
        script.onload = () => {
            // @ts-ignore
            window.require.config({
                paths: {
                    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
                }
            });

            // @ts-ignore
            window.require(['vs/editor/editor.main'], () => {
                setIsLoaded(true);
            });
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    };

    // Initialize Monaco Editor
    useEffect(() => {
        loadMonacoEditor();
    }, []);

    // Create or update the editor instance when Monaco is loaded
    useEffect(() => {
        if (isLoaded && editorRef.current) {
            // Map language mode to Monaco language
            const languageMap: Record<string, string> = {
                javascript: 'javascript',
                typescript: 'typescript',
                html: 'html',
                css: 'css',
                json: 'json',
                markdown: 'markdown',
                python: 'python',
                sql: 'sql',
                xml: 'xml',
                yaml: 'yaml',
            };

            const language = languageMap[mode.toLowerCase()] || 'javascript';

            if (!monacoInstanceRef.current) {
                // Create a new editor instance
                monacoInstanceRef.current = window.monaco.editor.create(editorRef.current, {
                    value: editorValue,
                    language,
                    theme: theme,
                    automaticLayout: true,
                    minimap: {
                        enabled: true
                    },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    folding: true,
                    renderLineHighlight: 'all',
                });

                // Add change event listener
                monacoInstanceRef.current.onDidChangeModelContent(() => {
                    const newValue = monacoInstanceRef.current.getValue();
                    setEditorValue(newValue);
                    if (onChange) {
                        onChange(newValue);
                    }
                });
            } else {
                // Update existing editor
                if (monacoInstanceRef.current.getValue() !== editorValue) {
                    monacoInstanceRef.current.setValue(editorValue);
                }

                // Update language if needed
                const model = monacoInstanceRef.current.getModel();
                if (model) {
                    window.monaco.editor.setModelLanguage(model, language);
                }
            }
        }

        return () => {
            if (monacoInstanceRef.current) {
                monacoInstanceRef.current.dispose();
                monacoInstanceRef.current = null;
            }
        };
    }, [isLoaded, mode, editorValue]);

    // Update the editor value when the prop changes
    useEffect(() => {
        if (value !== editorValue) {
            setEditorValue(value);
            if (monacoInstanceRef.current && monacoInstanceRef.current.getValue() !== value) {
                monacoInstanceRef.current.setValue(value);
            }
        }
    }, [value]);

    // Handle save action
    const handleSave = () => {
        if (save) {
            save(name, editorValue);
        }
    };

    // Toggle expanded state
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
        // Give time for the DOM to update before layout
        setTimeout(() => {
            if (monacoInstanceRef.current) {
                monacoInstanceRef.current.layout();
            }
        }, 100);
    };

    // Calculate editor height
    const editorHeight = isExpanded ? '80vh' : height;

    return (
        <div style={{ width: width }}>
            {showAppBar && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '4px',
                    backgroundColor: '#1e1e1e',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                }}>
                    {expandable && (
                        <button
                            onClick={toggleExpand}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                marginRight: '8px',
                            }}
                        >
                            <IconRenderer icon={isExpanded ? 'Minimize' : 'Maximize'} />
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        <IconRenderer icon='Save' />
                    </button>
                </div>
            )}
            <div
                ref={editorRef}
                style={{
                    height: editorHeight,
                    border: '1px solid #ccc',
                    borderBottomLeftRadius: '4px',
                    borderBottomRightRadius: '4px',
                    borderTopLeftRadius: showAppBar ? '0' : '4px',
                    borderTopRightRadius: showAppBar ? '0' : '4px',
                }}
            />
            {!isLoaded && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#888',
                }}>
                    Loading editor...
                </div>
            )}
        </div>
    );
};

// Add the Monaco type to the Window interface
declare global {
    interface Window {
        monaco: any;
        require: any;
    }
}

// Re-export the component as the default export
export default MonacoCodeEditor;
