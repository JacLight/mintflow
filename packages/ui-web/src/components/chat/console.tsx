'use client';

import { ReactNode } from 'react';

export interface ConsoleOutputContent {
  type: 'text' | 'image';
  value: string;
}

export interface ConsoleOutput {
  id: string;
  contents: ConsoleOutputContent[];
  status: 'in_progress' | 'loading_packages' | 'completed' | 'failed';
}

export interface ConsoleProps {
  consoleOutputs: ConsoleOutput[];
  setConsoleOutputs: (outputs: ConsoleOutput[]) => void;
}

export function Console({ consoleOutputs, setConsoleOutputs }: ConsoleProps) {
  if (consoleOutputs.length === 0) {
    return null;
  }

  return (
    <div className="console-container">
      <div className="console-header">
        <h3>Console Output</h3>
        <button onClick={() => setConsoleOutputs([])}>Clear</button>
      </div>
      <div className="console-output">
        {consoleOutputs.map((output) => (
          <div key={output.id} className="output-item">
            <div className="output-status">
              {output.status === 'in_progress' && 'Running...'}
              {output.status === 'loading_packages' && 'Loading packages...'}
              {output.status === 'completed' && 'Completed'}
              {output.status === 'failed' && 'Failed'}
            </div>
            <div className="output-content">
              {output.contents.map((content, index) => (
                <div key={index}>
                  {content.type === 'text' ? (
                    <pre>{content.value}</pre>
                  ) : (
                    <img src={content.value} alt="Output" style={{ maxWidth: '100%' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
