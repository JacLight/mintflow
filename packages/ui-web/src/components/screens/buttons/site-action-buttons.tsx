import React, { useState, useEffect } from 'react';
import { BaseModel, SiteModel, classNames, isNotEmpty } from '@jaclight/dbsdk';
import { appEndpoints } from '@ui/utils/request/api-endpoints';
import { ButtonDelete } from '@ui/components/common/button/button-delete';
import appConfig from '@ui/config';
import { activeSession } from '@ui/utils/active-session';
import { useSiteStore } from '@ui/store/site-store';
import { BusyIcon } from '@ui/components/common/icons/busy-icon';
import { elegantButton } from '@ui/utils/constants';
import requestQueueInstance from '@ui/utils/request/request-queue';
import { getResponseErrorMessage } from '@ui/utils/request/appengine';
import { IconRenderer } from '@ui/ui/icons/icon-renderer';

let intervalRef;
export const SiteActionButtons = props => {
  const activeSite: BaseModel<SiteModel> = useSiteStore(state => state.activeSite);
  const [update, setUpdate] = useState('');

  const appendUpdate = data => {
    if (data) {
      const newUpdate = '\n' + new Date().toLocaleString() + '\n\n' + JSON.stringify(data, null, 2);
      setUpdate(update + newUpdate);
    }
  };

  const handleMakeSiteTemplate = async () => {
    setUpdate('');
    const { name } = activeSite?.data || {};
    if (name) {
      await requestQueueInstance
        .processData(appEndpoints.tools_make_site_template.name, { site: name, orgId: appConfig.orgId })
        .then(res => {
          appendUpdate(res);
        })
        .catch(err => {
          appendUpdate({ error: getResponseErrorMessage(err), status: err?.response?.status });
        })
        .finally(() => {
        });
    } else {
      useSiteStore.getState().showNotice('Please select a site first', 'error');
    }
  };

  const handlePublishSite = async () => {
    setUpdate('');
    const { name } = activeSite?.data || {};
    const user = activeSession?.getUser();



    if (name && user) {
      // const rt = await request(appEndpoints.batch_sr_publish_with_api.name, { isNew: true, "repoName": "base-site", siteName: name, orgId: appConfig.orgId, "comment": "Publish site initiated by user " + user?.data?.email }, name)
      // const rt = await request(appEndpoints.batch_sr_publish.name, { createRepo: true, isNew: true, "repoName": "client-site", siteName: name, orgId: appConfig.orgId, "comment": "Publish site initiated by user " + user?.data?.email }, name)
      const data = { useApi: false, createRepo: true, hostOrgId: 'shared-site', siteName: name, orgId: appConfig.orgId, comment: 'Publish site initiated by user ' + user?.data?.email };
      await requestQueueInstance.processData(appEndpoints.batch_sr_publish_shared.name, data, name)
    } else {
      useSiteStore.getState().showNotice('Please select a site first', 'error');
    }
  };

  const getStatus = async () => {
    const { logo, name } = activeSite?.data || {};
    return await requestQueueInstance
      .processData(appEndpoints.batch_sr_publish_status.name, null, name)
      .then(res => {
        if (isNotEmpty(res.deploy)) {
          if (typeof res?.deploy === 'object') {
            const keys = Object.keys(res.deploy);
            let hasPending;
            let hasSuccess;
            let hasFailure;
            for (let i = 0; i < keys.length; i++) {
              const item = res?.deploy[keys[i]];
              if (item.status === 'completed' && item.conclusion === 'success') {
                hasSuccess = true;
              } else if (item.status !== 'completed') {
                hasPending = true;
                break;
              } else if (item.status === 'completed' && item.conclusion !== 'success') {
                hasFailure = true;
              }
            }
            if (hasPending) {
              return 'in-progress';
            } else if (hasSuccess) {
              return 'completed';
            } else if (hasFailure) {
              return 'failed';
            }
          }
        }
      })
      .catch(err => {
        console.error('Error fetching status:', err);
        appendUpdate({ action: 'Publishing Status', status: 'failure', error: getResponseErrorMessage(err) });
      })
      .finally(() => {
      });
  };

  const createFavicon = async () => {
    setUpdate('');
    const { logo, name } = activeSite?.data || {};
    if (logo) {
      await requestQueueInstance
        .processData(appEndpoints.tools_create_site_favicon.name, { path: logo.path, site: name }, name)
        .then(res => {
          appendUpdate(res.data);
        })
        .catch(err => {
          useSiteStore.getState().showNotice('Site Favicon created and added to site', 'success');
          const error = { action: 'Favicon ', status: 'failure', error: getResponseErrorMessage(err) };
          appendUpdate(error);
        })
        .finally(() => {
        });
    } else {
      useSiteStore.getState().showNotice('Add Logo to website first', 'error');
    }
  };

  const submitSiteIndex = async () => {
    return await requestQueueInstance
      .processData(appEndpoints.tools_create_site_index.name, { siteName: activeSite?.data.name })
      .then(res => res)
      .catch(err => {
        const error = { error: getResponseErrorMessage(err) || err?.response?.data?.message, status: err?.response?.status };
        appendUpdate(error);
      })
      .finally(() => {
      });
  };

  const classifySite = async () => {
    return await requestQueueInstance
      .processData(appEndpoints.tools_classify_site.name, { siteName: activeSite?.data.name })
      .then(res => res)
      .catch(err => {
        appendUpdate({ error: getResponseErrorMessage(err), status: err?.response?.status });
      })
      .finally(() => {
      });
  };

  const exportNextJs = async () => {
    setUpdate('');
  };

  const exportHtml = async () => {
    setUpdate('');
  };

  return (
    <div className="w-full h-full p-5">
      <div className="mb-6 grid grid-cols-2 gap-2">
        <ActionButton disabled={appConfig.sharedOrg !== appConfig.orgId} icon="Upload" title="Publish Site" info="publish your site to use the latest updates" getStatus={getStatus} handler={handlePublishSite} />
        <ActionButton icon="Palette" title="Create Favicon" info={!activeSite?.data?.logo && <span className="text-red-500 text-xs">Add Logo to site to create favicon</span>} handler={createFavicon} />
        <ActionButton title='Submit Site Index' handler={submitSiteIndex} icon={'Database'} />
        <ActionButton title='Export Site - coming soon' icon={'Download'} disabled={true} />
      </div>

      {appConfig.sharedOrg === appConfig.orgId && (
        <div className="w-full mb-6">
          <h1 className="mt-0">Template Site Actions</h1>
          <h1 className="mt-0 mb-2 text-xs">Register site as template for others to use</h1>
          <div className="flex justify-around gap-10 pt-2">
            <button onClick={handleMakeSiteTemplate} className={classNames(elegantButton, 'w-full')}>
              <span>Make Site Template</span>
            </button>
            <button onClick={classifySite} className={classNames(elegantButton, 'w-full')}>
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
      )}
    </div>
  );
};


const globalTimeout = 100000
const ActionButton = (props: { disabled?, icon?, onClick?, handler?, title, info?, getStatus?, className?}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const wait = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getStatus = async () => {
    let totalWait = 0;
    if (props.getStatus) {
      let status = await props.getStatus();
      setStatus(status);
      while (status === 'in-progress' && totalWait < globalTimeout) {
        totalWait += 5000;
        await wait(5000);
        status = await props.getStatus();
      }
    }
  }

  const onClick = async () => {
    setError(null);
    setStatus(null);
    if (props.handler) {
      try {
        setIsLoading(true);
        await props.handler();
        await getStatus();
      } catch (e) {
        setError(getResponseErrorMessage(e));
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-2 border-blue-100 rounded-lg">
      <button onClick={onClick} disabled={!!isLoading || props.disabled} className="text-sm flex items-center gap-3 disabled:opacity-40">
        <div className="bg-blue-50 p-2 rounded-lg">
          <IconRenderer icon={props.icon} className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 text-left">{props.title}</h3>
          <p className="text-xs text-gray-600">{props.info}</p>
        </div>
        <div className='flex-grow'></div>
        <BusyIcon isLoading={isLoading} />
      </button>

      {status && <div className='text-sm text-center text-green-500 p-2'>{status}</div>}
      {error && <div className='text-sm text-center text-red-500 p-2'>{error}</div>}
    </div>
  )
}