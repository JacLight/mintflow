// import { SiteNotificationType } from 'app/components/SiteNotification/types';
// import { notificationStore } from 'app/components/SiteNotification';

const objectRegister: { [key: number]: (any) => any } = {};
const callBackReuseRegister: { [key: number]: boolean } = {};

const registerObject = (object: any): any => {
  const objectId = new Date().getTime();
  objectRegister[objectId] = object;
  return objectId;
};

const registerCallback = (callback: (any) => any, reuse = false): number => {
  const callbackId = registerObject(callback);
  if (callBackReuseRegister) {
    callBackReuseRegister[callbackId] = true;
  }
  return callbackId
};

const unregisterReuse = (objectId: number) => {
  delete callBackReuseRegister[objectId];
  delete objectRegister[objectId];
};

const unregisterObject = (objectId: number) => {
  if (callBackReuseRegister[objectId]) {
    return;
  }
  delete objectRegister[objectId];
};

const execCallback = (callbackId: number, param: any): void => {
  const callback = objectRegister[callbackId];
  if (callback) {
    objectRegisterUtil.unregisterObject(callbackId);
    callback(param);
  } else {
    // notificationStore.showNotification('', 'Callback not found: '+ callbackId, SiteNotificationType.Error)
  }
};

const getObject = (objectId: number, unregister = true): any => {
  const object = objectRegister[objectId];
  if (unregister) {
    unregisterObject(objectId);
  }
  return object;
};

export const objectRegisterUtil = {
  objectRegister,
  registerObject,
  registerCallback,
  execCallback,
  getObject,
  unregisterObject,
  unregisterReuse
};
