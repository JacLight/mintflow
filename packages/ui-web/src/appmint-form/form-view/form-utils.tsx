import { isJsonString, isNotEmpty, toSentenceCase } from '../utils';
import * as objectPath from 'object-path';
import { validateValue } from './form-validator';
import { getCountryDropDownOptions, getCountryRegions } from '../common/countries';
import { themes } from '@ui/theme/theme-data';
import { toTitleCase } from '@jaclight/dbsdk';

// Stubs for missing dependencies
export const CollectionHelper = {
  getInstance: () => ({
    getAll: (includeData = false) => [],
    getCollection: (collectionName) => ({ data: [] }),
    getCollectionFields: (collectionName) => [],
    getCollectionField: (collectionName, fieldName) => ({ data: [] }),
  })
};

const ContactHelper = {
  getInstance: () => ({
    getMessageRecipients: () => [],
    getAssignToOptions: () => [],
    getCustomerRecipients: () => [],
    getUserRecipients: () => [],
    getSocialMediaAccounts: () => [],
    getFromAccounts: () => []
  })
};

const restAPI = {
  request: async (url) => ({ data: [] })
};

const requestQueueInstance = {
  findDataByAttribute: async (collection, property, value, options) => {
    console.log(`Finding data in ${collection} where ${property}=${value}`);
    return { data: [] };
  }
};

export const getSelectOptions = async (dataSource, data, arrayIndex?) => {
  if (!dataSource) return;

  let options;

  if (dataSource.source === 'self') {
    const key = resolveExpression(dataSource.value, arrayIndex);
    options = objectPath.get(data, key);
  } else if (dataSource.source === 'store' || dataSource.source === 'function') {
    const dValue = dataSource?.value?.toLowerCase();
    if (dValue === 'countries') {
      options = getCountryDropDownOptions();
    } else if (dValue === 'country-regions') {
      const filter = getTemplateValue(dataSource.filter?.value, data, arrayIndex);
      if (filter) {
        options = getCountryRegions(filter);
      } else {
        options = getCountryRegions('us');
      }
    } else if (dValue === 'getMessageRecipients'.toLowerCase() || dValue === 'message-recipients') {
      options = ContactHelper.getInstance().getMessageRecipients();
    } else if (dValue === 'getAssignToOptions'.toLowerCase() || dValue === 'assign-to') {
      options = ContactHelper.getInstance().getAssignToOptions();
    } else if (dValue === 'getCustomerRecipients'.toLowerCase() || dValue === 'customers') {
      options = ContactHelper.getInstance().getCustomerRecipients();
    } else if (dValue === 'getUserRecipients'.toLowerCase() || dValue === 'users') {
      options = ContactHelper.getInstance().getUserRecipients();
    } else if (dValue === 'getSocialAccounts'.toLowerCase() || dValue === 'social-accounts') {
      options = ContactHelper.getInstance()?.getSocialMediaAccounts();
    } else if (dValue === 'getFromAccounts'.toLowerCase() || dValue === 'from-accounts') {
      options = ContactHelper.getInstance().getFromAccounts();
    } else if (dValue === 'collection') {
      const collections = CollectionHelper.getInstance().getAll(true);
      const startsWith = dataSource.filter?.value;
      if (startsWith) {
        options = collections?.filter(row => row.data.name.startsWith(startsWith)).map(row => ({ value: row.data.name, label: row.data.name, subType: row.data.subType, mainType: row.data.mainType }));
      }
      options = collections?.map(row => ({ value: row.data.name, label: row.data.name, subType: row.data.subType, mainType: row.data.mainType }));
    } else if (dValue === 'getThemeSettingsList'.toLowerCase() || dValue === 'theme-settings') {
      options = Object.keys(themes).map(key => {
        const theme = themes[key];
        return { value: key, label: theme?.name || toTitleCase(key) };
      })
    } else if (dValue === 'listAIModels'.toLowerCase() || dValue === 'ai-models') {
      // options = await listAIModels();
    }
  } else if (dataSource.source === 'json') {
    options = dataSource.json || dataSource.value;
  } else if (dataSource.source === 'collection') {
    let collectionName = getTemplateValue(dataSource.collection || dataSource.value, data, arrayIndex);
    let filterValue = getTemplateValue(dataSource.filter?.value, data, arrayIndex);
    let filterProperty = getTemplateValue(dataSource.filter?.property, data, arrayIndex);

    let dataRows = [];
    if (collectionName === 'collection') {
      dataRows = CollectionHelper.getInstance().getAll(true);
    } else {
      await requestQueueInstance
        .findDataByAttribute(collectionName, filterProperty, filterValue, { pageSize: 1000, page: 0 })
        .then(res => {
          dataRows = res.data;
          return res;
        })
        .catch(e => {
          console.error(e);
        });
    }
    let thisOptions = [];
    dataRows?.forEach(row => {
      let value;
      const valueField = dataSource.valueField || dataSource.value;
      if (!valueField || valueField === 'sk') {
        value = row['sk'];
      } else if (valueField) {
        value = row.data[valueField];
      }

      let label;
      const labelField = dataSource.labelField || dataSource.label;
      if (Array.isArray(labelField)) {
        label = labelField.map(path => objectPath.get(row?.data, path)).join(' ');
      } else if (labelField) {
        label = objectPath.get(row?.data, labelField);
      } else {
        label = row?.data?.number || row?.data?.name || row?.data?.username || row?.data?.email || row?.data?.title || row?.data?.label || row?.name || value
      }
      thisOptions.push({ label, value, original: row });
    });
    options = thisOptions;
  } else if (dataSource.source === 'url') {
    const response: any = await restAPI.request(dataSource.value);
    options = response.data;
  }

  if (isJsonString(options)) {
    options = JSON.parse(options);
  }

  if (isNotEmpty(options) && typeof options[0] === 'string') {
    options = options.map(o => ({ value: o, label: toSentenceCase(o) }));
  }

  if (dataSource.filter && dataSource?.value?.toLowerCase() !== 'country-regions') {
    let filterValue = typeof dataSource.filter === 'string' ? dataSource.filter : dataSource.filter?.value;
    if (filterValue?.startsWith('{{') && filterValue?.endsWith('}}')) {
      const filterKey = resolveExpression(filterValue, arrayIndex);
      filterValue = objectPath.get(data, filterKey);
    }
    const filterProperty = typeof dataSource.filter?.property === 'string' ? dataSource.filter?.property : 'value';
    const filterOperation = typeof dataSource.filter?.property === 'string' ? dataSource.filter?.operation : 'equal';

    if (filterValue) {
      options = options.filter(option => {
        const response = validateValue(filterOperation, filterValue, option[filterProperty], '');
        return response.valid;
      });
    }
  }

  return options;
};

const resolveExpression = (rawValue, arrayIndex) => {
  if (!rawValue) return rawValue;
  let parsedValue = rawValue;
  if (parsedValue.startsWith('{{') && parsedValue.endsWith('}}')) {
    let valueKey: string = parsedValue.replace('{{', '').replace('}}', '');
    if (arrayIndex && valueKey.includes('[]')) {
      valueKey = valueKey.replace('[]', arrayIndex);
    }
    parsedValue = valueKey;
  }
  return parsedValue;
};

const getTemplateValue = (template, data, arrayIndex) => {
  if (!template || !template.startsWith('{{') || !template.endsWith('}}')) return template
  const valueKey = resolveExpression(template, arrayIndex);
  const value = objectPath.get(data, valueKey);
  return value;
}


export const getWatchedPaths = (schema, parentPath, arrayIndex?) => {
  if (!schema) return;
  let watchedPaths = schema?.watchedPaths || [];
  if (schema?.title?.startsWith('{{') && schema?.title?.endsWith('}}')) {
    watchedPaths.push(schema.title?.slice(2, -2));
  }
  if (typeof schema?.default === 'string' && schema?.default?.startsWith('{{') && schema?.default?.endsWith('}}')) {
    watchedPaths.push(schema.title?.slice(2, -2));
  }
  if (schema?.rules) {
    schema.rules.forEach(rule => {
      if (typeof rule.valueA === 'string' && rule.valueA.startsWith('{{') && rule.valueA.endsWith('}}')) {
        watchedPaths.push(rule.valueA.slice(2, -2));
      }
      if (typeof rule.valueB === 'string' && rule.valueB.startsWith('{{') && rule.valueB.endsWith('}}')) {
        watchedPaths.push(rule.valueB.slice(2, -2));
      }
    });
  }
  if (schema?.dataSource) {
    if (schema.dataSource.source === 'self') {
      watchedPaths.push(schema.dataSource.value);
    }
    if (schema.dataSource.filter?.value?.startsWith('{{') && schema.dataSource.filter?.value?.endsWith('}}')) {
      watchedPaths.push(resolveExpression(schema.dataSource.filter?.value, arrayIndex));
    }
  }
  if (parentPath) {
    watchedPaths = watchedPaths.map(path => `${parentPath}.${path}`);
  }
  return watchedPaths;
};
