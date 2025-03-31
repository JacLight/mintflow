'use client';

import React, { useState } from 'react';

// Placeholder component for site action buttons
export const SiteActionButtons = () => {
  const [update, setUpdate] = useState('');

  const appendUpdate = (data) => {
    if (data) {
      const newUpdate = '\n' + new Date().toLocaleString() + '\n\n' + JSON.stringify(data, null, 2);
      setUpdate(update + newUpdate);
    }
  };

  const handleMakeSiteTemplate = async () => {
    setUpdate('');
    appendUpdate({ message: 'Make site template action triggered' });
  };

  const handlePublishSite = async () => {
    setUpdate('');
    appendUpdate({ message: 'Publish site action triggered' });
  };

  const createFavicon = async () => {
    setUpdate('');
    appendUpdate({ message: 'Create favicon action triggered' });
  };

  const submitSiteIndex = async () => {
    appendUpdate({ message: 'Submit site index action triggered' });
    return { success: true };
  };

  const classifySite = async () => {
    appendUpdate({ message: 'Classify site action triggered' });
    return { success: true };
  };

  return (
    <div className="w-full h-full p-5">
      <div className="mb-6 grid grid-cols-2 gap-2">
        <ActionButton title="Publish Site" info="publish your site to use the latest updates" handler={handlePublishSite} />
        <ActionButton title="Create Favicon" info="Add Logo to site to create favicon" handler={createFavicon} />
        <ActionButton title='Submit Site Index' handler={submitSiteIndex} />
        <ActionButton title='Export Site - coming soon' disabled={true} />
      </div>

      <div className="w-full mb-6">
        <h1 className="mt-0">Template Site Actions</h1>
        <h1 className="mt-0 mb-2 text-xs">Register site as template for others to use</h1>
        <div className="flex justify-around gap-10 pt-2">
          <button onClick={handleMakeSiteTemplate} className="px-4 py-2 bg-blue-500 text-white rounded">
            <span>Make Site Template</span>
          </button>
          <button onClick={classifySite} className="px-4 py-2 bg-blue-500 text-white rounded">
            <span>Classify Site</span>
          </button>
        </div>

        {update && (
          <div className='max-h-64 overflow-auto shadow border border-gray-200 rounded-lg relative p-2 mt-4'>
            <button onClick={() => setUpdate('')} className={'text-sm px-2 py-1 rounded-full'}>
              <span>Clear</span>
            </button>
            <pre className='text-xs'>{update}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = (props: { disabled?: boolean, onClick?: () => void, handler?: () => Promise<any>, title: string, info?: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setStatus(null);
    if (props.handler) {
      try {
        setIsLoading(true);
        await props.handler();
        setStatus('completed');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-2 border-blue-100 rounded-lg">
      <button onClick={onClick} disabled={!!isLoading || props.disabled} className="text-sm flex items-center gap-3 disabled:opacity-40">
        <div>
          <h3 className="font-medium text-gray-900 text-left">{props.title}</h3>
          <p className="text-xs text-gray-600">{props.info}</p>
        </div>
        <div className='flex-grow'></div>
        {isLoading && <span>Loading...</span>}
      </button>

      {status && <div className='text-sm text-center text-green-500 p-2'>{status}</div>}
      {error && <div className='text-sm text-center text-red-500 p-2'>{error}</div>}
    </div>
  )
}
