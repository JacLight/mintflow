import { getTemplateValue, validateValue } from './form-validator.js';
import { isEmpty, isNotEmpty } from './helpers.js';

interface Rule {
  actions: any[];
  operations: any[];
  join?: string;
  valid?: boolean;
}

interface RuleResult {
  valid: boolean;
  message?: string;
}

export const runFormRules = (name: string, path: string, dataPath: string, newValue: any, schema: any, rules: Rule[], data: any, arrayData: any): any => {
  // console.log('runFormRules', { name, path, dataPath, newValue, schema, rules, data })
  if (!Array.isArray(rules)) {
    return null;
  }
  const ruleResults: Rule[] = [];
  const mergedData = { ...data, ...arrayData };
  for (let rule of rules) {
    if (isEmpty(rule.actions) || isEmpty(rule.operations)) {
      console.warn('Skipping: rule incomplete, actions and operations are required', rule);
      continue;
    }

    let ruleResult: Rule | undefined;
    for (let operation of rule.operations) {
      const result = executeRule(operation.operator, operation.valueA, operation.valueB, mergedData);
      const allValid = ruleResult ? ruleResult.valid && result.valid : result.valid;
      ruleResult = { ...rule, valid: allValid };
      if (rule.join === 'or' && ruleResult.valid) {
        break;
      }
      if (rule.join === 'and' && !ruleResult.valid) {
        break;
      }
    }
    if (ruleResult) {
      ruleResults.push(ruleResult);
    }
  }

  const resultByPath: any = {};
  ruleResults.forEach(rule => {
    rule.actions.forEach(action => {
      if ((typeof action.when === 'undefined' || action.when === 'true') && rule.valid) {
        const { operator, value, fields } = action;
        fields.forEach((field: string) => {
          resultByPath[field] = resultByPath[field] || [];
          const pathActions = resultByPath[field];
          pathActions.push({ operator, field, value });
        });
      } else if (action.when === 'false' && !rule.valid) {
        const { operator, value, fields } = action;
        fields.forEach((field: string) => {
          resultByPath[field] = resultByPath[field] || [];
          const pathActions = resultByPath[field];
          pathActions.push({ operator, field, value });
        });
      }
    });
  });

  return resultByPath;
};

export const runElementRules = (schema: any, data: any, arrayData: any): any => {
  if (!Array.isArray(schema.rules)) {
    return null;
  }
  const ruleActions: any = {};
  const mergedData = { ...data, ...arrayData };
  for (let rule of schema.rules) {
    if (isEmpty(rule.action) || isEmpty(rule.operation)) {
      continue;
    }
    const result = executeRule(rule.operation, rule.valueA, rule.valueB, mergedData);
    if (result.valid) {
      if (['disabled', 'hide', 'show', 'readOnly'].includes(rule.action)) {
        ruleActions[rule.action] = true;
      } else if (rule.action === 'set-property' && rule.property) {
        rule.property.forEach((entry: any) => {
          const key = getTemplateValue(entry.key, '', mergedData);
          ruleActions[key] = getTemplateValue(entry.value, '', mergedData);
        });
      }
    }
  }
  return ruleActions;
};

const executeRule = (operator: string, valueA: any, valueB: any, data: any): RuleResult => {
  if (isNotEmpty(valueA)) {
    const [firstItem] = Array.isArray(valueA) ? valueA : [valueA];
    if (typeof firstItem === 'string' && firstItem?.startsWith('{{') && firstItem?.endsWith('}}')) {
      const itemValue = getTemplateValue(firstItem, '', data);
      valueA = itemValue;
    } else {
      valueA = valueA;
    }
  }

  if (isNotEmpty(valueB)) {
    const [firstItem] = Array.isArray(valueB) ? valueB : [valueB];
    if (typeof firstItem === 'string' && firstItem?.startsWith('{{') && firstItem?.endsWith('}}')) {
      const itemValue = getTemplateValue(firstItem, '', data);
      valueB = itemValue;
    } else {
      valueB = valueB;
    }
  }
  const result = validateValue(operator, valueA, valueB, '');
  return result;
};


interface RuleOperation {
  operation: string;
  args: string[];
  message?: string;
  label: string;
  info?: string;
  pattern?: string;
}


export const ruleOperations: Record<string, RuleOperation> = {
  required: { operation: 'required', args: ['valueA'], message: 'This field is required', label: 'Required', info: 'value' },
  equal: { operation: 'equal', args: ['valueA', 'valueB'], message: 'This field must be equal to {{valueB}}', label: 'Equal', info: 'value' },
  notEqual: { operation: 'notEqual', args: ['valueA', 'valueB'], message: 'This field must not be equal to {{valueB}}', label: 'Not Equal', info: 'value' },
  greaterThan: { operation: 'greaterThan', args: ['valueA', 'valueB'], message: 'This field must be greater than {{valueB}}', label: 'Greater Than' },
  lessThan: { operation: 'lessThan', args: ['valueA', 'valueB'], message: 'This field must be less than {{valueB}}', label: 'Less Than' },
  greaterThanOrEqual: { operation: 'greaterThanOrEqual', args: ['valueA', 'valueB'], message: 'This field must be greater than or equal to {{valueB}}', label: 'Greater Than or Equal' },
  lessThanOrEqual: { operation: 'lessThanOrEqual', args: ['valueA', 'valueB'], message: 'This field must be less than or equal to {{valueB}}', label: 'Less Than or Equal' },
  in: { operation: 'in', args: ['valueA', 'valueB'], message: 'This field must be in the list of values {{valueB}}', label: 'In', info: 'value or separated by ,' },
  notIn: { operation: 'notIn', args: ['valueA', 'valueB'], message: 'This field must not be in the list of values {{valueB}}', label: 'Not In', info: 'value or separated by ,' },
  startsWith: { operation: 'startsWith', args: ['valueA', 'valueB'], message: 'This field must start with {{valueB}}', label: 'Starts With', info: 'value' },
  notStartsWith: { operation: 'notStartsWith', args: ['valueA', 'valueB'], message: 'This field must not start with {{valueB}}', label: 'Not Starts With', info: 'value' },
  endsWith: { operation: 'endsWith', args: ['valueA', 'valueB'], message: 'This field must end with {{valueB}}', label: 'Ends With', info: 'value' },
  notEndsWith: { operation: 'notEndsWith', args: ['valueA', 'valueB'], message: 'This field must not end with {{valueB}}', label: 'Not Ends With', info: 'value' },
  match: { operation: 'match', args: ['valueA', 'valueB'], message: 'This field must match the pattern {{valueB}}', label: 'Matches', info: 'RegEx pattern' },
  notMatch: { operation: 'notMatch', args: ['valueA', 'valueB'], message: 'This field must not match the pattern {{valueB}}', label: 'Not Matches', info: 'RegEx pattern' },
  isEmpty: { operation: 'isEmpty', args: ['valueA'], message: 'This field must be empty', label: 'Is Empty' },
  isNotEmpty: { operation: 'isNotEmpty', args: ['valueA'], message: 'This field must not be empty', label: 'Is Not Empty' },
  isTruthy: { operation: 'isTruthy', args: ['valueA'], message: 'This field must be truthy', label: 'Is Truthy' },
  isFalsy: { operation: 'isFalsy', args: ['valueA'], message: 'This field must be falsy', label: 'Is Falsy' },
  maxLength: { operation: 'maxLength', args: ['valueA'], message: 'This field must be at most {{valueA}} characters', label: 'Max Length', info: 'value' },
  minLength: { operation: 'minLength', args: ['valueA'], message: 'This field must be at least {{valueA}} characters', label: 'Min Length', info: 'value' },
  maxValue: { operation: 'maxValue', args: ['valueA'], message: 'This field must be less than or equal to {{valueA}}', label: 'Max Value', info: 'value' },
  minValue: { operation: 'minValue', args: ['valueA'], message: 'This field must be greater than or equal to {{valueA}}', label: 'Min Value', info: 'value' },
  isEmail: { operation: 'isEmail', args: ['valueA'], message: 'This field must be a valid email address', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', label: 'Is Email' },
  isUrl: { operation: 'isUrl', args: ['valueA'], message: 'This field must be a valid URL', pattern: '^(http|https)://[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+([/?].*)?$', label: 'Is URL' },
  isNumeric: { operation: 'isNumeric', args: ['valueA'], message: 'This field must be a number', pattern: '^[0-9]+$', label: 'Is Numeric' },
  isAlphaNumeric: { operation: 'isAlphaNumeric', args: ['valueA'], message: 'This field must contain both letters and numbers only', pattern: '^(?=.*[A-Za-z])(?=.*\\d).{8,}$', label: 'Is Alpha Numeric' },
  isAlpha: { operation: 'isAlpha', args: ['valueA'], message: 'This field must contain only letters', pattern: '^[a-zA-Z]+$', label: 'Is Alpha' },
  isDate: { operation: 'isDate', args: ['valueA'], message: 'This field must be a date', label: 'Is Date' },
  isPhone: { operation: 'isPhone', args: ['valueA'], message: 'This field must be a valid phone number', pattern: '^[0-9]{10,14}$', label: 'Is Phone' },
  isZipCode: { operation: 'isZipCode', args: ['valueA'], message: 'This field must be a valid zip code', pattern: '^[0-9]{5}(?:-[0-9]{4})?$', label: 'Is Zip Code' },
  isCreditCard: { operation: 'isCreditCard', args: ['valueA'], message: 'This field must be a valid credit card number', label: 'Is Credit Card' },
  fn: { operation: 'fn', args: ['valueA'], label: 'Custom Function' },
};
