import { create } from 'zustand';
import * as objectPath from 'object-path';
import { FormLayoutAccordion } from '../form-view/form-layout-accordion';
import { FormLayoutTab } from '../form-view/form-layout-tab';
import { FormLayoutSlider } from '../form-view/form-layout-slider';
import { produce } from 'immer';
import { deepCopy, getRandomString, isEmpty, isNotEmpty } from '../utils';
import { getTemplateValue } from '../form-view/form-validator';

const accessModes = { full: 1, read: 2, create: 3, update: 4, delete: 5 };

export const formLayouts = {
  accordion: FormLayoutAccordion,
  tab: FormLayoutTab,
  slide: FormLayoutSlider,
};

const storeMap = new Map();

interface FormStoreProps {
  datatype?: string;
  schema?: any;
  theme?: any;
  ref?: string;
  storeId: string;
  activePath?: string;
  activeDataPath?: string;
  timestamp: { [key: string]: number };
  page?: number;
  data: any;
  error: any;
  rules?: any;
  accessMode: string;
  watchedPaths: { [key: string]: string[] };
  ruleResults?: { [key: string]: any[] };
  activePage?: number;
  collectionForm?: boolean;
  email?: string;
  files: any;
  readOnly?: boolean;
  dataBindValue?: any;
  repository: { [key: string]: any };
  notifications?: any[];
  dataViewProps?: any;
  refreshPath(path: string): void;
  setStateItem: (item: { [key: string]: any }) => void;
  getStateItem: (key: string) => any;
  getSchemaItem: (path?: string) => any;
  getItemValue: (path?: string) => any;
  getDefaultValue: (path: string, schema?: any, schemaPath?: string, data?: any) => any;
  getError: (path?: string, startsWith?: boolean) => any;
  updateError: (path: string, message?: string) => void;
  clearError: () => void;
  updateBulkError: (validation: { valid; errors: any[]; message; validationResults: { path; error; message }[] }) => void;
  clearData?: () => void;
  setItemValue: (path: string, value: any, arrayIndex?, silent?: boolean, isFile?: boolean) => void;
  initForm: (formConfig: { data?, readOnly?, path?, schema, rules?, theme?, accessMode?, storeId, datatype?, onChangeCallback?}) => void;
  removeArrayValue: (path: string, index) => void;
  updateWatchedPath: (watcher: string, paths: string[]) => void;
  applyRuleResult: (path?, schema?) => any;
  onChangeCallback?: (path: string, value: any, data: any, files: any, error: any) => void;
  updateRepository: (path: string, value?: any) => void;
}

export const showNotice = (message, type: string) => {
  if (typeof message !== 'string') return;
  const notification = { id: getRandomString(6), title: '', message, type, status: 'new' };
  // set({ notifications: [...(get().notifications || []), notification] });
}

export const useFormStore = create<FormStoreProps>((set, get) => ({
  storeId: '',
  accessMode: '1',
  activePage: 0,
  error: {},
  data: {},
  files: {},
  watchedPaths: {},
  timestamp: {},
  repository: {},
  initForm: ({ data, readOnly, path, schema, rules, theme, accessMode, storeId, datatype, onChangeCallback }) => {
    set({ readOnly: false, data: {}, activePath: '', storeId: '', ref: '', rules: null, schema: null, datatype: undefined, accessMode: '', timestamp: {}, error: {}, page: 0, onChangeCallback: undefined });
    set({ readOnly, data, schema, activePath: path, rules, theme, accessMode, storeId, datatype, timestamp: {}, onChangeCallback });
    // const ruleResults = runFormRules('', '', '', null, schema, schema?.rules, data, null);
    // set({ ruleResults });
  },
  clearData: () => {
    set({ data: {}, timestamp: {}, error: {}, page: 0, activePath: '' });
  },
  setStateItem: (item: { [key: string]: any }) => set((state: any) => ({ ...item })),
  getStateItem: (key: string) => get()[key],
  updateBulkError: (validation: { valid; errors; message; validationResults }) =>
    set(state => {
      if (validation?.valid) {
        return { error: {}, timestamp: { ...state.timestamp, ['root']: Date.now() } };
      }
      const timestamp = { ...state.timestamp };
      const error = produce(state.error, draft => {
        delete draft['root'];
        validation.validationResults.forEach(result => {
          draft[result.path] = result.message;
          timestamp[result.path] = Date.now();
        });
        draft['root'] = validation.message;
        timestamp['root'] = Date.now();
      });

      return { error: error, timestamp: { ...timestamp } };
    }),
  updateError: (dataPath: string, message?: string) =>
    set(state => {
      const error = produce(state.error || {}, draft => {
        delete draft['root'];
        if (!message) {
          delete draft[dataPath];
          return draft;
        }
        draft[dataPath] = message;
      });
      return { error: error, timestamp: { ...state.timestamp, [dataPath]: Date.now() } };
    }),
  clearError: () => set(state => ({ error: {}, timestamp: { ...state.timestamp, ['root']: Date.now() } })),
  getError: (dataPath: string = '', startsWith = false) => {
    if (!get().error) return;
    if (startsWith) {
      const keys = Object.keys(get().error).filter(key => key.startsWith(dataPath));
      return keys.map(key => get().error[key]);
    }
    if (!dataPath) return get().error;
    return get().error[dataPath];
  },
  getItemValue: dataPath => {
    if (!dataPath) return get().data;
    return objectPath.get(get().data, dataPath);
  },
  getDefaultValue: (dataPath, schema?, schemaPath?, data?) => {
    schema = schema || get().getSchemaItem(schemaPath);
    if (!schema || !schema.default) return;
    const defaultValue = schema.default;
    if (typeof defaultValue === 'object') {
      return deepCopy(defaultValue);
    } else if (typeof defaultValue === 'string' && defaultValue?.startsWith('{{') && defaultValue?.endsWith('}}')) {
      return getTemplateValue(defaultValue, '', data || get().data);
    } else {
      return defaultValue;
    }
  },
  updateWatchedPath: (watcher, paths) => {
    if (isEmpty(paths)) return;
    if (paths && typeof paths === 'string') paths = [paths];
    const watchedPaths = produce(get().watchedPaths, draft => {
      paths.forEach(path => {
        if (!draft[path]) draft[path] = [];
        const watcherSet = new Set(draft[path]);
        watcherSet.add(watcher);
        draft[path] = Array.from(watcherSet);
      });
    });
    set({ watchedPaths: watchedPaths });
  },
  setItemValue: (dataPath, value, arrayIndex?, silent = false, isFile = false) => {
    if (!dataPath) return;
    const data = produce(get().data, draft => {
      if (typeof value === 'undefined' || value === null) {
        objectPath.del(draft, dataPath);
      } else {
        objectPath.set(draft, dataPath, value);
      }
    });

    let files = get().files;
    if (isFile) {
      files = produce(files, draft => {
        if (isEmpty(value)) {
          objectPath.del(draft, dataPath);
        } else {
          objectPath.set(draft, dataPath, value);
        }
      });
    }

    if (silent) {
      set({ data, files });
    } else {
      set({ data, files, timestamp: { ...get().timestamp, [dataPath]: Date.now() } });
    }

    let watchedPaths = dataPath;
    if (arrayIndex !== undefined) {
      watchedPaths = dataPath.replace(`.${arrayIndex}`, '');
    }
    const hasWatchers = [...(get().watchedPaths[watchedPaths] || []), ...(get().watchedPaths[dataPath] || [])];
    if (isNotEmpty(hasWatchers)) {
      const timestamp = { ...get().timestamp };
      for (const wp of hasWatchers) {
        timestamp[wp] = Date.now();
      }
      set({ timestamp: timestamp });
    }

    if (get().onChangeCallback) {
      const callback: any = get().onChangeCallback;
      callback(dataPath, value, data, files, get().getError(dataPath));
    }
  },
  getSchemaItem: path => {
    return objectPath.get(get().schema, path);
  },
  applyRuleResult: (path?, schema?) => {
    let rulesResult = get().ruleResults;
    if (!rulesResult) return schema;
    const data = deepCopy(get().data);
    const timestamp = {};

    if (path) {
      const pathRules = rulesResult[path];
      if (!pathRules) return schema;
      pathRules.forEach(rule => {
        if (rule.operator === 'hide') {
          schema = { ...schema, hidden: true };
        } else if (rule.operator === 'show') {
          schema = { ...schema, hidden: false };
        } else if (rule.operator === 'set-property') {
          const rawValue = getTemplateValue(rule.value, '', data);
          objectPath.set(schema, rule.field, rawValue);
        }
      });
      return schema;
    } else {
      Object.keys(rulesResult).forEach(path => {
        timestamp[path] = Date.now();
        const pathRules = rulesResult[path];
        pathRules.forEach(rule => {
          if (rule.operator === 'set-value') {
            const rawValue = getTemplateValue(rule.value, '', data);
            objectPath.set(data, path, rawValue);
          }
        });
      });
      get().setStateItem({ data, timestamp });
    }
  },
  removeArrayValue: (path, index) => {
    if (isEmpty(objectPath.get(get().data, path))) return;
    const data = produce(get().data, draft => {
      const array = objectPath.get(draft, path);
      array.splice(index, 1);
    });
    set({
      data: data,
      timestamp: { ...get().timestamp, [path]: Date.now() },
    });
    if (get().onChangeCallback) {
      const callback: any = get().onChangeCallback;
      callback(path, undefined, data, undefined, get().getError(path));
    }
  },
  refreshPath: path => {
    set({ timestamp: { ...get().timestamp, [path]: Date.now() } });
  },
  updateRepository: (path, value?) => {
    const repository = produce(get().repository, draft => {
      if (!value) {
        delete draft[path];
      } else {
        draft[path] = value;
      }
    });
    set({ repository });
  },
}));


export const getElementTheme = (name, theme = 'default') => {
  if (!name) return null;

  if (theme === 'unstyled') return { classes: [], style: {}, className: [] };

  if (themeStyleMap[theme] && themeStyleMap[theme][name]) {
    return { ...themeStyleMap[theme][name], className: (themeStyleMap[theme][name].classes || []).join(' ') };
  }

  if (themeStyleMap['default'] && themeStyleMap['default'][name]) {
    return { ...themeStyleMap['default'][name], className: (themeStyleMap['default'][name].classes || []).join(' ') };
  }
  return {};
};

const themeStyleMap = {
  default: {
    control: { classes: ['rounded-lg mx-auto mx-auto mt-2'], style: {} },
    button: { classes: [''], style: {} },
    layout: { classes: ['w-full  mx-auto my-2'], style: {} },
    form: { classes: [' '], style: {} },
    'form-root': { classes: ['pb-2'], style: {} },
    collapsible: { classes: [`text-sm mb-2 mt-4 shadow w-full rounded`], style: {} },
    'control-group': { classes: ['flex', 'gap-3', 'items-center', 'mx-auto'] },
    'control-label': { classes: ['whitespace-nowrap'], style: {} },
    'control-input': { classes: ['mt-0'] },

  },
  filter: {
    control: { classes: ['rounded-lg mx-auto'], style: {} },
    help: { classes: ['hidden'], style: {} },
    // 'label': { classes: ['hidden'], style: {} },
    form: { classes: ['h-full'], style: {} },
    layout: { classes: ['w-full  mx-auto'], style: {} },
    'form-root': { classes: ['space-y-0'], style: {} },
    date: { classes: ['w-24'], style: {} },
    collapsible: { classes: [`text-sm  shadow w-full rounded border-b border-b-gray-300 mt-1`], style: {} },
    // 'array': { layout: 'horizontal' },
  },
  schedule: {
    control: { classes: ['rounded-lg mx-auto'], style: {} },
    help: { classes: ['hidden'], style: {} },
    form: { classes: ['h-full'], style: {} },
    layout: { classes: ['w-full  mx-auto'], style: {} },
    'form-root': { classes: ['space-y-0'], style: {} },
    collapsible: { classes: [`text-sm  shadow w-full rounded border-b border-b-gray-300 mt-1`], style: {} },
  },
  'quick-meeting': {
    date: { classes: ['!w-56'], style: {} },
  },
  'settings': {
    layout: { classes: ['w-full  mx-auto my-0'], style: {} },
    'form-root': { classes: [''], style: {} },
    control: { classes: ['rounded-lg mx-auto my-0 mt-1'], style: {} },
    'control-group': { classes: ['justify-start', 'gap-3', ''] },
    collapsible: { classes: [`text-sm  shadow w-full rounded border-b border-b-gray-300 mt-1`], style: {} },
  },
  'mintflow': {
    label: { classes: ['hidden'], style: {} },
    layout: { classes: ['w-full  mx-auto my-0'], style: {} },
    'form-root': { classes: ['text-xs'], style: {} },
    control: { classes: ['rounded-lg  mx-auto mt-0 my-2'], style: {} },
    'control-group': { classes: ['justify-start', 'gap-1', ''] },
    'control-input': { classes: ['mt-0'] },
    'input': { classes: ['!text-xs', 'mt-0'] },
    'text': { classes: ['px-2 py-1'] },
    'number': { classes: ['px-2 py-1'] },
    'popup': { classes: ['w-[800px]'] }
  }
};


export const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-700',
  deleted: 'bg-gray-100 text-gray-700',
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  'active': 'text-green-600 bg-green-50 ring-green-600/20',
  'inactive': 'text-red-600 bg-red-50 ring-red-600/20',
  'trial': 'text-blue-600 bg-blue-50 ring-blue-600/20',
  'suspended': 'text-red-600 bg-red-50 ring-red-600/20',
  'expired': 'text-red-600 bg-red-50 ring-red-600/20',
  'grace': 'text-yellow-600 bg-yellow-50 ring-yellow-600/20',
}

export const planColors = {
  'free': 'text-gray-600 bg-gray-100 ring-gray-500/10',
  'basic': 'text-blue-700 bg-blue-100 ring-blue-600/20',
  'pro': 'text-yellow-800 bg-yellow-100 ring-yellow-600/20',
  'enterprise': 'text-green-700 bg-green-100 ring-green-600/20',
  'team': 'text-indigo-700 bg-indigo-100 ring-indigo-600/20',
}
