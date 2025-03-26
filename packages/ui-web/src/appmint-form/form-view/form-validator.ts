import { z } from 'zod';
import * as objectPath from 'object-path';
import { ruleOperations } from './form-rules';
import { deepCopy } from '../utils';

interface ValidationResult {
  valid: boolean;
  errors?: any;
  message?: string;
  path?: string;
}

// Helper function to convert JSON Schema to Zod schema
const jsonSchemaToZod = (schema: any): z.ZodTypeAny => {
  if (!schema || typeof schema !== 'object') {
    return z.any();
  }

  // Handle different types
  switch (schema.type) {
    case 'string':
      let stringSchema = z.string();

      if (schema.pattern) {
        stringSchema = stringSchema.regex(new RegExp(schema.pattern));
      }

      if (schema.minLength !== undefined) {
        stringSchema = stringSchema.min(schema.minLength);
      }

      if (schema.maxLength !== undefined) {
        stringSchema = stringSchema.max(schema.maxLength);
      }

      if (schema.enum) {
        return z.enum(schema.enum as [string, ...string[]]);
      }

      return stringSchema;

    case 'number':
    case 'integer':
      let numberSchema = schema.type === 'integer' ? z.number().int() : z.number();

      if (schema.minimum !== undefined) {
        numberSchema = numberSchema.min(schema.minimum);
      }

      if (schema.maximum !== undefined) {
        numberSchema = numberSchema.max(schema.maximum);
      }

      return numberSchema;

    case 'boolean':
      return z.boolean();

    case 'null':
      return z.null();

    case 'array':
      let arraySchema = z.array(schema.items ? jsonSchemaToZod(schema.items) : z.any());

      if (schema.minItems !== undefined) {
        arraySchema = arraySchema.min(schema.minItems);
      }

      if (schema.maxItems !== undefined) {
        arraySchema = arraySchema.max(schema.maxItems);
      }

      return arraySchema;

    case 'object':
      if (!schema.properties) {
        return z.record(z.any());
      }

      const shape: Record<string, z.ZodTypeAny> = {};
      const required = schema.required || [];

      for (const key in schema.properties) {
        const propSchema = schema.properties[key];
        const zodPropSchema = jsonSchemaToZod(propSchema);

        shape[key] = required.includes(key) ? zodPropSchema : zodPropSchema.optional();
      }

      return z.object(shape);

    default:
      // Handle multiple types or no type specified
      if (Array.isArray(schema.type)) {
        // Union of types
        const schemas = schema.type.map((type: string) => jsonSchemaToZod({ ...schema, type }));
        return z.union(schemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
      }

      // If no type is specified, use any
      return z.any();
  }
};

export const schemaValidator = (data: any, schema: any): { valid: boolean; validate: any } => {
  try {
    const zodSchema = jsonSchemaToZod(schema);
    const result = zodSchema.safeParse(data);

    return {
      valid: result.success,
      validate: {
        errors: result.success ? undefined : result.error.errors
      }
    };
  } catch (error) {
    console.error('Schema validation error:', error);
    return {
      valid: false,
      validate: {
        errors: [{ message: 'Schema validation error' }]
      }
    };
  }
};

export const getTemplateValue = (key: string, parentPath: string, data: any): any => {
  let argValue = key;
  if (typeof key === 'string' && key?.startsWith('{{') && key?.endsWith('}}')) {
    const valueKey: string = key.replace('{{', '').replace('}}', '');
    if (valueKey.startsWith('fn:')) {
      const fnPath = valueKey.replace('fn:', '');
      const fn = fnPath.startsWith('return') ? fnPath : `return ${fnPath}`;
      const tValue = new Function('value', 'data', fn)('', data);
      return tValue;
    } else {
      const fullPath = valueKey.includes('.') ? valueKey : parentPath ? parentPath + '.' + valueKey : valueKey;
      argValue = objectPath.get(data, fullPath);
      if (argValue === undefined) {
        argValue = objectPath.get(data, valueKey);
      }
    }
  }
  return argValue;
};

export const validateForm = (data: any, schema: any): { valid: boolean; validate: any; errors?: any[]; message?: string; validationResults?: ValidationResult[] } => {
  let schemaCopy = deepCopy(schema);
  schemaCopy = replaceIdWithDollarIdAndCleanSchema(schemaCopy);
  schemaCopy = findAndSetRequiredFields(schemaCopy);

  try {
    const zodSchema = jsonSchemaToZod(schemaCopy);
    const result = zodSchema.safeParse(data);
    const validationResults: ValidationResult[] = [];

    if (!result.success) {
      const formattedErrors = result.error.format();
      validationResults.push({
        valid: false,
        errors: result.error.errors,
        message: result.error.errors.map((e: any) => e.message).join(', ')
      });
    }

    // Additional custom validations
    validateSchemaItems('', '', deepCopy(schema), data, validationResults);

    if (validationResults.length) {
      return {
        valid: false,
        validate: { errors: validationResults.map(v => v.errors) },
        errors: validationResults.map(v => v.errors),
        message: validationResults.map(v => `${v.path ? v.path + ' : ' : ''}${v.message || ''}`).join('\n'),
        validationResults
      };
    }

    return { valid: true, validate: { errors: undefined } };
  } catch (error) {
    console.error('Form validation error:', error);
    return {
      valid: false,
      validate: { errors: [{ message: 'Form validation error' }] },
      errors: [{ message: 'Form validation error' }],
      message: 'Form validation error',
      validationResults: [{ valid: false, errors: [{ message: 'Form validation error' }], message: 'Form validation error' }]
    };
  }
};

const validateSchemaItems = (path: string, dataPath: string, schema: any, data: any, store: ValidationResult[]): any => {
  if (typeof schema !== 'object') return null;

  const itemSchema = objectPath.get(schema, path);

  if (itemSchema.type === 'object' || schema.type === 'array') {
    const properties = itemSchema.type === 'array' ? itemSchema.properties.items : itemSchema.properties;
    let basePath = itemSchema.type === 'array' ? 'properties.items' : 'properties';
    basePath = path ? `${path}.${basePath}` : basePath;
    const value = objectPath.get(data, dataPath) || {};
    for (let key in properties) {
      if (properties[key].hidden || properties[key].items?.hidden) {
        continue;
      }
      const valuePath = dataPath ? `${dataPath}.${key}` : key;
      if (itemSchema.properties[key] && itemSchema.properties[key].type === 'array' && itemSchema.properties[key].items?.type === 'object') {
        validateSchemaItems(`${basePath}.${key}`, valuePath, schema, data, store);
      } else if (itemSchema.properties[key] && itemSchema.properties[key].type === 'object') {
        validateSchemaItems(`${basePath}.${key}`, valuePath, schema, data, store);
      } else {
        const hasItems = itemSchema.properties[key].items;
        let validationResult;
        if (hasItems?.type && (hasItems?.type !== 'object' || hasItems?.type !== 'array')) {
          if (typeof value[key] !== 'undefined') {
            validationResult = validateFormValue(valuePath, value[key], hasItems, data);
          }
        } else {
          if (typeof value[key] !== 'undefined' || itemSchema.properties[key].inputRequired) {
            validationResult = validateFormValue(valuePath, value[key], itemSchema.properties[key], data);
          }
        }
        if (validationResult && !validationResult?.valid) {
          store.push(validationResult);
        }
      }
    }
  } else {
    const value = objectPath.get(data, dataPath);
    if (typeof value !== 'undefined' || itemSchema?.inputRequired) {
      const validationResult = validateFormValue(dataPath, value, itemSchema, data);
      if (!validationResult.valid) {
        store.push(validationResult);
      }
    }
  }
};

export const validateFormValue = (path: string, value: any, schema: any, data?: any): ValidationResult => {
  // No validation for hidden fields
  if (!schema || schema.hidden) return { path, valid: true };

  const copySchema = deepCopy(schema);
  // Remove minItems or maxItems if undefined and property exist
  if (copySchema.hasOwnProperty('minItems') && !copySchema.minItems) {
    delete copySchema.minItems;
  }
  if (copySchema.hasOwnProperty('maxItems') && !copySchema.maxItems) {
    delete copySchema.maxItems;
  }
  if (copySchema?.properties) {
    Object.keys(copySchema.properties).forEach(key => {
      if (copySchema.properties[key].hidden) {
        delete copySchema.properties[key];
      }
    });
  }

  try {
    const zodSchema = jsonSchemaToZod(copySchema);
    const result = zodSchema.safeParse(value);

    if (!result.success) {
      console.log('Validation failed:', path, value, result.error.errors);
      return {
        path,
        valid: false,
        errors: result.error.errors,
        message: result.error.errors.map((e: any) => e.message).join(', ')
      };
    }
  } catch (error) {
    console.error('Value validation error:', error);
    return {
      path,
      valid: false,
      errors: [{ message: 'Value validation error' }],
      message: 'Value validation error'
    };
  }

  if (schema.inputRequired && !value) {
    console.log('Validation failed:', path, value, schema.required);
    return { path, valid: false, errors: [{ message: 'This field is required', path }], message: 'This field is required' };
  }

  if (!value) {
    return { path, valid: true };
  }

  if (['string', 'number'].includes(schema.type)) {
    if (schema.pattern) {
      const result = new RegExp(schema.pattern).test(value as any);
      if (!result) {
        console.log('Validation failed:', path, value, schema.pattern);
        return { path, valid: false, errors: [{ message: 'Pattern does not match', path }], message: 'Pattern does not match' };
      }
    }
    if (schema.max && schema.type === 'number' && value > schema.max) {
      console.log('Validation failed:', path, value, schema.max);
      return { path, valid: false, errors: [{ message: `Value is greater than ${schema.max}`, path }], message: `Value is greater than ${schema.max}` };
    }
    if (schema.min && schema.type === 'number' && value < schema.min) {
      console.log('Validation failed:', path, value, schema.min);
      return { path, valid: false, errors: [{ message: `Value is less than ${schema.min}`, path }], message: `Value is less than ${schema.min}` };
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      console.log('Validation failed:', path, value, schema.maxLength);
      return { path, valid: false, errors: [{ message: 'Value is longer than max length', path }], message: 'Value is longer than max length' };
    }

    if (schema.minLength && value.length < schema.minLength) {
      console.log('Validation failed:', path, value, schema.minLength);
      return { path, valid: false, errors: [{ message: 'Value is shorter than min length', path }], message: 'Value is shorter than min length' };
    }

    if (schema.validations) {
      const parentPath = path.split('.').slice(0, -1).join('.');
      const results = schema.validations.map((v: any) => {
        let argValue = getTemplateValue(v.arg, parentPath, data);
        return validateValue(v.validation, value, argValue, v.message);
      });
      const errors: ValidationResult[] = results.filter((r: ValidationResult) => !r.valid).map((r: ValidationResult) => ({ message: r.message, path }));
      const errorMessage = errors.map(e => e.message).join(', ');

      if (errors.length) {
        return { path, valid: false, errors, message: errorMessage };
      }
    }
  }

  // entityValidations
  return { path, valid: true };
};

export const validateValue = (type: string, valueA: any, valueB: any, message?: string): ValidationResult => {
  const rule = ruleOperations[type];

  if (!rule) {
    throw new Error(`Rule ${type} not found`);
  }

  const isValid = rule.validate(valueA, valueB);
  const errorMessage = isValid ? '' : message?.replace('{{valueB}}', JSON.stringify(valueB)) || rule.message;

  return { valid: isValid, message: errorMessage };
};

const replaceIdWithDollarIdAndCleanSchema = (schema: any): any => {
  if (typeof schema === 'object' && schema !== null) {
    // Remove irrelevant fields for validation
    const keysToRemove = ['fieldType', 'inputStyle', 'name', 'unique', 'validations', 'minLength', 'maxLength', 'collection', 'displayStyle', 'repeatable', 'group', 'x-layout', 'description', 'title'];

    keysToRemove.forEach(key => {
      delete schema[key];
    });

    if (schema.hasOwnProperty('id')) {
      schema['$id'] = schema['id'];
      delete schema['id'];
    }

    for (let key in schema) {
      if (schema.hasOwnProperty(key)) {
        if (typeof schema[key] === 'object') {
          replaceIdWithDollarIdAndCleanSchema(schema[key]);
        }
      }
    }
  }
  return schema;
};

const findAndSetRequiredFields = (schema: any, parent: any = null, parentKey: string | null = null): any => {
  if (typeof schema === 'object' && schema !== null) {
    if (schema.properties) {
      schema.required = schema.required || [];
      for (let key in schema.properties) {
        if (schema.properties[key].inputRequired === true) {
          if (!schema.required.includes(key)) {
            schema.required.push(key);
          }
          if (parent && !parent.required.includes(parentKey)) {
            parent.required.push(parentKey);
          }
        }
        // Recursively handle nested objects and arrays
        findAndSetRequiredFields(schema.properties[key], schema, key);
      }
    } else if (schema.items) {
      // Handle arrays
      if (Array.isArray(schema.items)) {
        (schema.items as any[]).forEach((item: any) => findAndSetRequiredFields(item, schema));
      } else {
        findAndSetRequiredFields(schema.items, schema);
      }
    }
  }
  return schema;
};
