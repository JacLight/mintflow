import { getTemplateValue, validateValue } from './form-validator';
import { isEmpty, isNotEmpty } from '../utils/helpers';

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

interface RuleOperation {
  operation: string;
  args: string[];
  message?: string;
  label: string;
  info?: string;
  pattern?: string;
  validate: (valueA: any, valueB?: any) => boolean;
}

const parseNumber = (value: any) => (!isNaN(value) ? parseFloat(value) : value);

export const ruleOperations: Record<string, RuleOperation> = {
  required: {
    operation: 'required',
    args: ['valueA'],
    message: 'This field is required',
    label: 'Required',
    info: 'value',
    validate: (valueA) => !!valueA,
  },

  equal: {
    operation: 'equal',
    args: ['valueA', 'valueB'],
    message: 'This field must be equal to {{valueB}}',
    label: 'Equal',
    info: 'value',
    validate: (valueA, valueB) => parseNumber(valueA) === parseNumber(valueB),
  },

  notEqual: {
    operation: 'notEqual',
    args: ['valueA', 'valueB'],
    message: 'This field must not be equal to {{valueB}}',
    label: 'Not Equal',
    info: 'value',
    validate: (valueA, valueB) => parseNumber(valueA) !== parseNumber(valueB),
  },

  greaterThan: {
    operation: 'greaterThan',
    args: ['valueA', 'valueB'],
    message: 'This field must be greater than {{valueB}}',
    label: 'Greater Than',
    validate: (valueA, valueB) => parseNumber(valueA) > parseNumber(valueB),
  },

  lessThan: {
    operation: 'lessThan',
    args: ['valueA', 'valueB'],
    message: 'This field must be less than {{valueB}}',
    label: 'Less Than',
    validate: (valueA, valueB) => parseNumber(valueA) < parseNumber(valueB),
  },

  in: {
    operation: 'in',
    args: ['valueA', 'valueB'],
    message: 'This field must be in the list of values {{valueB}}',
    label: 'In',
    validate: (valueA, valueB) => {
      if (typeof valueB === 'string' && typeof valueA === 'string') {
        return valueB.includes(valueA);
      } else if (Array.isArray(valueB) && Array.isArray(valueA)) {
        return valueA.every(v => valueB.includes(v));
      } else if (Array.isArray(valueA)) {
        return valueA.includes(valueB);
      } else if (Array.isArray(valueB)) {
        return valueB.includes(valueA);
      } else if (typeof valueB === 'object') {
        return !!valueB[valueA];
      }
      return false;
    },
  },

  notIn: {
    operation: 'notIn',
    args: ['valueA', 'valueB'],
    message: 'This field must not be in the list of values {{valueB}}',
    label: 'Not In',
    validate: (valueA, valueB) => {
      if (typeof valueB === 'string' && typeof valueA === 'string') {
        return !valueB.includes(valueA);
      } else if (Array.isArray(valueB) && Array.isArray(valueA)) {
        return !valueA.every(v => valueB.includes(v));
      } else if (Array.isArray(valueA)) {
        return !valueA.includes(valueB);
      } else if (Array.isArray(valueB)) {
        return !valueB.includes(valueA);
      } else if (typeof valueB === 'object') {
        return !valueB[valueA];
      }
      return true;
    },
  },

  startsWith: {
    operation: 'startsWith',
    args: ['valueA', 'valueB'],
    message: 'This field must start with {{valueB}}',
    label: 'Starts With',
    validate: (valueA, valueB) => typeof valueA === 'string' && valueA.startsWith(valueB),
  },

  endsWith: {
    operation: 'endsWith',
    args: ['valueA', 'valueB'],
    message: 'This field must end with {{valueB}}',
    label: 'Ends With',
    validate: (valueA, valueB) => typeof valueA === 'string' && valueA.endsWith(valueB),
  },

  match: {
    operation: 'match',
    args: ['valueA', 'valueB'],
    message: 'This field must match the pattern {{valueB}}',
    label: 'Matches',
    validate: (valueA, valueB) => new RegExp(valueB).test(valueA),
  },

  notMatch: {
    operation: 'notMatch',
    args: ['valueA', 'valueB'],
    message: 'This field must not match the pattern {{valueB}}',
    label: 'Not Matches',
    validate: (valueA, valueB) => !new RegExp(valueB).test(valueA),
  },

  isAlpha: {
    operation: 'isAlpha',
    args: ['valueA'],
    message: 'This field must contain only letters',
    label: 'Is Alpha',
    pattern: '^[a-zA-Z]+$',
    validate: (valueA) => /^[a-zA-Z]+$/.test(valueA)
  },

  isNumeric: {
    operation: 'isNumeric',
    args: ['valueA'],
    message: 'This field must be a number',
    label: 'Is Numeric',
    pattern: '^[0-9]+$',
    validate: (valueA) => /^[0-9]+$/.test(valueA)
  },

  isAlphaNumeric: {
    operation: 'isAlphaNumeric',
    args: ['valueA'],
    message: 'This field must contain both letters and numbers only',
    label: 'Is Alpha Numeric',
    pattern: '^(?=.*[A-Za-z])(?=.*\\d).{8,}$',
    validate: (valueA) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(valueA)
  },

  isEmpty: {
    operation: 'isEmpty',
    args: ['valueA'],
    message: 'This field must be empty',
    label: 'Is Empty',
    validate: (valueA) => valueA === null || valueA === undefined || valueA === '',
  },

  isNotEmpty: {
    operation: 'isNotEmpty',
    args: ['valueA'],
    message: 'This field must not be empty',
    label: 'Is Not Empty',
    validate: (valueA) => valueA !== null && valueA !== undefined && valueA !== '',
  },

  isTruthy: {
    operation: 'isTruthy',
    args: ['valueA'],
    message: 'This field must be truthy',
    label: 'Is Truthy',
    validate: (valueA) => !!valueA,
  },

  isFalsy: {
    operation: 'isFalsy',
    args: ['valueA'],
    message: 'This field must be falsy',
    label: 'Is Falsy',
    validate: (valueA) => !valueA,
  },

  isEmail: {
    operation: 'isEmail',
    args: ['valueA'],
    message: 'This field must be a valid email address',
    label: 'Is Email',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    validate: (valueA) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(valueA),
  },

  isDate: {
    operation: 'isDate',
    args: ['valueA'],
    message: 'This field must be a date',
    label: 'Is Date',
    validate: (valueA) => !isNaN(new Date(valueA).getTime()),
  },

  fn: {
    operation: 'fn',
    args: ['valueA', 'valueB'],
    label: 'Custom Function',
    validate: (valueA, valueB) => {
      try {
        const fn = new Function('valueA', 'valueB', `return ${valueB};`);
        return fn(valueA, valueB);
      } catch (e) {
        console.error("Invalid function in rule operation", e);
        return false;
      }
    },
  },
};
