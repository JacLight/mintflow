'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { getConsoleService } from '@/lib/console-service';
import 'xterm/css/xterm.css';

interface TerminalProps {
    className?: string;
}

export const TerminalComponent: React.FC<TerminalProps> = ({ className }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [terminal, setTerminal] = useState<Terminal | null>(null);
    const [fitAddon, setFitAddon] = useState<FitAddon | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const consoleService = getConsoleService();

    // Initialize terminal
    useEffect(() => {
        if (!terminalRef.current) return;

        // Create terminal instance
        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#1e1e1e',
                foreground: '#f0f0f0',
                cursor: '#f0f0f0',
                black: '#000000',
                red: '#e06c75',
                green: '#98c379',
                yellow: '#e5c07b',
                blue: '#61afef',
                magenta: '#c678dd',
                cyan: '#56b6c2',
                white: '#dcdfe4',
                brightBlack: '#5c6370',
                brightRed: '#e06c75',
                brightGreen: '#98c379',
                brightYellow: '#e5c07b',
                brightBlue: '#61afef',
                brightMagenta: '#c678dd',
                brightCyan: '#56b6c2',
                brightWhite: '#ffffff'
            },
            fontFamily: 'monospace',
            fontSize: 14,
            lineHeight: 1.2,
            scrollback: 1000,
            convertEol: true
        });

        // Create fit addon
        const fit = new FitAddon();
        term.loadAddon(fit);

        // Create web links addon
        const webLinks = new WebLinksAddon();
        term.loadAddon(webLinks);

        // Open terminal
        term.open(terminalRef.current);
        fit.fit();

        // Set terminal and fit addon
        setTerminal(term);
        setFitAddon(fit);

        // Connect to console server
        consoleService.connect();

        // Display welcome message
        term.writeln('\x1b[1;34m=== MintFlow Terminal ===\x1b[0m');
        term.writeln('\x1b[90mConnecting to server...\x1b[0m');

        // Clean up on unmount
        return () => {
            term.dispose();
            consoleService.disconnect();
        };
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (fitAddon) {
                fitAddon.fit();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [fitAddon]);

    // Function to set up a new session
    const setupSession = async (term: Terminal) => {
        try {
            // Create a new session
            const newSessionId = await consoleService.createSession();
            setSessionId(newSessionId);
            setIsConnected(true);
            setConnectionError(null);

            term.writeln('\x1b[92mConnected to server. Session established.\x1b[0m');
            term.writeln('\x1b[90mType "help" to see available commands.\x1b[0m');
            term.writeln('');
            term.write('\x1b[1;36m$ \x1b[0m');

            // Set up message handler
            const unsubscribe = consoleService.subscribeToMessages(newSessionId, (message) => {
                if (message.type === 'output') {
                    // Handle output message
                    if (message.stream === 'stderr') {
                        term.write(`\x1b[31m${message.data || ''}\x1b[0m`);
                    } else {
                        term.write(message.data || '');
                    }
                } else if (message.type === 'system') {
                    // Handle system message
                    if (message.event === 'close') {
                        term.writeln('');
                        term.writeln(`\x1b[90mProcess exited with code ${message.code}\x1b[0m`);
                        term.write('\x1b[1;36m$ \x1b[0m');
                    } else if (message.event === 'clear') {
                        // Clear the terminal
                        term.clear();
                        term.write('\x1b[1;36m$ \x1b[0m');
                    }
                } else if (message.type === 'error') {
                    // Handle error message
                    term.writeln(`\x1b[31mError: ${message.error}\x1b[0m`);
                    term.write('\x1b[1;36m$ \x1b[0m');
                }
            });

            // Set up input handling
            let currentLine = '';

            term.onKey(({ key, domEvent }) => {
                const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

                if (domEvent.keyCode === 13) { // Enter
                    // Execute command
                    term.writeln('');
                    const trimmedCommand = currentLine.trim();

                    if (trimmedCommand) {
                        // Handle special commands
                        if (trimmedCommand === 'retry' && !isConnected) {
                            term.writeln('\x1b[90mRetrying connection...\x1b[0m');
                            consoleService.connect();
                            setupSession(term);
                        } else {
                            consoleService.executeCommand(newSessionId, currentLine);
                        }
                    } else {
                        term.write('\x1b[1;36m$ \x1b[0m');
                    }
                    currentLine = '';
                } else if (domEvent.keyCode === 8) { // Backspace
                    if (currentLine.length > 0) {
                        currentLine = currentLine.substring(0, currentLine.length - 1);
                        term.write('\b \b');
                    }
                } else if (printable) {
                    currentLine += key;
                    term.write(key);
                }
            });

            // Return cleanup function
            return () => {
                unsubscribe();
                if (newSessionId) {
                    consoleService.terminateSession(newSessionId);
                }
            };
        } catch (error) {
            console.error('Error setting up terminal session:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            term.writeln(`\x1b[31mError connecting to server: ${errorMessage}\x1b[0m`);
            term.writeln('\x1b[90mType "retry" to attempt reconnection.\x1b[0m');
            setConnectionError(errorMessage);
            setIsConnected(false);
            return () => { };
        }
    };

    // Create session and set up event handlers
    useEffect(() => {
        if (!terminal) return;

        let cleanupFn: (() => void) | undefined;

        setupSession(terminal).then(fn => {
            cleanupFn = fn;
        }).catch(error => {
            console.error('Error in setupSession:', error);
        });

        return () => {
            if (cleanupFn) cleanupFn();
        };
    }, [terminal]);

    return (
        <div className={`terminal-container h-full w-full ${className || ''}`}>
            <div ref={terminalRef} className="h-full w-full" />
            {connectionError && (
                <div className="absolute bottom-4 right-4">
                    <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        onClick={() => {
                            if (terminal) {
                                terminal.writeln('\x1b[90mRetrying connection...\x1b[0m');
                                consoleService.connect();
                                setupSession(terminal);
                            }
                        }}
                    >
                        Retry Connection
                    </button>
                </div>
            )}
        </div>
    );
}