'use client';

export const localStorageUtils = {
  set: (name: string, value: any) => {
    if (value instanceof Object) {
      value = JSON.stringify(value);
    }
    localStorage.setItem(name, value);
  },
  get: (name: string): any => {
    let value = localStorage.getItem(name);
    try {
      value = JSON.parse(value);
    } catch (e) {
      console.error('not object');
    }
    return value;
  },
  remove: (name: string) => {
    localStorage.removeItem(name);
  },

  clear: () => {
    localStorage.clear();
  },
};
